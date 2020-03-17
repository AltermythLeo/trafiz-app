import * as types from '../actions/AppActions';

var initialState = {
  language:'english',
  synchStep:0,
  synchLastTime:0,
  lastLogin:0,
  htmlHelp:'',
  lastGrade:'',
};

export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_SETTING: {
      console.warn('set setting!');
      const key = action.key;
      const val = action.val;
      const o = {};
      o[key] = val;
      let newState = Object.assign({}, state, o);
      return newState;
    }
    case types.LOGIN_SYNCH_STEP: {
      let newState = Object.assign({}, state, {
        synchStep:action.step
      });
      return newState;
    }
    case types.LOGIN_SYNCH_DONE: {
      let newState = Object.assign({}, state, {
        synchLastTime:action.timeStamp
      });
      return newState;
    }
    case types.LOCK_USER: {
      let newState = Object.assign({}, state, {
        lastLogin:0,
      });
      return newState;
    }
    case types.LOGOUT_USER: {
      let newState = Object.assign({}, {
        language:'english',
        synchStep:0,
        synchLastTime:0,
        lastLogin:0,
        htmlHelp:'',
        lastGrade:''
      });
      return newState;
    }
    default:
      return state;
  }
};
