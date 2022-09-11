# IDX Financial Report Reader

Reader for financial report that published by [Indonesian Stock Exchange](https://idx.co.id) that have .xlsx format

## How to Install

```bash
  npm install idstock-reader

  // using yarn:

  yarn add idstock-reader
```

## Usage

```bash
import Reader from 'idstock-reader'


const readerIns = new Reader({path: "financialReportPath.xlsx", language: "en"})

// Get general information
await readerIns.getGeneral()

//get cashflow statement
await readerIns.getCashflow()

//get balance statement
await readerIns.getBalance()

//get income statement
await readerIns.getIncome()

//get change statement
await readerIns.getChangeStatement()

//get full report (general, income, cashflow, balance, change) statement
await readerIns.getFullReport()


```
