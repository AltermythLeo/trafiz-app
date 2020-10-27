const _ = require('lodash');
const lib = require('../lib');
const SqliteInvest = require('../SqliteInvest');
const moment = require('moment');
const OldTrafizHelper = require('./OldTrafizHelper');
const L = require('../dictionary').translate;

module.exports.getHomeDataByFilter = getHomeDataByFilter;
module.exports.getAddExpenseDataByFilter = getAddExpenseDataByFilter;
module.exports.getAddIncomeDataByFilter = getAddIncomeDataByFilter;
module.exports.getBuyFishData = getBuyFishData;
module.exports.getSellFishData = getSellFishData;
module.exports.getTakeLoanData = getTakeLoanData;
module.exports.getPayLoanData = getPayLoanData;
module.exports.getTakeLoanInfoData = getTakeLoanInfoData;
module.exports.getGiveCreditData = getGiveCreditData;
module.exports.getCreditPaymentData = getCreditPaymentData;
module.exports.getCustomIncomeData = getCustomIncomeData;

module.exports.getTakeLoans = getTakeLoans;
module.exports.getGiveCredits = getGiveCredits;

function getCustomIncomeData(stateData,customTypeOfflineID,customIncomeOfflineID) {
  const ret = {
    customType:null,
    customIncome:null
  };

  return SqliteInvest.getCustomType(customTypeOfflineID)
    .then(row=>{
      if(!row) return ret;
      ret.customType = row;
      return SqliteInvest.getCustomIncome(customIncomeOfflineID);
    })
    .then(row=>{
      if(!row) return ret;
      ret.customIncome = row;
      return ret;
    })
}

function getCreditPaymentData(stateData,giveCreditOfflineID,creditPaymentOfflineID) {
  const ret = {
    giveCredit:null,
    creditPayment:null
  };

  return SqliteInvest.getGiveCredit(giveCreditOfflineID)
    .then(row=>{
      if(!row) return ret;
      let rows = [row];
      rows = populateRows(rows,'GIVECREDITS',-1);
      rows = populateGiveCredit(stateData,rows);
      ret.giveCredit = rows[0];
      return SqliteInvest.getCreditPayment(creditPaymentOfflineID);
    })
    .then(row=>{
      if(!row) return ret;
      let rows = [row];
      rows = populateRows(rows,'CREDITPAYMENTS',1);
      rows = populateCreditPayment(stateData,rows);
      ret.creditPayment = rows[0];
      return ret;
    })

}

function getGiveCreditData(stateData,giveCreditOfflineID) {
  const ret = {
    giveCredit:null
  };

  return SqliteInvest.getGiveCredit(giveCreditOfflineID)
  .then(row=>{
    if(!row) return ret;
    let rows = [row];
    rows = populateRows(rows,'GIVECREDITS',-1);
    rows = populateGiveCredit(stateData,rows);
    ret.giveCredit = rows[0];
    return ret;
  });
}

function getTakeLoanInfoData(stateData,takeLoanOfflineID) {
  const ret = {
    takeLoan:null,
    payLoan:null
  };

  return SqliteInvest.getTakeLoan(takeLoanOfflineID)
  .then(row=>{
    if(!row) return null;
    let rows = [row];
    rows = populateRows(rows,'TAKELOANS',1);
    rows = populateTakeLoan(stateData,rows);
    ret.takeLoan = rows[0];
    return SqliteInvest.getPayLoansByTakeLoanOfflineID(takeLoanOfflineID);
  })
  .then(rows=>{
    rows = populateRows(rows,'PAYLOANS',-1);
    rows = populatePayLoan(stateData,rows);
    ret.history = rows;
    return ret;
  });
}

