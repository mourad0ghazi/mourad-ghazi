import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import type { Budget, CalendarEvent, Goal, Habit, Investment, JournalEntry, Note, Priority, Profile, SavingsGoal, Settings, Task, TaskStatus, Transaction, TransactionType } from '../types'
import type { ModuleId } from '../data/modules'

export type ExcelValue = string | number | boolean | null
export interface ExcelFormula { cell: string; formula: string; cachedValue: ExcelValue }
export interface ExcelSheet { name: string; rows: ExcelValue[][]; formulas: ExcelFormula[]; rowNumbers?: number[] }
export interface ExcelWorkbook { sheets: ExcelSheet[]; formulaCount: number }
export type ImportKind = 'transactions' | 'tasks' | 'events' | 'budgets' | 'savings' | 'investments' | 'goals' | 'habits' | 'notes' | 'journal' | 'profile'
export interface DetectedTable { kind: ImportKind; label: string; sheet: string; count: number; headerRow: number; deep?: boolean }
export interface DeepSheetAnalysis {
  sheet: string
  rows: number
  cells: number
  destination: string
  inferredRecords: number
  archiveNotes: number
}
export interface ExcelImportPlan {
  workbook: ExcelWorkbook
  detected: DetectedTable[]
  transactions: Transaction[]
  tasks: Task[]
  events: CalendarEvent[]
  budgets: Budget[]
  savingsGoals: SavingsGoal[]
  investments: Investment[]
  goals: Goal[]
  habits: Habit[]
  notes: Note[]
  journal: JournalEntry[]
  profile: Partial<Profile>
  settings: Partial<Settings>
  widgets: ModuleId[]
  deepAnalysis: DeepSheetAnalysis[]
  warnings: string[]
  totalRecords: number
}

type Canonical = Record<string, string[]>
type Detection = { kind: ImportKind; label: string; aliases: Canonical; required: string[][]; names: string[] }
type LocatedTable = { definition: Detection; sheet: ExcelSheet; headerRow: number; columns: Record<string, number>; score: number }

const definitions: Detection[] = [
  { kind: 'transactions', label: 'Transactions', names: ['transaction','operation','releve','banque','depense','revenu'], required: [['amount','debit','credit'],['title','date','category','type']], aliases: {
    date:['date','jour','date operation','date de l operation'], title:['libelle','description','titre','nom','operation','details','designation'], type:['type','sens','nature','debit credit'], category:['categorie','category','rubrique'], amount:['montant','amount','valeur','somme'], debit:['debit','sortie','depense'], credit:['credit','entree','revenu'], note:['note','commentaire','memo'] } },
  { kind: 'tasks', label: 'Tâches', names: ['tache','task','todo','kanban'], required: [['title'],['status','priority','dueDate']], aliases: {
    title:['titre','tache','task','nom','description'], status:['statut','status','etat'], priority:['priorite','priority','urgence'], dueDate:['echeance','date limite','due date','deadline','date'], category:['categorie','category','projet'], tags:['tags','etiquettes','labels'] } },
  { kind: 'events', label: 'Événements', names: ['evenement','event','agenda','calendrier','calendar'], required: [['title'],['date'],['time','location']], aliases: {
    title:['titre','evenement','event','nom','objet'], date:['date','jour','debut'], time:['heure','time','horaire'], location:['lieu','location','endroit'], color:['couleur','color'] } },
  { kind: 'budgets', label: 'Budgets', names: ['budget'], required: [['category'],['planned']], aliases: {
    category:['categorie','category','poste','rubrique'], planned:['budget','budget mensuel','montant prevu','prevu','planned','limite','plafond'], color:['couleur','color'] } },
  { kind: 'savings', label: 'Épargne', names: ['epargne','saving','objectif epargne'], required: [['name'],['target']], aliases: {
    name:['nom','objectif','name','projet'], current:['montant actuel','actuel','epargne actuelle','current','realise'], target:['montant cible','cible','target','objectif montant'], deadline:['echeance','date cible','deadline','date'], icon:['icone','icon'] } },
  { kind: 'investments', label: 'Investissements', names: ['investissement','investment','portefeuille','portfolio','actif'], required: [['name'],['value','invested']], aliases: {
    name:['nom','actif','name','investissement'], symbol:['symbole','symbol','ticker'], type:['type','classe','categorie'], value:['valeur','valeur actuelle','value','cours'], invested:['montant investi','investi','cout','invested'], change:['variation','performance','rendement','change'] } },
  { kind: 'goals', label: 'Objectifs', names: ['objectif','goal','smart'], required: [['title'],['progress','deadline']], aliases: {
    title:['titre','objectif','goal','nom'], progress:['progression','progres','progress','avancement','pourcentage'], deadline:['echeance','deadline','date cible','date'], category:['categorie','category','domaine'] } },
  { kind: 'habits', label: 'Habitudes', names: ['habitude','habit','routine'], required: [['name'],['streak','bestStreak','state']], aliases: {
    name:['nom','habitude','habit','routine'], streak:['serie','streak','jours consecutifs'], bestStreak:['meilleure serie','record','best streak'], state:['etat du jour','statut','state'], icon:['icone','icon'] } },
  { kind: 'notes', label: 'Notes', names: ['note','memo'], required: [['title'],['content']], aliases: {
    title:['titre','note','nom'], content:['contenu','content','texte','description','note complete'], updatedAt:['modifie le','date','updated at'], pinned:['epingle','pinned','favori'] } },
  { kind: 'journal', label: 'Journal', names: ['journal','mood','humeur'], required: [['content'],['date','mood']], aliases: {
    date:['date','jour'], content:['contenu','texte','journal','entree','note'], mood:['humeur','mood','note humeur'] } },
  { kind: 'profile', label: 'Profil', names: ['profil','profile','parametre','settings'], required: [['field'],['value']], aliases: {
    field:['champ','field','parametre','cle','propriete'], value:['valeur','value','contenu'] } },
]

