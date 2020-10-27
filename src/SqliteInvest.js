import SQLite from 'react-native-sqlite-storage';
const L = require('./dictionary').translate;

const _ = require('lodash');
const moment = require('moment');
const vsprintf = require('sprintf-js').vsprintf;

SQLite.DEBUG(true);
SQLite.enablePromise(false);

let db = null;

db = SQLite.openDatabase({name : "trafizinvest.db", createFromLocation : 1},openCB,errorCB);

function openCB() {
  console.warn('TRAFIZINVEST db opened..');
}

function errorCB(err) {
  console.warn('TRAFIZINVEST db error..');
  console.warn(err);
}

const GIVECREDIT_TABLE = 'GiveCredit';
const CREDITPAYMENT_TABLE = 'CreditPayment';
const CUSTOMTYPE_TABLE = 'CustomType';
const CUSTOMINCOME_TABLE = 'CustomIncome';
const CUSTOMEXPENSE_TABLE = 'CustomExpense';
const SIMPLESELLFISH_TABLE = 'SimpleSellFish';
const SPLITFISH_TABLE = 'SplitFish';
const TAKELOAN_TABLE = 'TakeLoan';
const PAYLOAN_TABLE = 'PayLoan';
const BUYFISH_TABLE = 'BuyFish';

module.exports.GIVECREDIT_TABLE = GIVECREDIT_TABLE;
module.exports.CREDITPAYMENT_TABLE = CREDITPAYMENT_TABLE;
module.exports.CUSTOMTYPE_TABLE = CUSTOMTYPE_TABLE;
module.exports.CUSTOMINCOME_TABLE = CUSTOMINCOME_TABLE;
module.exports.CUSTOMEXPENSE_TABLE = CUSTOMEXPENSE_TABLE;
module.exports.SIMPLESELLFISH_TABLE = SIMPLESELLFISH_TABLE;
module.exports.SPLITFISH_TABLE = SPLITFISH_TABLE;
module.exports.TAKELOAN_TABLE = TAKELOAN_TABLE;
module.exports.PAYLOAN_TABLE = PAYLOAN_TABLE;
module.exports.BUYFISH_TABLE = BUYFISH_TABLE;

module.exports.getTakeLoan = getTakeLoan;
module.exports.getTakeLoans = getTakeLoans;
module.exports.upsertTakeLoan = upsertTakeLoan;
module.exports.deleteTakeLoan = deleteTakeLoan;
module.exports.getTakeLoansNotFinalized = getTakeLoansNotFinalized;

module.exports.getBuyFish = getBuyFish;
module.exports.getBuyFishes = getBuyFishes;
module.exports.upsertBuyFish = upsertBuyFish;

module.exports.getSellFishes = getSellFishes;
module.exports.getSellFishesSold = getSellFishesSold;
module.exports.getSellFishesUnsold = getSellFishesUnsold;
module.exports.upsertSplitFish = upsertSplitFish;
module.exports.upsertManySplitFish = upsertManySplitFish;
module.exports.setSplitFishSold = setSplitFishSold;

module.exports.getPayLoan = getPayLoan;
module.exports.getPayLoans = getPayLoans;
module.exports.upsertPayLoan = upsertPayLoan;
module.exports.deletePayLoan = deletePayLoan;

module.exports.getSellFishesByBuyFishOfflineID = getSellFishesByBuyFishOfflineID;
module.exports.getPayLoansByTakeLoanOfflineID = getPayLoansByTakeLoanOfflineID;

module.exports.getGiveCredit = getGiveCredit;
module.exports.getGiveCredits = getGiveCredits;
module.exports.getGiveCreditsNotFinalized = getGiveCreditsNotFinalized;
module.exports.upsertGiveCredit = upsertGiveCredit;

module.exports.getCreditPayment = getCreditPayment;
module.exports.getCreditPayments = getCreditPayments;
module.exports.upsertCreditPayment = upsertCreditPayment;

module.exports.upsertCustomType = upsertCustomType;
module.exports.getCustomIncomeTypes = getCustomIncomeTypes;
module.exports.getCustomExpenseTypes = getCustomExpenseTypes;
module.exports.getCustomType = getCustomType;

module.exports.getCustomIncome = getCustomIncome;
module.exports.getCustomIncomes = getCustomIncomes;
module.exports.upsertCustomIncome = upsertCustomIncome;

module.exports.getCustomExpense = getCustomExpense;
module.exports.getCustomExpenses = getCustomExpenses;
module.exports.upsertCustomExpense = upsertCustomExpense;

module.exports.getSimpleSellFish = getSimpleSellFish;
module.exports.getSimpleSellFishes = getSimpleSellFishes;
module.exports.upsertSimpleSellFish = upsertSimpleSellFish;

// financialreport - catchreport
module.exports.getDailyCatchByMonthFilter = getDailyCatchByMonthFilter;
module.exports.getWeightByFishOnMonth = getWeightByFishOnMonth;

// financialreport - annualcatchreport
module.exports.getMonthlyCatchByYearFilter = getMonthlyCatchByYearFilter;
module.exports.getWeightByFishOnYear = getWeightByFishOnYear;

// financialreport - financialreport
module.exports.getBarChartFinancialData = getBarChartFinancialData;
module.exports.getPieChartFinancialData = getPieChartFinancialData;

// financialreport - annualfinancialreport
module.exports.getBarChartAnnualFinancialData = getBarChartAnnualFinancialData;
module.exports.getPieChartAnnualFinancialData = getPieChartAnnualFinancialData;

// synch
// module.exports.setRowSynched = setRowSynched;
module.exports.setManyRowSynched = setManyRowSynched;
module.exports.getRowsNotSynched = getRowsNotSynched;
module.exports.upsertTableOffline = upsertTableOffline;
module.exports.upsertTableOfflineRows = upsertTableOfflineRows;

// login - reset app
module.exports.emptyAllTables = emptyAllTables;

function dummy() {
  return Promise.resolve([])
}

function emptyAllTables() {
  const allTables = [
    BUYFISH_TABLE,
    SPLITFISH_TABLE,
    SIMPLESELLFISH_TABLE,
    TAKELOAN_TABLE,
    PAYLOAN_TABLE,
    GIVECREDIT_TABLE,
    CREDITPAYMENT_TABLE,
    CUSTOMTYPE_TABLE,
    CUSTOMINCOME_TABLE,
    CUSTOMEXPENSE_TABLE
  ];

  let p = Promise.resolve();
  for(let i=0;i<allTables.length;i++) {
    const tableName = allTables[i];
    p = p.then(()=>{
      const sql = "DELETE FROM "+tableName;
      return runSQL(sql);
    });
  }

  return p;
}

function upsertTableOffline(tableName,row) {
  let updateParams = [];
  let createKeyParams = [];
  let createValParams = [];

  for (let key in row) {
    if (row.hasOwnProperty(key)) {
      let val = row[key];
      let valStr = ''+val;
      let isNotNum = (((''+val).length == 0) || isNaN(val));
      if(isNotNum) val = "'"+val+"'";

      if(key != 'id') {
        let updateParam = ""+key+" = "+val;
        updateParams.push(updateParam);
        createKeyParams.push(key);
        createValParams.push(val);
      }
    }
  }

  updateParams = updateParams.join(',');
  createKeyParams = createKeyParams.join(',');

  const sqlUpdate = "UPDATE "+tableName+" SET "+updateParams+" WHERE id = ";
  const sqlCreate = "INSERT INTO "+tableName+" ("+createKeyParams+") VALUES("+createValParams+")";

  return getRowByOfflineID(tableName,row.offlineID)
  .then(row=>{
    if(row) {
      const sql = sqlUpdate+row.id;
      console.warn(sql);
      return runSQL(sql);
    } else {
      const sql = sqlCreate;
      console.warn(sql);
      return runSQL(sql);
    }
  })

}

