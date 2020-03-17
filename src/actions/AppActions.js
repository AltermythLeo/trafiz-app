import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import email from 'react-native-email';

axios.defaults.headers.common['User-Agent'] = 'TRAFIZ';

export const CREATE_DATA = 'CREATE_DATA';
export const APP_CONNECTION = 'APP_CONNECTION';
export const SET_OFFLINE = 'SET_OFFLINE';
export const LOGIN_USER = 'LOGIN_USER';
export const LOGOUT_USER = 'LOGOUT_USER';
export const LOCK_USER = 'LOCK_USER';
export const LOGIN_USER_OFFLINE = 'LOGIN_USER_OFFLINE';
export const LOGIN_SYNCH_STEP = 'LOGIN_SYNCH_STEP';
export const LOGIN_SYNCH_DONE = 'LOGIN_SYNCH_DONE';
export const LOGIN_SET_PROFILE = 'LOGIN_SET_PROFILE';
export const SET_STEPS = 'SET_STEPS';
export const SET_BUYERS = 'SET_BUYERS';
export const SET_SUPPLIERS = 'SET_SUPPLIERS';
export const SET_FISHERMANS = 'SET_FISHERMANS';
export const SET_SHIPS = 'SET_SHIPS';
export const SET_FISHES = 'SET_FISHES';
export const SET_LOANS = 'SET_LOANS';
export const SET_PAYLOANS = 'SET_PAYLOANS';
export const SET_SETTING = 'SET_SETTING';
export const SET_CATCHES = 'SET_CATCHES';
export const SET_CUSTOMITEMS = 'SET_CUSTOMITEMS';
export const SET_LOANTYPE = 'SET_LOANTYPE';
export const ADD_TASK = 'ADD_TASK';
export const SET_TASKS = 'SET_TASKS';
export const CLEAR_TASKS = 'CLEAR_TASKS';
export const START_SYNCH = 'START_SYNCH';
export const END_SYNCH = 'END_SYNCH';
export const SET_LASTMAPSTATE = 'SET_LASTMAPSTATE';
export const ADD_ERROR = 'ADD_ERROR';
export const CLEAR_ERRORS = 'CLEAR_ERRORS';

export const SET_FISHCATCHBUYERNAME = 'SET_FISHCATCHBUYERNAME';
export const SET_READY_TO_DELIVER = 'SET_READY_TO_DELIVER';
export const SET_BATCH_DELIVERY_DATA = 'SET_BATCH_DELIVERY_DATA';
export const SET_DELIVERY_PARAMS = 'SET_DELIVERY_PARAMS';
export const SET_PREDELIVERY_SHEETS = 'SET_PREDELIVERY_SHEETS';

export const SET_DELIVERY_SHEETS = 'SET_DELIVERY_SHEETS';
export const SET_BATCH_DELIVERIES = 'SET_BATCH_DELIVERIES';
export const SET_FISH_ID_TO_DELIVERY = 'SET_FISH_ID_TO_DELIVERY';
export const SET_OPEN_BATCH_DELIVERY_OFFLINE_ID = 'SET_OPEN_BATCH_DELIVERY_OFFLINE_ID';
// export const SET_DELIVERY_CLOSE = 'SET_DELIVERY_CLOSE';

export const SET_EXTRADATA = 'SET_EXTRADATA';
export const SET_EXTRADATA_ONLY = 'SET_EXTRADATA_ONLY';

export const SET_EXTRA_CATCHES = 'SET_EXTRA_CATCHES';

export const FLAG_CATCH_DOWNLOADED = 'FLAG_CATCH_DOWNLOADED';

const lib = require('../lib');
const TRAFIZ_URL = lib.TRAFIZ_URL;

export function syncToServer(dispatch,getState) {
  const state = getState();

  if( !state.App.connectionStatus || state.Login.offline ) {
    return Promise.resolve();
  }

  const idmsuser = state.Login.idmsuser;
  let tasks = state.Task.tasks.slice();
  tasks = _.uniqBy(tasks, o=>{
    return JSON.stringify(o);
  });

  if(tasks && tasks.length == 0) return Promise.resolve();

  const data = {
    sender:idmsuser,
    data:tasks
  }

  console.warn('TASKS:',state.Task.tasks);
  
  // dispatch({
  //   type: START_SYNCH
  // });

  dispatch({
    type: CLEAR_TASKS
  });       

  // const newState = getState();
  lib.dump(data);

  return new Promise((resolve,reject)=>{
    axios({
      method: 'post',
      url: TRAFIZ_URL+'/_api/syncdatav2',
      data: {jsonParam:JSON.stringify(data),senderParam:idmsuser}
    })
    .then(result=>{
      if(result.status !== 200 ) throw 'Connection error';
      const json = result.data;
      if(!json || !json.success) {
        throw json;
      }

      console.warn('success');

      // dispatch({
      //   type: END_SYNCH
      // });

      resolve();
    })
    .catch(err=>{
      let errMsg = 'error';
      if(err && err.response && err.response.data) {
        errMsg = err.response.data;
      } else if(err) {
        errMsg = err;
      }
      
      console.warn('error!');
      console.warn(errMsg);

      dispatch({
        type: ADD_ERROR,
        errData: {
          input:data,
          error:errMsg
        }
      });       

      // dispatch({
      //   type: END_SYNCH
      // });       

      resolve();
    })  
  });
}

// export function syncToServerBetterErrorHandlingV1(dispatch,getState) {
//   const state = getState();

//   const idmsuser = state.Login.idmsuser;
//   const tasks = state.Task.tasks;

//   if(tasks && tasks.length == 0) return Promise.resolve();

//   const data = {
//     sender:idmsuser,
//     data:tasks
//   }

//   console.warn('TASKS:',state.Task.tasks);
//   console.warn('NUM TASKS:',tasks.length);
//   lib.dump(data);

//   return new Promise((resolve,reject)=>{
//     axios({
//       method: 'post',
//       url: TRAFIZ_URL+'/_api/syncdatav2',
//       data: {jsonParam:JSON.stringify(data),senderParam:idmsuser}
//     })
//     .then(result=>{
//       if(result.status !== 200 ) throw 'Connection error';
//       const json = result.data;
//       if(!json.success) {

//         const state = getState();
//         const tasks = state.Task.tasks.slice();
//         const errIndex = Number(json.errIndex);
//         const newTasks = [];
//         for(let i=0;i<tasks.length;i++) {
//           if(i < errIndex) continue;
//           newTasks.push(tasks[i]);
//         }

//         dispatch({
//           type: SET_TASKS,
//           rows: newTasks
//         });       
          
//         // remove until index x
//         throw json;
//       }
//       console.warn(result.data);

//       dispatch({
//         type: CLEAR_TASKS
//       });       
      
//       resolve();
//     })
//     .catch(err=>{
//       let errMsg = 'error';
//       if(err && err.response && err.response.data) {
//         errMsg = err.response.data;
//       } else if(err) {
//         errMsg = err;
//       }
      
//       console.warn('error!');
//       console.warn(errMsg);

//       dispatch({
//         type: ADD_ERROR,
//         errData: {
//           input:data,
//           error:errMsg
//         }
//       });       

//       reject({input:data,error:errMsg});
//     })  
//   });
// }

export function resetSteps(dispatch,getState) {
  dispatch({
    type: SET_STEPS,
    val: 0
  });
}

export function addSteps(dispatch,getState) {
  const steps = getState().Task.steps ? getState().Task.steps : 0;
  const val = steps + 1;

  dispatch({
    type: SET_STEPS,
    val: val
  });
}

export function startSynch() {
  return {
    type: START_SYNCH
  };
}

export function endSynch() {
  return {
    type: END_SYNCH
  };
}

function synchOneByOne(idmsuser,singleTask,taskIndex) {
  const tasks = [];
  tasks.push(singleTask);

  const data = {
    sender:idmsuser,
    data:tasks
  }
  console.warn(data);
  return new Promise((resolve,reject)=>{
    axios({
      method: 'post',
      url: TRAFIZ_URL+'/_api/syncdatav2',
      data: {jsonParam:JSON.stringify(data),senderParam:idmsuser}
    })
    .then(result=>{
      if(result.status !== 200 ) throw 'Connection error';
      const json = result.data;
      if(!json.success) {
        throw json;
      }
      console.warn('task:'+taskIndex+' synched');
      console.warn(result.data);
      resolve();
    })
    .catch(err=>{
      reject(err,taskIndex);
    })  
  });
}

export function syncToServerBetterErrorHandling(dispatch,getState) {
  const state = getState();

  const idmsuser = state.Login.idmsuser;
  let tasks = state.Task.tasks.slice();
  console.warn(tasks.length);
  tasks = _.uniqBy(tasks, o=>{
    return JSON.stringify(o);
  });
  console.warn(tasks.length);
  
  resetSteps(dispatch,getState);
  if(tasks && tasks.length == 0) return Promise.resolve();

  console.warn('NUM TASKS:',tasks.length);

  let p = Promise.resolve();
  for(let i=0;i<tasks.length;i++) {
    const task = tasks[i];
    p = p.then(()=>{
      // synchOneByOne(idmsuser,task,i);
      return synchOneByOne(idmsuser,task,i);
    })
    .then(()=>{
      addSteps(dispatch,getState);
    })
  }

  return new Promise((resolve,reject)=>{
    p
    .then(result=>{
      dispatch({
        type: CLEAR_TASKS
      });       
      
      resolve();
    })
    .catch((err,errIndex)=>{
      const errorIndex = Number(errIndex);
      const newTasks = [];
      for(let i=0;i<tasks.length;i++) {
        if(i < errorIndex) continue;
        newTasks.push(tasks[i]);
      }

      console.warn('SAVE NEW TASKS');
      console.warn(newTasks.length);

      dispatch({
        type: SET_TASKS,
        rows: newTasks
      });       
      
      let errMsg = 'error';
      if(err && err.response && err.response.data) {
        errMsg = err.response.data;
      } else if(err) {
        errMsg = err;
      }

      let input = tasks;
      reject({idmsuser:idmsuser,errorIndex:errorIndex,error:errMsg,input:tasks});
    })  
  });
}

