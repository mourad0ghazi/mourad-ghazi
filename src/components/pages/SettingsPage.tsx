import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Bell, CalendarDays, Check, CircleDollarSign, Database, Download, Eye, EyeOff, FileSpreadsheet, Gift, Keyboard, LayoutGrid, LayoutTemplate, LockKeyhole, MailCheck, Move, Palette, Save, Send, Shield, Sparkles, Trash2, Upload, User, WalletCards } from 'lucide-react'
import { motion } from 'framer-motion'
import { dashboardPresets } from '../../data/dashboardPresets'
import { modules, type ModuleId } from '../../data/modules'
import { sortLayout, useDashboardStore, useFinancePlanningStore, useFinanceStore, usePersonalStore, useSettingsStore, useUIStore } from '../../store'
import type { Density, Settings, Theme } from '../../types'
import { queueExcelImportFile } from '../../utils/excelHandoff'
import { buildEmailNotificationMessage, getEmailPreparationHistory, prepareEmailNotification } from '../../utils/emailNotifications'
import { downloadFile, formatCurrency, formatDate, initials } from '../../utils/helpers'
import { Badge, Button, IconButton, Input, Select, Toggle } from '../ui'

const sections = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'appearance', label: 'Apparence', icon: Palette },
  { id: 'locale', label: 'Langue & région', icon: WalletCards },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'data', label: 'Données', icon: Database },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'shortcuts', label: 'Raccourcis', icon: Keyboard },
]

export function SettingsPage() {
  const [section, setSection] = useState(() => {
    const requested = sessionStorage.getItem('lifeos:settings-section')
    sessionStorage.removeItem('lifeos:settings-section')
    return sections.some((item) => item.id === requested) ? requested! : 'profile'
  })
  return <motion.div className="page settings-page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
    <div className="page-heading"><div><span className="eyebrow">PERSONNALISATION</span><h1>Paramètres</h1><p>LifeOS s’adapte à votre rythme, vos formats et votre façon de travailler.</p></div><Badge tone="free"><Gift size={12}/> TOUT INCLUS</Badge></div>
    <div className="settings-shell"><nav className="settings-nav">{sections.map((item) => <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => setSection(item.id)}><item.icon size={17}/>{item.label}</button>)}</nav><div className="settings-content"><SettingsSection id={section}/></div></div>
  </motion.div>
}

