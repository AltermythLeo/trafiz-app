import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';

axios.defaults.headers.common['User-Agent'] = 'TRAFIZ';

const lib = require('../lib');
const TRAFIZ_URL = lib.TRAFIZ_URL;

export function getLoans(idmssupplier,month,year) {
  const m = month ? month : moment().month()+1;
  const y = year ? year : moment().year();
  const url = TRAFIZ_URL+'/_api/loan/get?id='+idmssupplier+'&m='+m+'&y='+y;
  const url2 = TRAFIZ_URL+'/_api/payloan/get?id='+idmssupplier+'&m='+m+'&y='+y;
  console.warn('get loans at month:',m);
  let payloans = [];
  return axios.get(url2)
    .then(result=>{
      console.warn(result.status);
      if(result.status === 200) {
        payloans = result.data;
      }
      return axios.get(url)
    })
    .then(result=>{
      console.warn(result.status);
      if(result.status === 200) {
        const rows = result.data;
        console.warn(rows.length);
        const data = [];
        for (let i = 0;i<rows.length;i++) {
          const row = rows[i];
            
          const idmsuserloan = row.idmsuserloan;
          const idmsbuyerloan = row.idmsbuyerloan;
          const name = row.nameloan;
          const idmsloaner = idmsuserloan ? idmsuserloan : idmsbuyerloan;
          const job = idmsuserloan ? 'FISHERMAN' : 'SUPPLIER';
          const items = [];
          let totalinrp = 0;
          const loans = row.loan;

          for(let j=0;j<loans.length;j++) {
            const loan = loans[j];
            const idtrloan = loan.idtrloan;
            let loandate = loan.loandate;
            if(loandate && loandate.length > 0) loandate = loandate.split(' ')[0];
            const desc = loan.descloan;
            const total = loan.loaninrp;
            const strike = loan.paidoffdate ? true : false;
            items.push({
              idtrloan:idtrloan,
              loanDate:loandate,
              desc:desc,
              total:total,
              strike:strike
            });

            // estimate total loan must inline to items
            if(!strike) totalinrp += Number(total);
          }

          data.push({
            idmsuser:idmsloaner,
            name:name,
            usertypename:job,
            items:items,
            estimateTotalLoan:totalinrp
          });

        }

        return {payloans:payloans,loans:data};
      } else {
        throw 'Connection error';
      }
    });
}