export function sendSynchErrorByEmail(errorData) {
  return (dispatch,getState) => {
    const state = getState();

    const title = 'Error Reports (' + state.Login.identity + ',' + state.Login.id + ',' + moment().format('YYYY-MM-DD')+')';
    const toSend = ''+JSON.stringify(errorData)+'';
    console.warn('send error by email');
  
    return new Promise((resolve,reject)=>{
      const to = ['trafizerrors@gmail.com'];
      email(to, {
        subject: title,
        body: toSend
      })
      .then(()=>resolve())
      .catch(err=>{
        console.warn(err);
        resolve();
      })  
    });
  }
}

export function sendErrorsByEmail() {
  return (dispatch,getState) => {
    const state = getState();

    const errorData = state.Task.errorData;
    const title = 'Error Reports (' + state.Login.identity + ',' + state.Login.id + ',' + moment().format('YYYY-MM-DD')+')';
    const toSend = ''+JSON.stringify(errorData)+'';
    console.warn('send error by email');
  
    return new Promise((resolve,reject)=>{
      const to = ['trafizerrors@gmail.com'];
      email(to, {
        subject: title,
        body: toSend
      })
      .then(()=>resolve())
      .catch(err=>{
        console.warn(err);
        resolve();
      })  
    });
  }
}

// export function example() {
//   return (dispatch,getState) => {
//     const stateLogin = getState().Login;
//     return doSomething()
//       .then(result=>{
//         dispatch({
//           type: LOGIN_USER,
//           user: result
//         });
//       });
//   }
// }

export function setTasks(tasks) {
  return {
    type: SET_TASKS,
    rows: tasks
  };
}

export function setSetting(key,val) {
  return {
    type: SET_SETTING,
    key:key,
    val:val
  };
}

export function appSetConnection(status) {
  return {
    type: APP_CONNECTION,
    status: status
  };
}

export function setOffline(offline) {
  return {
    type: SET_OFFLINE,
    offline: offline,
    offlineTime: moment().unix()
  };
}

export function setOnlineAndSynch() {
  return (dispatch,getState) => {
    // dispatch({
    //   type: SET_OFFLINE,
    //   offline: false
    // });
    console.warn('set online & synch..');
    return syncToServerBetterErrorHandling(dispatch,getState)
      .then(()=>{
        dispatch({
          type: SET_OFFLINE,
          offline: false,
          offlineTime: moment().unix()
        });
      });
  }
}

export function loginUserOffline(username,password) {
  return (dispatch,getState) => {
    const state = getState();

    dispatch({
      type: LOGIN_USER_OFFLINE,
      identity: username,
      password: password
    });  

    return Promise.resolve();
  }
}

export function loginUser(username,password) {
  return (dispatch,getState) => {
    const state = getState();
    const idmsuser = state.Login.idmsuser;

    return axios.post(TRAFIZ_URL+'/_api/sup/login',{
        identity: username,
        password: password
      })
      .then(result=>{
        if(result.status === 200 && result.data.err === 'ok') {
          const data = result.data.data;
          console.warn(data);
          dispatch({
            type: LOGIN_USER,
            identity: username,
            password: password,
            id: data.id,
            idmsuser: data.idmsuser,
            idmssupplier: data.idmssupplier,
            supplierid: data.supplierid,
            accessrole: data.accessrole
          });  
        } else {
          console.warn(result.data);
          throw 'Invalid PIN';
        }
      });
  }
}

export function startSynchronize(resume) {
  return (dispatch,getState) => {
    const state = getState();
    let step = 0;
    
    if(resume) {
      step = state.Setting.synchStep;
      console.warn('resume on step:',step);
    } else {
      dispatch({
        type: LOGIN_SYNCH_STEP,
        step: 0
      });  
    }

    let p = Promise.resolve();
    p = p.then(()=>{
      console.warn('get help..');
      addSteps(dispatch,getState);
      const action = downloadHelp();
      return action(dispatch,getState);
    })
    .then(()=>{
      console.warn('get profile..');
      addSteps(dispatch,getState);
      const action = getProfile();
      return action(dispatch,getState);
    });

    if(step < 1) {
      p = p.then(()=>{
        const action = getShips();
        return action(dispatch,getState);
      }).then(()=>{
        addSteps(dispatch,getState);
        dispatch({
          type: LOGIN_SYNCH_STEP,
          step: 1
        });  
      })  
    }

    if(step < 2) {
      p = p.then(()=>{
        return getFishermans()(dispatch,getState);
      }).then(()=>{
        addSteps(dispatch,getState);
        dispatch({
          type: LOGIN_SYNCH_STEP,
          step: 2
        });  
      })
    }

    if(step < 3) {
      p = p.then(()=>{
        return getFishes()(dispatch,getState);
      }).then(()=>{
        addSteps(dispatch,getState);
        dispatch({
          type: LOGIN_SYNCH_STEP,
          step: 3
        });  
      })
    }

    if(step < 4) {
      p = p.then(()=>{
        return getBuyers()(dispatch,getState);
      }).then(()=>{
        addSteps(dispatch,getState);
        dispatch({
          type: LOGIN_SYNCH_STEP,
          step: 4
        });  
      })
    }

    if(step < 5) {
      p = p.then(()=>{
        return getSuppliers()(dispatch,getState);
      }).then(()=>{
        addSteps(dispatch,getState);
        dispatch({
          type: LOGIN_SYNCH_STEP,
          step: 5
        });  
      })
    }

    if(step < 6) {
      p = p.then(()=>{
        return getCatchFishes()(dispatch,getState);
      })
      .then(()=>{
        return getExtraData()(dispatch,getState);
      })
      .then(()=>{
        addSteps(dispatch,getState);
        dispatch({
          type: LOGIN_SYNCH_STEP,
          step: 6
        });  
      })
    }

    if(step < 7) {
      p = p.then(()=>{
        return getLoans()(dispatch,getState);
      })
      .then(()=>{
        return getLoanType()(dispatch,getState);
      })
      .then(()=>{
        addSteps(dispatch,getState);
        dispatch({
          type: LOGIN_SYNCH_STEP,
          step: 7
        });  
      })
    }

    if(step < 8) {
      p = p.then(()=>{
        return getDeliveries()(dispatch,getState);
      }).then(()=>{
        addSteps(dispatch,getState);
        dispatch({
          type: LOGIN_SYNCH_STEP,
          step: 8
        });  
      })
    }

    p = p.then(()=>{
      return lib.delay(500);
    })
    .then(()=>{
      addSteps(dispatch,getState);
      dispatch({
        type: LOGIN_SYNCH_DONE,
        timeStamp:moment().unix()
      });  
    })

    return p;
  }
}

export function registerUser(name,hp,supplierId,pass) {
  return (dispatch,getState) => {
    return axios.post('https://jsonplaceholder.typicode.com/posts',{
        name: name,
        hp: hp,
        supplierId: supplierId,
        pass: pass
      })
      .then(result=>{
        if(result.status !== 200 ) throw 'Connection error';
      });
  }
}

export function downloadHelp() {
  return (dispatch,getState) => {
    return new Promise((resolve,reject)=>{
      axios.get(TRAFIZ_URL+'/_api/getinfo?id=supportinfo')
      .then(result=>{
        if(result.status === 200) {
          console.warn('download help done!');
          dispatch({
            type: SET_SETTING,
            key:'htmlHelp',
            val:result.data
          });  
        } else {
          throw 'Connection error';
        }
        resolve();
      })
      .catch(err=>{
        resolve();
      });
    });
  }
}

export function getShips() {
  return (dispatch,getState) => {
    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    return new Promise((resolve,reject)=>{
      axios.get(TRAFIZ_URL+'/_api/ship/getv2?id='+idmsuser)
      .then(result=>{
        // console.warn(result.status);
        // console.warn(result.data);
        if(result.status === 200) {
          console.warn('get ships done!');
          dispatch({
            type: SET_SHIPS,
            rows: result.data
          });  
        } else {
          throw 'Connection error';
        }
        resolve();
      })
      .catch(err=>{
        resolve();
      });
    });
  }
}

export function getFishermans() {
  return (dispatch,getState) => {
    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    return new Promise((resolve,reject)=>{
      const url = TRAFIZ_URL+'/_api/fisherman/getv2?id='+idmsuser;
      axios.get(url)
      .then(result=>{
        // console.warn(result.status);
        // console.warn(result.data);
        if(result.status === 200) {
          console.warn('get fishermans done!');
          dispatch({
            type: SET_FISHERMANS,
            rows: result.data
          });  
        } else {
          throw 'Connection error';
        }
        resolve();
      })
      .catch(err=>{
        resolve();
      });
    });
  }
}

export function getFishes() {
  return (dispatch,getState) => {
    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    return new Promise((resolve,reject)=>{
      axios.get(TRAFIZ_URL+'/_api/fish/getv2?id='+idmsuser)
      .then(result=>{
        // console.warn(result.status);
        // console.warn(result.data);
        if(result.status === 200) {
          console.warn('get fishes done!');
          dispatch({
            type: SET_FISHES,
            rows: result.data
          });  
        } else {
          throw 'Connection error';
        }
        resolve();
      })
      .catch(err=>{
        resolve();
      });
    });
  }
}

export function getSuppliers() {
  return (dispatch,getState) => {
    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    return new Promise((resolve,reject)=>{
      axios.get(TRAFIZ_URL+'/_api/buyer/getv2?id='+idmsuser)
      .then(result=>{
        if(result.status === 200) {
          console.warn('get suppliers done!');
          _.remove(result.data,{usertypename:'Buyer'})
          dispatch({
            type: SET_SUPPLIERS,
            rows: result.data
          });  
        } else {
          throw 'Connection error';
        }
        resolve();
      })
      .catch(err=>{
        resolve();
      });
    });
  }
}

export function getBuyers() {
  return (dispatch,getState) => {
    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    return new Promise((resolve,reject)=>{
      axios.get(TRAFIZ_URL+'/_api/buyer/getv2?id='+idmsuser)
      .then(result=>{
        if(result.status === 200) {
          console.warn('get buyers done!');
          _.remove(result.data,{usertypename:'Supplier'})
          dispatch({
            type: SET_BUYERS,
            rows: result.data
          });  
        } else {
          throw 'Connection error';
        }
        resolve();
      })
      .catch(err=>{
        resolve();
      });
    });
  }
}