function SettingsSection({ id }: { id: string }) {
  const state = useSettingsStore()
  const update = useSettingsStore((store) => store.update)
  const updateProfile = useSettingsStore((store) => store.updateProfile)
  const showToast = useUIStore((store) => store.showToast)
  const fileRef = useRef<HTMLInputElement>(null)
  const save = () => showToast('Paramètres enregistrés automatiquement')

  if (id === 'profile') return <SettingsBlock title="Votre profil" description="Ces informations personnalisent les salutations et l’assistant."><div className="profile-editor"><div className="avatar-upload"><span className="avatar xlarge">{state.profile.avatar ? <img src={state.profile.avatar} alt="Avatar"/> : initials(state.profile.name)}</span><div><Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}><Upload size={15}/>Changer la photo</Button><small>JPG ou PNG, stocké localement.</small></div><input ref={fileRef} hidden type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => updateProfile({ avatar: String(reader.result) }); reader.readAsDataURL(file) } }}/></div><div className="form-grid"><Field label="Nom complet"><Input value={state.profile.name} onChange={(event) => updateProfile({ name: event.target.value })}/></Field><Field label="Email"><Input type="email" value={state.profile.email} onChange={(event) => updateProfile({ email: event.target.value })}/></Field><Field label="Téléphone"><Input value={state.profile.phone} onChange={(event) => updateProfile({ phone: event.target.value })}/></Field><Field label="Ville"><Input value={state.profile.city} onChange={(event) => updateProfile({ city: event.target.value })}/></Field><Field label="Date de naissance"><Input type="date" value={state.profile.birthDate} onChange={(event) => updateProfile({ birthDate: event.target.value })}/></Field><Field label="Bio" wide><textarea className="input" rows={3} value={state.profile.bio} onChange={(event) => updateProfile({ bio: event.target.value })}/></Field></div><Button onClick={save}><Save size={16}/>Enregistrer</Button></div></SettingsBlock>

  if (id === 'appearance') return <SettingsBlock title="Apparence" description="Choisissez une ambiance cohérente avec votre espace."><SettingGroup title="Thème"><ChoiceCards options={[{ id: 'light', label: 'Clair', hint: 'Toujours lumineux' }, { id: 'dark', label: 'Sombre', hint: 'Confort le soir' }, { id: 'auto', label: 'Automatique', hint: 'Selon le système' }]} value={state.theme} onChange={(value) => update({ theme: value as Theme })}/></SettingGroup><SettingGroup title="Couleur d’accent"><div className="accent-options">{(['smoke', 'sage', 'slate', 'terracotta'] as const).map((accent) => <button key={accent} className={`${accent} ${state.accent === accent ? 'active' : ''}`} onClick={() => update({ accent })}><i/><span>{accent === 'smoke' ? 'Fumée' : accent === 'sage' ? 'Sauge' : accent === 'slate' ? 'Ardoise' : 'Terre cuite'}</span>{state.accent === accent && <Check size={15}/>}</button>)}</div></SettingGroup><SettingGroup title="Densité"><ChoiceCards options={[{ id: 'compact', label: 'Compacte', hint: 'Plus d’informations' }, { id: 'comfortable', label: 'Confortable', hint: 'Équilibrée' }, { id: 'spacious', label: 'Spacieuse', hint: 'Plus aérée' }]} value={state.density} onChange={(value) => update({ density: value as Density })}/></SettingGroup><SettingGroup title="Mouvements"><ToggleRow label="Animations d’interface" text="Transitions et révélations fluides" value={state.animations} onChange={(value) => update({ animations: value })}/><ToggleRow label="Effet fumée" text="Brume douce en arrière-plan" value={state.smoke} onChange={(value) => update({ smoke: value })}/><ToggleRow label="Parallax subtil" text="Profondeur de la bannière" value={state.parallax} onChange={(value) => update({ parallax: value })}/></SettingGroup></SettingsBlock>

  if (id === 'locale') {
    const previewMoney = formatCurrency(12345.67, state.currency, false, { fractionDigits: state.amountDecimals, currencyDisplay: state.currencyDisplay, language: state.language })
    const previewDate = formatDate(new Date(), { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: state.timezone }, state.dateFormat, state.language)
    const previewTime = new Intl.DateTimeFormat(state.language === 'en' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit', hour12: state.timeFormat === '12h', timeZone: state.timezone }).format(new Date())
    return <SettingsBlock title="Langue, prix & dates" description="Ces formats sont appliqués immédiatement dans tout le dashboard et peuvent aussi venir de votre fichier Excel."><div className="format-preview"><div><CircleDollarSign/><span><small>Aperçu d’un prix</small><b>{previewMoney}</b></span></div><div><CalendarDays/><span><small>Aperçu date et heure</small><b>{previewDate} · {previewTime}</b></span></div></div><div className="form-grid"><Field label="Langue"><Select value={state.language} onChange={(event) => update({ language: event.target.value as Settings['language'] })}><option value="fr">🇫🇷 Français</option><option value="en">🇬🇧 English</option></Select></Field><Field label="Devise"><Select value={state.currency} onChange={(event) => update({ currency: event.target.value as Settings['currency'] })}>{['MAD', 'EUR', 'USD', 'GBP', 'CAD', 'CHF', 'AED'].map((currency) => <option key={currency}>{currency}</option>)}</Select></Field><Field label="Format de date"><Select value={state.dateFormat} onChange={(event) => update({ dateFormat: event.target.value as Settings['dateFormat'] })}><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></Select></Field><Field label="Format de l’heure"><Select value={state.timeFormat} onChange={(event) => update({ timeFormat: event.target.value as Settings['timeFormat'] })}><option value="24h">24 heures</option><option value="12h">12 heures</option></Select></Field><Field label="Décimales des prix"><Select value={state.amountDecimals} onChange={(event) => update({ amountDecimals: Number(event.target.value) as Settings['amountDecimals'] })}><option value="0">Sans décimales</option><option value="2">Toujours 2 décimales</option></Select></Field><Field label="Affichage de la devise"><Select value={state.currencyDisplay} onChange={(event) => update({ currencyDisplay: event.target.value as Settings['currencyDisplay'] })}><option value="symbol">Symbole (DH, €, $)</option><option value="code">Code (MAD, EUR, USD)</option></Select></Field><Field label="Fuseau horaire" wide><Select value={state.timezone} onChange={(event) => update({ timezone: event.target.value })}>{['Africa/Casablanca', 'Europe/Paris', 'Europe/London', 'America/New_York', 'Asia/Dubai', 'Asia/Tokyo'].map((timezone) => <option key={timezone}>{timezone}</option>)}</Select></Field></div></SettingsBlock>
  }

  if (id === 'dashboard') return <DashboardSettings/>
  if (id === 'notifications') return <SettingsBlock title="Notifications & e-mail" description="Contrôlez les alertes LifeOS et préparez des récapitulatifs dans votre application e-mail."><ToggleRow label="Notifications LifeOS" text="Interrupteur principal des alertes dans l’application" value={state.notifications} onChange={(value) => update({ notifications: value })}/><ToggleRow label="Alertes de budget" text="À 80 % et en cas de dépassement" value={state.budgetAlerts} onChange={(value) => update({ budgetAlerts: value })}/><EmailNotificationSettings/><SettingGroup title="Coach local"><ToggleRow label="Coach proactif" text="Conseils contextuels selon vos données" value={state.coachMode} onChange={(value) => update({ coachMode: value })}/><div className="form-grid top-space"><Field label="Fréquence du coach"><Select value={state.coachFrequency} onChange={(event) => update({ coachFrequency: event.target.value as Settings['coachFrequency'] })}><option value="never">Jamais</option><option value="daily">Quotidien</option><option value="weekly">Hebdomadaire</option></Select></Field></div></SettingGroup></SettingsBlock>
  if (id === 'data') return <DataSettings/>
  if (id === 'security') return <SettingsBlock title="Sécurité locale" description="Protection sur cet appareil, sans transfert de données."><div className="form-grid"><Field label="PIN à 4 chiffres"><Input type="password" inputMode="numeric" maxLength={4} value={state.pin} onChange={(event) => /^\d{0,4}$/.test(event.target.value) && update({ pin: event.target.value })}/></Field></div><ToggleRow label="Masquer les montants" text="Remplace tous les chiffres financiers par •••••" value={state.hideAmounts} onChange={(value) => update({ hideAmounts: value })} icon={state.hideAmounts ? <EyeOff/> : <Eye/>}/><ToggleRow label="Verrouiller le journal" text="Demande le PIN avant la lecture" value={state.journalLocked} onChange={(value) => update({ journalLocked: value })}/><div className="security-note"><LockKeyhole size={18}/><span><b>Protection locale</b>Ce PIN améliore la confidentialité sur un appareil partagé mais ne remplace pas le chiffrement du système.</span></div></SettingsBlock>
  return <SettingsBlock title="Raccourcis clavier" description="Naviguez plus vite dans LifeOS."><div className="shortcuts-list">{[['⌘ K', 'Recherche globale'], ['⌘ T', 'Nouvelle tâche'], ['⌘ N', 'Nouvelle note'], ['⌘ M', 'Nouvelle transaction'], ['⌘ /', 'Ouvrir l’assistant'], ['⌘ ⇧ L', 'Changer de thème'], ['⌘ ⇧ R', 'Télécharger le rapport complet'], ['⌘ ,', 'Paramètres'], ['P', 'Pomodoro'], ['L', 'Verrouiller LifeOS']].map(([keys, label]) => <div key={label}><span>{label}</span><kbd>{keys}</kbd></div>)}</div></SettingsBlock>
}

