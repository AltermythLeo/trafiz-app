import SQLite from 'react-native-sqlite-storage';
SQLite.DEBUG(true);
SQLite.enablePromise(false);

let db = null;

db = SQLite.openDatabase({name : "ltfish.sqlite", createFromLocation : 1},openCB,errorCB);

function openCB() {
  console.warn('DB opened..');
  db.transaction((txn) => {
    console.warn('will execute..');
    txn.executeSql('SELECT * FROM ltfish LIMIT 1', [], (tx,results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        let row = results.rows.item(i);
        console.warn(row);
      }    
    },err =>{
      console.warn('not ok!');
    });
  });
}

function errorCB(err) {
  console.warn('DB error..');
  console.warn(err);
}

module.exports.searchFish = function (str) {
  return new Promise((resolve,reject)=>{
    const txt = str.toLowerCase();
    db.transaction((txn) => {
      // console.warn('will execute..');
      let sql = "SELECT * FROM ltfish WHERE"
      + " LOWER(ltfish.english_name) LIKE  '%"+txt+"%'"
      + " OR LOWER(ltfish.scientific_name) LIKE  '%"+txt+"%'"
      + " OR LOWER(ltfish.indonesian_name) LIKE  '%"+txt+"%'"
      + " OR LOWER(ltfish.threea_code) LIKE  '%"+txt+"%'"
      + " LIMIT 30";

      console.warn(sql);
      txn.executeSql(sql, [], (tx,results) => {
        const ret = [];
        const len = results.rows.length;
        console.warn(len);
        for (let i = 0; i < len; i++) {
          let row = results.rows.item(i);
          ret.push(row);
          console.warn(row);
        }    
        resolve(ret);
      },err =>{
        resolve([]);
      });
    });
  });
}