export function addSupplier(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('create','buyer','addnewbuyerv3',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const rows = state.Data.suppliers.slice();
      rows.push(offlineJson);
      dispatch({
        type: SET_SUPPLIERS,
        rows: rows
      });  
    }

    return syncToServer(dispatch,getState);
  }
}

export function addBuyer(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('create','buyer','addnewbuyerv3',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const rows = state.Data.buyers.slice();
      rows.push(offlineJson);
      dispatch({
        type: SET_BUYERS,
        rows: rows
      });  
    }

    return syncToServer(dispatch,getState);
  }
}

export function editSupplier(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('update','buyer','updatebuyerv3',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const rows = state.Data.suppliers.slice();
      const index = _.findIndex(rows,{idbuyeroffline:offlineJson.idbuyeroffline});
      if(index > -1) {
        rows[index] = offlineJson;
        dispatch({
          type: SET_SUPPLIERS,
          rows: rows
        });  
      }
    }

    return syncToServer(dispatch,getState);
  }
}

export function editBuyer(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('update','buyer','updatebuyerv3',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const rows = state.Data.buyers.slice();
      const index = _.findIndex(rows,{idbuyeroffline:offlineJson.idbuyeroffline});
      if(index > -1) {
        rows[index] = offlineJson;
        dispatch({
          type: SET_BUYERS,
          rows: rows
        });  
      }
    }

    return syncToServer(dispatch,getState);
  }
}

export function removeBuyer(json) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('delete','buyer','deletebuyer',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    const rows = state.Data.buyers.slice();
    console.warn(json);
    const index = _.findIndex(rows,{idbuyeroffline:json.idbuyerofflineparam});
    console.warn(index);
    rows[index].lasttransact = 'D';
    dispatch({
      type: SET_BUYERS,
      rows: rows
    });

    return syncToServer(dispatch,getState);
  }
}

export function removeSupplier(json) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('delete','buyer','deletebuyer',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    const rows = state.Data.suppliers.slice();
    const index = _.findIndex(rows,{idbuyeroffline:json.idbuyerofflineparam});
    rows[index].lasttransact = 'D';
    dispatch({
      type: SET_SUPPLIERS,
      rows: rows
    });

    return syncToServer(dispatch,getState);
  }
}


export function addShip(json,offlineJson,skipSynch) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('create','ship','addnewshipv3',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const rows = state.Data.ships.slice();
      rows.push(offlineJson);
      dispatch({
        type: SET_SHIPS,
        rows: rows
      });  
    }

    if(skipSynch) return Promise.resolve();

    return syncToServer(dispatch,getState);
  }
}

export function editShip(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('update','ship','updateshipv3',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const rows = state.Data.ships.slice();
      const index = _.findIndex(rows,{idshipoffline:offlineJson.idshipoffline});
      if(index > -1) {
        rows[index] = offlineJson;
        dispatch({
          type: SET_SHIPS,
          rows: rows
        });  
      }
    }

    return syncToServer(dispatch,getState);
  }
}

export function removeShip(json) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('delete','ship','deleteship',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    const rows = state.Data.ships.slice();
    const index = _.findIndex(rows,{idshipoffline:json.idshipofflineparam});
    rows[index].lasttransact = 'D';
    dispatch({
      type: SET_SHIPS,
      rows: rows
    });

    return syncToServer(dispatch,getState);
  }
}

export function addFisherman(json,offlineJson) {
  return (dispatch,getState) => {

    const state = getState();
    const task = createTask('create','fisherman','addnewfishermanv3',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const rows = state.Data.fishermans.slice();
      rows.push(offlineJson);
      dispatch({
        type: SET_FISHERMANS,
        rows: rows
      });  
    }

    return syncToServer(dispatch,getState);
  }
}

export function editFisherman(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('update','fisherman','updatefishermanv3',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const rows = state.Data.fishermans.slice();
      const index = _.findIndex(rows,{idfishermanoffline:offlineJson.idfishermanoffline});
      if(index > -1) {
        rows[index] = offlineJson;
        dispatch({
          type: SET_FISHERMANS,
          rows: rows
        });  
      }
    }


    return syncToServer(dispatch,getState);
  }
}

export function removeFisherman(json) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('delete','fisherman','deletefisherman',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    const rows = state.Data.fishermans.slice();
    const index = _.findIndex(rows,{idfishermanoffline:json.idfishermanofflineparam});
    rows[index].lasttransact = 'D';
    dispatch({
      type: SET_FISHERMANS,
      rows: rows
    });

    return syncToServer(dispatch,getState);
  }
}

export function addFish(json,offlineJson,skipSynch) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('create','fish','addnewfish',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const fishes = state.Data.fishes.slice();
      fishes.push(offlineJson);
      dispatch({
        type: SET_FISHES,
        rows: fishes
      });  
    }

    if(skipSynch) return Promise.resolve();
    
    return syncToServer(dispatch,getState);
  }
}

export function editFish(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('update','fish','updatefish',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const fishes = state.Data.fishes.slice();
      const index = _.findIndex(fishes,{idfishoffline:offlineJson.idfishoffline});
      if(index > -1) {
        fishes[index] = offlineJson;
        dispatch({
          type: SET_FISHES,
          rows: fishes
        });  
      }
    }

    return syncToServer(dispatch,getState);
  }
}

export function removeFish(json) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('delete','fish','deletefish',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    const fishes = state.Data.fishes.slice();
    const index = _.findIndex(fishes,{idfishoffline:json.idfishofflineparam});
    fishes[index].lasttransact = 'D';
    // _.remove(fishes, {idfishoffline:json.idfishofflineparam})
    dispatch({
      type: SET_FISHES,
      rows: fishes
    });

    return syncToServer(dispatch,getState);
  }
}

export function logoutUser() {
  return {
    type: LOGOUT_USER
  };
}

export function lockUser() {
  return {
    type: LOCK_USER
  };
}

export function getLoans(month,year) {
  return (dispatch,getState) => {

    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;
    const m = -1; //month ? month : moment().month()+1;
    const y = -1; //year ? year : moment().year();
    const url = TRAFIZ_URL+'/_api/loan/getv2?id='+idmssupplier+'&m='+m+'&y='+y;
    const url2 = TRAFIZ_URL+'/_api/payloan/get?id='+idmssupplier+'&m='+m+'&y='+y;
    return axios.get(url2)
      .then(result=>{
        if(result.status === 200) {
          const rows = result.data;
          console.warn('get payloans done!');
          dispatch({
            type: SET_PAYLOANS,
            rows: rows
          });
        }

        return axios.get(url)
      })
      .then(result=>{
        if(result.status === 200) {
          console.warn('get loans done!');
          const rows = result.data;
          const data = [];
          for (let i = 0;i<rows.length;i++) {
            const row = rows[i];
              
            const idmsuserloan = row.idmsuserloan;
            const idmsbuyerloan = row.idmsbuyerloan;
            let idfishermanoffline = row.idfishermanoffline ? row.idfishermanoffline : null;
            let idbuyeroffline = row.idbuyeroffline ? row.idbuyeroffline : null;
            // if(idfishermanoffline || idbuyeroffline) console.warn(row);
            const name = row.nameloan;
            const idmsloaner = idmsuserloan ? idmsuserloan : idmsbuyerloan;
            let job = 'FISHERMAN';
            if(idmsbuyerloan || idbuyeroffline) job = 'SUPPLIER';
            const items = [];
            let totalinrp = 0;
            const loans = row.loan;

            for(let j=0;j<loans.length;j++) {
              const loan = loans[j];
              const idtrloan = loan.idtrloan;
              const idloanoffline = loan.idloanoffline;
              if(!idloanoffline) continue;
              let loandate = loan.loandate;
              if(loandate && loandate.length > 0) loandate = loandate.split(' ')[0];
              const desc = loan.descloan;
              const total = loan.loaninrp;
              const strike = loan.paidoffdate ? true : false;
              items.push({
                idtrloan:idtrloan,
                idloanoffline:idloanoffline,
                loanDate:loandate,
                desc:desc,
                total:total,
                strike:strike,
                namecreator:loan.namecreator,
                namelasttrans:loan.namelasttrans,

                idmstypeitemloanofflineparam:loan.idmstypeitemloanoffline,
                unitparam:loan.unit,
                priceperunitparam:loan.priceperunit,

                idfishermanoffline:loan.idfishermanoffline,
                idbuyeroffline:loan.idbuyeroffline,
              });

              if(!idfishermanoffline && loan.idfishermanoffline) idfishermanoffline = loan.idfishermanoffline;
              if(!idbuyeroffline && loan.idbuyeroffline) idbuyeroffline = loan.idbuyeroffline;

              // estimate total loan must inline to items
              if(!strike) totalinrp += Number(total);
            }

            data.push({
              idmsuser:idmsloaner,
              idfishermanoffline,
              idbuyeroffline,
              name:name,
              usertypename:job,
              items:items,
              estimateTotalLoan:totalinrp
            });

          }

          dispatch({
            type: SET_LOANS,
            rows: data
          });

        } else {
          throw 'Connection error';
        }
        
      });
  }
}

export function getLoansV1(month,year) {
  return (dispatch,getState) => {

    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;
    const m = month ? month : moment().month()+1;
    const y = year ? year : moment().year();
    const url = TRAFIZ_URL+'/_api/loan/get?id='+idmssupplier+'&m='+m+'&y='+y;
    // const url2 = TRAFIZ_URL+'/_api/paynloan/get?id='+idmssupplier+'&m='+m+'&y='+y;
    const url2 = TRAFIZ_URL+'/_api/payloan/get?id='+idmssupplier+'&m='+m+'&y='+y;
    // console.warn(url);
    // let paynloan = [];
    return axios.get(url2)
      .then(result=>{
        if(result.status === 200) {
          const rows = result.data;
          console.warn('get payloans done!');
          dispatch({
            type: SET_PAYLOANS,
            rows: rows
          });
        }

        return axios.get(url)
      })
      .then(result=>{
        if(result.status === 200) {
          console.warn('get loans done!');
          const rows = result.data;
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

          dispatch({
            type: SET_LOANS,
            rows: data
          });

        } else {
          throw 'Connection error';
        }
        
      });
  }
}