function EmailNotificationSettings() {
  const state = useSettingsStore()
  const update = useSettingsStore((store) => store.update)
  const showToast = useUIStore((store) => store.showToast)
  const [historyCount, setHistoryCount] = useState(() => getEmailPreparationHistory().length)
  const prepareTest = () => {
    const result = prepareEmailNotification(buildEmailNotificationMessage())
    if (result.ok) {
      setHistoryCount(getEmailPreparationHistory().length)
      showToast('Récapitulatif préparé dans votre application e-mail')
    } else showToast(result.reason)
  }
  return <SettingGroup title="Notifications e-mail">
    <div className="email-settings-intro"><MailCheck size={20}/><span><b>Livraison par votre application e-mail</b><small>LifeOS prépare le destinataire, l’objet et le contenu. Vous gardez le contrôle et validez l’envoi depuis Gmail, Outlook, Apple Mail ou votre application habituelle.</small></span><Badge tone={state.emailNotifications ? 'success' : 'neutral'}>{state.emailNotifications ? 'ACTIVE' : 'INACTIVE'}</Badge></div>
    <ToggleRow label="Activer les récapitulatifs e-mail" text="Affiche une action e-mail dans le centre de notifications" value={state.emailNotifications} onChange={(value) => update({ emailNotifications: value })}/>
    <div className="form-grid top-space"><Field label="Adresse de destination"><Input type="email" value={state.emailAddress} placeholder={state.profile.email} onChange={(event) => update({ emailAddress: event.target.value })}/></Field><Field label="Fréquence souhaitée"><Select value={state.emailFrequency} onChange={(event) => update({ emailFrequency: event.target.value as Settings['emailFrequency'] })}><option value="instant">À la demande</option><option value="daily">Récapitulatif quotidien</option><option value="weekly">Récapitulatif hebdomadaire</option></Select></Field></div>
    <div className="email-alert-options"><ToggleRow label="Budgets" text="Catégories utilisées à 80 % ou plus" value={state.emailBudgetAlerts} onChange={(value) => update({ emailBudgetAlerts: value })}/><ToggleRow label="Tâches" text="Échéances du jour et tâches en retard" value={state.emailTaskReminders} onChange={(value) => update({ emailTaskReminders: value })}/><ToggleRow label="Rapport hebdomadaire" text="Résumé financier et personnel" value={state.emailWeeklyReport} onChange={(value) => update({ emailWeeklyReport: value })}/></div>
    <div className="email-test-row"><span><b>{historyCount} message(s) préparé(s)</b><small>Aucun envoi silencieux : votre validation finale est toujours requise.</small></span><Button variant="secondary" onClick={prepareTest}><Send size={15}/>Tester l’e-mail</Button></div>
  </SettingGroup>
}