const labels: Record<ImportKind, string> = Object.fromEntries(definitions.map((d) => [d.kind, d.label])) as Record<ImportKind, string>
const colors = ['#343a40','#596168','#747c83','#90969b','#737d74','#988a7d']
const uuid = () => crypto.randomUUID()
const clean = (value: unknown) => String(value ?? '').trim()
const normalize = (value: unknown) => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/[_/\\-]+/g,' ').replace(/[^a-z0-9% ]/g,'').replace(/\s+/g,' ').trim()
const num = (value: unknown, fallback = 0) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  const raw = clean(value).replace(/[\s\u00a0\u202f]/g,'')
  const parenthesized = /^\(.*\)$/.test(raw)
  let normalized = raw.replace(/[^0-9,.+\-]/g,'')
  const comma = normalized.lastIndexOf(','), dot = normalized.lastIndexOf('.')
  if (comma >= 0 && dot >= 0) {
    normalized = comma > dot ? normalized.replace(/\./g,'').replace(',','.') : normalized.replace(/,/g,'')
  } else if (comma >= 0) {
    const decimals = normalized.length - comma - 1
    normalized = decimals === 3
      ? normalized.replace(/,/g,'')
      : `${normalized.slice(0, comma).replace(/,/g,'')}.${normalized.slice(comma + 1)}`
  } else if (dot >= 0) {
    const decimals = normalized.length - dot - 1
    normalized = decimals === 3
      ? normalized.replace(/\./g,'')
      : `${normalized.slice(0, dot).replace(/\./g,'')}.${normalized.slice(dot + 1)}`
  }
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? (parenthesized ? -Math.abs(parsed) : parsed) : fallback
}
const percent = (value: unknown) => { const n=num(value); return Math.max(0,Math.min(100,n > 0 && n <= 1 ? n*100 : n)) }
const bool = (value: unknown) => ['1','true','oui','yes','vrai','x','epingle'].includes(normalize(value))

