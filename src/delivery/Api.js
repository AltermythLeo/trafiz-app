import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';

axios.defaults.headers.common['User-Agent'] = 'TRAFIZ';
const lib = require('../lib');
const TRAFIZ_URL = lib.TRAFIZ_URL;

export function getDeliverySheetOfflineIds(idmssupplier) {
  return new Promise((resolve,reject)=>{
    const ids = [];
    const url = TRAFIZ_URL+'/_api/delivery/getbysup?id='+idmssupplier;
    axios.get(url)
    .then(result=>{
      if(result.status === 200) {
        const rows = result.data;
        for(let i=0;i<rows.length;i++) {
          const deliverysheetofflineid = rows[i].deliverysheetofflineid;
          if(ids.indexOf(deliverysheetofflineid) == -1) ids.push(deliverysheetofflineid);
        }
      } else {
        throw 'Connection error';
      }
      resolve(ids);
    })
    .catch(err=>{
      resolve(ids);
    });
  });
}

export function getDeliverySheet(deliverysheetofflineid) {
  return new Promise((resolve,reject)=>{
    let ret = {};
    const url = TRAFIZ_URL+'/_api/delivery/getsheet?id='+deliverysheetofflineid;
    axios.get(url)
    .then(result=>{
      if(result.status === 200) {
        const json = JSON.parse(result.data[0].savedtext);
        ret = json;
      } else {
        throw 'Connection error';
      }
      resolve(ret);
    })
    .catch(err=>{
      resolve(ret);
    });
  });
}



