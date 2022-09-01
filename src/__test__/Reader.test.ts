import path from 'path'
import ReadFinancial from '..'
import fs from 'fs'

describe('Reader testing', () => {
  for (const filePath of fs.readdirSync(path.resolve('src/__test__/financialReport'))) {
    const financeInsEn = new ReadFinancial({
      path: path.resolve(`src/__test__/financialReport/${filePath}`),
      language: 'en',
    })

    const financeInsId = new ReadFinancial({
      path: path.resolve(`src/__test__/financialReport/${filePath}`),
      language: 'id',
    })

    const fileName = filePath.match(/^[\d\w]+/g)?.[0] as string

    it(`Sheets number of ${fileName}`, async () => {
      const numberOfSheets = await financeInsEn.getSheets()
      expect(numberOfSheets.length).toBe(9)
    })

    it(`General data of ${fileName}`, async () => {
      const [enGeneral, idGeneral] = [await financeInsEn.getGeneral(), await financeInsId.getGeneral()]
      const idKeyLength = Object.keys(idGeneral).length
      expect(idKeyLength).toBeGreaterThan(10)
      expect(idKeyLength).toBe(Object.keys(enGeneral).length)
    })

    it(`Balance data of ${fileName}`, async () => {
      const [enBalance, idBalance] = [await financeInsEn.getBalance(), await financeInsId.getBalance()]
      const idKeyLength = Object.keys(idBalance).length
      expect(idKeyLength).toBeGreaterThan(30)
      expect(idKeyLength).toBe(Object.keys(enBalance).length)
    })

    it(`Income data of ${fileName}`, async () => {
      const [enIncome, idIncome] = [await financeInsEn.getIncome(), await financeInsId.getIncome()]
      const idKeyLength = Object.keys(idIncome).length
      expect(idKeyLength).toBeGreaterThan(15)
      expect(idKeyLength).toBe(Object.keys(enIncome).length)
    })

    it(`Cashflow data of ${fileName}`, async () => {
      const [enCashflow, idCashflow] = [await financeInsEn.getCashflow(), await financeInsId.getCashflow()]
      const idKeyLength = Object.keys(idCashflow).length
      expect(idKeyLength).toBeGreaterThan(15)
      expect(idKeyLength).toBe(Object.keys(enCashflow).length)
    })

    it(`Change Statement data of ${fileName}`, async () => {
      const [enGeneral, idGeneral] = [await financeInsEn.getChangeStatement(), await financeInsId.getChangeStatement()]
      const idKeyLength = Object.keys(idGeneral).length
      expect(idGeneral).toBeInstanceOf(Object)
      expect(idKeyLength).toBe(Object.keys(enGeneral).length)
    })
  }
})