function validDateParts(year: string, month: string, day: string) {
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return parsed.getUTCFullYear() === Number(year) && parsed.getUTCMonth() === Number(month) - 1 && parsed.getUTCDate() === Number(day)
}
function asDate(value: unknown, fallback = new Date().toISOString().slice(0,10), dateFormat: Settings['dateFormat'] = 'DD/MM/YYYY') {
  if (typeof value === 'number' && value > 1) return excelDate(value).slice(0,10)
  const raw=clean(value); if(!raw)return fallback
  const iso=raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if(iso)return validDateParts(iso[1],iso[2],iso[3])?raw.slice(0,10):fallback
  const match=raw.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/)
  if(match){
    const year=match[3].length===2?`20${match[3]}`:match[3]
    const month=dateFormat==='MM/DD/YYYY'?match[1]:match[2]
    const day=dateFormat==='MM/DD/YYYY'?match[2]:match[1]
    return validDateParts(year,month,day)?`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`:fallback
  }
  const parsed=new Date(raw); return Number.isNaN(parsed.getTime())?fallback:parsed.toISOString().slice(0,10)
}
function asTime(value: unknown) { if(typeof value==='number'&&value>=0&&value<1){const minutes=Math.round(value*1440)%1440;return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`} const raw=clean(value);const m=raw.match(/(\d{1,2}):(\d{2})/);return m?`${m[1].padStart(2,'0')}:${m[2]}`:'09:00' }
function excelDate(serial: number) { const date=new Date(Date.UTC(1899,11,30)+serial*86400000); const hasTime=Math.abs(serial-Math.floor(serial))>.000001; return hasTime?date.toISOString().slice(0,16):date.toISOString().slice(0,10) }
function direct(element: Element, name: string) { return Array.from(element.children).find((child)=>child.localName===name) }
function resolvePath(target: string) { const parts=(target.startsWith('/')?target.slice(1):`xl/${target}`).split('/'),out:string[]=[];for(const part of parts){if(!part||part==='.')continue;if(part==='..')out.pop();else out.push(part)}return out.join('/') }
function columnIndex(reference: string) { const letters=(reference.match(/[A-Z]+/i)?.[0]??'A').toUpperCase();return [...letters].reduce((sum,char)=>sum*26+char.charCodeAt(0)-64,0)-1 }
function isDateFormat(id: number, custom: Map<number,string>) { if((id>=14&&id<=22)||(id>=27&&id<=36)||(id>=45&&id<=47)||(id>=50&&id<=58))return true;const code=custom.get(id)?.replace(/"[^"]*"|\[[^\]]*\]/g,'')??'';return /(^|[^a-z])[dmyhs]+([^a-z]|$)/i.test(code) }

export async function parseExcelFile(file: File): Promise<ExcelWorkbook> {
  if(file.size>25*1024*1024)throw new Error('Le fichier dépasse la limite locale de 25 Mo.')
  const extension=file.name.split('.').pop()?.toLowerCase()
  if(extension==='csv')return parseCSVWorkbook(await file.text(),file.name.replace(/\.csv$/i,''))
  if(!['xlsx','xlsm','xltx'].includes(extension??''))throw new Error('Format non pris en charge. Enregistrez le classeur au format .xlsx.')
  const archive=unzipSync(new Uint8Array(await file.arrayBuffer()))
  const read=(path:string)=>{const bytes=archive[path];if(!bytes)throw new Error(`Structure Excel incomplète (${path}).`);return new DOMParser().parseFromString(strFromU8(bytes),'application/xml')}
  const workbook=read('xl/workbook.xml'), relationships=read('xl/_rels/workbook.xml.rels')
  const relationMap=new Map(Array.from(relationships.getElementsByTagName('*')).filter((node)=>node.localName==='Relationship').map((node)=>[node.getAttribute('Id')??'',resolvePath(node.getAttribute('Target')??'')]))
  const shared=archive['xl/sharedStrings.xml']?Array.from(read('xl/sharedStrings.xml').getElementsByTagName('*')).filter((node)=>node.localName==='si').map((node)=>Array.from(node.getElementsByTagName('*')).filter((child)=>child.localName==='t').map((child)=>child.textContent??'').join('')):[]
  const customFormats=new Map<number,string>(), styleFormats:number[]=[]
  if(archive['xl/styles.xml']){const styles=read('xl/styles.xml');Array.from(styles.getElementsByTagName('*')).filter((node)=>node.localName==='numFmt').forEach((node)=>customFormats.set(Number(node.getAttribute('numFmtId')),node.getAttribute('formatCode')??''));const xfs=Array.from(styles.getElementsByTagName('*')).find((node)=>node.localName==='cellXfs');if(xfs)Array.from(xfs.children).filter((node)=>node.localName==='xf').forEach((node)=>styleFormats.push(Number(node.getAttribute('numFmtId')??0)))}
  const sheetNodes=Array.from(workbook.getElementsByTagName('*')).filter((node)=>node.localName==='sheet')
  const sheets=sheetNodes.map((sheetNode,index)=>{
    const name=sheetNode.getAttribute('name')??`Feuille ${index+1}`,relationId=sheetNode.getAttribute('r:id')??sheetNode.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')??''
    const path=relationMap.get(relationId)??`xl/worksheets/sheet${index+1}.xml`,document=read(path),rows:ExcelValue[][]=[],formulas:ExcelFormula[]=[],rowNumbers:number[]=[]
    const rowNodes=Array.from(document.getElementsByTagName('*')).filter((node)=>node.localName==='row')
    for(const rowNode of rowNodes){const row:ExcelValue[]=[];for(const cell of Array.from(rowNode.children).filter((node)=>node.localName==='c')){const ref=cell.getAttribute('r')??'',column=columnIndex(ref);if(column>16_383)continue;const type=cell.getAttribute('t')??'',raw=direct(cell,'v')?.textContent??'',formula=direct(cell,'f')?.textContent??'';let value:ExcelValue=null
      if(type==='s')value=shared[Number(raw)]??'';else if(type==='inlineStr')value=Array.from(cell.getElementsByTagName('*')).filter((node)=>node.localName==='t').map((node)=>node.textContent??'').join('');else if(type==='b')value=raw==='1';else if(type==='str'||type==='e'||type==='d')value=raw;else if(raw!==''){const parsed=Number(raw);value=Number.isFinite(parsed)?parsed:raw;const style=Number(cell.getAttribute('s')??0);if(typeof value==='number'&&isDateFormat(styleFormats[style]??0,customFormats))value=excelDate(value)}
      row[column]=value;if(formula)formulas.push({cell:ref,formula,cachedValue:value})
    }rows.push(row);rowNumbers.push(Math.max(1,Number(rowNode.getAttribute('r'))||rows.length))}
    return {name,rows,formulas,rowNumbers}
  })
  return {sheets,formulaCount:sheets.reduce((sum,sheet)=>sum+sheet.formulas.length,0)}
}

export function parseCSVWorkbook(text: string, name='Import CSV'): ExcelWorkbook {
  const first=text.split(/\r?\n/,1)[0]??'',delimiter=(first.match(/;/g)?.length??0)>(first.match(/,/g)?.length??0)?';':','
  const rows:ExcelValue[][]=[];let row:string[]=[],cell='',quoted=false
  for(let i=0;i<=text.length;i++){const char=text[i]??'\n';if(char==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(char===delimiter&&!quoted){row.push(cell.trim());cell=''}else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&text[i+1]==='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell=''}else cell+=char}
  return {sheets:[{name,rows,formulas:[]}],formulaCount:0}
}

function locateTables(workbook: ExcelWorkbook) {
  const located:LocatedTable[]=[]
  for(const sheet of workbook.sheets){let winner:LocatedTable|undefined
    for(const definition of definitions){for(let rowIndex=0;rowIndex<Math.min(20,sheet.rows.length);rowIndex++){const columns:Record<string,number>={};sheet.rows[rowIndex].forEach((value,column)=>{const header=normalize(value);for(const [field,aliases] of Object.entries(definition.aliases))if(!Object.hasOwn(columns,field)&&aliases.some((alias)=>normalize(alias)===header))columns[field]=column});const keys=Object.keys(columns),valid=definition.required.every((options)=>options.some((field)=>keys.includes(field))),nameMatch=definition.names.some((name)=>normalize(sheet.name).includes(normalize(name)));if(!valid&&!(nameMatch&&keys.length>=Math.max(1,definition.required.length)))continue;const score=keys.length+(nameMatch?5:0);if(!winner||score>winner.score)winner={definition,sheet,headerRow:rowIndex,columns,score}}}
    if(winner)located.push(winner)
  }
  return located
}
function records(table: LocatedTable) { return table.sheet.rows.slice(table.headerRow+1).filter((row)=>Object.values(table.columns).some((column)=>clean(row[column])!=='')).map((row)=>Object.fromEntries(Object.entries(table.columns).map(([field,column])=>[field,row[column]])) as Record<string,ExcelValue>) }
function transactionType(value: unknown, amount: number, hasDebit: boolean, hasCredit: boolean): TransactionType {const type=normalize(value);if(/revenu|income|credit|entree|recette/.test(type))return'income';if(/depense|expense|debit|sortie|achat/.test(type))return'expense';if(hasCredit)return'income';if(hasDebit)return'expense';return amount<0?'expense':'income'}
function taskStatus(value: unknown):TaskStatus {const status=normalize(value);if(/fait|termine|fini|done|complete|clos/.test(status))return'done';if(/cours|doing|progress|commence/.test(status))return'doing';return'todo'}
function priority(value: unknown):Priority {const p=normalize(value);if(/urgent|critique/.test(p))return'urgent';if(/haut|high|eleve/.test(p))return'high';if(/bas|low|faible/.test(p))return'low';return'medium'}
function investmentType(value: unknown):Investment['type'] {const type=normalize(value);if(type.includes('crypto'))return'Crypto';if(/immob|real estate/.test(type))return'Immobilier';if(/epargne|saving|obligation/.test(type))return'Épargne';return'Actions'}
function importedDateFormat(value: unknown): Settings['dateFormat'] | undefined { const raw=clean(value).toUpperCase().replace(/[.\-]/g,'/').replace(/\s/g,'');if(raw.startsWith('YYYY'))return'YYYY-MM-DD';if(raw.startsWith('MM'))return'MM/DD/YYYY';if(raw.startsWith('DD'))return'DD/MM/YYYY';return undefined }
function applyProfileRow(plan: ExcelImportPlan, row: Record<string, ExcelValue>, dateFormat: Settings['dateFormat']) {
  const field=normalize(row.field),value=clean(row.value),normalizedValue=normalize(value)
  if(!field||!value)return false
  if(['nom','name','nom complet'].includes(field))plan.profile.name=value
  else if(field==='email'||field==='e mail')plan.profile.email=value
  else if(['ville','city'].includes(field))plan.profile.city=value
  else if(['telephone','phone'].includes(field))plan.profile.phone=value
  else if(['bio','biographie'].includes(field))plan.profile.bio=value
  else if(['date naissance','birth date','naissance'].includes(field))plan.profile.birthDate=asDate(value,undefined,dateFormat)
  else if(['devise','currency'].includes(field)&&['MAD','EUR','USD','GBP','CAD','CHF','AED'].includes(value.toUpperCase()))plan.settings.currency=value.toUpperCase() as Settings['currency']
  else if(['langue','language'].includes(field)) { if(/^(fr|francais|french)$/.test(normalizedValue))plan.settings.language='fr';else if(/^(en|anglais|english)$/.test(normalizedValue))plan.settings.language='en';else return false }
  else if(['fuseau horaire','timezone','time zone'].includes(field))plan.settings.timezone=value
  else if(['format date','format de date','date format','ordre des dates'].includes(field)) { const parsed=importedDateFormat(value);if(!parsed)return false;plan.settings.dateFormat=parsed }
  else if(['format heure','format de l heure','time format','heure'].includes(field)) { if(value.includes('12'))plan.settings.timeFormat='12h';else if(value.includes('24'))plan.settings.timeFormat='24h';else return false }
  else if(['densite','density','densite affichage','densite d affichage'].includes(field)) { if(/compact/.test(normalizedValue))plan.settings.density='compact';else if(/spac|aere/.test(normalizedValue))plan.settings.density='spacious';else if(/comfort|confort|equilibr/.test(normalizedValue))plan.settings.density='comfortable';else return false }
  else if(['decimales','decimales prix','decimales des prix','decimales montants','decimales des montants','amount decimals','decimal places'].includes(field))plan.settings.amountDecimals=num(value)===2?2:0
  else if(['affichage devise','currency display','format devise'].includes(field)) { if(/code|iso/.test(normalizedValue))plan.settings.currencyDisplay='code';else if(/symbole|symbol/.test(normalizedValue))plan.settings.currencyDisplay='symbol';else return false }
  else if(['theme','mode apparence'].includes(field)) { if(/sombre|dark/.test(normalizedValue))plan.settings.theme='dark';else if(/clair|light/.test(normalizedValue))plan.settings.theme='light';else if(/auto|system/.test(normalizedValue))plan.settings.theme='auto';else return false }
  else return false
  return true
}

type DeepKind = 'transactions' | 'budgets' | 'tasks' | 'goals' | 'habits' | 'journal' | 'notes'
type DeepRow = { row: ExcelValue[]; rowNumber: number; values: ExcelValue[]; text: string[] }

const deepLabels: Record<DeepKind, string> = {
  transactions: 'Finances',
  budgets: 'Budgets',
  tasks: 'Tâches / Agenda',
  goals: 'Objectifs',
  habits: 'Habitudes',
  journal: 'Journal',
  notes: 'Notes',
}
const ignoredDeepLabels = new Set([
  'titre','title','nom','name','description','details','detail','date','jour','heure','horaire','time','statut','status','etat',
  'priorite','priority','categorie','category','objectif','goal','progression','progres','avancement','contenu','content','note',
  'lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche','monday','tuesday','wednesday','thursday','friday','saturday','sunday',
  'janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre',
  'oui','non','yes','no','fait','termine','en cours','a faire','todo','done','total','sous total',
])

function meaningfulDeepRows(sheet: ExcelSheet): DeepRow[] {
  return sheet.rows.flatMap((row, index) => {
    const values = row.filter((value) => value !== null && value !== undefined && clean(value) !== '')
    if (!values.length) return []
    return [{ row, rowNumber: sheet.rowNumbers?.[index] ?? index + 1, values, text: values.filter((value): value is string => typeof value === 'string').map(clean).filter(Boolean) }]
  })
}

function classifyDeepSheet(sheet: ExcelSheet, rows: DeepRow[]): DeepKind {
  const sample = normalize(`${sheet.name} ${rows.slice(0, 60).flatMap((row) => row.text).join(' ')}`)
  const name = normalize(sheet.name)
  if (/journal|quotidien|humeur|gratitude|rapport hebdo|bilan hebdo/.test(name) || /journal|humeur|gratitude/.test(sample)) return 'journal'
  if (/habitude|routine|sport|entrainement|pauses? travail|bien etre|sommeil/.test(name) || /serie quotidienne|streak|habitude/.test(sample)) return 'habits'
  if (/skill|competence|apprendre|objectif|projet revenu|vision|roadmap/.test(name) || /objectif smart|progression cible|competence a apprendre/.test(sample)) return 'goals'
  if (/budget|prevision depense|enveloppe/.test(name) || /budget mensuel|montant prevu|plafond/.test(sample)) return 'budgets'
  if (/finance|depense|revenu|recette|banque|tresorerie|argent|vente/.test(name) || /montant.*(?:depense|revenu)|(?:depense|revenu).*montant|debit.*credit/.test(sample)) return 'transactions'
  if (/planning|planification|programme|semaine|weekly|hebdo|agenda|calendrier|emploi du temps|plan d action|to do|\b\d{1,2}\s+(?:au\s+)?\d{1,2}\s+(?:janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)/.test(name) || /echeance|priorite|a faire|horaire/.test(sample)) return 'tasks'
  return 'notes'
}

function looksLikeDate(value: ExcelValue, dateFormat: Settings['dateFormat']) {
  if (typeof value !== 'string' || !/^(?:\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4})(?:[ T].*)?$/.test(value.trim())) return undefined
  return asDate(value, '', dateFormat) || undefined
}
function looksLikeTime(value: ExcelValue) {
  if (typeof value === 'number' && value >= 0 && value < 1) return asTime(value)
  if (typeof value !== 'string' || !/^(?:[01]?\d|2[0-3])[:h][0-5]\d(?:\s*(?:am|pm))?$/i.test(value.trim())) return undefined
  return asTime(value.replace(/h/i, ':'))
}
function deepAmount(row: DeepRow, dateFormat: Settings['dateFormat']) {
  const explicit = row.values.filter((value) => typeof value === 'string' && /(?:mad|dhs?|€|eur|\$|usd|£|gbp)/i.test(value) && !looksLikeDate(value, dateFormat))
  const numeric = row.values.filter((value) => (typeof value === 'number' || /^[-+]?\(?[\d\s.,]+\)?$/.test(clean(value))) && !looksLikeDate(value, dateFormat) && !looksLikeTime(value) && !clean(value).includes('%'))
  const candidate = explicit.at(-1) ?? numeric.at(-1)
  if (candidate === undefined) return undefined
  const amount = num(candidate, Number.NaN)
  return Number.isFinite(amount) && amount !== 0 ? amount : undefined
}
function deepCandidates(row: DeepRow, sheetName: string) {
  return row.text.filter((value) => {
    const normalized = normalize(value)
    if (value.length < 3 || value.length > 240 || normalized === normalize(sheetName) || ignoredDeepLabels.has(normalized)) return false
    if (looksLikeDate(value, 'DD/MM/YYYY') || looksLikeTime(value) || /^[-+]?\d+(?:[.,]\d+)?\s*%?$/.test(value)) return false
    if (/^(?:mad|eur|usd|dh|dhs|semaine|week)\s*\d*$/i.test(normalized)) return false
    return true
  })
}
function archiveCell(value: ExcelValue) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\r?\n/g, ' ↵ ').trim()
}
function columnNameForArchive(index: number) {
  let result = ''
  for (let current = index + 1; current > 0; current = Math.floor((current - 1) / 26)) result = String.fromCharCode((current - 1) % 26 + 65) + result
  return result
}
function splitArchive(content: string, maximum = 24_000) {
  const chunks: string[] = []
  let remaining = content
  while (remaining.length > maximum) {
    const breakAt = Math.max(remaining.lastIndexOf('\n', maximum), Math.floor(maximum * 0.6))
    chunks.push(remaining.slice(0, breakAt))
    remaining = remaining.slice(breakAt).replace(/^\n/, '')
  }
  if (remaining) chunks.push(remaining)
  return chunks
}
function archiveSheet(sheet: ExcelSheet, rows: DeepRow[]) {
  const lines = [
    `ARCHIVE EXCEL COMPLÈTE — ${sheet.name}`,
    'Chaque cellule non vide est conservée ci-dessous avec sa coordonnée d’origine.',
    '',
  ]
  for (const { row, rowNumber } of rows) {
    const cells = row.flatMap((value, column) => {
      const rendered = archiveCell(value)
      return rendered ? [`${columnNameForArchive(column)}${rowNumber}: ${rendered}`] : []
    })
    if (cells.length) lines.push(cells.join('  |  '))
  }
  if (sheet.formulas.length) {
    lines.push('', 'FORMULES (expression et résultat mémorisé)')
    for (const formula of sheet.formulas) lines.push(`${formula.cell}: =${formula.formula}  →  ${archiveCell(formula.cachedValue) || 'résultat non enregistré'}`)
  }
  return splitArchive(lines.join('\n'))
}

function deepReadSheet(plan: ExcelImportPlan, sheet: ExcelSheet, dateFormat: Settings['dateFormat'], today: string, widgetSet: Set<ModuleId>) {
  const rows = meaningfulDeepRows(sheet)
  if (!rows.length && !sheet.formulas.length) return
  const kind = classifyDeepSheet(sheet, rows)
  const before = {
    transactions: plan.transactions.length,
    budgets: plan.budgets.length,
    tasks: plan.tasks.length,
    events: plan.events.length,
    goals: plan.goals.length,
    habits: plan.habits.length,
    journal: plan.journal.length,
  }
  const seen = new Set<string>()
  const uniqueCandidates = (row: DeepRow) => deepCandidates(row, sheet.name).filter((candidate) => {
    const key = normalize(candidate)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  if (kind === 'transactions') {
    for (const row of rows) {
      const amount = deepAmount(row, dateFormat)
      const title = uniqueCandidates(row).sort((first, second) => second.length - first.length)[0]
      if (amount === undefined || !title) continue
      if (plan.transactions.length - before.transactions >= 200) break
      const signature = `${sheet.name} ${row.values.join(' ')}`
      const normalizedSignature = normalize(signature)
      const hasDebit = /debit|depense|sortie|achat/.test(normalizedSignature)
      const hasCredit = /credit|revenu|entree|recette|vente/.test(normalizedSignature)
      if (!hasDebit && !hasCredit && amount > 0) continue
      plan.transactions.push({
        id: uuid(),
        date: row.values.map((value) => looksLikeDate(value, dateFormat)).find(Boolean) ?? today,
        title,
        type: transactionType(signature, amount, hasDebit, hasCredit),
        category: `Excel · ${sheet.name}`,
        amount: Math.abs(amount),
        note: 'Déduit par la lecture profonde',
      })
    }
    widgetSet.add('transactions');widgetSet.add('finance');widgetSet.add('expenses')
  }
  if (kind === 'budgets') {
    for (const row of rows) {
      const planned = deepAmount(row, dateFormat)
      const category = uniqueCandidates(row).sort((first, second) => second.length - first.length)[0]
      if (planned === undefined || !category) continue
      if (plan.budgets.length - before.budgets >= 100) break
      plan.budgets.push({ id: uuid(), category, planned: Math.abs(planned), color: colors[plan.budgets.length % colors.length] })
    }
    widgetSet.add('budget');widgetSet.add('finance')
  }
  if (kind === 'tasks') {
    for (const row of rows) {
      const date = row.values.map((value) => looksLikeDate(value, dateFormat)).find(Boolean)
      const time = row.values.map(looksLikeTime).find(Boolean)
      for (const title of uniqueCandidates(row)) {
        if (plan.tasks.length + plan.events.length - before.tasks - before.events >= 200) break
        if (date && time) plan.events.push({ id: uuid(), title, date, time, color: '#596168' })
        else plan.tasks.push({ id: uuid(), title, status: taskStatus(row.values.join(' ')), priority: priority(row.values.join(' ')), dueDate: date ?? today, category: `Excel · ${sheet.name}`, tags: ['import-profond'], subtasks: [] })
      }
      if (plan.tasks.length + plan.events.length - before.tasks - before.events >= 200) break
    }
    widgetSet.add('tasks')
    if (plan.events.length) widgetSet.add('calendar')
  }
  if (kind === 'goals') {
    for (const row of rows) for (const title of uniqueCandidates(row)) {
      if (plan.goals.length - before.goals >= 120) break
      const progressValue = row.values.find((value) => typeof value === 'string' && value.includes('%'))
      const deadline = row.values.map((value) => looksLikeDate(value, dateFormat)).find(Boolean)
      plan.goals.push({ id: uuid(), title, progress: progressValue === undefined ? 0 : percent(progressValue), deadline: deadline ?? new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10), category: `Excel · ${sheet.name}`, milestones: [] })
    }
    widgetSet.add('goals')
  }
  if (kind === 'habits') {
    for (const row of rows) for (const name of uniqueCandidates(row)) {
      if (plan.habits.length - before.habits >= 80) break
      plan.habits.push({ id: uuid(), name, icon: '◇', streak: 0, bestStreak: 0, done: {}, missed: {} })
    }
    if (!seen.size) plan.habits.push({ id: uuid(), name: sheet.name, icon: '◇', streak: 0, bestStreak: 0, done: {}, missed: {} })
    widgetSet.add('habits')
  }
  if (kind === 'journal') {
    for (const row of rows) {
      const content = uniqueCandidates(row).join(' · ')
      if (!content) continue
      if (plan.journal.length - before.journal >= 120) break
      const date = row.values.map((value) => looksLikeDate(value, dateFormat)).find(Boolean) ?? today
      plan.journal.push({ id: uuid(), date, content, mood: 3 })
    }
    widgetSet.add('journal')
  }

  const inferredRecords =
    plan.transactions.length - before.transactions +
    plan.budgets.length - before.budgets +
    plan.tasks.length - before.tasks +
    plan.events.length - before.events +
    plan.goals.length - before.goals +
    plan.habits.length - before.habits +
    plan.journal.length - before.journal
  const archive = archiveSheet(sheet, rows)
  const now = new Date().toISOString()
  archive.forEach((content, index) => plan.notes.push({
    id: uuid(),
    title: `Excel · ${sheet.name}${archive.length > 1 ? ` (${index + 1}/${archive.length})` : ''}`,
    content,
    updatedAt: now,
    pinned: false,
  }))
  widgetSet.add('notes')
  const cells = rows.reduce((total, row) => total + row.values.length, 0) + sheet.formulas.filter((formula) => formula.cachedValue === null || formula.cachedValue === '').length
  plan.deepAnalysis.push({
    sheet: sheet.name,
    rows: rows.length,
    cells,
    destination: `${deepLabels[kind]} + archive Notes`,
    inferredRecords,
    archiveNotes: archive.length,
  })
  const count = inferredRecords + archive.length
  plan.detected.push({ kind, label: `Lecture profonde · ${deepLabels[kind]}`, sheet: sheet.name, count, headerRow: 0, deep: true })
  plan.totalRecords += count
}

export function buildExcelImportPlan(workbook: ExcelWorkbook): ExcelImportPlan {
  const plan:ExcelImportPlan={workbook,detected:[],transactions:[],tasks:[],events:[],budgets:[],savingsGoals:[],investments:[],goals:[],habits:[],notes:[],journal:[],profile:{},settings:{},widgets:[],deepAnalysis:[],warnings:[],totalRecords:0}
  const widgetSet=new Set<ModuleId>(),today=new Date().toISOString().slice(0,10),located=locateTables(workbook)
  let dateFormat:Settings['dateFormat']='DD/MM/YYYY'
  for(const table of located.filter((item)=>item.definition.kind==='profile'))for(const row of records(table))if(['format date','format de date','date format','ordre des dates'].includes(normalize(row.field)))dateFormat=importedDateFormat(row.value)??dateFormat
  const importedDate=(value:unknown,fallback?:string)=>asDate(value,fallback,dateFormat)

  for(const table of located){
    const data=records(table)
    const before:Record<ImportKind,number>={transactions:plan.transactions.length,tasks:plan.tasks.length,events:plan.events.length,budgets:plan.budgets.length,savings:plan.savingsGoals.length,investments:plan.investments.length,goals:plan.goals.length,habits:plan.habits.length,notes:plan.notes.length,journal:plan.journal.length,profile:0}
    let profileCount=0
    if(table.definition.kind==='transactions'){
      for(const row of data){const debit=num(row.debit),credit=num(row.credit),rawAmount=row.amount!==undefined?num(row.amount):credit||debit,amount=Math.abs(rawAmount);if(!amount)continue;plan.transactions.push({id:uuid(),date:importedDate(row.date),title:clean(row.title)||'Transaction importée',type:transactionType(row.type,rawAmount,debit>0,credit>0),category:clean(row.category)||'Import Excel',amount,note:clean(row.note)||undefined})}
      widgetSet.add('transactions');widgetSet.add('finance');widgetSet.add('expenses')
    }
    if(table.definition.kind==='tasks'){
      for(const row of data){const title=clean(row.title);if(!title)continue;plan.tasks.push({id:uuid(),title,status:taskStatus(row.status),priority:priority(row.priority),dueDate:importedDate(row.dueDate),category:clean(row.category)||'Import Excel',tags:clean(row.tags).split(/[,;]/).map((x)=>x.trim()).filter(Boolean),subtasks:[]})}
      widgetSet.add('tasks')
    }
    if(table.definition.kind==='events'){
      for(const row of data){const title=clean(row.title);if(!title)continue;plan.events.push({id:uuid(),title,date:importedDate(row.date),time:asTime(row.time),color:clean(row.color)||'#596168'})}
      widgetSet.add('calendar')
    }
    if(table.definition.kind==='budgets'){
      for(const row of data){const category=clean(row.category),planned=Math.abs(num(row.planned));if(!category||!planned)continue;plan.budgets.push({id:uuid(),category,planned,color:clean(row.color)||colors[plan.budgets.length%colors.length]})}
      widgetSet.add('budget')
    }
    if(table.definition.kind==='savings'){
      for(const row of data){const name=clean(row.name),target=Math.abs(num(row.target));if(!name||!target)continue;plan.savingsGoals.push({id:uuid(),name,current:Math.max(0,Math.min(target,num(row.current))),target,deadline:importedDate(row.deadline,new Date(Date.now()+365*86400000).toISOString().slice(0,10)),icon:clean(row.icon)||'🎯'})}
      widgetSet.add('savings')
    }
    if(table.definition.kind==='investments'){
      for(const row of data){const name=clean(row.name),value=Math.abs(num(row.value||row.invested));if(!name||!value)continue;plan.investments.push({id:uuid(),name,symbol:(clean(row.symbol)||name.slice(0,4)).toUpperCase(),type:investmentType(row.type),value,invested:Math.abs(num(row.invested,value)),change:num(row.change)})}
      widgetSet.add('investments')
    }
    if(table.definition.kind==='goals'){
      for(const row of data){const title=clean(row.title);if(!title)continue;plan.goals.push({id:uuid(),title,progress:percent(row.progress),deadline:importedDate(row.deadline,new Date(Date.now()+90*86400000).toISOString().slice(0,10)),category:clean(row.category)||'Personnel',milestones:[]})}
      widgetSet.add('goals')
    }
    if(table.definition.kind==='habits'){
      for(const row of data){const name=clean(row.name);if(!name)continue;const streak=Math.max(0,Math.round(num(row.streak)));plan.habits.push({id:uuid(),name,icon:clean(row.icon)||'◇',streak,bestStreak:Math.max(streak,Math.round(num(row.bestStreak,streak))),done:/fait|done|oui|yes/.test(normalize(row.state))?{[today]:true}:{},missed:/manque|missed|non|no/.test(normalize(row.state))?{[today]:true}:{}})}
      widgetSet.add('habits')
    }
    if(table.definition.kind==='notes'){
      for(const row of data){const content=clean(row.content),title=clean(row.title)||'Note importée';if(!content&&!clean(row.title))continue;plan.notes.push({id:uuid(),title,content,updatedAt:importedDate(row.updatedAt,new Date().toISOString()),pinned:bool(row.pinned)})}
      widgetSet.add('notes')
    }
    if(table.definition.kind==='journal'){
      for(const row of data){const content=clean(row.content);if(!content)continue;plan.journal.push({id:uuid(),date:importedDate(row.date),content,mood:Math.max(1,Math.min(5,Math.round(num(row.mood,3))))})}
      widgetSet.add('journal')
    }
    if(table.definition.kind==='profile')for(const row of data)if(applyProfileRow(plan,row,dateFormat))profileCount++
    const after:Record<ImportKind,number>={transactions:plan.transactions.length,tasks:plan.tasks.length,events:plan.events.length,budgets:plan.budgets.length,savings:plan.savingsGoals.length,investments:plan.investments.length,goals:plan.goals.length,habits:plan.habits.length,notes:plan.notes.length,journal:plan.journal.length,profile:profileCount}
    const current=table.definition.kind==='profile'?profileCount:Math.max(0,after[table.definition.kind]-before[table.definition.kind])
    plan.detected.push({kind:table.definition.kind,label:labels[table.definition.kind],sheet:table.sheet.name,count:current,headerRow:table.headerRow+1})
    plan.totalRecords+=current
  }
  const strictlyMapped = new Set(plan.detected.filter((item) => item.count > 0).map((item) => item.sheet))
  for (const sheet of workbook.sheets) if (!strictlyMapped.has(sheet.name)) deepReadSheet(plan, sheet, dateFormat, today, widgetSet)
  plan.widgets=[...widgetSet]
  const emptySheets=workbook.sheets.filter((sheet)=>!meaningfulDeepRows(sheet).length&&!sheet.formulas.length)
  if(emptySheets.length)plan.warnings.push(`${emptySheets.length} feuille(s) vide(s) ignorée(s) : ${emptySheets.map((sheet)=>sheet.name).join(', ')}.`)
  if(workbook.formulaCount)plan.warnings.push(`${workbook.formulaCount} formule(s) détectée(s). LifeOS conserve leur expression et lit leur résultat enregistré sans exécuter de macro ni de formule.`)
  return plan
}

function xmlEscape(value: unknown) { return clean(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
function columnName(index:number){let result='';for(let n=index+1;n>0;n=Math.floor((n-1)/26))result=String.fromCharCode((n-1)%26+65)+result;return result}
function worksheetXML(rows:(string|number)[][]){return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row,r)=>`<row r="${r+1}">${row.map((value,c)=>typeof value==='number'?`<c r="${columnName(c)}${r+1}"><v>${value}</v></c>`:`<c r="${columnName(c)}${r+1}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`).join('')}</row>`).join('')}</sheetData></worksheet>`}
export function createLifeOSExcelTemplate(){const sheets=[
  ['Transactions',[['Date','Libellé','Type','Catégorie','Montant'],['2026-08-20','Courses','Dépense','Alimentation',450]]],
  ['Taches',[['Titre','Statut','Priorité','Échéance','Catégorie'],['Préparer le bilan','En cours','Haute','2026-09-01','Travail']]],
  ['Evenements',[['Titre','Date','Heure'],['Réunion équipe','2026-09-03','10:00']]],
  ['Budget',[['Catégorie','Budget mensuel'],['Alimentation',2500]]],
  ['Epargne',[['Nom','Montant cible','Montant actuel','Échéance'],['Fonds urgence',30000,8500,'2027-06-01']]],
  ['Investissements',[['Nom','Symbole','Type','Valeur','Montant investi'],['ETF Monde','IWDA','Actions',12000,10500]]],
  ['Objectifs',[['Titre','Progression','Échéance','Catégorie'],['Courir 10 km',35,'2026-12-01','Santé']]],
  ['Habitudes',[['Nom','Série','Meilleure série'],['Lecture',7,15]]],
  ['Notes',[['Titre','Contenu'],['Idées semaine','Préparer le planning de septembre']]],
  ['Journal',[['Date','Humeur','Contenu'],['2026-08-23',4,'Une journée productive.']]],
  ['Profil',[['Champ','Valeur'],['Nom','Mourad Ghazi'],['Ville','Casablanca'],['Devise','MAD'],['Langue','fr'],['Format de date','DD/MM/YYYY'],['Format de l’heure','24h'],['Densité d’affichage','Confortable'],['Décimales des prix',0],['Affichage devise','Symbole'],['Fuseau horaire','Africa/Casablanca']]],
] as [string,(string|number)[][]][]
  const contentTypes=`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`
  const rootRels=`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
  const workbook=`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map(([name],i)=>`<sheet name="${xmlEscape(name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`
  const workbookRels=`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}</Relationships>`
  const files:Record<string,Uint8Array>={'[Content_Types].xml':strToU8(contentTypes),'_rels/.rels':strToU8(rootRels),'xl/workbook.xml':strToU8(workbook),'xl/_rels/workbook.xml.rels':strToU8(workbookRels)}
  sheets.forEach(([,rows],i)=>files[`xl/worksheets/sheet${i+1}.xml`]=strToU8(worksheetXML(rows)))
  return zipSync(files,{level:6})
}
