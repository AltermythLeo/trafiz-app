import axios from 'axios';
import _ from 'lodash';

axios.defaults.headers.common['User-Agent'] = 'TRAFIZ';

export const SET_TAKELOANS = 'SET_TAKELOANS';
export const SET_BUYFISHES = 'SET_BUYFISHES';

export const SET_MAINPAGE_DATA = 'SET_MAINPAGE_DATA';
export const SET_DATE_FILTER = 'SET_DATE_FILTER';
export const SET_ADD_EXPENSE_DATA = 'SET_ADD_EXPENSE_DATA';
export const SET_ADD_INCOME_DATA = 'SET_ADD_INCOME_DATA';

export const ADD_CHUNK_DATA_KEY = 'ADD_CHUNK_DATA_KEY';
export const SET_DOWNLOAD_INVEST_DATA_MSG = 'SET_DOWNLOAD_INVEST_DATA_MSG';

export function setTakeLoans(rows) {
  return {
    type: SET_TAKELOANS,
    rows: rows
  };
}

export function setBuyFishes(rows) {
  return {
    type: SET_BUYFISHES,
    rows: rows
  };
}

export function setMainPageData(json) {
  return {
    type: SET_MAINPAGE_DATA,
    json: json
  };
}

export function setDateFilter(dateFilter) {
  return {
    type: SET_DATE_FILTER,
    dateFilter: dateFilter
  };
}

export function setAddExpenseData(json) {
  return {
    type: SET_ADD_EXPENSE_DATA,
    json: json
  };
}

export function setAddIncomeData(json) {
  return {
    type: SET_ADD_INCOME_DATA,
    json: json
  };
}

export function addChunkDataKey(key) {
  return {
    type: ADD_CHUNK_DATA_KEY,
    key: key
  };
}

export function setDownloadInvestDataMsg(msg) {
  return {
    type: SET_DOWNLOAD_INVEST_DATA_MSG,
    msg: msg
  };
}

// export function getCatchFishesByMonth(month, year) {
//   return (dispatch,getState) => {

//     const state = getState();
//     if(state.Login.offline) return Promise.resolve();

//     const idmsuser = state.Login.idmsuser;
//     const idmssupplier = state.Login.idmssupplier;
//     const url = TRAFIZ_URL+'/_api/catch/getbymonthyear?id='+idmssupplier+'&m='+month+'&y='+year;
//     console.warn(url);
//     const key = ''+year+month;

//     return axios.get(url)
//       .then(result=>{
//         if(result.status === 200) {
//           const data = result.data; 
//           console.warn(data);        
//           dispatch({
//             type: SET_EXTRA_CATCHES,
//             key: key,
//             rows: data
//           });
//         } else {
//           throw 'Connection error';
//         }
//       });
//   }
// }