export function loanAddItemForUser(user,newItem) {
  return (dispatch,getState) => {
    const state = getState();
    const loans = state.Data.loans.slice();
    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;

    let index = -1;
    if(user.idmsuser) 
      index = _.findIndex(loans,{'idmsuser':user.idmsuser});
    else if(user.idfishermanoffline)
      index = _.findIndex(loans,{'idfishermanoffline':user.idfishermanoffline});
    else if(user.idbuyeroffline)
      index = _.findIndex(loans,{'idbuyeroffline':user.idbuyeroffline});

    if(index == -1) {
      console.warn('create new loan');
      index = loans.length;
      loans.push(user);
    } else {
      console.warn('user found at index:',index);
    }

    let items = loans[index].items;
    if(!items) items = [];
    items.unshift(newItem);
    loans[index].items = items;

    const prev = loans[index].estimateTotalLoan ? loans[index].estimateTotalLoan : 0;
    loans[index].estimateTotalLoan = prev + newItem.total;

    const isSupplier = (user.usertypename == 'SUPPLIER');

    return lib.delay(10)
      .then(result=>{
        console.warn(user);
        console.warn(user.idfishermanoffline);
        console.warn(user.idbuyeroffline);
        dispatch({
          type: SET_LOANS,
          rows: loans
        });

        let param = {
          idloanofflineparam:newItem.idloanoffline, //todo
          descparam:newItem.desc, 
          rpparam:newItem.total, 
          idmsuserloanparam:user.idmsuser ? user.idmsuser : null,
          idmsbuyerloanparam:null,
          idmssupplierparam:idmssupplier, 
          loandateparam:newItem.loanDate, 
          loaneridmsuserofficerparam:idmsuser,
          
          idmstypeitemloanofflineparam:newItem.idmstypeitemloanofflineparam,
          unitparam:newItem.unitparam,
          priceperunitparam:newItem.priceperunitparam,

          idfishermanofflineparam:user.idfishermanoffline,
          idbuyerofflineparam:null,    
        }

        if(isSupplier) param = {
          idloanofflineparam:newItem.idloanoffline, //todo
          descparam:newItem.desc, 
          rpparam:newItem.total,
          idmsuserloanparam:null,
          idmsbuyerloanparam:user.idmsuser ? user.idmsuser : null, //idmsuser fisherman/supplier
          idmssupplierparam:idmssupplier, 
          loandateparam:newItem.loanDate, 
          loaneridmsuserofficerparam:idmsuser,

          idmstypeitemloanofflineparam:newItem.idmstypeitemloanofflineparam,
          unitparam:newItem.unitparam,
          priceperunitparam:newItem.priceperunitparam,

          idfishermanofflineparam:null,
          idbuyerofflineparam:user.idbuyeroffline,    
        }
        
        const task = createTask('create','loan','addnewloanv5',param);

        dispatch({
          type: ADD_TASK,
          task: task
        });
    
        return syncToServer(dispatch,getState);    
      });
  }
  
}

export function loanUpdateItem(user,newItem) {
  return (dispatch,getState) => {
    const state = getState();
    const loans = state.Data.loans.slice();
    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;

    let index = -1;
    if(user.idmsuser) 
      index = _.findIndex(loans,{'idmsuser':user.idmsuser});
    else if(user.idfishermanoffline)
      index = _.findIndex(loans,{'idfishermanoffline':user.idfishermanoffline});
    else if(user.idbuyeroffline)
      index = _.findIndex(loans,{'idbuyeroffline':user.idbuyeroffline});

    if(index == -1) return Promise.resolve()

    let items = loans[index].items;
    if(!items) items = [];
    index2 = _.findIndex(items,{idloanoffline:newItem.idloanoffline});
    
    if(index2 > -1) {
      loans[index].items[index2] = newItem;
      const newItems = loans[index].items;      
      let estimateTotalLoan = 0;
      for(let i=0;i<newItems.length;i++) {
        if(newItems[i].strike) continue;
        estimateTotalLoan += Number(newItems[i].total);
      }
      loans[index].estimateTotalLoan = estimateTotalLoan;
    }

    const isSupplier = (user.usertypename == 'SUPPLIER');

    return lib.delay(1000)
      .then(result=>{
        dispatch({
          type: SET_LOANS,
          rows: loans
        });

        let param = {
          idloanofflineparam:newItem.idloanoffline, //todo
          descparam:newItem.desc, 
          rpparam:newItem.total, 
          idmsuserloanparam:user.idmsuser ? user.idmsuser : null, //idmsuser fisherman/supplier
          idmsbuyerloanparam:null,
          idmssupplierparam:idmssupplier, 
          loandateparam:newItem.loanDate, 
          loaneridmsuserofficerparam:idmsuser,
          
          idmstypeitemloanofflineparam:newItem.idmstypeitemloanofflineparam,
          unitparam:newItem.unitparam,
          priceperunitparam:newItem.priceperunitparam,

          idfishermanofflineparam:user.idfishermanoffline ? user.idfishermanoffline : null,
          idbuyerofflineparam:null,
        }

        if(isSupplier) param = {
          idloanofflineparam:newItem.idloanoffline, //todo
          descparam:newItem.desc, 
          rpparam:newItem.total,
          idmsuserloanparam:null,
          idmsbuyerloanparam:user.idmsuser ? user.idmsuser : null, //idmsuser fisherman/supplier
          idmssupplierparam:idmssupplier, 
          loandateparam:newItem.loanDate, 
          loaneridmsuserofficerparam:idmsuser,

          idmstypeitemloanofflineparam:newItem.idmstypeitemloanofflineparam,
          unitparam:newItem.unitparam,
          priceperunitparam:newItem.priceperunitparam,

          idfishermanofflineparam:null,
          idbuyerofflineparam:user.idbuyeroffline ? user.idbuyeroffline : null,
        }
        
        const task = createTask('create','loan','updateloanv5',param);

        dispatch({
          type: ADD_TASK,
          task: task
        });
    
        return syncToServer(dispatch,getState);    
      });
  }
  
}

export function loanRemoveItem(user,idloanoffline) {
  return (dispatch,getState) => {
    const state = getState();
    const loans = state.Data.loans.slice();

    let index = -1;
    if(user.idmsuser) 
      index = _.findIndex(loans,{'idmsuser':user.idmsuser});
    else if(user.idfishermanoffline)
      index = _.findIndex(loans,{'idfishermanoffline':user.idfishermanoffline});
    else if(user.idbuyeroffline)
      index = _.findIndex(loans,{'idbuyeroffline':user.idbuyeroffline});

    if(index == -1) return Promise.resolve();

    let items = loans[index].items ? loans[index].items.slice() : [];
    console.warn(items);
    console.warn(idloanoffline);
    _.remove(items,{idloanoffline:idloanoffline});
    
    let estimateTotalLoan = 0;
    for(let i=0;i<items.length;i++) {
      if(items[i].strike) continue;
      estimateTotalLoan += Number(items[i].total);
    }
    loans[index].estimateTotalLoan = estimateTotalLoan;
    loans[index].items = items;

    return lib.delay(100)
      .then(result=>{
        dispatch({
          type: SET_LOANS,
          rows: loans
        });

        let param = {
          idloanofflineparam:idloanoffline
        }

        const task = createTask('create','loan','deleteloanv3',param);

        dispatch({
          type: ADD_TASK,
          task: task
        });
    
        return syncToServer(dispatch,getState);    
      });
  }
  
}

export function loanAddItemForUserV1(user,newItem) {
  return (dispatch,getState) => {
    const state = getState();
    const loans = state.Data.loans.slice();
    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;

    let index;
    index = _.findIndex(loans,{'idmsuser':user.idmsuser});
    if(index == -1) {
      console.warn('create new loan');
      index = loans.length;
      loans.push(user);
    } else {
      console.warn('user found at index:',index);
    }

    let items = loans[index].items;
    if(!items) items = [];
    items.unshift(newItem);
    loans[index].items = items;

    const prev = loans[index].estimateTotalLoan ? loans[index].estimateTotalLoan : 0;
    loans[index].estimateTotalLoan = prev + newItem.total;

    const isSupplier = (user.usertypename == 'SUPPLIER');

    return lib.delay(1000)
      .then(result=>{
        dispatch({
          type: SET_LOANS,
          rows: loans
        });

        let param = {
          descparam:newItem.desc, 
          rpparam:newItem.total, 
          idmsuserloanparam:user.idmsuser, //idmsuser fisherman/supplier
          idmsbuyerloanparam:null,
          idmssupplierparam:idmssupplier, 
          loandateparam:newItem.loanDate, 
          loaneridmsuserofficerparam:idmsuser        
        }

        if(isSupplier) param = {
          descparam:newItem.desc, 
          rpparam:newItem.total,
          idmsuserloanparam:null,
          idmsbuyerloanparam:user.idmsuser, //idmsuser fisherman/supplier
          idmssupplierparam:idmssupplier, 
          loandateparam:newItem.loanDate, 
          loaneridmsuserofficerparam:idmsuser        
        }
        
        const task = createTask('create','loan','addnewloan',param);

        dispatch({
          type: ADD_TASK,
          task: task
        });
    
        return syncToServer(dispatch,getState);    
      });
  }
  
}

