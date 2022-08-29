import readXlsxFile, { readSheetNames } from 'read-excel-file/node'
import humps from 'humps'

const sheetIndex = {
  GENERAL: 2,
  BALANCE: 3,
  INCOME: 4,
  CURRENTCHANGESTATEMENT: 5,
  PREVIOUSCHANGESTATEMENT: 6,
  CASHFLOW: 7,
} as const

class ReadFinancial {
  private path: string
  private lang: 'en' | 'id'

  constructor(option: { path: string; language: 'en' | 'id' }) {
    this.path = option.path
    this.lang = option.language
  }

  async getFullReport() {
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

  getRows(sheetType: keyof typeof sheetIndex) {
    return readXlsxFile(this.path, {
      sheet: sheetIndex[sheetType],
    }).then((rows) => {
      return rows
    })
  }

  async getGeneral() {
    const generalData: Record<string, string | number> = {}
    const rows = await readXlsxFile(this.path, { sheet: sheetIndex.GENERAL })

    for (const row of rows) {
      if (!row[0] || !row[1] || !row[2]) continue
      const descIndex = this.lang === 'en' ? 2 : 0
      generalData[humps.camelize(row[descIndex].toString())] = row[1]?.toString()
    }

    return generalData
  }

  async getBalance() {
    const balanceData: Record<string, Record<'previous' | 'current', number>> = {}
    const rows = await readXlsxFile(this.path, { sheet: sheetIndex.BALANCE })
    const langIdx = this.lang === 'en' ? 3 : 0
    for (const row of rows.slice(4)) {
      if (!row[0] || !row[1] || !row[2] || !row[3]) continue

      balanceData[humps.camelize(row[langIdx].toString())] = {
        previous: parseInt(row[2].toString()),
        current: parseInt(row[1].toString()),
      }
    }
    return balanceData
  }

  async getIncome() {
    const incomeData: Record<string, Record<'previous' | 'current', number>> = {}
    const rows = await readXlsxFile(this.path, { sheet: sheetIndex.INCOME })
    const langIdx = this.lang === 'en' ? 3 : 0
    for (const row of rows.slice(4)) {
      if (!row[0] || !row[1] || !row[2] || !row[3]) continue

      incomeData[humps.camelize(row[langIdx].toString())] = {
        previous: parseInt(row[2].toString()),
        current: parseInt(row[1].toString()),
      }
    }
    return incomeData
  }

  async getCashflow() {
    const cashflowData: Record<string, Record<'previous' | 'current', number>> = {}
    const rows = await readXlsxFile(this.path, { sheet: sheetIndex.CASHFLOW })
    const langIdx = this.lang === 'en' ? 3 : 0
    for (const row of rows.slice(4)) {
      if (!row[0] || !row[1] || !row[2] || !row[3]) continue

      cashflowData[humps.camelize(row[langIdx].toString())] = {
        previous: parseInt(row[2].toString()),
        current: parseInt(row[1].toString()),
      }
    }
    return cashflowData
  }

  async getChangeStatement() {
    const changeStatementData: Record<string, Record<string, Record<'previous' | 'current', number>>> = {}
    const previousRows = await readXlsxFile(this.path, { sheet: sheetIndex.PREVIOUSCHANGESTATEMENT })
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

    const currentRows = await readXlsxFile(this.path, { sheet: sheetIndex.CURRENTCHANGESTATEMENT })
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