function generateUpsertSql(tableName,row) {
  let updateParams = [];
  let createKeyParams = [];
  let createValParams = [];

  for (let key in row) {
    if (row.hasOwnProperty(key)) {
      let val = row[key];
      let valStr = ''+val;
      let isNotNum = (((''+val).length == 0) || isNaN(val));
      if(isNotNum) val = "'"+val+"'";

      if(key != 'id') {
        let updateParam = ""+key+" = "+val;
        updateParams.push(updateParam);
        createKeyParams.push(key);
        createValParams.push(val);
      }
    }
  }

  updateParams = updateParams.join(',');
  createKeyParams = createKeyParams.join(',');

  const sqlCreate = "INSERT OR REPLACE INTO "+tableName+" ("+createKeyParams+") VALUES("+createValParams+")";
  return Promise.resolve(sqlCreate);

}


function upsertTableOfflineRows(tableName,rows) {
  const sqls = [];
  let p = Promise.resolve();
  for(let i=0;i<rows.length;i++) {
    const row = rows[i];
    p = p
      .then(()=>{
        return generateUpsertSql(tableName,row);
      })
      .then(sql=>{
        sqls.push(sql);
      });
  }

  return p
  .then(()=>{
    // console.warn(tableName+': PROCESS '+sqls.length+' SQL');
    return runManyUpsertSQL(sqls);
  })
  .then(()=>{
    // const sql = "SELECT * FROM "+tableName+" GROUP BY offlineID HAVING count(*) = 1";
    const sql = "SELECT * FROM "+tableName+"";
    return getRowsBySql(sql);
  })
  .then(rows=>{
    // console.warn(tableName+': INSERTED '+rows.length+' ROWS');
  })
}

// function setRowSynched(tableName,offlineID) {
//   return getRowByOfflineID(tableName,offlineID)
//     .then(row=>{
//       if(row) {
//         const trxdate = moment().format('YYYY-MM-DD HH:mm:ss');
//         const ts = moment().unix();
//         const sql = "UPDATE "+tableName+" SET trxdate = '"+trxdate+"', ts = "+ts+", synch = 1 WHERE id = "+row.id;
//         console.warn(sql);
//         return runSQL(sql);
//       } else {
//         console.warn('row not found..');
//         console.warn(tableName);
//         console.warn(offlineID);
//       }
//     });
// }

function setManyRowSynched(tableName, offlineIDs, updateDateTime) {
  const oids = offlineIDs.join("','");
  // if(updateDateTime) {
  //   const trxdate = moment().format('YYYY-MM-DD HH:mm:ss');
  //   const ts = moment().unix();
  //   const sql = "UPDATE "+tableName+" SET trxdate = '"+trxdate+"', ts = "+ts+", synch = 1 WHERE offlineID IN ('"+oids+"')";
  //   return runSQL(sql);
  // } else {
  //   const sql = "UPDATE "+tableName+" SET synch = 1 WHERE offlineID IN ('"+oids+"')";
  //   return runSQL(sql);
  // }
  const sql = "UPDATE "+tableName+" SET synch = 1 WHERE offlineID IN ('"+oids+"')";
  return runSQL(sql);
}


function getRowsNotSynched(tableName) {
  const sql = "SELECT * FROM "+tableName+" WHERE synch = 0";
  return getRowsBySql(sql);
}

function getPieChartAnnualFinancialData(yearQuery) {
  const sql1 = "SELECT 'Buy Fish' as label, 'expense' as kind, SUM(amount) as total FROM "+BUYFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D'";
  
  const sql2 = "SELECT 'Sell Fish' as label, 'income' as kind, SUM(amount) as total FROM "+SPLITFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D' AND sold = 1";
  
  const sql3 = "SELECT 'Sell Fish' as label, 'income' as kind, SUM(amount) as total FROM "+SIMPLESELLFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D'";

  const sql4 = "SELECT 'Take Loan' as label, 'income' as kind, SUM(amount) as total FROM "+TAKELOAN_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D'";

  const sql5 = "SELECT 'Pay Loan' as label, 'expense' as kind, SUM(amount) as total FROM "+PAYLOAN_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D'";

  const sql6 = "SELECT 'Give Credit' as label, 'expense' as kind, SUM(amount) as total FROM "+GIVECREDIT_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D'";

  const sql7 = "SELECT 'Credit Payment' as label, 'income' as kind, SUM(amount) as total FROM "+CREDITPAYMENT_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D'";

  const sql8 = "SELECT ct.label as label, 'expense' as kind, SUM(ce.amount) as total FROM "+CUSTOMEXPENSE_TABLE+" AS ce LEFT JOIN CustomType AS ct ON ct.offlineID = ce.offlineCustomTypeID WHERE substr(ce.trxdate,1,4) = '"+yearQuery+"' AND ce.trxoperation <> 'D' GROUP BY ce.offlineCustomTypeID";

  const sql9 = "SELECT ct.label as label, 'income' as kind, SUM(ci.amount) as total FROM "+CUSTOMINCOME_TABLE+" AS ci LEFT JOIN CustomType AS ct ON ct.offlineID = ci.offlineCustomTypeID WHERE substr(ci.trxdate,1,4) = '"+yearQuery+"' AND ci.trxoperation <> 'D' GROUP BY ci.offlineCustomTypeID";

  const sqls = [sql1,sql2,sql3,sql4,sql5,sql6,sql7,sql8,sql9];

  let p = Promise.resolve();
  let allRows = [];
  for(let i=0;i<sqls.length;i++) {
    let sql = '';
    p = p.then(()=>{
      sql = sqls[i];
      return getRowsBySql(sql);
    })
    .then(rows=>{
      allRows = _.concat(allRows,rows);
    });
  }

  return p
    .then(()=>{

      const income = {};
      const expense = {};

      for(let i=0;i<allRows.length;i++) {
        const kind = allRows[i].kind;
        let total = allRows[i].total;
        
        //skip if total is null (no data)
        if(total == null) 
          continue;

        total = Number(total);
        const label = allRows[i].label;

        if(kind === 'income') {
          if(!income[label]) income[label] = 0;
          income[label] += total;
        } else {
          if(!expense[label]) expense[label] = 0;
          expense[label] += total;
        }
      }
      return {income,expense};
    });
}