function DashboardSettings() {
  const visible = useDashboardStore((state) => state.visible)
  const toggle = useDashboardStore((state) => state.toggleWidget)
  const edit = useDashboardStore((state) => state.editMode)
  const setEdit = useDashboardStore((state) => state.setEditMode)
  const reset = useDashboardStore((state) => state.resetLayout)
  const applyPreset = useDashboardStore((state) => state.applyPreset)
  const activePreset = useDashboardStore((state) => state.activePreset)
  const moveWidget = useDashboardStore((state) => state.moveWidget)
  const layout = useDashboardStore((state) => state.layout)
  const setView = useUIStore((state) => state.setView)
  const showToast = useUIStore((state) => state.showToast)
  const readingOrder = sortLayout(layout).map((item) => item.i)
  const orderedModules = [...modules].sort((a, b) => readingOrder.indexOf(a.id) - readingOrder.indexOf(b.id))

  return <SettingsBlock title="Organisation du dashboard" description="Déplacez, redimensionnez ou appliquez l’une des quatre suggestions de personnalisation.">
    <SettingGroup title="Suggestions complètes · 17 modules"><div className="settings-presets">{dashboardPresets.map((preset) => { const selected = activePreset === preset.id; return <button key={preset.id} className={selected ? 'active' : ''} aria-pressed={selected} onClick={() => { applyPreset(preset.id); showToast(`Disposition « ${preset.label} » appliquée — aucun module masqué`) }}><span>{selected ? <Check size={16}/> : <LayoutTemplate size={16}/>}</span><b>{preset.label}</b><small>{preset.description}</small></button> })}</div></SettingGroup>
    <div className="dashboard-customize-callout"><Move size={23}/><span><b>Déplacer n’importe quelle carte</b><small>Activez le mode puis glissez les cartes et redimensionnez-les depuis leur coin inférieur droit.</small></span><Button onClick={() => { setEdit(true); setView('dashboard') }}><Sparkles size={16}/>Ouvrir la personnalisation</Button></div>
    <ToggleRow label="Mode personnalisation" text="Autoriser le déplacement et le redimensionnement" value={edit} onChange={setEdit}/>
    <div className="settings-modules">{orderedModules.map((item, index) => <div key={item.id}><span><item.icon size={17}/>{item.label}<small>{item.category}</small></span><span className="module-order-actions"><IconButton label={`Monter ${item.label}`} disabled={index === 0} onClick={() => moveWidget(item.id, -1)}><ArrowUp size={13}/></IconButton><IconButton label={`Descendre ${item.label}`} disabled={index === orderedModules.length - 1} onClick={() => moveWidget(item.id, 1)}><ArrowDown size={13}/></IconButton></span><Toggle checked={visible[item.id] !== false} onChange={() => toggle(item.id as ModuleId)} label={`Afficher ${item.label}`}/></div>)}</div>
    <Button variant="secondary" onClick={() => confirm('Réinitialiser tous les modules ?') && reset()}><LayoutGrid size={16}/>Réinitialiser la disposition</Button>
  </SettingsBlock>
}

