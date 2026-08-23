import type { ExcelWorkbook } from './excel'

const databaseName = 'lifeos-local-files'
const storeName = 'excel-workbooks'
const latestId = 'latest'

export interface WorkbookArchiveInfo {
  fileName: string
  savedAt: string
  sheets: number
  cells: number
}

interface WorkbookArchiveRecord extends WorkbookArchiveInfo {
  id: typeof latestId
  workbook: ExcelWorkbook
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Impossible d’ouvrir l’archive locale.'))
  })
}

async function readRecord() {
  const database = await openDatabase()
  return new Promise<WorkbookArchiveRecord | undefined>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const request = transaction.objectStore(storeName).get(latestId)
    request.onsuccess = () => resolve(request.result as WorkbookArchiveRecord | undefined)
    request.onerror = () => reject(request.error ?? new Error('Impossible de lire l’archive locale.'))
    transaction.oncomplete = () => database.close()
  })
}

export async function saveWorkbookArchive(fileName: string, workbook: ExcelWorkbook) {
  const database = await openDatabase()
  const cells = workbook.sheets.reduce((total, sheet) => total + sheet.rows.reduce((rowTotal, row) => rowTotal + row.filter((value) => value !== null && value !== undefined && String(value).trim() !== '').length, 0), 0)
  const record: WorkbookArchiveRecord = {
    id: latestId,
    fileName,
    savedAt: new Date().toISOString(),
    sheets: workbook.sheets.length,
    cells,
    workbook,
  }
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).put(record)
    transaction.oncomplete = () => { database.close(); resolve() }
    transaction.onerror = () => reject(transaction.error ?? new Error('Impossible d’enregistrer l’archive locale.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('Archivage local interrompu.'))
  })
  return record
}

export async function getWorkbookArchiveInfo(): Promise<WorkbookArchiveInfo | undefined> {
  const record = await readRecord()
  if (!record) return undefined
  return { fileName: record.fileName, savedAt: record.savedAt, sheets: record.sheets, cells: record.cells }
}

export async function loadWorkbookArchive() {
  return readRecord()
}