function getBarChartAnnualFinancialData(yearQuery,hiddenLabels) {
  const sql1 = "SELECT 'Buy Fish' as label, SUM(amount) as totalExpense, substr(trxdate,1,7) as monthFilter FROM "+BUYFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D' GROUP BY substr(trxdate,1,7)";
  
  const sql2 = "SELECT 'Sell Fish' as label, SUM(amount) as totalIncome, substr(trxdate,1,7) as monthFilter FROM "+SPLITFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D' AND sold = 1 GROUP BY substr(trxdate,1,7)";
  
  const sql3 = "SELECT 'Sell Fish' as label, SUM(amount) as totalIncome, substr(trxdate,1,7) as monthFilter FROM "+SIMPLESELLFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D' GROUP BY substr(trxdate,1,7)";

  const sql4 = "SELECT 'Take Loan' as label, SUM(amount) as totalIncome, substr(trxdate,1,7) as monthFilter FROM "+TAKELOAN_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D' GROUP BY substr(trxdate,1,7)";

  const sql5 = "SELECT 'Pay Loan' as label, SUM(amount) as totalExpense, substr(trxdate,1,7) as monthFilter FROM "+PAYLOAN_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D' GROUP BY substr(trxdate,1,7)";

  const sql6 = "SELECT 'Give Credit' as label, SUM(amount) as totalExpense, substr(trxdate,1,7) as monthFilter FROM "+GIVECREDIT_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D' GROUP BY substr(trxdate,1,7)";

  const sql7 = "SELECT 'Credit Payment' as label, SUM(amount) as totalIncome, substr(trxdate,1,7) as monthFilter FROM "+CREDITPAYMENT_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND trxoperation <> 'D' GROUP BY substr(trxdate,1,7)";

  const sql8 = "SELECT ct.label as label, SUM(ce.amount) as totalExpense, substr(ce.trxdate,1,7) as monthFilter FROM "+CUSTOMEXPENSE_TABLE+" AS ce LEFT JOIN CustomType AS ct ON ct.offlineID = ce.offlineCustomTypeID WHERE substr(ce.trxdate,1,4) = '"+yearQuery+"' AND ce.trxoperation <> 'D' GROUP BY substr(ce.trxdate,1,7)";

  const sql9 = "SELECT ct.label as label, SUM(ci.amount) as totalIncome, substr(ci.trxdate,1,7) as monthFilter FROM "+CUSTOMINCOME_TABLE+" AS ci LEFT JOIN CustomType AS ct ON ct.offlineID = ci.offlineCustomTypeID WHERE substr(ci.trxdate,1,4) = '"+yearQuery+"' AND ci.trxoperation <> 'D' GROUP BY substr(ci.trxdate,1,7)";

  const sqls = [sql1,sql2,sql3,sql4,sql5,sql6,sql7,sql8,sql9];

  let p = Promise.resolve();
  let allRows = [];
  for(let i=0;i<sqls.length;i++) {
    let sql = '';
    p = p.then(()=>{
      sql = sqls[i];
      return getRowsBySql(sql);
    })
    .then(rows=>{
      allRows = _.concat(allRows,rows);
    });
  }

  return p
    .then(()=>{
      const filteredAllRows = [];
      for(let i=0;i<allRows.length;i++) {
        const label = allRows[i].label;
        if(hiddenLabels.indexOf(L(label)) < 0) filteredAllRows.push(allRows[i]);
      }
      allRows = filteredAllRows;
      console.warn(allRows);
      let keyval = {};

      for(let i=0;i<allRows.length;i++) {
        const key = allRows[i].monthFilter;
        const te = allRows[i].totalExpense;
        const ti = allRows[i].totalIncome;

        if(!keyval[key]) keyval[key] = {expense:0,income:0};
        if(te) keyval[key].expense += Number(te);
        if(ti) keyval[key].income += Number(ti);
      }

      return keyval;
    });
}

function getPieChartFinancialData(monthQuery) {
  const sql1 = "SELECT 'Buy Fish' as label, 'expense' as kind, SUM(amount) as total FROM "+BUYFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"' AND trxoperation <> 'D' ";
  
  const sql2 = "SELECT 'Sell Fish' as label, 'income' as kind, SUM(amount) as total FROM "+SPLITFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"' AND trxoperation <> 'D' AND sold = 1";
  
  const sql3 = "SELECT 'Sell Fish' as label, 'income' as kind, SUM(amount) as total FROM "+SIMPLESELLFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"' AND trxoperation <> 'D' ";

  const sql4 = "SELECT 'Take Loan' as label, 'income' as kind, SUM(amount) as total FROM "+TAKELOAN_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"' AND trxoperation <> 'D' ";

  const sql5 = "SELECT 'Pay Loan' as label, 'expense' as kind, SUM(amount) as total FROM "+PAYLOAN_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"' AND trxoperation <> 'D' ";

  const sql6 = "SELECT 'Give Credit' as label, 'expense' as kind, SUM(amount) as total FROM "+GIVECREDIT_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"' AND trxoperation <> 'D' ";

  const sql7 = "SELECT 'Credit Payment' as label, 'income' as kind, SUM(amount) as total FROM "+CREDITPAYMENT_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"' AND trxoperation <> 'D' ";

  const sql8 = "SELECT ct.label as label, 'expense' as kind, SUM(ce.amount) as total FROM "+CUSTOMEXPENSE_TABLE+" AS ce LEFT JOIN CustomType AS ct ON ct.offlineID = ce.offlineCustomTypeID WHERE substr(ce.trxdate,1,7) = '"+monthQuery+"' AND ce.trxoperation <> 'D' GROUP BY ce.offlineCustomTypeID";

  const sql9 = "SELECT ct.label as label, 'income' as kind, SUM(ci.amount) as total FROM "+CUSTOMINCOME_TABLE+" AS ci LEFT JOIN CustomType AS ct ON ct.offlineID = ci.offlineCustomTypeID WHERE substr(ci.trxdate,1,7) = '"+monthQuery+"' AND ci.trxoperation <> 'D' GROUP BY ci.offlineCustomTypeID";

  const sqls = [sql1,sql2,sql3,sql4,sql5,sql6,sql7,sql8,sql9];

  let p = Promise.resolve();
  let allRows = [];
  for(let i=0;i<sqls.length;i++) {
    let sql = '';
    p = p.then(()=>{
      sql = sqls[i];
      return getRowsBySql(sql);
    })
    .then(rows=>{
      allRows = _.concat(allRows,rows);
    });
  }

  return p
    .then(()=>{

      const income = {};
      const expense = {};

      for(let i=0;i<allRows.length;i++) {
        const kind = allRows[i].kind;
        let total = allRows[i].total;
        
        //skip if total is null (no data)
        if(total == null) 
          continue;

        total = Number(total);
        const label = allRows[i].label;

        if(kind === 'income') {
          if(!income[label]) income[label] = 0;
          income[label] += total;
        } else {
          if(!expense[label]) expense[label] = 0;
          expense[label] += total;
        }
      }
      return {income,expense};
    });
}

