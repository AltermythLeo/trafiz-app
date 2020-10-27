const axios = require('axios');
const moment = require('moment');
const SqliteInvest = require('../SqliteInvest');
const lib = require('../lib');
const TRAFIZ_URL = lib.TRAFIZ_URL;
const ALL_TABLES = [
  SqliteInvest.BUYFISH_TABLE,
  SqliteInvest.SPLITFISH_TABLE,
  SqliteInvest.SIMPLESELLFISH_TABLE,
  SqliteInvest.TAKELOAN_TABLE,
  SqliteInvest.PAYLOAN_TABLE,
  SqliteInvest.GIVECREDIT_TABLE,
  SqliteInvest.CREDITPAYMENT_TABLE,
  SqliteInvest.CUSTOMTYPE_TABLE,
  SqliteInvest.CUSTOMINCOME_TABLE,
  SqliteInvest.CUSTOMEXPENSE_TABLE
];

module.exports.synchBuyFish = synchBuyFish;
module.exports.synchSplitFish = synchSplitFish;
module.exports.synchSimpleSellFish = synchSimpleSellFish;
module.exports.synchTakeLoan = synchTakeLoan;
module.exports.synchPayLoan = synchPayLoan;
module.exports.synchGiveCredit = synchGiveCredit;
module.exports.synchCreditPayment = synchCreditPayment;
module.exports.downloadInvestData = downloadInvestData;
module.exports.uploadInvestData = uploadInvestData;
module.exports.synchCustomType = synchCustomType;
module.exports.synchCustomIncome = synchCustomIncome;
module.exports.synchCustomExpense = synchCustomExpense;

let OFFLINE = false;

module.exports.setOffline = function(offline) {
  console.warn('investSyncHelper set offline:'+offline);
  OFFLINE = offline;
}

// called once after login
module.exports.downloadInvestDataForThreeMonth = downloadInvestDataForThreeMonth;
module.exports.downloadInvestDataFromStartYear = downloadInvestDataFromStartYear;
// called when pull to refresh on invest home
module.exports.downloadInvestDataForDate = downloadInvestDataForDate;

function synchBuyFish(updateDateTime=true) {
  return synchTable(SqliteInvest.BUYFISH_TABLE, false);
}

function synchSplitFish(updateDateTime=true) {
  return synchTable(SqliteInvest.SPLITFISH_TABLE, false);
}

function synchSimpleSellFish(updateDateTime=true) {
  return synchTable(SqliteInvest.SIMPLESELLFISH_TABLE, false);
}

function synchTakeLoan(updateDateTime=true) {
  return synchTable(SqliteInvest.TAKELOAN_TABLE, false);
}

function synchPayLoan(updateDateTime=true) {
  return synchTable(SqliteInvest.PAYLOAN_TABLE, false);
}

function synchGiveCredit(updateDateTime=true) {
  return synchTable(SqliteInvest.GIVECREDIT_TABLE, false);
}

function synchCreditPayment(updateDateTime=true) {
  return synchTable(SqliteInvest.CREDITPAYMENT_TABLE, false);
}

function synchCustomType(updateDateTime=true) {
  return synchTable(SqliteInvest.CUSTOMTYPE_TABLE, updateDateTime);
}

function synchCustomIncome(updateDateTime=true) {
  return synchTable(SqliteInvest.CUSTOMINCOME_TABLE, false);
}

function synchCustomExpense(updateDateTime=true) {
  return synchTable(SqliteInvest.CUSTOMEXPENSE_TABLE, false);
}

function uploadInvestData() {
  const allTables = ALL_TABLES;

  let p = Promise.resolve();
  for(let i=0;i<allTables.length;i++) {
    const tableName = allTables[i];
    p = p.then(()=>{
      return synchTable(tableName);
    });
  }

  return p;
}

function downloadInvestDataForDate(idmsuser,yParam,mParam,dParam) {
  const allTables = ALL_TABLES;

  let p = Promise.resolve();
  for(let i=0;i<allTables.length;i++) {
    const tableName = allTables[i];
    p = p.then(()=>{
      return downloadRows(tableName,idmsuser,yParam,mParam,dParam); // y m d
    });
  }

  return p;
}

function downloadInvestDataForThreeMonth(idmsuser) {
  const allTables = ALL_TABLES;

  const curMonth = moment();
  const curMonthMinus1 = moment().subtract(1, 'months');
  const curMonthMinus2 = moment().subtract(2, 'months');
  const m0 = curMonth.format('M');
  const y0 = curMonth.format('YYYY');
  const m1 = curMonthMinus1.format('M');
  const y1 = curMonthMinus1.format('YYYY');
  const m2 = curMonthMinus2.format('M');
  const y2 = curMonthMinus2.format('YYYY');

  let p = Promise.resolve();
  for(let i=0;i<allTables.length;i++) {
    const tableName = allTables[i];
    p = p.then(()=>{
      return downloadRows(tableName,idmsuser,y0,m0,''); // y m d
    }).then(()=>{
      return downloadRows(tableName,idmsuser,y1,m1,''); // y m d
    }).then(()=>{
      return downloadRows(tableName,idmsuser,y2,m2,''); // y m d
    });
  }

  return p;
}

