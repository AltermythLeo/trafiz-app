import * as types from '../actions/AppActions';
import _ from 'lodash';

var initialState = {
  fishermans:[],
  ships:[],
  fishes:[],
  loans:[],
  payloans:[],
  buyers:[],
  suppliers:[],
  catches:[],
  customitems:[],
  lastMapState:{},
  
  fishCatchBuyerNames:{},
  readyToDeliver:[],
  batchDeliveryData:{},

  preDeliverySheets:{},

  fishIdToDelivery:{},
  batchDeliveries:[],
  deliverySheets:{},
  openBatchDeliveryOfflineId:null,

  loantype:[],

  extraDataOfflineId:null,
  extraData:{},

  extraCatches:{},
  extraCatchesArr:[],

  cacheSavedMonth:{}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_FISHERMANS: {
      return Object.assign({}, state, {
        fishermans:action.rows
      });
    }
    case types.SET_SHIPS: {
      return Object.assign({}, state, {
        ships:action.rows
      });
    }
    case types.SET_FISHES: {
      return Object.assign({}, state, {
        fishes:action.rows
      });
    }
    case types.SET_LOANS: {
      return Object.assign({}, state, {
        loans:action.rows
      });
    }
    case types.SET_PAYLOANS: {
      return Object.assign({}, state, {
        payloans:action.rows
      });
    }
    case types.SET_BUYERS: {
      return Object.assign({}, state, {
        buyers:action.rows
      });
    }
    case types.SET_SUPPLIERS: {
      return Object.assign({}, state, {
        suppliers:action.rows
      });
    }
    case types.SET_CATCHES: {
      const arr1 = state.extraCatchesArr.slice();
      const arr2 = action.rows;
      const newCatches = arr1.concat(arr2);
      
      return Object.assign({}, state, {
        catches:newCatches
      });
    }
    case types.SET_CUSTOMITEMS: {
      return Object.assign({}, state, {
        customitems:action.rows
      });
    }
    case types.SET_LOANTYPE: {
      return Object.assign({}, state, {
        loantype:action.rows
      });
    }
    case types.SET_LASTMAPSTATE: {
      return Object.assign({}, state, {
        lastMapState:action.mapState
      });
    }
    case types.SET_FISHCATCHBUYERNAME: {
      return Object.assign({}, state, {
        fishCatchBuyerNames:action.fishCatchBuyerNames
      });
    }
    case types.SET_READY_TO_DELIVER: {
      return Object.assign({}, state, {
        readyToDeliver:action.readyToDeliver
      });
    }
    case types.SET_DELIVERY_PARAMS: {
      return Object.assign({}, state, {
        readyToDeliver:action.readyToDeliver,
        fishCatchBuyerNames:action.fishCatchBuyerNames
      });
    }
    case types.SET_BATCH_DELIVERY_DATA: {
      return Object.assign({}, state, {
        batchDeliveryData:action.batchDeliveryData
      });
    }
    case types.SET_PREDELIVERY_SHEETS: {
      return Object.assign({}, state, {
        preDeliverySheets:action.preDeliverySheets
      });
    }
    case types.SET_DELIVERY_SHEETS: {
      return Object.assign({}, state, {
        deliverySheets:action.deliverySheets
      });
    }
    case types.SET_BATCH_DELIVERIES: {
      return Object.assign({}, state, {
        batchDeliveries:action.batchDeliveries
      });
    }
    case types.SET_FISH_ID_TO_DELIVERY: {
      return Object.assign({}, state, {
        fishIdToDelivery:action.fishIdToDelivery
      });
    }    
    case types.SET_OPEN_BATCH_DELIVERY_OFFLINE_ID: {
      return Object.assign({}, state, {
        openBatchDeliveryOfflineId:action.openBatchDeliveryOfflineId
      });
    }    
    case types.SET_EXTRADATA: {
      return Object.assign({}, state, {
        extraData:action.extraData,
        extraDataOfflineId:action.extraDataOfflineId
      });
    }    
    case types.SET_EXTRADATA_ONLY: {
      return Object.assign({}, state, {
        extraData:action.extraData
      });
    }    

    // flag catch for a month downloaded
    case types.FLAG_CATCH_DOWNLOADED: {
      const cacheSavedMonth = Object.assign({},state.cacheSavedMonth);
      cacheSavedMonth[action.dateStr] = true;
      return Object.assign({}, state, {
        cacheSavedMonth:cacheSavedMonth
      });
    }    
    case types.LOGOUT_USER: {
      let newState = Object.assign({}, {
        fishermans:[],
        ships:[],
        fishes:[],
        loans:[],
        payloans:[],
        buyers:[],
        suppliers:[],
        catches:[],
        // customitems:[],
        lastMapState:{},
        fishCatchBuyerNames:{},
        readyToDeliver:[],
        batchDeliveryData:{},
        preDeliverySheets:{},

        deliverySheets:{},
        batchDeliveries:[],
        fishIdToDelivery:{},
        openBatchDeliveryOfflineId:null,

        loantype:[],

        extraDataOfflineId:null,
        extraData:{},

        extraCatches:{},
        extraCatchesArr:[],

        cacheSavedMonth:{}
      
      });
      return newState;
    }

    case types.SET_EXTRA_CATCHES: {
      const newObj = Object.assign({},state.extraCatches);
      newObj[action.key] = action.rows;

      let newArr = [];
      for (var key in newObj) {
        if (newObj.hasOwnProperty(key)) {
          const arr = newObj[key];
          newArr = newArr.concat(arr);
        }
      }
      
      return Object.assign({}, state, {
        extraCatches:newObj,
        extraCatchesArr:newArr
      });
    }

    default:
      return state;
  }
};