function getBarChartFinancialData(monthQuery,hiddenLabels) {
  const sql1 = "SELECT 'Buy Fish' as label, SUM(amount) as totalExpense, substr(trxdate,1,10) as dayFilter FROM "+BUYFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"' AND trxoperation <> 'D' GROUP BY substr(trxdate,1,10)";
  
  const sql2 = "SELECT 'Sell Fish' as label, SUM(amount) as totalIncome, substr(trxdate,1,10) as dayFilter FROM "+SPLITFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"'  AND trxoperation <> 'D' AND sold = 1 GROUP BY substr(trxdate,1,10)";
  
  const sql3 = "SELECT 'Sell Fish' as label, SUM(amount) as totalIncome, substr(trxdate,1,10) as dayFilter FROM "+SIMPLESELLFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"'  AND trxoperation <> 'D' GROUP BY substr(trxdate,1,10)";

  const sql4 = "SELECT 'Take Loan' as label, SUM(amount) as totalIncome, substr(trxdate,1,10) as dayFilter FROM "+TAKELOAN_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"'  AND trxoperation <> 'D' GROUP BY substr(trxdate,1,10)";

  const sql5 = "SELECT 'Pay Loan' as label, SUM(amount) as totalExpense, substr(trxdate,1,10) as dayFilter FROM "+PAYLOAN_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"'  AND trxoperation <> 'D' GROUP BY substr(trxdate,1,10)";

  const sql6 = "SELECT 'Give Credit' as label, SUM(amount) as totalExpense, substr(trxdate,1,10) as dayFilter FROM "+GIVECREDIT_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"'  AND trxoperation <> 'D' GROUP BY substr(trxdate,1,10)";

  const sql7 = "SELECT 'Credit Payment' as label, SUM(amount) as totalIncome, substr(trxdate,1,10) as dayFilter FROM "+CREDITPAYMENT_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"'  AND trxoperation <> 'D' GROUP BY substr(trxdate,1,10)";

  const sql8 = "SELECT ct.label as label, SUM(ce.amount) as totalExpense, substr(ce.trxdate,1,10) as dayFilter FROM "+CUSTOMEXPENSE_TABLE+" AS ce LEFT JOIN CustomType AS ct ON ct.offlineID = ce.offlineCustomTypeID WHERE substr(ce.trxdate,1,7) = '"+monthQuery+"'  AND ce.trxoperation <> 'D' GROUP BY substr(ce.trxdate,1,10)";

  const sql9 = "SELECT ct.label as label, SUM(ci.amount) as totalIncome, substr(ci.trxdate,1,10) as dayFilter FROM "+CUSTOMINCOME_TABLE+" AS ci LEFT JOIN CustomType AS ct ON ct.offlineID = ci.offlineCustomTypeID WHERE substr(ci.trxdate,1,7) = '"+monthQuery+"'  AND ci.trxoperation <> 'D' GROUP BY substr(ci.trxdate,1,10)";

  const sqls = [sql1,sql2,sql3,sql4,sql5,sql6,sql7,sql8,sql9];

  let p = Promise.resolve();
  let allRows = [];
  for(let i=0;i<sqls.length;i++) {
    let sql = '';
    p = p.then(()=>{
      sql = sqls[i];
      console.warn("Get Rows By SQL")
      return getRowsBySql(sql);
    })
    .then(rows=>{
      console.warn(rows);
      allRows = _.concat(allRows,rows);
    });
  }
  console.warn("NEXT...")
  return p
    .then(()=>{
      console.warn("filtering all rows")
      const filteredAllRows = [];
      for(let i=0;i<allRows.length;i++) {
        const label = allRows[i].label;
        if(hiddenLabels.indexOf(L(label)) < 0) filteredAllRows.push(allRows[i]);
      }
      
      allRows = filteredAllRows;
      console.warn(allRows);
      let keyval = {};

      for(let i=0;i<allRows.length;i++) {
        const key = allRows[i].dayFilter;
        const te = allRows[i].totalExpense;
        const ti = allRows[i].totalIncome;

        if(!keyval[key]) keyval[key] = {expense:0,income:0};
        if(te) keyval[key].expense += Number(te);
        if(ti) keyval[key].income += Number(ti);
      }

      return keyval;
    });
}

function getWeightByFishOnYear(yearQuery) {
  const sql1 = "SELECT SUM(weightBeforeSplit) as totalWeight, fishOfflineID FROM "+BUYFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' GROUP BY fishOfflineID";
  const sql2 = "SELECT SUM(weight) as totalWeight, fishOfflineID FROM "+SIMPLESELLFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' GROUP BY fishOfflineID";
  const sql3 = "SELECT SUM(weightOnSplit) as totalWeight, fishOfflineID FROM "+SPLITFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND sold = 1 GROUP BY fishOfflineID";

  let rows1;
  let rows2;
  let rows3;

  return getRowsBySql(sql1)
  .then(rows=>{
    rows1 = rows;
    return getRowsBySql(sql2)
  })
  .then(rows=>{
    rows2 = rows;
    return getRowsBySql(sql3)
  })
  .then(rows=>{
    rows3 = rows;
    allRows = _.concat(rows1,rows2,rows3);
    const keyval = {};
    for(let i=0;i<allRows.length;i++) {
      const key = allRows[i].fishOfflineID;
      const val = allRows[i].totalWeight;
      keyval[key] = keyval[key] > 0 ? (keyval[key]+val) : val;
    } 

    return keyval;
  });
}

function getMonthlyCatchByYearFilter(yearQuery,excludeIds) {
  const ids = "('"+excludeIds.join("','")+"')";  

  const sql1 = "SELECT SUM(weightBeforeSplit) as totalWeight, substr(trxdate,1,7) as monthFilter FROM "+BUYFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND fishOfflineID NOT IN "+ids+" GROUP BY substr(trxdate,1,7)";
  const sql2 = "SELECT SUM(weightOnSplit) as totalWeight, substr(trxdate,1,7) as monthFilter FROM "+SPLITFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND fishOfflineID NOT IN "+ids+" AND sold = 1 GROUP BY substr(trxdate,1,7)";
  const sql3 = "SELECT SUM(weight) as totalWeight, substr(trxdate,1,7) as monthFilter FROM "+SIMPLESELLFISH_TABLE+" WHERE substr(trxdate,1,4) = '"+yearQuery+"' AND fishOfflineID NOT IN "+ids+" GROUP BY substr(trxdate,1,7)";
  
  let rows1;
  let rows2;
  let rows3;
  return getRowsBySql(sql1)
    .then(rows=>{
      rows1 = rows;
      return getRowsBySql(sql2)
    })
    .then(rows=>{
      rows2 = rows;
      return getRowsBySql(sql3)
    })
    .then(rows=>{
      rows3 = rows;
      rows23 = _.concat(rows2,rows3);
      let keyval = {};
      for(let i=0;i<rows1.length;i++) {
        const key = rows1[i].monthFilter;
        const val = rows1[i].totalWeight;
        if(!keyval[key]) keyval[key] = {b:0,s:0};
        keyval[key].b += Number(val);
      }

      for(let i=0;i<rows23.length;i++) {
        const key = rows23[i].monthFilter;
        const val = rows23[i].totalWeight;
        if(!keyval[key]) keyval[key] = {b:0,s:0};
        keyval[key].s += Number(val);
      }

      return keyval;
    });
}

function getWeightByFishOnMonth(monthFilterQuery) {
  const sql1 = "SELECT SUM(weightBeforeSplit) as totalWeight, fishOfflineID FROM "+BUYFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthFilterQuery+"' GROUP BY fishOfflineID";
  const sql2 = "SELECT SUM(weight) as totalWeight, fishOfflineID FROM "+SIMPLESELLFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthFilterQuery+"' GROUP BY fishOfflineID";
  const sql3 = "SELECT SUM(weightOnSplit) as totalWeight, fishOfflineID FROM "+SPLITFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthFilterQuery+"' AND sold = 1 GROUP BY fishOfflineID";

  let rows1;
  let rows2;
  let rows3;

  return getRowsBySql(sql1)
  .then(rows=>{
    rows1 = rows;
    return getRowsBySql(sql2)
  })
  .then(rows=>{
    rows2 = rows;
    return getRowsBySql(sql3)
  })
  .then(rows=>{
    rows3 = rows;
    allRows = _.concat(rows1,rows2,rows3);
    const keyval = {};
    for(let i=0;i<allRows.length;i++) {
      const key = allRows[i].fishOfflineID;
      const val = allRows[i].totalWeight;
      keyval[key] = keyval[key] > 0 ? (keyval[key]+val) : val;
    } 

    return keyval;
  });
}