function DataSettings() {
  const backupInputRef = useRef<HTMLInputElement>(null)
  const excelInputRef = useRef<HTMLInputElement>(null)
  const showToast = useUIStore((state) => state.showToast)
  const setView = useUIStore((state) => state.setView)
  const backup = () => {
    const data = { exportedAt: new Date().toISOString(), version: 3, settings: useSettingsStore.getState(), finance: useFinanceStore.getState(), financePlanning: useFinancePlanningStore.getState(), personal: usePersonalStore.getState(), dashboard: useDashboardStore.getState() }
    downloadFile('lifeos-donnees.json', JSON.stringify(data, null, 2), 'application/json')
    localStorage.setItem('lifeos:last-backup', new Date().toISOString())
    showToast('Sauvegarde téléchargée')
  }
  const restore = (file?: File) => {
    if (!file) return
    file.text().then((text) => {
      try {
        const data = JSON.parse(text)
        if (data.settings) localStorage.setItem('lifeos:v2:settings', JSON.stringify({ state: data.settings, version: 0 }))
        if (data.finance) localStorage.setItem('lifeos:v2:finance', JSON.stringify({ state: data.finance, version: 0 }))
        if (data.financePlanning) localStorage.setItem('lifeos:v2:finance-settings', JSON.stringify({ state: data.financePlanning, version: 1 }))
        if (data.personal) localStorage.setItem('lifeos:v2:personal', JSON.stringify({ state: data.personal, version: 0 }))
        if (data.dashboard) localStorage.setItem('lifeos:v2:dashboard', JSON.stringify({ state: { layout: data.dashboard.layout, visible: data.dashboard.visible, activePreset: data.dashboard.activePreset ?? null }, version: 3 }))
        showToast('Données restaurées')
        setTimeout(() => location.reload(), 700)
      } catch {
        showToast('Fichier invalide')
      }
    })
  }
  const importExcel = (file?: File) => {
    if (!file) return
    queueExcelImportFile(file)
    sessionStorage.setItem('lifeos:open-tool', 'bank')
    showToast(`Analyse locale de « ${file.name} »`)
    setView('tools')
    if (excelInputRef.current) excelInputRef.current.value = ''
  }

  return <SettingsBlock title="Importer & gérer vos données" description="Choisissez directement votre fichier Excel : LifeOS vous montre les changements avant de les appliquer.">
    <section className="settings-excel-import"><span className="settings-excel-icon"><FileSpreadsheet size={29}/></span><div><Badge tone="success">100 % LOCAL</Badge><h3>Importer mon fichier Excel</h3><p>Les prix, dates, budgets, tâches, objectifs, profils et formats reconnus remplaceront ou compléteront les données affichées dans LifeOS.</p><div className="excel-impact-list"><span><CircleDollarSign size={14}/>Prix & devise</span><span><CalendarDays size={14}/>Dates & heures</span><span><LayoutGrid size={14}/>Widgets</span><span><User size={14}/>Profil</span></div></div><Button className="excel-settings-button" onClick={() => excelInputRef.current?.click()}><Upload size={17}/>Choisir mon fichier Excel</Button><input ref={excelInputRef} hidden type="file" accept=".xlsx,.xlsm,.xltx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" onChange={(event) => importExcel(event.target.files?.[0])}/></section>
    <p className="excel-privacy-note"><Shield size={14}/>Le fichier est analysé dans votre navigateur. Rien n’est envoyé vers un serveur.</p>
    <div className="data-actions"><button onClick={backup}><Download/><span><b>Exporter toutes les données</b><small>Fichier JSON portable</small></span></button><button onClick={() => backupInputRef.current?.click()}><Upload/><span><b>Restaurer une sauvegarde</b><small>Depuis un fichier JSON</small></span></button><input ref={backupInputRef} hidden type="file" accept=".json,application/json" onChange={(event) => restore(event.target.files?.[0])}/><button onClick={() => { const snapshot = Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith('lifeos:'))); localStorage.setItem('lifeos:manual-backup', JSON.stringify(snapshot)); localStorage.setItem('lifeos:last-backup', new Date().toISOString()); showToast('Instantané local créé') }}><Save/><span><b>Instantané local</b><small>Dans ce navigateur</small></span></button></div>
    <div className="danger-zone"><span><b>Zone de réinitialisation</b><small>Cette action supprime toutes les données LifeOS locales.</small></span><Button variant="danger" onClick={() => { if (prompt('Tapez SUPPRIMER pour confirmer') === 'SUPPRIMER') { Object.keys(localStorage).filter((key) => key.startsWith('lifeos')).forEach((key) => localStorage.removeItem(key)); location.reload() } }}><Trash2 size={16}/>Réinitialiser</Button></div>
  </SettingsBlock>
}

function SettingsBlock({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="settings-block"><header><h2>{title}</h2><p>{description}</p></header><div>{children}</div></section> }
function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) { return <div className="setting-group"><h3>{title}</h3>{children}</div> }
function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) { return <label className={`field ${wide ? 'wide' : ''}`}><span>{label}</span>{children}</label> }
function ToggleRow({ label, text, value, onChange, icon }: { label: string; text: string; value: boolean; onChange: (value: boolean) => void; icon?: React.ReactNode }) { return <div className="toggle-row"><span>{icon}<span><b>{label}</b><small>{text}</small></span></span><Toggle checked={value} onChange={onChange} label={label}/></div> }
function ChoiceCards({ options, value, onChange }: { options: { id: string; label: string; hint: string }[]; value: string; onChange: (id: string) => void }) { return <div className="choice-cards">{options.map((item) => <button key={item.id} className={value === item.id ? 'active' : ''} onClick={() => onChange(item.id)}><span className="choice-preview"/><b>{item.label}</b><small>{item.hint}</small>{value === item.id && <Check size={15}/>}</button>)}</div> }
