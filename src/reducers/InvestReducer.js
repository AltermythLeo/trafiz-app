import * as types from '../actions/AppActions';
import * as types2 from '../actions/InvestActions';
import _ from 'lodash';

var initialState = {
  dateFilter:null,
  mainPageData:{},
  addExpenseData:{},
  addIncomeData:{},
  dataMsg:''
};

export default function(state = initialState, action) {
  switch (action.type) {
    case types2.SET_DATE_FILTER: {
      return Object.assign({}, state, {
        dateFilter:action.dateFilter
      });
    }
    case types2.SET_MAINPAGE_DATA: {
      return Object.assign({}, state, {
        mainPageData:action.json
      });
    }
    case types2.SET_ADD_EXPENSE_DATA: {
      return Object.assign({}, state, {
        addExpenseData:action.json
      });
    }
    case types2.SET_ADD_INCOME_DATA: {
      return Object.assign({}, state, {
        addIncomeData:action.json
      });
    }
    
    case types2.SET_DOWNLOAD_INVEST_DATA_MSG: {
      return Object.assign({}, state, {
        dataMsg:(action.msg ? action.msg : '')
      });
    }
    case types.LOGOUT_USER: {
      let newState = Object.assign({}, {
        dateFilter:null,
        mainPageData:{},
        addExpenseData:{},
        addIncomeData:{},
        dataMsg:''
      });
      return newState;
    }
    default:
      return state;
  }
};