function getDailyCatchByMonthFilter(monthQuery,excludeIds) { 
  const ids = "('"+excludeIds.join("','")+"')";  
  const sql1 = "SELECT SUM(weightBeforeSplit) as totalWeight, substr(trxdate,1,10) as dayFilter FROM "+BUYFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"' AND fishOfflineID NOT IN "+ids+" GROUP BY substr(trxdate,1,10)";
  const sql2 = "SELECT SUM(weightOnSplit) as totalWeight, substr(trxdate,1,10) as dayFilter FROM "+SPLITFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"' AND sold = 1 AND fishOfflineID NOT IN "+ids+" GROUP BY substr(trxdate,1,10)";
  const sql3 = "SELECT SUM(weight) as totalWeight, substr(trxdate,1,10) as dayFilter FROM "+SIMPLESELLFISH_TABLE+" WHERE substr(trxdate,1,7) = '"+monthQuery+"' AND fishOfflineID NOT IN "+ids+" GROUP BY substr(trxdate,1,10)";
  
  // console.warn(sql1);
  // console.warn(sql2);
  // console.warn(sql3);

  let rows1;
  let rows2;
  let rows3;
  return getRowsBySql(sql1)
    .then(rows=>{
      //console.warn(rows);
      rows1 = rows;
      return getRowsBySql(sql2)
    })
    .then(rows=>{
      //console.warn(rows);
      rows2 = rows;
      return getRowsBySql(sql3)
    })
    .then(rows=>{
      //console.warn(rows);
      rows3 = rows;
      rows23 = _.concat(rows2,rows3);
      let keyval = {};
      for(let i=0;i<rows1.length;i++) {
        const key = rows1[i].dayFilter;
        const val = rows1[i].totalWeight;
        if(!keyval[key]) keyval[key] = {b:0,s:0};
        keyval[key].b += Number(val);
      }

      for(let i=0;i<rows23.length;i++) {
        const key = rows23[i].dayFilter;
        const val = rows23[i].totalWeight;
        if(!keyval[key]) keyval[key] = {b:0,s:0};
        keyval[key].s += Number(val);
      }

      return keyval;
    });
}


function getSimpleSellFish(offlineID, isQuickSell = false) {
  return getRowByOfflineID(isQuickSell ? SPLITFISH_TABLE : SIMPLESELLFISH_TABLE, offlineID);
}

function getSimpleSellFishes() {
  return getRows(SIMPLESELLFISH_TABLE)
    .then(rows=>{
      return rows;
    })
}

/*
function upsertSimpleSellFish(offlineID,fishOfflineID,grade,weight,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser) {
  const str = "INSERT INTO "+SIMPLESELLFISH_TABLE+" (offlineID,fishOfflineID,grade,weight,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser) VALUES('%s','%s','%s',%s, %s,'%s',%s, %s, '%s','%s','%s','%s')";
  const sql = vsprintf(str,[offlineID,fishOfflineID,grade,weight,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser]);
  console.warn(sql);
  return runSQL(sql);

}*/

function upsertSimpleSellFish(offlineID,fishOfflineID,grade,weight,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser, isQuickSell) {
  if(isQuickSell)
  {
    return getRowByOfflineID(SPLITFISH_TABLE,offlineID)
    .then(row=>{
      if(row) {
        const str = "UPDATE "+SPLITFISH_TABLE+" SET amount = %s, notes = '%s', ts = %s, synch = %s, trxoperation = '%s', trxdate = '%s', idmssupplier = '%s', idmsuser = '%s', weightOnSplit = %s, fishOfflineID = '%s'  WHERE id = %s";
        const sql = vsprintf(str,[amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,weight, fishOfflineID,row.id]);
        console.warn(str);
        return runSQL(sql);
      } else {
        console.warn("should never come here")
        return runSQL(null);
      }
    });
  }
  else
  {
    return getRowByOfflineID(SIMPLESELLFISH_TABLE, offlineID)
    .then(row=>{
    if(row) 
    {
      const str = "UPDATE " + SIMPLESELLFISH_TABLE + " SET offlineID = '%s', fishOfflineID = '%s', grade = '%s', weight = %s, amount = %s, notes = '%s', ts = %s, synch = %s, trxoperation = '%s', trxdate = '%s', idmssupplier = '%s', idmsuser = '%s' WHERE id = %s";
      const sql = vsprintf(str,[offlineID,fishOfflineID,grade,weight,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser, row.id]);
      console.warn(sql);
      return runSQL(sql);
    } else 
    {
      const str = "INSERT INTO "+SIMPLESELLFISH_TABLE+" (offlineID,fishOfflineID,grade,weight,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser) VALUES('%s','%s','%s',%s, %s,'%s',%s, %s, '%s','%s','%s','%s')";
      const sql = vsprintf(str,[offlineID,fishOfflineID,grade,weight,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser]);
      console.warn(sql);
      return runSQL(sql);
    }
    });
  }
}

function getCustomExpense(offlineID) {
  return getRowByOfflineID(CUSTOMEXPENSE_TABLE,offlineID);
}

function getCustomExpenses() {
  return getRowsBySql('SELECT ce.*, ct.label FROM '+CUSTOMEXPENSE_TABLE+' AS ce LEFT JOIN CustomType AS ct ON ct.offlineID = ce.offlineCustomTypeID')
  .then(rows=>{
    return rows;
  })
}

function upsertCustomExpense(offlineID,offlineCustomTypeID,amount,notes,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser) {
  return getRowByOfflineID(CUSTOMEXPENSE_TABLE,offlineID)
    .then(row=>{
      if(row) {
        const str = "UPDATE "+CUSTOMEXPENSE_TABLE+" SET offlineID = '%s', offlineCustomTypeID = '%s', amount = %s, notes = '%s', ts = %s, createddate = '%s',createdhour = '%s', synch = %s, trxoperation = '%s', trxdate = '%s', idmssupplier = '%s', idmsuser = '%s' WHERE id = %s";
        const sql = vsprintf(str,[offlineID,offlineCustomTypeID,amount,notes,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser,row.id]);
        console.warn(sql);
        return runSQL(sql);
      } else {
        const str = "INSERT INTO "+CUSTOMEXPENSE_TABLE+" (offlineID,offlineCustomTypeID,amount,notes,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser) VALUES('%s','%s',%s,'%s',%s,'%s','%s',%s,'%s','%s','%s','%s')";
        const sql = vsprintf(str,[offlineID,offlineCustomTypeID,amount,notes,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser]);
        console.warn(sql);
        return runSQL(sql);
      }
    })
}

function getCustomIncome(offlineID) {
  return getRowByOfflineID(CUSTOMINCOME_TABLE,offlineID);
}

function getCustomIncomes() {
  return getRowsBySql('SELECT ci.*, ct.label FROM '+CUSTOMINCOME_TABLE+' AS ci LEFT JOIN CustomType AS ct ON ct.offlineID = ci.offlineCustomTypeID')
  .then(rows=>{
    return rows;
  })
}

function upsertCustomIncome(offlineID,offlineCustomTypeID,amount,notes,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser) {
  return getRowByOfflineID(CUSTOMINCOME_TABLE,offlineID)
    .then(row=>{
      if(row) {
        const str = "UPDATE "+CUSTOMINCOME_TABLE+" SET offlineID = '%s', offlineCustomTypeID = '%s', amount = %s, notes = '%s', ts = %s, createddate = '%s',createdhour = '%s', synch = %s, trxoperation = '%s', trxdate = '%s', idmssupplier = '%s', idmsuser = '%s' WHERE id = %s";
        const sql = vsprintf(str,[offlineID,offlineCustomTypeID,amount,notes,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser,row.id]);
        console.warn(sql);
        return runSQL(sql);
      } else {
        const str = "INSERT INTO "+CUSTOMINCOME_TABLE+" (offlineID,offlineCustomTypeID,amount,notes,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser) VALUES('%s','%s',%s,'%s',%s,'%s','%s',%s,'%s','%s','%s','%s')";
        const sql = vsprintf(str,[offlineID,offlineCustomTypeID,amount,notes,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser]);
        console.warn(sql);
        return runSQL(sql);
      }
    })
}

function getCustomType(offlineID) {
  return getRowByOfflineID(CUSTOMTYPE_TABLE,offlineID);
}

function getCustomExpenseTypes() {
  return getRowsBySql("SELECT * FROM "+CUSTOMTYPE_TABLE+" WHERE incomeorexpense = 'expense'")
    .then(rows=>{
      return rows;
    })
}