function downloadInvestDataFromStartYear(investActions,idmsuser) {
  let p = Promise.resolve();
  const mEnd = moment().startOf('year');
  const mNow = moment();
  let delta = mNow.diff(mEnd,'months');

  if(delta < 3) delta = 3;

  console.warn('downloadInvestDataFromStartYear delta:'+delta);
  
  for(let i=0;i<=delta;i++) {
    p = p.then(()=>{
      const mCheck = moment().subtract(i,'month');
      const key = 'INVESTDATA '+mCheck.format('MM YYYY');
      const yParam = mCheck.format('YYYY');
      const mParam = mCheck.format('M');
      const msg = 'Download data '+mCheck.format('MMMM YYYY');
      return downloadInvestDataForDate(idmsuser,yParam,mParam,'')
        .then(()=>{
          investActions.addChunkDataKey(key);
          investActions.setDownloadInvestDataMsg(msg.toUpperCase());
          console.warn('download '+key)
        });
    })
  }

  return p;
}

function downloadInvestData(idmsuser) {
  const allTables = ALL_TABLES;

  let p = uploadInvestData();
  for(let i=0;i<allTables.length;i++) {
    const tableName = allTables[i];
    p = p.then(()=>{
      return downloadRows(tableName,idmsuser,'','','');
    });
  }

  return p;
}


function synchTable(tableName, updateDateTime = true) {
  if(OFFLINE) {
    console.warn('MODE OFFLINE SKIP SYNCH TABLE');
    return Promise.resolve();
  }

  return SqliteInvest.getRowsNotSynched(tableName)
    .then(rows=>{
      let p = Promise.resolve();
      
      const num = rows.length;
      const msg = ''+tableName.toUpperCase()+': '+num+' ROWS TO UPLOAD';
//      console.warn(msg);

      const oidOK = [];
      for(let i=0;i<rows.length;i++) {
        p = p.then(()=>{
          const row = rows[i];
          return upsertTableOnline(tableName,row);
        })
        .then(result=>{
          if(result) {
            oidOK.push(result.offlineID);
            // return SqliteInvest.setRowSynched(tableName,result.offlineID);
          }
        });
      }

      p = p.then(()=>{
//        console.warn(''+tableName.toUpperCase()+': '+num+' ROWS SUCCESS TO UPLOAD');
        return SqliteInvest.setManyRowSynched(tableName,oidOK, updateDateTime);
      });

      return p;
    });

}

function upsertTableOnline(tableName,row) {
  const url = TRAFIZ_URL+'/_api/invest/'+tableName.toLowerCase()+'/upsert';
  lib.dump({
    url,row
  });
  return new Promise((resolve,reject)=>{
    axios({
      method: 'post',
      url: url,
      data: row
    })
    .then(result=>{
      const status = result.status;
      if( !(status >= 200 && status < 300 ) ) throw 'CONNECTION ERROR';
//      console.warn('upsertTableOnline: '+url+' OK');
      resolve(row);  
    })
    .catch(err=>{
      console.warn('upsertTableOnline: '+url+' FAIL');
      let errMsg = 'UNKNOWN ERROR';
      if(err && err.response && err.response.data) {
        errMsg = err.response.data;
      } else if(err) {
        errMsg = err;
      }
      
      console.warn('ERROR:');
      console.warn(errMsg);

      resolve();
    })  
  });

}

function downloadRows(tableName,idmsuser,yParam,mParam,dParam) {
  return getRowsOnline(tableName,idmsuser,yParam,mParam,dParam)
    .then(rows=>{
      let p = Promise.resolve();
      const num = rows.length;
      const msg = ''+tableName+': DOWNLOAD '+num+' ROWS FOR '+mParam+'-'+yParam;

      p = SqliteInvest.upsertTableOfflineRows(tableName,rows);

      // for(let i=0;i<rows.length;i++) {
      //   p = p.then(()=>{
      //     const row = rows[i];
      //     return SqliteInvest.upsertTableOffline(tableName,row);
      //   });
      // }

      return p;
    })
}

function getRowsOnline(tableName,idmsuser,yParam,mParam,dParam) {
  if(!yParam) yParam = '';
  if(!mParam) mParam = '';
  if(!dParam) dParam = '';

  if(tableName == SqliteInvest.CUSTOMTYPE_TABLE) {
    yParam = '0';
    mParam = '0';
    dParam = '0';
  }

  return new Promise((resolve,reject)=>{
    const url = TRAFIZ_URL+'/_api/invest/'+tableName.toLowerCase()+'/getlist?idmsuser='+idmsuser+'&d='+dParam+'&m='+mParam+'&y='+yParam;
    axios.get(url)
    .then(result=>{
      const status = result.status;
      if( !(status >= 200 && status < 300 ) ) throw 'CONNECTION ERROR';
      console.warn('downloadTableOnline: '+url+' OK');
      resolve(result.data);  
    })
    .catch(err=>{
      console.warn('downloadTableOnline: '+url+' FAIL');
      let errMsg = 'UNKNOWN ERROR';
      if(err && err.response && err.response.data) {
        errMsg = err.response.data;
      } else if(err) {
        errMsg = err;
      }
      
      console.warn('ERROR:');
      console.warn(errMsg);

      resolve([]);
    })  
  });

}