function getPayLoanData(stateData,takeLoanOfflineID,payLoanOfflineID) {
  const ret = {
    takeLoan:null,
    payLoan:null
  };

  return SqliteInvest.getTakeLoan(takeLoanOfflineID)
  .then(row=>{
    if(!row) return null;
    let rows = [row];
    rows = populateRows(rows,'TAKELOANS',1);
    rows = populateTakeLoan(stateData,rows);
    ret.takeLoan = rows[0];
    return SqliteInvest.getPayLoan(payLoanOfflineID);
  })
  .then(row=>{
    if(!row) return ret;
    let rows = [row];
    rows = populateRows(rows,'PAYLOANS',-1);
    rows = populatePayLoan(stateData,rows);
    ret.payLoan = rows[0];
    return ret;
  });
}

function getTakeLoanData(stateData,takeLoanOfflineID) {
  const ret = {};

  return SqliteInvest.getTakeLoan(takeLoanOfflineID)
  .then(row=>{
    if(!row) return {takeLoan:null};
    let rows = [row];
    rows = populateRows(rows,'TAKELOANS',1);
    rows = populateTakeLoan(stateData,rows);
    ret.takeLoan = rows[0];
    return ret;
  });
}

function getBuyFishData(stateData,buyFishOfflineID) {
  const ret = {};

  return SqliteInvest.getBuyFish(buyFishOfflineID)
  .then(row=>{
    if(!row) return {buyFish:null};
    let rows = [row];
    rows = populateRows(rows,'BUYFISHES',-1);
    ret.buyFish = rows[0];
    return ret;
  });
}

function getSellFishData(stateData,buyFishOfflineID) {
  const ret = {};

  return SqliteInvest.getBuyFish(buyFishOfflineID)
  .then(row=>{
    let rows = [row];
    rows = populateRows(rows,'BUYFISHES',-1);
    ret.buyFish = rows[0];
    return SqliteInvest.getSellFishesByBuyFishOfflineID(buyFishOfflineID);
  })
  .then(rows=>{
    if(rows && rows.length > 0) {
      rows = populateRows(rows,'SELLFISHES',1);
      ret.sellFish = rows[0];
    } else {
      ret.sellFish = false;
    }
    return ret;
  });
}

function getTakeLoans(stateData) {

  return SqliteInvest.getTakeLoansNotFinalized()
  .then(rows=>{
    rows = populateRows(rows,'TAKELOANS',1);
    rows = populateTakeLoan(stateData,rows);

    const sortedRet = _.sortBy(rows, o => {
      return Number(o.ts);
    }).reverse();

    return sortedRet;
  });

}

function getGiveCredits(stateData) {

  return SqliteInvest.getGiveCreditsNotFinalized()
  .then(rows=>{
    rows = populateRows(rows,'GIVECREDITS',-1);
    rows = populateGiveCredit(stateData,rows);

    const sortedRet = _.sortBy(rows, o => {
      return Number(o.ts);
    }).reverse();

    return sortedRet;
  });

}

function getAddIncomeDataByFilter(stateData,dateFilter) {
  let sellFishes = [];

  return SqliteInvest.getSellFishesUnsold()
  .then(rows=>{
    rows = populateRows(rows,'SELLFISHES',1);
    sellFishes = rows;
    return SqliteInvest.getCustomIncomeTypes();
  })
  .then(customIncomeTypes=>{

    sortedRet = _.sortBy(sellFishes, o => {
      return Number(o.ts);
    }).reverse();

    return {
      customIncomeTypes:customIncomeTypes,
      rows:sortedRet
    };
  });
}

function getAddExpenseDataByFilter(stateData,dateFilter) {
  let buyFishes = [];
  let payLoans = [];
  let giveCredits = [];

  return SqliteInvest.getBuyFishes()
  .then(rows=>{
    rows = populateRows(rows,'BUYFISHES',-1);
    // if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    buyFishes = rows;

    return SqliteInvest.getPayLoans();
  })
  .then(rows=>{
    rows = populateRows(rows,'PAYLOANS',-1);
    rows = populatePayLoan(stateData,rows);
    // if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    payLoansAmount = _.sumBy(rows, 'amount');
    payLoans = rows;

    return SqliteInvest.getGiveCredits();
  })
  .then(rows=>{
    rows = populateRows(rows,'GIVECREDITS',-1);
    rows = populateGiveCredit(stateData,rows);
    //if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    giveCreditsAmount = _.sumBy(rows, 'amount');
    giveCredits = rows;

    return SqliteInvest.getCustomExpenseTypes();
  })
  .then(customExpenseTypes=>{

    allRows = _.concat(buyFishes,payLoans,giveCredits);
    sortedRet = _.sortBy(allRows, o => {
      return Number(o.ts);
    }).reverse();

    return {
      customExpenseTypes:customExpenseTypes,
      rows:sortedRet
    };
  });
}


