import * as types from '../actions/AppActions';

var initialState = {
  connectionStatus:false,
  synching:false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case types.APP_CONNECTION:
      return Object.assign({}, state, {
        connectionStatus:action.status
      });
    case types.START_SYNCH: {
      let newState = Object.assign({}, state, {synching:true});
      return newState;
    }  
    case types.END_SYNCH: {
      let newState = Object.assign({}, state, {synching:false});
      return newState;
    }  
    default:
      return state;
  }
};