export function loanUpdateItemsForUser(user,newItems) {
  return (dispatch,getState) => {
    const state = getState();
    const loans = state.Data.loans.slice();
    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;

    let index = -1;
    if(user.idmsuser) 
      index = _.findIndex(loans,{'idmsuser':user.idmsuser});
    else if(user.idfishermanoffline)
      index = _.findIndex(loans,{'idfishermanoffline':user.idfishermanoffline});
    else if(user.idbuyeroffline)
      index = _.findIndex(loans,{'idbuyeroffline':user.idbuyeroffline});

    if(index == -1) return Promise.resolve();

    // ensure est total loan inline with striked items
    console.warn(newItems);
    let items = loans[index].items.slice();
    loans[index].items = newItems;
    let estimateTotalLoan = 0;
    for(let i=0;i<newItems.length;i++) {
      if(newItems[i].strike) continue;
      estimateTotalLoan += Number(newItems[i].total);
    }
    loans[index].estimateTotalLoan = estimateTotalLoan;

    const paidoffdate = moment().format('YYYY-MM-DD');
    for(let i=0;i<newItems.length;i++) {
      if(!newItems[i].needUpdate) continue;
      const idloanoffline = newItems[i].idloanoffline;
      if(!idloanoffline) throw 'loan error!';
      let task;
      if(newItems[i].strike) {
        task = createTask('create','loan','payloanv3',{
          idloanofflineparam:idloanoffline,
          paidoffdateparam:paidoffdate,
          paidoffidmsuserofficerparam:idmsuser        
        });  
      } else {
        task = createTask('create','loan','cancelpayloanv3',{
          idloanofflineparam:idloanoffline
        });
      }
      dispatch({
        type: ADD_TASK,
        task: task
      });
    }

    return lib.delay(100)
      .then(result=>{
        dispatch({
          type: SET_LOANS,
          rows: loans
        });

        return syncToServer(dispatch,getState);    
      });
  }
  
}

// export function loanUpdateItemsForUserV1(user,newItems) {
//   return (dispatch,getState) => {
//     const state = getState();
//     const loans = state.Data.loans.slice();
//     const idmsuser = state.Login.idmsuser;
//     const idmssupplier = state.Login.idmssupplier;

//     let index;
//     index = _.findIndex(loans,{'idmsuser':user.idmsuser});
//     if(index == -1) {
//       console.warn('user not found!');
//       return Promise.resolve();
//     }

//     // ensure est total loan inline with striked items
//     let items = loans[index].items.slice();
//     loans[index].items = newItems;
//     let estimateTotalLoan = 0;
//     for(let i=0;i<newItems.length;i++) {
//       if(newItems[i].strike) continue;
//       estimateTotalLoan += Number(newItems[i].total);
//     }
//     loans[index].estimateTotalLoan = estimateTotalLoan;

//     const paidoffdate = moment().format('YYYY-MM-DD');
//     for(let i=0;i<items.length;i++) {
//       if(!newItems[i].needUpdate) continue;
//       if(newItems[i].idtrloan.indexOf('offline') > -1) continue;
//       const idtrloan = newItems[i].idtrloan;
//       console.log(idtrloan+' updated!');
//       let task;
//       if(newItems[i].strike) {
//         task = createTask('create','loan','payloan',{
//           idtrloanparam:idtrloan,
//           paidoffdateparam:paidoffdate,
//           paidoffidmsuserofficerparam:idmsuser        
//         });  
//       } else {
//         task = createTask('create','loan','cancelpayloan',{
//           idtrloanparam:idtrloan
//         });
//       }
//       dispatch({
//         type: ADD_TASK,
//         task: task
//       });
//     }

//     return lib.delay(1000)
//       .then(result=>{
//         dispatch({
//           type: SET_LOANS,
//           rows: loans
//         });

//         return syncToServer(dispatch,getState);    
//       });
//   }
  
// }

export function loanUpdatePaidForUser(user,paidAmount,paidDate,paidDesc,borrowerName) {
  return (dispatch,getState) => {
    const state = getState();
    const loans = state.Data.loans.slice();
    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;

    let index = -1;
    index = _.findIndex(loans,{'idmsuser':user.idmsuser});
    if(index == -1) {
      if(user.idfishermanoffline)
        index = _.findIndex(loans,{'idfishermanoffline':user.idfishermanoffline});
      else if(user.idbuyeroffline)
        index = _.findIndex(loans,{'idbuyeroffline':user.idbuyeroffline});
    }

    if(index == -1) return Promise.resolve();

    loans[index].estimateTotalLoan -= Number(paidAmount);
    
    const newPayloan = {
      descloan:paidDesc,
      loaninrp:paidAmount,
      idmsuserloan:user.idmsuser,
      nameloan:borrowerName,
      idmsbuyerloan:null,
      nameloanbuyer:borrowerName,
      idmssupplier:idmssupplier,
      paidoffdate:paidDate+" 00:00:00",

      idfishermanoffline:user.idfishermanoffline ? user.idfishermanoffline : null,
      idbuyeroffline:user.idbuyeroffline ? user.idbuyeroffline : null,
    };

    const payloans = state.Data.payloans.slice();
    payloans.push(newPayloan);
    dispatch({
      type: SET_PAYLOANS,
      rows: payloans
    });


    const isSupplier = (user.usertypename == 'SUPPLIER');
    const uid = Number(state.Login.id);
    const id = lib.getShortOfflineId('pl',uid.toString(36));

    // todo
    let param = {
      idpayloanofflineparam:id,
      idmsuserloanparam:user.idmsuser ? user.idmsuser : null,
      idmsbuyerloanparam:null,
      idmssupplierparam:idmssupplier, 
      descparam:paidDesc, 
      rpparam:paidAmount, 
      paiddateparam:paidDate, 
      paidoffidmsuserofficerparam:idmsuser,

      idfishermanofflineparam:user.idfishermanoffline ? user.idfishermanoffline : null,
      idbuyerofflineparam:null,
    };

    if(isSupplier) param = {
      idpayloanofflineparam:id,
      idmsuserloanparam:null,
      idmsbuyerloanparam:user.idmsuser ? user.idmsuser : null,
      idmssupplierparam:idmssupplier, 
      descparam:paidDesc,
      rpparam:paidAmount, 
      paiddateparam:paidDate, 
      paidoffidmsuserofficerparam:idmsuser,

      idfishermanofflineparam:null,
      idbuyerofflineparam:user.idbuyeroffline ? user.idbuyeroffline : null,
    }

    // console.warn(param);

    const task = createTask('create','loan','addpayloanv4',param);
    dispatch({
      type: ADD_TASK,
      task: task
    });

    return lib.delay(10)
      .then(result=>{
        dispatch({
          type: SET_LOANS,
          rows: loans
        });

        return syncToServer(dispatch,getState);
      });
  }
  
}

// export function loanUpdatePaidForUserV2(user,paidAmount,borrowerName) {
//   return (dispatch,getState) => {
//     const state = getState();
//     const loans = state.Data.loans.slice();
//     const idmsuser = state.Login.idmsuser;
//     const idmssupplier = state.Login.idmssupplier;

//     let index;
//     index = _.findIndex(loans,{'idmsuser':user.idmsuser});
//     if(index == -1) {
//       console.warn('user not found!');
//       return Promise.resolve();
//     }

//     loans[index].estimateTotalLoan -= Number(paidAmount);
    
//     const newPayloan = {
//       descloan:"Pembayaran Hutang",
//       loaninrp:paidAmount,
//       idmsuserloan:user.idmsuser,
//       nameloan:borrowerName,
//       idmsbuyerloan:null,
//       nameloanbuyer:borrowerName,
//       idmssupplier:idmssupplier,
//       paidoffdate:moment().format('YYYY-MM-DD')+" 00:00:00",
//     };

//     const payloans = state.Data.payloans.slice();
//     payloans.push(newPayloan);
//     dispatch({
//       type: SET_PAYLOANS,
//       rows: payloans
//     });


//     const isSupplier = (user.usertypename == 'SUPPLIER');
//     const uid = Number(state.Login.id);
//     const id = lib.getShortOfflineId('pl',uid.toString(36));

//     // todo
//     let param = {
//       idpayloanofflineparam:id,
//       idmsuserloanparam:user.idmsuser,
//       idmsbuyerloanparam:null,
//       idmssupplierparam:idmssupplier, 
//       descparam:'Pembayaran Hutang', 
//       rpparam:paidAmount, 
//       paiddateparam:moment().format('YYYY-MM-DD'), 
//       paidoffidmsuserofficerparam:idmsuser
//     };

//     if(isSupplier) param = {
//       idpayloanofflineparam:id,
//       idmsuserloanparam:null,
//       idmsbuyerloanparam:user.idmsuser,
//       idmssupplierparam:idmssupplier, 
//       descparam:'Pembayaran Hutang', 
//       rpparam:paidAmount, 
//       paiddateparam:moment().format('YYYY-MM-DD'), 
//       paidoffidmsuserofficerparam:idmsuser
//     }

//     const task = createTask('create','loan','addpayloanv3',param);
//     dispatch({
//       type: ADD_TASK,
//       task: task
//     });

//     return lib.delay(1000)
//       .then(result=>{
//         dispatch({
//           type: SET_LOANS,
//           rows: loans
//         });

//         return syncToServer(dispatch,getState);
//       });
//   }
  
// }

// export function loanUpdatePaidForUserV1(user,paidAmount) {
//   return (dispatch,getState) => {
//     const state = getState();
//     const loans = state.Data.loans.slice();
//     const idmsuser = state.Login.idmsuser;
//     const idmssupplier = state.Login.idmssupplier;

//     let index;
//     index = _.findIndex(loans,{'idmsuser':user.idmsuser});
//     if(index == -1) {
//       console.warn('user not found!');
//       return Promise.resolve();
//     }

//     loans[index].estimateTotalLoan -= Number(paidAmount);

//     const isSupplier = (user.usertypename == 'SUPPLIER');

//     // todo
//     let param = {
//       idmsuserloanparam:user.idmsuser,
//       idmsbuyerloanparam:null,
//       idmssupplierparam:idmssupplier, 
//       descparam:'Pembayaran Hutang', 
//       rpparam:paidAmount, 
//       paiddateparam:moment().format('YYYY-MM-DD'), 
//       paidoffidmsuserofficerparam:idmsuser
//     };

//     if(isSupplier) param = {
//       idmsuserloanparam:null,
//       idmsbuyerloanparam:user.idmsuser,
//       idmssupplierparam:idmssupplier, 
//       descparam:'Pembayaran Hutang', 
//       rpparam:paidAmount, 
//       paiddateparam:moment().format('YYYY-MM-DD'), 
//       paidoffidmsuserofficerparam:idmsuser
//     }

//     const task = createTask('create','loan','addpayloanv3',param);
//     dispatch({
//       type: ADD_TASK,
//       task: task
//     });

