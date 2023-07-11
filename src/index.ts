import readXlsxFile, { readSheetNames } from 'read-excel-file/node'
import humps from 'humps'

class ReadFinancial {
  private path: string
  private lang: 'en' | 'id'

  private sheetIndex = {
    GENERAL: 0,
    BALANCE: 0,
    INCOME: 0,
    CURRENTCHANGESTATEMENT: 0,
    PREVIOUSCHANGESTATEMENT: 0,
    CASHFLOW: 0,
  }

  constructor(option: { path: string; language: 'en' | 'id' }) {
    this.path = option.path
    this.lang = option.language
  }

  private async initSheetIndex() {
    const allSheets = await this.getSheets()
    const generalIdx = allSheets.findIndex((v) => v.name === '1000000')
    this.sheetIndex = {
      GENERAL: generalIdx + 1,
      BALANCE: generalIdx + 2,
      INCOME: generalIdx + 3,
      CURRENTCHANGESTATEMENT: generalIdx + 4,
      PREVIOUSCHANGESTATEMENT: generalIdx + 5,
      CASHFLOW: generalIdx + 6,
    }
  }

  async getFullReport() {
    if (this.sheetIndex.GENERAL === 0) await this.initSheetIndex()
    return {
      general: await this.getGeneral(),
      balance: await this.getBalance(),
      income: await this.getIncome(),
      cashflow: await this.getCashflow(),
      changeStatement: await this.getChangeStatement(),
    }
  }

  getSheets() {
    return readSheetNames(this.path).then((sheetNames) => {
      return sheetNames.map((sheetName) => ({ name: sheetName }))
    })
  }

  getRows(
    sheetType: 'GENERAL' | 'BALANCE' | 'INCOME' | 'CURRENTCHANGESTATEMENT' | 'PREVIOUSCHANGESTATEMENT' | 'CASHFLOW'
  ) {
    return readXlsxFile(this.path, {
      sheet: this.sheetIndex[sheetType],
    }).then((rows) => {
      return rows
    })
  }

  async getGeneral() {
    if (this.sheetIndex.GENERAL === 0) await this.initSheetIndex()

    const rows = await readXlsxFile(this.path, { sheet: this.sheetIndex.GENERAL })
    const data: Record<string, string | number> = {}
    for (const row of rows) {
      if (!row[0] || !row[1] || !row[2]) continue
      const descIndex = this.lang === 'en' ? 2 : 0
      data[humps.camelize(row[descIndex].toString())] = row[1]?.toString()
    }

    return data
  }

  async getBalance() {
    if (this.sheetIndex.GENERAL === 0) await this.initSheetIndex()
    const balanceData: Record<string, Record<'previous' | 'current', number>> = {}
    const rows = await readXlsxFile(this.path, { sheet: this.sheetIndex.BALANCE })
    const langIdx = this.lang === 'en' ? 3 : 0
    for (const row of rows.slice(4)) {
      if (!row[0] || !row[3] || (typeof row[1] !== 'number' && typeof row[2] !== 'number')) continue

      balanceData[humps.camelize(row[langIdx].toString())] = {
        previous: row[2] ? parseInt(row[2].toString()) : 0,
        current: row[1] ? parseInt(row[1].toString()) : 0,
      }
    }
    return balanceData
  }

  async getIncome() {
    if (this.sheetIndex.GENERAL === 0) await this.initSheetIndex()
    const incomeData: Record<string, Record<'previous' | 'current', number>> = {}
    const rows = await readXlsxFile(this.path, { sheet: this.sheetIndex.INCOME })
    const langIdx = this.lang === 'en' ? 3 : 0
    for (const row of rows.slice(4)) {
      if (!row[0] || !row[3] || (typeof row[1] !== 'number' && typeof row[2] !== 'number')) continue

      incomeData[humps.camelize(row[langIdx].toString())] = {
        previous: row[2] ? parseInt(row[2].toString()) : 0,
        current: row[1] ? parseInt(row[1].toString()) : 0,
      }
    }
    return incomeData
  }

  async getCashflow() {
    if (this.sheetIndex.GENERAL === 0) await this.initSheetIndex()
    const cashflowData: Record<string, Record<'previous' | 'current', number>> = {}
    const rows = await readXlsxFile(this.path, { sheet: this.sheetIndex.CASHFLOW })
    const langIdx = this.lang === 'en' ? 3 : 0
    for (const row of rows.slice(4)) {
      if (!row[0] || !row[3] || (typeof row[1] !== 'number' && typeof row[2] !== 'number')) continue

      cashflowData[humps.camelize(row[langIdx].toString())] = {
        previous: row[2] ? parseInt(row[2].toString()) : 0,
        current: row[1] ? parseInt(row[1].toString()) : 0,
      }
    }
    return cashflowData
  }

  async getChangeStatement() {
    if (this.sheetIndex.GENERAL === 0) await this.initSheetIndex()
    const changeStatementData: Record<string, Record<string, Record<'previous' | 'current', number>>> = {}
    const previousRows = await readXlsxFile(this.path, { sheet: this.sheetIndex.PREVIOUSCHANGESTATEMENT })
    const langIdx = this.lang === 'en' ? 6 : 5
    if (this.lang === 'id') previousRows.splice(langIdx + 1, 1)
    const prevKeys: string[] = []
    for (const [rowIdx, previousRow] of previousRows.slice(langIdx).entries()) {
      let desc = humps.camelize(previousRow[0]?.toString() || '')
      if (this.lang === 'en') desc = humps.camelize(previousRow[previousRow.length - 1]?.toString() || '')

      for (const [colIdx, column] of previousRow.entries()) {
        if (rowIdx === 0) {
          prevKeys[colIdx] = humps.camelize(column?.toString() || '')
          continue
        }

        if (!column || prevKeys[colIdx] === '' || colIdx === 0) continue

        changeStatementData[prevKeys[colIdx]] = {
          ...changeStatementData[prevKeys[colIdx]],
          [desc]: {
            previous: parseInt(column.toString()),
            current: 0,
          },
        }
      }
    }

    const currentRows = await readXlsxFile(this.path, { sheet: this.sheetIndex.CURRENTCHANGESTATEMENT })
    if (this.lang === 'id') currentRows.splice(langIdx + 1, 1)
    const currentKeys: string[] = []
    for (const [rowIdx, currentRow] of currentRows.slice(langIdx).entries()) {
      let desc = humps.camelize(currentRow[0]?.toString() || '')
      if (this.lang === 'en') desc = humps.camelize(currentRow[currentRow.length - 1]?.toString() || '')

      for (const [colIdx, column] of currentRow.entries()) {
        if (rowIdx === 0) {
          currentKeys[colIdx] = humps.camelize(column?.toString() || '')
          continue
        }

        if (!column || currentKeys[colIdx] === '' || colIdx === 0) continue

        changeStatementData[currentKeys[colIdx]] = {
          ...changeStatementData[currentKeys[colIdx]],
          [desc]: {
            previous: changeStatementData[currentKeys[colIdx]]?.[desc]?.['previous'] || 0,
            current: parseInt(column.toString()),
          },
        }
      }
    }

    return changeStatementData
  }
}

export default ReadFinancial
