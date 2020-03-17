import * as types from '../actions/AppActions';

var initialState = {
  tasks:[],
  errorData:[],
  steps:0
};

export default function(state = initialState, action) {
  switch (action.type) {
    case types.ADD_TASK: {
      const newState = Object.assign({}, state);
      newState.tasks.push(action.task);
      return newState;
    }
    case types.CLEAR_TASKS: {
      let newState = Object.assign({}, state, {
        tasks:[]
      });
      return newState;
    }
    case types.SET_TASKS: {
      let newState = Object.assign({}, state, {
        tasks:action.rows
      });
      return newState;
    }
    case types.ADD_ERROR: {
      const newState = Object.assign({}, state);
      if(!newState.errorData) newState.errorData = [];
      newState.errorData.push(action.errData);
      return newState;
    }
    case types.CLEAR_ERRORS: {
      let newState = Object.assign({}, state, {
        errorData:[]
      });
      return newState;
    }
    case types.SET_STEPS: {
      let newState = Object.assign({}, state, {
        steps:action.val
      });
      return newState;
    }
    case types.LOGOUT_USER: {
      let newState = Object.assign({}, state, {
        tasks:[],
        steps:0
      });
      return newState;
    }
    default:
      return state;
  }
};