//     return lib.delay(1000)
//       .then(result=>{
//         dispatch({
//           type: SET_LOANS,
//           rows: loans
//         });

//         return syncToServer(dispatch,getState);
//       });
//   }
  
// }

function createTask(type,func,functionName,p) {
  let params = [];

  for (var key in p) {
    if (p.hasOwnProperty(key)) {
      const val = p[key];
      params.push(val);
    }
  }
  params = params.join(',');
  const desc = ''+type+' data '+func+' sebagai berikut : '+params;

  const task = {
    type:type, // create / update / delete
    function:func,
    functionName:functionName,
    param:p,
    desc:desc,
    dateTime:moment().format('YYYY-MM-DD HH:mm:ss')
  }

  return task;
}

export function addCatchList(json,offlineJson) {
  return (dispatch,getState) => {

    const state = getState();
    const task = createTask('create','catch','addcatchv5',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson && state.Login.offline) {
      const rows = state.Data.catches.slice();
      rows.push(offlineJson);
      dispatch({
        type: SET_CATCHES,
        rows: rows
      });  
    }

    return syncToServer(dispatch,getState);
  }
}

export function addCatchListOri(json) {
  return (dispatch,getState) => {
    const state = getState();
    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;

    const catches = state.Data.catches.slice();
    json.id = moment().unix();
    json.createdAt = moment().format('YYYY-MM-DD');
    catches.unshift(json);

    dispatch({
      type: SET_CATCHES,
      rows: catches
    });

    // synch todo
    const playerData = json.playerData;
    const shipData = json.shipData;
    const fishData = json.fishData;

    const param = {
      idtrcatchpostparam:json.id,
      idmssupplierparam:idmssupplier,
      idmsfishermanparam:playerData.idmsfisherman,
      idmsbuyersupplierparam:null,
      idmsshipparam:shipData.idmsship,
      idmsfishparam:fishData.idmsfish,
      varianceparam:json.fishVariation,
      dispatchnotephotoparam:lib.getFN(json.sailLetterPhoto),
      locationparam:json.fishingLocation,
      saildateparam:json.sailDate,
      priceperkgparam:0,
      totalpriceparam:0,
      loanexpenseparam:0,
      otherexpenseparam:0,
      postdateparam:json.createdAt
    }

    // todo for supplier

    const task = createTask('create','catch','addcatch',param);
    dispatch({
      type: ADD_TASK,
      task: task
    });


    return syncToServer(dispatch,getState);
  }
}

export function addCustomItem(item) {
  return (dispatch,getState) => {
    const state = getState();
    const rows = state.Data.customitems.slice();
    rows.unshift(item);
    dispatch({
      type: SET_CUSTOMITEMS,
      rows: rows
    });

    return Promise.resolve();
  }
}

export function clearCustomItem() {
  return (dispatch,getState) => {
    dispatch({
      type: SET_CUSTOMITEMS,
      rows: []
    });

    return Promise.resolve();
  }
}


export function removeCustomItem(index) {
  return (dispatch,getState) => {
    const state = getState();
    const rows = state.Data.customitems.slice();
    rows.splice(index, 1);
    dispatch({
      type: SET_CUSTOMITEMS,
      rows: rows
    });

    return Promise.resolve();
  }
}


export function getCatchFishes() {
  return (dispatch,getState) => {

    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;
    const url = TRAFIZ_URL+'/_api/catch/getv6bysup?id='+idmssupplier;

    return axios.get(url)
      .then(result=>{
        if(result.status === 200) {
          console.warn('get catches done!');
          const data = result.data;          
          dispatch({
            type: SET_CATCHES,
            rows: data
          });
        } else {
          throw 'Connection error';
        }
      });
  }
}

function getOneDeliverySheet(deliverysheetofflineid) {
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

export function getDeliveries() {
  return (dispatch,getState) => {

    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;
    const url = TRAFIZ_URL+'/_api/delivery/getsheetv6?id='+idmssupplier;

    const odbId = 'ODB-'+idmssupplier;
    const odbUrl = TRAFIZ_URL+'/_api/delivery/getsheet?id='+odbId;

    return axios.get(odbUrl)
      .then(result=>{
        if(result.status === 200) {
          const rows = result.data;
          if(rows && rows.length > 0) {
            const savedtext = rows[0].savedtext;
            const json = JSON.parse(savedtext);
            const batchDeliveries = json.batchDeliveries;
            _.remove(batchDeliveries,{hidden:true});
            const fishIdToDelivery = json.fishIdToDelivery;
            setOpenBatchDeliveriesFromServer(odbId,batchDeliveries,fishIdToDelivery)(dispatch,getState);
            console.warn('num batchdeliveries:',batchDeliveries.length);

            // const json = JSON.parse(rows[0].savedtext);
            // consolw.warn('retrieve batch deliveries from server');
            // console.warn(json);
            // const batchDeliveries = json.batchDeliveries;
            // setOpenBatchDeliveriesFromServer(odbId,batchDeliveries)(dispatch,getState);            
          }
        }
        return axios.get(url);
      })
      .then(result=>{
        if(result.status === 200) {
          const rows = result.data;
      
          for(let i=0;i<rows.length;i++) {
            const row = rows[i];
            const json = JSON.parse(row.savedtext);
            console.warn('get delivery sheet '+(i+1)+'/'+rows.length);
            if(json.batchId) {
              const batchId = json.batchId;
              const deliverySheet = json;
              setDeliverySheet(batchId,deliverySheet)(dispatch,getState);
            }
          }
          
          return lib.delay(10);
        } else {
          throw 'Connection error';
        }
      });
  }
}

export function getDeliveriesV1() {
  return (dispatch,getState) => {

    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;
    const url = TRAFIZ_URL+'/_api/delivery/getbysup?id='+idmssupplier;

    return axios.get(url)
      .then(result=>{
        if(result.status === 200) {
          const rows = result.data;
          const ids = [];
          for(let i=0;i<rows.length;i++) {
            const deliverysheetofflineid = rows[i].deliverysheetofflineid;
            if(ids.indexOf(deliverysheetofflineid) == -1) ids.push(deliverysheetofflineid);
          }

          let p = lib.delay(1000);
      
          for(let i=0;i<ids.length;i++) {
            const id = ids[i];
            p = p.then(result=>{
              return getOneDeliverySheet(id);
            })
            .then(result=>{
              console.warn('get delivery sheet '+(i+1)+'/'+ids.length);
              if(result.batchId) {
                const batchId = result.batchId;
                const deliverySheet = result;
                setDeliverySheet(batchId,deliverySheet)(dispatch,getState);  
              }
              return lib.delay(100);
            });
          }
        
          return p;
        } else {
          throw 'Connection error';
        }
      });
  }
}

export function synchronizeNow() {
  return (dispatch,getState) => {
    return syncToServer(dispatch,getState);
  }
}

export function addFishToCatchList(json,offlineJson) {
  return (dispatch,getState) => {

    const task = createTask('create','fishcatch','addfishcatchv4',json);
    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const state = getState();
      const rows = state.Data.catches.slice();
      const index = _.findIndex(rows,{idtrcatchoffline:offlineJson.idtrcatchoffline});
      if(index > -1) {
        const temp = Object.assign({},rows[index]);
        if(!temp.fish) temp.fish = [];
        temp.fish.push(offlineJson);
        rows[index] = temp;
        dispatch({
          type: SET_CATCHES,
          rows: rows
        });  
      }
    }

    return Promise.resolve();
    // return syncToServer(dispatch,getState);
  }
}

export function popFishFromCatchList(json,offlineJson) {
  return (dispatch,getState) => {
    const task = createTask('delete','catch','deletefishcatch',json);
    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const state = getState();
      const rows = state.Data.catches.slice();
      const index = _.findIndex(rows,{idtrcatchoffline:offlineJson.idtrcatchoffline});
      if(index > -1) {
        const temp = Object.assign({},rows[index]);
        let fish = temp.fish;
        if(!fish) fish = [];
        _.remove(fish,{idtrfishcatchoffline:offlineJson.idtrfishcatchoffline});
        rows[index].fish = fish;
        dispatch({
          type: SET_CATCHES,
          rows: rows
        });  
      }  
    }

    return Promise.resolve();
    // return syncToServer(dispatch,getState);
  }
}

// export function updateBuyPriceCatchList(id,buyPrice) {
//   return (dispatch,getState) => {
//     const state = getState();
//     const idmsuser = state.Login.idmsuser;
//     const idmssupplier = state.Login.idmssupplier;

//     const catches = state.Data.catches.slice();

//     const index = _.findIndex(catches,{id:id});

//     /*
//       perKiloPrice:this.state.perKiloPrice,
//       buyPrice:this.state.buyPrice,
//       otherExpense:this.state.otherExpense,
//       loanExpense:this.state.loanExpense,
//       netBuyPrice:netBuyPrice
//     */

//     catches[index].priceperkg = buyPrice.perKiloPrice;
//     catches[index].totalprice = buyPrice.buyPrice;
//     catches[index].loanexpense = buyPrice.loanExpense;
//     catches[index].otherexpense = buyPrice.otherExpense;
//     catches[index].netBuyPrice = buyPrice.netBuyPrice;

//     dispatch({
//       type: SET_CATCHES,
//       rows: catches
//     });

//     // synch task can not do
//     // not all parameter available
//     const rawJson = catches[index].rawJson;
//     let json = {};
//     if(rawJson) json = JSON.parse(rawJson);
//     console.warn(json);
//     /*
//       idtrcatchparam:'4b93966b7b5211e89d55000d3aa384f1',
//       idtrcatchpostparam:'1234567890',
//       idmssupplierparam:idmssupplier,
//       idmsfishermanparam:'2a9561d0794211e89d55000d3aa384f1', //Coba
//       idmsbuyersupplierparam:null,
//       idmsshipparam:'01ad492c687a11e89d55000d3aa384f1',
//       idmsfishparam:'5529a2a2747f11e89d55000d3aa384f1',
//       varianceparam:'Ikan Laut',
//       dispatchnotephotoparam:'',
//       locationparam:'Laut Sunda',
//       saildateparam:'2018-06-20',
//       priceperkgparam:321,
//       totalpriceparam:100000,
//       loanexpenseparam:500,
//       otherexpenseparam:123000,
//       postdateparam:'2018-06-29'
//     */

