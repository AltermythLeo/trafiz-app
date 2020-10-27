import * as types from '../actions/AppActions';
import * as types2 from '../actions/InvestActions';
import _ from 'lodash';

var initialState = {
  chunkData:{}
};

export default function(state = initialState, action) {
  switch (action.type) {
    
    case types2.ADD_CHUNK_DATA_KEY: {
      const newObj = Object.assign({},state.chunkData);
      newObj[action.key] = true;
      return Object.assign({}, state, {
        chunkData:newObj
      });
    }
    case types.LOGOUT_USER: {
      let newState = Object.assign({}, {
        chunkData:{}
      });
      return newState;
    }
    default:
      return state;
  }
};