function getHomeDataByFilter(stateData,dateFilter) {
  let buyFishes = [];
  let sellFishes = [];
  let simpleSellFishes = [];
  let payLoans = [];
  let takeLoans = [];
  let giveCredits = [];
  let creditPayments = [];
  let customIncomes = [];
  let customExpenses = [];

  let buyFishesAmount = 0;
  let sellFishesAmount = 0;
  let simpleSellFishesAmount = 0;
  let payLoansAmount = 0;
  let takeLoansAmount = 0;
  let giveCreditsAmount = 0;
  let creditPaymentsAmount = 0;
  let customIncomesAmount = 0;
  let customExpensesAmount = 0;

  let totalIN = 0;
  let totalOUT = 0;
  let total = 0;

  return SqliteInvest.getBuyFishes()
  .then(rows=>{
    rows = populateRows(rows,'BUYFISHES',-1);
    if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    rows = _.filter(rows, (item) => item.trxoperation != 'D');
    buyFishesAmount = _.sumBy(rows, 'amount');
    buyFishes = rows;

    return SqliteInvest.getSellFishesSold();
  })
  .then(rows=>{
    rows = populateRows(rows,'SELLFISHES',1);
    if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    rows = _.filter(rows, (item) => item.trxoperation != 'D');
    sellFishesAmount = _.sumBy(rows, 'amount');
    sellFishes = rows;

    return SqliteInvest.getSimpleSellFishes();
  })
  .then(rows=>{
    rows = populateRows(rows,'SIMPLESELLFISHES',1);
    if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    rows = _.filter(rows, (item) => item.trxoperation != 'D');
    simpleSellFishesAmount = _.sumBy(rows, 'amount');
    simpleSellFishes = rows;

    return SqliteInvest.getPayLoans();
  })
  .then(rows=>{
    rows = populateRows(rows,'PAYLOANS',-1);
    rows = populatePayLoan(stateData,rows);
    if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    rows = _.filter(rows, (item) => item.trxoperation != 'D');
    payLoansAmount = _.sumBy(rows, 'amount');
    payLoans = rows;

    return SqliteInvest.getTakeLoans();
  })
  .then(rows=>{
    rows = populateRows(rows,'TAKELOANS',1);
    rows = populateTakeLoan(stateData,rows);
    if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    rows = _.filter(rows, (item) => item.trxoperation != 'D');
    takeLoansAmount = _.sumBy(rows, 'amount');
    takeLoans = rows;

    return SqliteInvest.getGiveCredits();
  })
  .then(rows=>{
    rows = populateRows(rows,'GIVECREDITS',-1);
    rows = populateGiveCredit(stateData,rows);
    if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    rows = _.filter(rows, (item) => item.trxoperation != 'D');
    giveCreditsAmount = _.sumBy(rows, 'amount');
    giveCredits = rows;

    return SqliteInvest.getCreditPayments();
  })
  .then(rows=>{
    rows = populateRows(rows,'CREDITPAYMENTS',1);
    rows = populateCreditPayment(stateData,rows);
    if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    rows = _.filter(rows, (item) => item.trxoperation != 'D');
    creditPaymentsAmount = _.sumBy(rows, 'amount');
    creditPayments = rows;

    return SqliteInvest.getCustomIncomes();
  })
  .then(rows=>{
    rows = populateRows(rows,'CUSTOMINCOMES',1);
    rows = populateCustomIncome(stateData,rows);
    if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    rows = _.filter(rows, (item) => item.trxoperation != 'D');
    customIncomesAmount = _.sumBy(rows, 'amount');
    customIncomes = rows;

    return SqliteInvest.getCustomExpenses();
  })
  .then(rows=>{
    rows = populateRows(rows,'CUSTOMEXPENSES',-1);
    rows = populateCustomExpense(stateData,rows);
    if(dateFilter) rows = _.filter(rows,{dateValue:dateFilter});
    rows = _.filter(rows, (item) => item.trxoperation != 'D');
    customExpensesAmount = _.sumBy(rows, 'amount');
    customExpenses = rows;
  })
  .then(()=>{

    totalIN = simpleSellFishesAmount + sellFishesAmount + takeLoansAmount + creditPaymentsAmount + customIncomesAmount;
    totalOUT = buyFishesAmount + payLoansAmount + giveCreditsAmount + customExpensesAmount;
    total = totalIN-totalOUT;

    allRows = _.concat(buyFishes,sellFishes,simpleSellFishes,payLoans,takeLoans,giveCredits,creditPayments,customIncomes,customExpenses);
    console.warn(allRows);
    sortedRet = _.sortBy(allRows, o => {
      return Number(o.ts);
    }).reverse();

    return {
      totalIN,totalOUT,total,rows:sortedRet
    };
  });
}