//     const param = {
//       idtrcatchparam:json.idtrcatch,
//       idtrcatchpostparam:json.idtrcatchpost,
//       idmssupplierparam:idmssupplier,
//       idmsfishermanparam:json.idmsfisherman,
//       idmsbuyersupplierparam:null,
//       idmsshipparam:json.idmsship,
//       idmsfishparam:json.idmsfish,
//       varianceparam:json.variance,
//       dispatchnotephotoparam:json.dispatchnotephoto,
//       locationparam:json.location,
//       saildateparam:json.saildate,
//       priceperkgparam:buyPrice.perKiloPrice,
//       totalpriceparam:buyPrice.buyPrice,
//       loanexpenseparam:buyPrice.loanExpense,
//       otherexpenseparam:buyPrice.otherExpense,
//       postdateparam:moment().format('YYYY-MM-DD')
//     };

//     const task = createTask('update','catch','updatecatch',param);
//     dispatch({
//       type: ADD_TASK,
//       task: task
//     });

//     return syncToServer(dispatch,getState);
//   }
// }

export function editFishInCatchList(json,offlineJson) {
  return (dispatch,getState) => {

    const task = createTask('update','fishcatch','updatefishcatchv3',json);
    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const state = getState();
      const rows = state.Data.catches.slice();
      const index = _.findIndex(rows,{idtrcatchoffline:offlineJson.idtrcatchoffline});
      if(index > -1) {
        const temp = Object.assign({},rows[index]);
        let fish = temp.fish;
        if(!fish) fish = [];
        const index2 = _.findIndex(fish,{idtrfishcatchoffline:offlineJson.idtrfishcatchoffline});
        const newFish = Object.assign({},fish[index2],offlineJson);
        fish[index2] = newFish;
        rows[index].fish = fish;
        dispatch({
          type: SET_CATCHES,
          rows: rows
        });  
      }  
    }

    return syncToServer(dispatch,getState);

  }
}

export function editCatchList(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();

    const task = createTask('update','catch','updatecatchv5',json);
    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson && state.Login.offline) {
      const rows = state.Data.catches.slice();
      const index = _.findIndex(rows,{idtrcatchoffline:offlineJson.idtrcatchoffline});
      if(index > -1) {
        const temp = Object.assign({},rows[index]);
        rows[index] = Object.assign({},temp,offlineJson);
        dispatch({
          type: SET_CATCHES,
          rows: rows
        });  
      }
    }

    return syncToServer(dispatch,getState);
  }
}

export function removeCatchList(idtrcatchoffline) {
  return (dispatch,getState) => {
    const state = getState();
    const json = {
      idtrcatchofflineparam:idtrcatchoffline
    }
    const task = createTask('delete','catch','deletecatchv3',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    const rows = state.Data.catches.slice();
    const index = _.findIndex(rows,{idtrcatchoffline:idtrcatchoffline});
    if(index > -1) {
      rows[index].lasttransact = 'D';
      dispatch({
        type: SET_CATCHES,
        rows: rows
      });  
    }

    return syncToServer(dispatch,getState);
  }
}

export function editCatchListHaveNotes(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();

    const task = createTask('update','catch','updatecatchv4',json);
    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const rows = state.Data.catches.slice();
      const index = _.findIndex(rows,{idtrcatchoffline:offlineJson.idtrcatchoffline});
      if(index > -1) {
        const temp = Object.assign({},rows[index]);
        rows[index] = Object.assign({},temp,offlineJson);
        dispatch({
          type: SET_CATCHES,
          rows: rows
        });  
      }
    }

    return syncToServer(dispatch,getState);
  }
}


export function setFishCatchBuyerName(fishCatchBuyerNames) {
  return {
    type: SET_FISHCATCHBUYERNAME,
    fishCatchBuyerNames:fishCatchBuyerNames
  };
}

export function addReadyToDeliver(add) {
  return (dispatch,getState) => {
    const state = getState();
    const readyToDeliver = state.Data.readyToDeliver.slice();
    const index = _.findIndex(readyToDeliver,{fishCatchId:add.fishCatchId});
    if(index == -1) {
      readyToDeliver.push(add);
    } else {
      readyToDeliver[index] = add;
    }

    dispatch({
      type: SET_READY_TO_DELIVER,
      readyToDeliver: readyToDeliver
    });
  }
}

export function cancelReadyToDeliver(fishCatchId) {
  return (dispatch,getState) => {
    const state = getState();
    let readyToDeliver = state.Data.readyToDeliver.slice();
    _.remove(readyToDeliver,{fishCatchId:fishCatchId});

    const fishCatchBuyerNames = Object.assign({},state.Data.fishCatchBuyerNames);
    delete fishCatchBuyerNames[fishCatchId];

    dispatch({
      type: SET_DELIVERY_PARAMS,
      readyToDeliver: readyToDeliver,
      fishCatchBuyerNames: fishCatchBuyerNames
    });
  }  
}

export function setBatchDeliveryData(batchDeliveryData) {
  return {
    type: SET_BATCH_DELIVERY_DATA,
    batchDeliveryData: batchDeliveryData
  };
}

export function setPreDeliverySheets(preDeliverySheets) {
  return {
    type: SET_PREDELIVERY_SHEETS,
    preDeliverySheets: preDeliverySheets
  };
}

export function setDeliverySheets(deliverySheets) {
  return {
    type: SET_DELIVERY_SHEETS,
    deliverySheets: deliverySheets
  };
}

export function setLastMapState(mapState) {
  return {
    type: SET_LASTMAPSTATE,
    mapState: mapState
  };
}

export function synchDeliverySheet(id,text) {
  return (dispatch,getState) => {
    const state = getState();

    const task = createTask('create','deliverysheet','createdeliverysheet',{
      deliverysheetofflineidparam:id,
      savedtextparam:text
    });

    dispatch({
      type: ADD_TASK,
      task: task
    });

    return syncToServer(dispatch,getState);
  }
}

export function createDeliverySheetV2(id,text) {
  return (dispatch,getState) => {
    const state = getState();
    const idmssupplierparam = state.Login.idmssupplier;

    const task = createTask('create','deliverysheet','createdeliverysheetv2',{
      deliverysheetofflineidparam:id,
      savedtextparam:text,
      idmssupplierparam
    });

    dispatch({
      type: ADD_TASK,
      task: task
    });

    return syncToServer(dispatch,getState);
  }
}

export function updateDeliverySheet(id,text) {
  return (dispatch,getState) => {
    const state = getState();

    const task = createTask('update','deliverysheet','updatedeliverysheet',{
      deliverysheetofflineidparam:id,
      savedtextparam:text
    });

    dispatch({
      type: ADD_TASK,
      task: task
    });

    const ds = JSON.parse(text);
    const batchId = ds.batchId;
    setDeliverySheet(batchId,ds)(dispatch,getState);

    return syncToServer(dispatch,getState);
  }
}

export function updateDeliverySheetV2(id,text) {
  return (dispatch,getState) => {
    const state = getState();
    const idmssupplierparam = state.Login.idmssupplier;

    const task = createTask('update','deliverysheet','updatedeliverysheetv2',{
      deliverysheetofflineidparam:id,
      savedtextparam:text,
      idmssupplierparam
    });

    dispatch({
      type: ADD_TASK,
      task: task
    });

    const ds = JSON.parse(text);
    const batchId = ds.batchId;
    setDeliverySheet(batchId,ds)(dispatch,getState);

    return syncToServer(dispatch,getState);
  }
}

export function synchBatchDelivery(jsons) {
  return (dispatch,getState) => {
    const state = getState();

    for(let i=0;i<jsons.length;i++) {
      const json = jsons[i];
      const task = createTask('create','delivery','addnewdeliveryv2',json);
      dispatch({
        type: ADD_TASK,
        task: task
      });
    }

    return syncToServer(dispatch,getState);
  }
}

export function setDeliverySheet(batchId,deliverySheet) {
  return (dispatch,getState) => {
    const state = getState();

    const deliverySheets = Object.assign({},state.Data.deliverySheets);
    deliverySheets[batchId] = deliverySheet;

    if(deliverySheet.fishCatchData && deliverySheet.viewData) {
      const fishIdToDelivery = Object.assign({},state.Data.fishIdToDelivery);
      const buyerName = deliverySheet.viewData.buyerName;
      for(let i=0;i<deliverySheet.fishCatchData.length;i++) {
        const id = deliverySheet.fishCatchData[i].idfish;
        fishIdToDelivery[id] = {nameBuyer:buyerName, close:true, id:deliverySheet.batchId};
      }

      dispatch({
        type: SET_FISH_ID_TO_DELIVERY,
        fishIdToDelivery
      });  

      dispatch({
        type: SET_DELIVERY_SHEETS,
        deliverySheets: deliverySheets
      });
    }

    // const fishCatchBuyerNames = Object.assign({},state.Data.fishCatchBuyerNames);
    // const fishes = deliverySheet.fishCatchIds;
    // const buyerName = deliverySheet.viewData.buyerName;

    // for(let i=0;i<fishes.length;i++) {
    //   const id = fishes[i];
    //   fishCatchBuyerNames[id] = {name:buyerName,close:true};
    // }

    // dispatch({
    //   type: SET_FISHCATCHBUYERNAME,
    //   fishCatchBuyerNames:fishCatchBuyerNames
    // });
  }
}

export function addBatchDeliveries(add) {
  return (dispatch,getState) => {
    const state = getState();
    const batchDeliveries = state.Data.batchDeliveries.slice();
    batchDeliveries.push(add);

    dispatch({
      type: SET_BATCH_DELIVERIES,
      batchDeliveries
    });
  }
}

export function removeBatchDeliveries(deliverysheetofflineid) {
  return (dispatch,getState) => {
    const state = getState();
    let batchDeliveries = state.Data.batchDeliveries.slice();
    _.remove(batchDeliveries,{deliverysheetofflineid:deliverysheetofflineid});

    dispatch({
      type: SET_BATCH_DELIVERIES,
      batchDeliveries
    });
  }
}


