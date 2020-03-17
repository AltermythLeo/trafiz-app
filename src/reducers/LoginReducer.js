import * as types from '../actions/AppActions';

var initialState = {
  offline:false,
  offlineIdentity:null,
  offlinePassword:null,
  token:null,
  identity:null,
  password:null,
  id:null,
  idmsuser:null,
  idmssupplier:null,
  supplierid:null,
  accessrole:null,
  profile:null,
  offlineTime:0,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case types.LOGIN_USER: {
      let newState = Object.assign({}, state, {
        identity:action.identity,
        password:action.password,
        token:action.token,
        id:action.id,
        idmsuser:action.idmsuser,
        idmssupplier:action.idmssupplier,
        supplierid:action.supplierid,
        accessrole:action.accessrole
      });
      return newState;
    }
    case types.SET_OFFLINE: {
      let newState = Object.assign({}, state, {
        offline:action.offline,
        offlineTime:action.offlineTime
      });
      return newState;
    }
    case types.LOGIN_USER_OFFLINE: {
      let newState = Object.assign({}, state, {
        offlineIdentity:action.identity,
        offlinePassword:action.password,      
        token:'OFFLINE_TOKEN',
        identity:'OFFLINE_IDENTITY',
        password:'OFFLINE_PASSWORD',
        id:'OFFLINE_ID',
        idmsuser:'OFFLINE_IDMSUSER',
        idmssupplier:'OFFLINE_IDMSSUPPLIER',
        supplierid:'OFFLINE_SUPPLIERID'
      });
      return newState;
    }
    case types.LOGIN_SET_PROFILE: {
      let newState = Object.assign({}, state, {
        profile:action.profile
      });
      return newState;
    }
    case types.LOGOUT_USER: {
      let newState = Object.assign({}, {
        offline:false,
        offlineIdentity:null,
        offlinePassword:null,      
        token:null,
        identity:null,
        password:null,
        id:null,
        idmsuser:null,
        idmssupplier:null,
        supplierid:null,
        profile:null,
        offlineTime:0,
      });
      return newState;
    }
    default:
      return state;
  }
};