function getCustomIncomeTypes() {
  return getRowsBySql("SELECT * FROM "+CUSTOMTYPE_TABLE+" WHERE incomeorexpense = 'income'")
    .then(rows=>{
      return rows;
    })
}

function upsertCustomType(offlineID,label,incomeorexpense,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser) {
  return getRowByOfflineID(CUSTOMTYPE_TABLE,offlineID)
    .then(row=>{
      if(row) {
        const str = "UPDATE "+CUSTOMTYPE_TABLE+" SET offlineID = '%s', label = '%s', incomeorexpense = '%s', ts = %s, createddate = '%s',createdhour = '%s', synch = %s, trxoperation = '%s', trxdate = '%s', idmssupplier = '%s', idmsuser = '%s' WHERE id = %s";
        const sql = vsprintf(str,[offlineID,label,incomeorexpense,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser,row.id]);
        console.warn(sql);
        return runSQL(sql);
      } else {
        const str = "INSERT INTO "+CUSTOMTYPE_TABLE+" (offlineID,label,incomeorexpense,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser) VALUES('%s','%s','%s',%s,'%s','%s',%s,'%s','%s','%s','%s')";
        const sql = vsprintf(str,[offlineID,label,incomeorexpense,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser]);
        console.warn(sql);
        return runSQL(sql);
      }
    })
//  const str = "INSERT INTO "+CUSTOMTYPE_TABLE+" (offlineID,label,incomeorexpense,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser) VALUES('%s','%s','%s',%s,'%s','%s',%s,'%s','%s','%s','%s')";
//  const sql = vsprintf(str,[offlineID,label,incomeorexpense,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser]);
//  console.warn(sql);
//  return runSQL(sql);
}

function getCreditPayments() {
  return getRowsBySql('SELECT cp.*, gc.name FROM CreditPayment AS cp LEFT JOIN GiveCredit AS gc ON gc.offlineID = cp.giveCreditOfflineID')
    .then(rows=>{
      return rows;
    })
}

function getCreditPayment(offlineID) {
  return getRowsBySql("SELECT cp.*, gc.name FROM CreditPayment AS cp LEFT JOIN GiveCredit AS gc ON gc.offlineID = cp.giveCreditOfflineID WHERE cp.offlineID='"+offlineID+"'")
    .then(rows=>{
      if(rows.length == 0) return null;
      return rows[0];
    })
}

function upsertCreditPayment(offlineID,giveCreditOfflineID,trafizPayloanOfflineID,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,paidoff) {
  return getRowByOfflineID(CREDITPAYMENT_TABLE,offlineID)
    .then(row=>{
      if(row) {
        const str = "UPDATE "+CREDITPAYMENT_TABLE+" SET offlineID = '%s', giveCreditOfflineID = '%s', trafizPayloanOfflineID = '%s', amount = %s, notes = '%s', ts = %s, synch = %s, trxoperation = '%s', trxdate = '%s', idmssupplier = '%s', idmsuser = '%s', paidoff = %s WHERE id = %s";
        const sql = vsprintf(str,[offlineID,giveCreditOfflineID,trafizPayloanOfflineID,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,paidoff,row.id]);
        console.warn(sql);
        return runSQL(sql);
      } else {
        const str = "INSERT INTO "+CREDITPAYMENT_TABLE+" (offlineID,giveCreditOfflineID,trafizPayloanOfflineID,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,paidoff) VALUES('%s','%s','%s',%s,'%s',%s,%s,'%s','%s','%s','%s',%s)";
        const sql = vsprintf(str,[offlineID,giveCreditOfflineID,trafizPayloanOfflineID,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,paidoff]);
        console.warn(sql);
        return runSQL(sql);
      }
    })
}


function getGiveCredit(offlineID) {
  return getRowByOfflineID(GIVECREDIT_TABLE,offlineID);
}

function getGiveCredits() {
  return getRows(GIVECREDIT_TABLE)
    .then(rows=>{
      return rows;
    })
}

function getGiveCreditsNotFinalized() {
  return getRowsBySql('SELECT * FROM '+GIVECREDIT_TABLE+' WHERE offlineID NOT IN (SELECT giveCreditOfflineID FROM '+CREDITPAYMENT_TABLE+' WHERE paidoff = 1)')
    .then(rows=>{
      return rows;
    })
}

function upsertGiveCredit(offlineID,trafizLoanOfflineID,name,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser) {
  return getRowByOfflineID(GIVECREDIT_TABLE,offlineID)
    .then(row=>{
      if(row) {
        const str = "UPDATE "+GIVECREDIT_TABLE+" SET offlineID = '%s', trafizLoanOfflineID = '%s', name = '%s', amount = %s, notes = '%s', ts = %s, synch = %s, trxoperation = '%s', trxdate = '%s', idmssupplier = '%s', idmsuser = '%s' WHERE id = %s";
        const sql = vsprintf(str,[offlineID,trafizLoanOfflineID,name,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,row.id]);
        console.warn(sql);
        return runSQL(sql);
      } else {
        const str = "INSERT INTO "+GIVECREDIT_TABLE+" (offlineID,trafizLoanOfflineID,name,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser) VALUES('%s','%s','%s',%s,'%s',%s,%s,'%s','%s','%s','%s')";
        const sql = vsprintf(str,[offlineID,trafizLoanOfflineID,name,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser]);
        console.warn(sql);
        return runSQL(sql);
      }
    })
}

function getPayLoansByTakeLoanOfflineID(takeLoanOfflineID) {
  return getRowsBySql("SELECT pl.*, tl.creditor AS creditor, tl.tenor AS tenor FROM PayLoan AS pl LEFT JOIN TakeLoan AS tl ON tl.offlineID = pl.takeLoanOfflineID WHERE pl.takeLoanOfflineID = '"+takeLoanOfflineID+"'")
  .then(rows=>{
    return rows;
  })
}

function getSellFishesByBuyFishOfflineID(buyFishOfflineID) {
  const sql = "SELECT sf.*, bf.catchOfflineID, bf.weightBeforeSplit, bf.grade FROM "+SPLITFISH_TABLE+" AS sf LEFT JOIN BuyFish AS bf ON bf.offlineID = sf.buyFishOfflineID WHERE buyFishOfflineID = '"+buyFishOfflineID+"'";
  console.warn(sql);
  return getRowsBySql(sql)
    .then(rows=>{
      console.warn(rows);
      return rows;
    })
}

function getSellFishesSold() {
  return getRowsBySql("SELECT sf.*, bf.catchOfflineID, bf.grade FROM "+SPLITFISH_TABLE+" AS sf LEFT JOIN BuyFish AS bf ON bf.offlineID = sf.buyFishOfflineID WHERE sf.sold = 1")
    .then(rows=>{
      return rows;
    })
}

function getSellFishesUnsold() {
  return getRowsBySql("SELECT sf.*, bf.catchOfflineID, bf.grade FROM "+SPLITFISH_TABLE+" AS sf LEFT JOIN BuyFish AS bf ON bf.offlineID = sf.buyFishOfflineID WHERE sf.sold = 0")
    .then(rows=>{
      return rows;
    })
}

function getSellFishes() {
  return getRowsBySql("SELECT sf.*, bf.catchOfflineID FROM "+SPLITFISH_TABLE+" AS sf LEFT JOIN BuyFish AS bf ON bf.offlineID = sf.buyFishOfflineID")
    .then(rows=>{
      return rows;
    })
}

