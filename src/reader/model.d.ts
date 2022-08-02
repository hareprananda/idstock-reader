export interface IExcelFinancialReport {
    balance: {
      Kas: number
      'Jumlah aset lancar': number
      'Jumlah aset tidak lancar': number
      'Jumlah liabilitas jangka panjang': number
      'Jumlah liabilitas jangka pendek': number
      'Jumlah ekuitas': number
    }
    cashflow: {
      OperatingCash: number
      InvestingCash: number
      FinancingCash: number
      'Kas dan setara kas arus kas, akhir periode': number
    }
    income: {
      'Penjualan dan pendapatan usaha': number
      'Jumlah laba (rugi)': number
    }
    general: {
      ticker: string
      tahun: number
      periode: 1 | 2 | 3 | 4
      currency: string
      multiply: number
    }
    sektor: string
    dividen: number
    subsektor: string
  }