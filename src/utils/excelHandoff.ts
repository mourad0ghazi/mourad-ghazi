let queuedExcelFile: File | null = null

export function queueExcelImportFile(file: File) {
  queuedExcelFile = file
}

export function takeQueuedExcelFile() {
  const file = queuedExcelFile
  queuedExcelFile = null
  return file
}