function setSplitFishSold(offlineIDs, _trxdate) 
{
  let ids = '';
  for(let i = 0; i < offlineIDs.length; i++)
  {
    ids += '\'' + offlineIDs[i] + '\'';
    if(i < offlineIDs.length - 1)
      ids += ','
  }
  const trxdate = moment(_trxdate).format('YYYY-MM-DD HH:mm:ss');
  const ts = moment(_trxdate).unix();
  const sql = "UPDATE "+SPLITFISH_TABLE+" SET trxdate = '"+trxdate+"', ts = "+ts+", sold = 1, synch = 0 WHERE offlineID IN ("+ ids +")";
  console.warn(sql);
  return runSQL(sql);
}

function setBuyFishDeleted(offlineIDs) 
{
  let ids = '';
  for(let i = 0; i < offlineIDs.length; i++)
  {
    ids += '\'' + offlineIDs[i] + '\'';
    if(i < offlineIDs.length - 1)
      ids += ','
  }
  const trxdate = moment().format('YYYY-MM-DD HH:mm:ss');
  const ts = moment().unix();
  const sql = "UPDATE "+BUYFISH_TABLE+" SET trxdate = '"+trxdate+"', trxoperation = D WHERE offlineID IN ("+ ids +")";
  console.warn(sql);
  return runSQL(sql);
}

function upsertSplitFish(offlineID,deliveryOfflineID,buyFishOfflineID,sellUnitName,numUnit,sellUnitPrice,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,weightOnSplit,sold,fishOfflineID) {
  return getRowByOfflineID(SPLITFISH_TABLE,offlineID)
    .then(row=>{
      if(row) {
        const str = "UPDATE "+SPLITFISH_TABLE+" SET offlineID = '%s', deliveryOfflineID = '%s', buyFishOfflineID = '%s', sellUnitName = '%s', numUnit = %s, sellUnitPrice = %s, amount = %s, notes = '%s', ts = %s, synch = %s, trxoperation = '%s', trxdate = '%s', idmssupplier = '%s', idmsuser = '%s', weightOnSplit = %s, sold = %s, fishOfflineID = '%s'  WHERE id = %s";
        const sql = vsprintf(str,[offlineID,deliveryOfflineID,buyFishOfflineID,sellUnitName,numUnit,sellUnitPrice,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,weightOnSplit, sold,fishOfflineID,row.id]);
        console.warn(str);
        return runSQL(sql);
      } else {
        const str = "INSERT INTO "+SPLITFISH_TABLE+" (offlineID,deliveryOfflineID,buyFishOfflineID,sellUnitName,numUnit,sellUnitPrice,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,weightOnSplit,sold,fishOfflineID) VALUES('%s','%s','%s','%s',%s,%s,%s,'%s','%s','%s','%s','%s','%s','%s',%s,%s,'%s')";
        const sql = vsprintf(str,[offlineID,deliveryOfflineID,buyFishOfflineID,sellUnitName,numUnit,sellUnitPrice,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,weightOnSplit,sold,fishOfflineID]);
        console.warn(str);
        return runSQL(sql);
      }
    })
}

function upsertManySplitFish(rows) {
  const sqls = [];

  let p = Promise.resolve();
  for(let i=0;i<rows.length;i++) {
    const row = rows[i];
    
    const str = "INSERT OR REPLACE INTO "+SPLITFISH_TABLE+" (offlineID,deliveryOfflineID,buyFishOfflineID,sellUnitName,numUnit,sellUnitPrice,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,weightOnSplit,sold,fishOfflineID) VALUES('%s','%s','%s','%s',%s,%s,%s,'%s','%s','%s','%s','%s','%s','%s',%s,%s,'%s')";
    const sql = vsprintf(str,[
      row.offlineID,
      row.deliveryOfflineID,
      row.buyFishOfflineID,
      row.sellUnitName,
      row.numUnit,
      row.sellUnitPrice,
      row.amount,
      row.notes,
      row.ts,
      row.synch,
      row.trxoperation,
      row.trxdate,
      row.idmssupplier,
      row.idmsuser,
      row.weightOnSplit,
      row.sold,
      row.fishOfflineID
    ]);

    sqls.push(sql);
        
  }
  
  console.warn(SPLITFISH_TABLE+': PROCESS '+sqls.length+' SQL');
  return runManyUpsertSQL(sqls);

  // return getRowByOfflineID(SPLITFISH_TABLE,offlineID)
  //   .then(row=>{
  //     if(row) {
  //       const str = "UPDATE "+SPLITFISH_TABLE+" SET offlineID = '%s', deliveryOfflineID = '%s', buyFishOfflineID = '%s', sellUnitName = '%s', numUnit = %s, sellUnitPrice = %s, amount = %s, notes = '%s', ts = %s, synch = %s, trxoperation = '%s', trxdate = '%s', idmssupplier = '%s', idmsuser = '%s', weightOnSplit = %s, sold = %s, fishOfflineID = '%s'  WHERE id = %s";
  //       const sql = vsprintf(str,[offlineID,deliveryOfflineID,buyFishOfflineID,sellUnitName,numUnit,sellUnitPrice,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,weightOnSplit, sold,fishOfflineID,row.id]);
  //       console.warn(str);
  //       return runSQL(sql);
  //     } else {
  //       const str = "INSERT INTO "+SPLITFISH_TABLE+" (offlineID,deliveryOfflineID,buyFishOfflineID,sellUnitName,numUnit,sellUnitPrice,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,weightOnSplit,sold,fishOfflineID) VALUES('%s','%s','%s','%s',%s,%s,%s,'%s','%s','%s','%s','%s','%s','%s',%s,%s,'%s')";
  //       const sql = vsprintf(str,[offlineID,deliveryOfflineID,buyFishOfflineID,sellUnitName,numUnit,sellUnitPrice,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,weightOnSplit,sold,fishOfflineID]);
  //       console.warn(str);
  //       return runSQL(sql);
  //     }
  //   })
}


function getBuyFish(offlineID) {
  return getRowByOfflineID('BuyFish',offlineID);
}

function getBuyFishes() {
  return getRowsBySql('SELECT * FROM BuyFish')
  // return getRowsBySql('SELECT bf.*, sf.offlineID AS sellFishOfflineID FROM BuyFish AS bf LEFT JOIN SellFish AS sf ON sf.buyFishOfflineID = bf.offlineID')
  .then(rows=>{
    return rows;
  })

  // return getRows('BuyFish')
  //   .then(rows=>{
  //     return rows;
  //   })
}

function upsertBuyFish(offlineID,catchOfflineID,fishOfflineID,shipOfflineID,species,speciesEng,speciesIndo,weightBeforeSplit,grade,fishermanname,fishingground,shipName,shipGear,landingDate,portName,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser) {
  console.warn(trxdate);
  return getRowByOfflineID('BuyFish',offlineID)
    .then(row=>{
      if(row) {
        console.warn("Updating New Buy Data");
        const str = "UPDATE BuyFish SET offlineID = '%s',catchOfflineID = '%s',fishOfflineID = '%s',shipOfflineID = '%s',species = '%s',speciesEng = '%s',speciesIndo = '%s',weightBeforeSplit = '%s',grade = '%s',fishermanname = '%s',fishingground = '%s',shipName = '%s',shipGear = '%s',landingDate = '%s',portName = '%s',amount = %s,notes = '%s',ts = %s,synch = %s,trxoperation = '%s',trxdate = '%s',idmssupplier = '%s',idmsuser = '%s' WHERE id = %s";
        const sql = vsprintf(str,[offlineID,catchOfflineID,fishOfflineID,shipOfflineID,species,speciesEng,speciesIndo,weightBeforeSplit,grade,fishermanname,fishingground,shipName,shipGear,landingDate,portName,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,row.id]);
        console.warn(sql);
        return runSQL(sql);
      } else {
        console.warn("Creating New Buy Data");
        const str = "INSERT INTO BuyFish (offlineID,catchOfflineID,fishOfflineID,shipOfflineID,species,speciesEng,speciesIndo,weightBeforeSplit,grade,fishermanname,fishingground,shipName,shipGear,landingDate,portName,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser) VALUES('%s','%s','%s','%s','%s','%s','%s',%s,'%s','%s','%s','%s','%s','%s','%s',%s,'%s',%s,%s,'%s','%s','%s','%s')";
        const sql = vsprintf(str,[offlineID,catchOfflineID,fishOfflineID,shipOfflineID,species,speciesEng,speciesIndo,weightBeforeSplit,grade,fishermanname,fishingground,shipName,shipGear,landingDate,portName,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser]);
        console.warn(sql);
        return runSQL(sql);
      }
    })
}