export function setBatchDeliveries(batchDeliveries) {
  return {
    type: SET_BATCH_DELIVERIES,
    batchDeliveries
  };
}

export function setFishIdToDelivery(fishIdToDelivery) {
  return {
    type: SET_FISH_ID_TO_DELIVERY,
    fishIdToDelivery
  };
}

export function closeBatchDelivery(batchId,deliverySheet) {
  return (dispatch,getState) => {
    const state = getState();

    const deliverySheets = Object.assign({},state.Data.deliverySheets);
    deliverySheets[batchId] = deliverySheet;

    dispatch({
      type: SET_DELIVERY_SHEETS,
      deliverySheets: deliverySheets
    });

    // todo: fishId close
    // todo: remove from batchDeliveries
    // todo: on get

    const fishIdToDelivery = Object.assign({},state.Data.fishIdToDelivery);
    for(let i=0;i<deliverySheet.fishCatchData.length;i++) {
      const id = deliverySheet.fishCatchData[i].idfish;
      fishIdToDelivery[id].close = true;
    }

    dispatch({
      type: SET_FISH_ID_TO_DELIVERY,
      fishIdToDelivery
    });

    const batchDeliveries = state.Data.batchDeliveries.slice();
    const index = _.findIndex(batchDeliveries,{deliverysheetofflineid:batchId});
    batchDeliveries[index].hidden = true;

    dispatch({
      type: SET_BATCH_DELIVERIES,
      batchDeliveries
    });
  }
}

export function setOpenBatchDeliveriesFromServer(openBatchDeliveryOfflineId,batchDeliveries,fishIdToDelivery) {
  return (dispatch,getState) => {
    const state = getState();

    dispatch({
      type:SET_OPEN_BATCH_DELIVERY_OFFLINE_ID,
      openBatchDeliveryOfflineId:openBatchDeliveryOfflineId
    });

    dispatch({
      type: SET_BATCH_DELIVERIES,
      batchDeliveries
    });

    dispatch({
      type: SET_FISH_ID_TO_DELIVERY,
      fishIdToDelivery
    });
  }
}

export function upsertBatchDeliveries() {
  return (dispatch,getState) => {
    const state = getState();
    let openBatchDeliveryOfflineId = state.Data.openBatchDeliveryOfflineId;
    let create = true;
    const login = state.Login;
    let id = 'ODB-'+login.idmssupplier;

    if( state.Data.openBatchDeliveryOfflineId && state.Data.openBatchDeliveryOfflineId.length > 0) {
      create = false;
      id = state.Data.openBatchDeliveryOfflineId;
    }

    const json = {
      openBatchDeliveryOfflineId:id,
      fishIdToDelivery:Object.assign({},state.Data.fishIdToDelivery),
      batchDeliveries:state.Data.batchDeliveries.slice()
    }

    const text = JSON.stringify(json);
    console.warn(text);
    console.warn('create:',create);
    console.warn('id:',id);
    
    let task;
    if(create) {
      task = createTask('create','deliverysheet','createdeliverysheet',{
        deliverysheetofflineidparam:id,
        savedtextparam:text
      });  
    } else {
      task = createTask('update','deliverysheet','updatedeliverysheet',{
        deliverysheetofflineidparam:id,
        savedtextparam:text
      });  
    }

    dispatch({
      type: ADD_TASK,
      task: task
    });

    return syncToServer(dispatch,getState);
  }
}

export function editProfile(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('update','profile','editSupplier2',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    return syncToServer(dispatch,getState);
  }
}

export function getProfile() {
  return (dispatch,getState) => {
    const login = getState().Login;
    const idmsuser = login.idmsuser;

    return new Promise((resolve,reject)=>{
      axios.get(TRAFIZ_URL+'/_api/user/getdata?id='+idmsuser)
      .then(result=>{
        if(result.status === 200) {
          console.warn('get profile done!');
          const profile = result.data[0];
          console.warn(profile);
          dispatch({
            type: LOGIN_SET_PROFILE,
            profile:profile
          });  
        } else {
          throw 'Connection error';
        }
        resolve();
      })
      .catch(err=>{
        console.warn('get profile error:');
        console.warn(err);
        resolve();
      });
    });
  }
}

export function addLoanType(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('create','loantype','addnewtypeitemloan',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const rows = state.Data.loantype.slice();
      rows.push(offlineJson);
      dispatch({
        type: SET_LOANTYPE,
        rows: rows
      });  
    }
    
    return syncToServer(dispatch,getState);
  }
}

export function saveOldLoanType(json) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('create','loantype','addnewtypeitemloan',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });
  }
}

export function editLoanType(json,offlineJson) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('update','loantype','updatetypeitemloan',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    if(offlineJson) {
      const rows = state.Data.loantype.slice();
      const index = _.findIndex(rows,{idtypeitemloanoffline:offlineJson.idtypeitemloanoffline});
      if(index > -1) {
        rows[index] = offlineJson;
        dispatch({
          type: SET_LOANTYPE,
          rows: rows
        });  
      }
    }

    return syncToServer(dispatch,getState);
  }
}

export function removeLoanType(json) {
  return (dispatch,getState) => {
    const state = getState();
    const task = createTask('delete','loantype','deletetypeitemloan',json);

    dispatch({
      type: ADD_TASK,
      task: task
    });

    const rows = state.Data.loantype.slice();
    const index = _.findIndex(rows,{idmstypeitemloanoffline:json.idmstypeitemloanofflineparam});
    rows[index].lasttransact = 'D';
    dispatch({
      type: SET_LOANTYPE,
      rows: rows
    });

    return syncToServer(dispatch,getState);
  }
}

export function getLoanType() {
  return (dispatch,getState) => {
    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;

    return new Promise((resolve,reject)=>{
      const url = TRAFIZ_URL+'/_api/itemloan/getdata?id='+idmssupplier;
      axios.get(url)
      .then(result=>{
        if(result.status === 200) {
          dispatch({
            type: SET_LOANTYPE,
            rows: result.data
          });  
        } else {
          throw 'Connection error';
        }
        resolve();
      })
      .catch(err=>{
        resolve();
      });
    });
  }
}

export function upsertExtraData() {
  return (dispatch,getState) => {
    const state = getState();
    let create = true;
    const login = state.Login;
    let id = 'EXD-'+login.idmssupplier;

    let extraDataOfflineId = state.Data.extraDataOfflineId;
    let extraData = state.Data.extraData;
    if( extraDataOfflineId && extraDataOfflineId.length > 0) {
      create = false;
      id = extraDataOfflineId;
    }

    const json = {
      extraDataOfflineId:id,
      extraData:extraData,
    }

    const text = JSON.stringify(json);
    console.warn(text);
    console.warn('create:',create);
    console.warn('id:',id);
    
    let task;
    if(create) {
      task = createTask('create','extradata','createdeliverysheet',{
        deliverysheetofflineidparam:id,
        savedtextparam:text
      });  
    } else {
      task = createTask('update','extradata','updatedeliverysheet',{
        deliverysheetofflineidparam:id,
        savedtextparam:text
      });  
    }

    dispatch({
      type: ADD_TASK,
      task: task
    });

    return syncToServer(dispatch,getState);
  }
}

export function getExtraData() {
  return (dispatch,getState) => {

    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;
    const exdId = 'EXD-'+idmssupplier;
    const exdUrl = TRAFIZ_URL+'/_api/delivery/getsheet?id='+exdId;

    return axios.get(exdUrl)
      .then(result=>{
        if(result.status === 200) {
          const rows = result.data;
          console.warn('getExtraData:',rows);
          if(rows && rows.length > 0) {
            const savedtext = rows[0].savedtext;
            const json = JSON.parse(savedtext);
            const extraData = json.extraData;
            const extraDataOfflineId = json.extraDataOfflineId;

            dispatch({
              type: SET_EXTRADATA,
              extraDataOfflineId,
              extraData
            });
          }
        } else {
          console.warn('no extraData..');
        }
        
      });
  }
}

export function setCatchExtraData(offlineId,data) {
  return (dispatch,getState) => {

    const state = getState();
    const newExtraData = Object.assign({},state.Data.extraData);
    if(!newExtraData.catch) newExtraData.catch = {};
    newExtraData.catch[offlineId] = data;

    dispatch({
      type: SET_EXTRADATA_ONLY,
      extraData: newExtraData
    });

    return Promise.resolve();
  }
}

export function getCatchFishesByMonth(month, year) {
  return (dispatch,getState) => {

    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;
    const url = TRAFIZ_URL+'/_api/catch/getbymonthyear?id='+idmssupplier+'&m='+month+'&y='+year;
    console.warn(url);
    const key = ''+year+month;

    return axios.get(url)
      .then(result=>{
        if(result.status === 200) {
          const data = result.data; 
          console.warn(data);        
          dispatch({
            type: SET_EXTRA_CATCHES,
            key: key,
            rows: data
          });
        } else {
          throw 'Connection error';
        }
      });
  }
}

export function flagCatchDownloaded(dateStr) {
  return (dispatch,getState) => {

    dispatch({
      type: FLAG_CATCH_DOWNLOADED,
      dateStr: dateStr
    });

    return Promise.resolve();
  }
}

export function getDeliveriesByMonthYear(month,year) {
  return (dispatch,getState) => {

    const state = getState();
    if(state.Login.offline) return Promise.resolve();

    const idmsuser = state.Login.idmsuser;
    const idmssupplier = state.Login.idmssupplier;
    const url = TRAFIZ_URL+'/_api/delivery/getsheetbymonthyear?id='+idmssupplier+'&m='+month+'&y='+year;
    console.warn(url);
    return axios.get(url)
      .then(result=>{
        if(result.status === 200) {
          const rows = result.data;
      
          for(let i=0;i<rows.length;i++) {
            const row = rows[i];
            const json = JSON.parse(row.savedtext);
            console.warn('get delivery sheet '+(i+1)+'/'+rows.length);
            if(json.batchId) {
              const batchId = json.batchId;
              const deliverySheet = json;
              setDeliverySheet(batchId,deliverySheet)(dispatch,getState);
            }
          }
          
          return lib.delay(1);
        } else {
          throw 'Connection error';
        }
      });
  }
}