function populateRows(rows,rowType,mod) {
  const ret = _.map(rows,o=>{ 
    o.rowType = rowType;
    o.transValue = o.amount * mod;
    const m = moment.unix(o.ts);
    o.hourValue = m.format('HH:mm');
    o.dateValue = m.format('DD MMMM YYYY');
    return o;
  })
  return ret;
}

function populateTakeLoan(stateData,rows) {
  const ret = _.map(rows.slice(),o=>{ 
    let freq = 'day';
    console.warn(o.payperiod);
    if(o.payperiod === 'Monthly') freq = 'month';
    if(o.payperiod === 'Yearly') freq = 'year';
    if(o.payperiod.toString() === '1') freq = 'week';
    if(o.payperiod.toString() === '2') freq = 'month';
    o.labelValue = L('Take Loan') +': '+o.creditor+' '+o.tenor+'x (Rp '+lib.toPrice(o.installment)+'/'+L(freq)+')';
    return o;
  })
  return ret;
}

function populatePayLoan(stateData,rows) {
  const ret = _.map(rows.slice(),o=>{ 
    let final = 'Not Final';
    if(o.paidoff === 1) final = 'Final';
    o.labelValue = L('Pay Loan') +': '+o.creditor+' '+o.tenor+'x ('+final+')';
    return o;
  })
  return ret;
}

function populateGiveCredit(stateData,rows) {
  const ret = _.map(rows.slice(),o=>{ 
    if(o.notes && o.notes.length > 0)
      o.labelValue = L('Give Credit') +': '+o.name+' '+' ('+o.notes+')';
    else
      o.labelValue = L('Give Credit') +': '+o.name;
    return o;
  })
  return ret;
}

function populateCreditPayment(stateData,rows) {
  const ret = _.map(rows.slice(),o=>{ 
    if(o.notes && o.notes.length > 0) 
      o.labelValue = L('Credit Payment') +': '+o.name+' '+' ('+o.notes+')';
    else
      o.labelValue = L('Credit Payment') +': '+o.name;
    return o;
  })
  return ret;
}

function populateCustomIncome(stateData,rows) {
  const ret = _.map(rows.slice(),o=>{ 
    if(o.notes && o.notes.length > 0) 
      o.labelValue = ''+o.label+': '+o.notes+'';
    else
      o.labelValue = ''+o.label;
    return o;
  })
  return ret;
}

function populateCustomExpense(stateData,rows) {
  const ret = _.map(rows.slice(),o=>{ 
    if(o.notes && o.notes.length > 0) 
      o.labelValue = ''+o.label+': '+o.notes+'';
    else
      o.labelValue = ''+o.label;
    return o;
  })
  return ret;
}