function getPayLoan(offlineID) {
  return getRowsBySql("SELECT pl.*, tl.creditor AS creditor, tl.tenor AS tenor FROM PayLoan AS pl LEFT JOIN TakeLoan AS tl ON tl.offlineID = pl.takeLoanOfflineID WHERE pl.offlineID = '"+offlineID+"'")
  .then(rows=>{
    if(rows.length === 0) return null;
    return rows[0];
  })
}

function getPayLoans() {
  return getRowsBySql('SELECT pl.*, tl.creditor AS creditor, tl.tenor AS tenor FROM PayLoan AS pl LEFT JOIN TakeLoan AS tl ON tl.offlineID = pl.takeLoanOfflineID')
    .then(rows=>{
      return rows;
    })
}

function upsertPayLoan(offlineID,takeLoanOfflineID,amount,notes,paidoff,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser) {
  return getRowByOfflineID('PayLoan',offlineID)
    .then(row=>{
      if(row) {
        const str = "UPDATE PayLoan SET offlineID = '%s', takeLoanOfflineID = '%s', amount = %s, notes = '%s', paidoff = %s, ts = %s, synch = %s, trxoperation = '%s', trxdate = '%s', idmssupplier = '%s', idmsuser = '%s' WHERE id = %s";
        const sql = vsprintf(str,[offlineID,takeLoanOfflineID,amount,notes,paidoff,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,row.id]);
        console.warn(sql);
        return runSQL(sql);
      } else {
        const str = "INSERT INTO PayLoan (offlineID,takeLoanOfflineID,amount,notes,paidoff,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser) VALUES('%s','%s',%s,'%s',%s,%s,%s,'%s','%s','%s','%s')";
        const sql = vsprintf(str,[offlineID,takeLoanOfflineID,amount,notes,paidoff,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser]);
        console.warn(sql);
        return runSQL(sql);
      }
    })
}

function deletePayLoan(offlineID,idmssupplier,idmsuser) {
  return getRowByOfflineID('PayLoan',offlineID)
    .then(row=>{
      if(row) {
        const trxdate = moment().format('YYYY-MM-DD HH:mm:ss');
        const sql = "UPDATE PayLoan SET trxoperation = 'D', trxdate = '"+trxdate+"', idmssupplier = '"+idmssupplier+"', idmsuser = '"+idmsuser+"' WHERE id = "+row.id;
        return runSQL(sql);
      } else {
        console.warn('row not found!');
      }
    })
}

function getTakeLoan(offlineID) {
  return getRowByOfflineID('TakeLoan',offlineID);
}

function getTakeLoans() {
  return getRows('TakeLoan')
    .then(rows=>{
      return rows;
    })
}

function getTakeLoansNotFinalized() {
  return getRowsBySql('SELECT * FROM '+TAKELOAN_TABLE+' WHERE offlineID NOT IN (SELECT takeLoanOfflineID FROM '+PAYLOAN_TABLE+' WHERE paidoff = 1)')
    .then(rows=>{
      return rows;
    })
}

function upsertTakeLoan(offlineID,creditor,tenor,installment,payperiod,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser) {
  return getRowByOfflineID('TakeLoan',offlineID)
    .then(row=>{
      if(row) {
        const str = "UPDATE TakeLoan SET offlineID = '%s', creditor = '%s', tenor = %s, installment = %s, payperiod = '%s', amount = %s, notes = '%s', ts = %s, synch = %s, trxoperation = '%s', trxdate = '%s', idmssupplier = '%s', idmsuser = '%s' WHERE id = %s";
        const sql = vsprintf(str,[offlineID,creditor,tenor,installment,payperiod,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,row.id]);
        console.warn(sql);
        return runSQL(sql);
      } else {
        const str = "INSERT INTO TakeLoan (offlineID,creditor,tenor,installment,payperiod,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser) VALUES('%s','%s',%s,%s,'%s',%s,'%s',%s,%s,'%s','%s','%s','%s')";
        const sql = vsprintf(str,[offlineID,creditor,tenor,installment,payperiod,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser]);
        console.warn(sql);
        return runSQL(sql);
      }
    })
}

function deleteTakeLoan(offlineID,idmssupplier,idmsuser) {
  return getRowByOfflineID('TakeLoan',offlineID)
    .then(row=>{
      if(row) {
        const trxdate = moment().format('YYYY-MM-DD HH:mm:ss');
        const sql = "UPDATE TakeLoan SET trxoperation = 'D', trxdate = '"+trxdate+"', idmssupplier = '"+idmssupplier+"', idmsuser = '"+idmsuser+"' WHERE id = "+row.id;
        return runSQL(sql);
      } else {
        console.warn('row not found!');
      }
    })
}

function runSQL(sql) {
  return new Promise((resolve,reject)=>{
    db.transaction((txn) => {
      txn.executeSql(sql, [], (tx,results) => {
        resolve(results);
      },err =>{
        console.warn('sql error: '+sql);
        console.warn(err);
        resolve(null);
      });
    });
  });
}

function runManyUpsertSQL(sqls) {
  return new Promise((resolve,reject)=>{

    db.transaction((tx) => {
      for(let i=0;i<sqls.length;i++) {
        const sql = sqls[i];
        tx.executeSql(sql);
      }
    }, (error) => {
      console.error('Transaction ERROR: ' + error.message);
      reject();
    }, () => {
      resolve();
    });

  });
}

function getRowByOfflineID(tableName,offlineID) {
  return new Promise((resolve,reject)=>{
    db.transaction((txn) => {
      let sql = "SELECT * FROM "+tableName+" WHERE offlineID = '"+offlineID+"'";
      console.warn(sql);
      txn.executeSql(sql, [], (tx,results) => {
        let ret = null;
        const len = results.rows.length;
        if(len > 0) {
          ret = results.rows.item(0);
        }
        console.warn('SQL Executed with return ' + ret);
        resolve(ret);
      },err =>{
        console.warn(error);
        resolve(null);
      });
    });
  });
}

function getRows(tableName) {
  return new Promise((resolve,reject)=>{
    db.transaction((txn) => {
      let sql = "SELECT * FROM "+tableName+" WHERE trxoperation != 'D' ORDER BY ts ASC";
      
      txn.executeSql(sql, [], (tx,results) => {
        const ret = [];
        const len = results.rows.length;
        for (let i = 0; i < len; i++) {
          let row = results.rows.item(i);
          ret.push(row);
        }
        resolve(ret);
      },err =>{
        console.warn(error);
        resolve([]);
      });
    });
  });
}

function getRowsBySql(sql) {
  return new Promise((resolve,reject)=>{
    db.transaction((txn) => {
      
      txn.executeSql(sql, [], (tx,results) => {
        const ret = [];
        const len = results.rows.length;
        for (let i = 0; i < len; i++) {
          let row = results.rows.item(i);
          ret.push(row);
        }
        resolve(ret);
      },err =>{
        console.warn(error);
        resolve([]);
      });
    });
  });
}
