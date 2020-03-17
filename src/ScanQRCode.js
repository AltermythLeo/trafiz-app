import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator } from './Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions/AppActions';
import QRCode from 'react-native-qrcode';
import SendSMS from 'react-native-sms';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import QRCodeScanner from 'react-native-qrcode-scanner';
import axios from 'axios';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('./lib');
const L = require('./dictionary').translate;
const TRAFIZ_URL = lib.TRAFIZ_URL;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      show:'busy',
      rows:[]
    }
  }

  componentDidMount() {
    this.setState({
      show:'scan'
    });
  }

  processScan(result) {
    const data = result.data;
    const arr = data.split(';');
    const id = arr[0];
    if(id && id.length > 0 && id.toUpperCase().indexOf('DS') > -1) {
      this.setState({
        show:'busy'
      });
      console.warn(id);  
      this.retrieveDeliverySheet(id);
    } else {
      this.setState({
        show:'error',
        errMsg:'CAN NOT SCAN QR CODE'
      });
    }

  }

  ensureSenderExist(sender) {
    return new Promise((resolve,reject)=>{
      const supplierPhone = sender.supplierPhone;
      let rows = this.props.stateData.suppliers.slice();
      const index = _.findIndex(rows,{phonenumber_param:supplierPhone});
      if(index > -1) {
        const idbuyeroffline = rows[index].idbuyeroffline;
        console.warn('supplier already exist');
        return resolve(idbuyeroffline);
      }

      const login = this.props.stateLogin;
      const idbuyeroffline = lib.getOfflineId('supplier',login.idmsuser);
  
      const json = {
        idbuyeroffline:idbuyeroffline,
        name_param:sender.supplierName,
        id_param:'',
        sex_param:'1',
        companynameparam:'',
        businesslicense_param:'',
        businesslicenseexpireddate:'',
        nationalcode_param:'',
        contact_param:'',
        phonenumber_param:sender.supplierPhone,
        address_param:'',
        country_param:'',
        province_param:'',
        city_param:'',
        district_param:'',
        completestreetaddress_param:'',
        idltusertype:'1',
        idmssupplier:login.idmssupplier
      }

      const offlineJson = {
        idbuyeroffline:json['idbuyeroffline'],
        idmssupplier:json['idmssupplier'],
        name_param:json['name_param'],
        id_param:json['id_param'],
        businesslicense_param:json['businesslicense_param'],
        contact_param:json['contact_param'],
        phonenumber_param:json['phonenumber_param'],
        address_param:json['address_param'],
        idltusertype:'1',
        sex_param:json['sex_param'],
        nationalcode_param:json['nationalcode_param'],
        country_param:json['country_param'],
        province_param:json['province_param'],
        city_param:json['city_param'],
        district_param:json['district_param'],
        completestreetaddress_param:json['completestreetaddress_param'],
        usertypename:"Supplier",
        businesslicenseexpireddate:json['businesslicenseexpireddate']
      }
  
      this.props.actions.addSupplier(json,offlineJson)
      .then(()=>{
        return this.props.actions.removeSupplier({idbuyerofflineparam:json['idbuyeroffline']});
      })
      .then(()=>{
        return this.props.actions.getSuppliers();
      })
      .then(()=>{
        resolve(idbuyeroffline);
      });

    })
  }

  ensureShipExist(shipRefs) {
    const toCreate = [];
    let ships = this.props.stateData.ships.slice();

    for (let key in shipRefs) {
      if (shipRefs.hasOwnProperty(key)) {
        const obj = shipRefs[key];

        const index = _.findIndex(ships,{
          vesselname_param:obj.vesselname_param,
          vesselsize_param:obj.vesselsize_param,
          vessellicensenumber_param:obj.vessellicensenumber_param,
          vessellicenseexpiredate_param:obj.vessellicenseexpiredate_param,
          vesselflag_param:obj.vesselflag_param,
          vesselgeartype_param:obj.vesselgeartype_param,  
        })

        if(index == -1) {
          toCreate.push(obj);
        } else {
          console.warn(obj.vesselname_param+' exist!');
        }
      }
    }

    let p = Promise.resolve();
    const login = this.props.stateLogin;

    if(toCreate.length > 0) {
      for(let i=0;i<toCreate.length;i++) {
        p = p.then(()=>{
          const ship = toCreate[i];

          const json = {};
          json.idshipoffline = lib.getOfflineId('ship',login.idmsuser);
          json.idmsuserparam = login.idmsuser;
          json.vesselid_param = ship.vessel_id ? ship.vessel_id : null;

          const keys = [
            'vesselname_param',
            'vessellicensenumber_param',
            'vessellicenseexpiredate_param',
            'fishinglicensenumber_param',
            'fishinglicenseexpiredate_param',
            'vesselsize_param',
            'vesselflag_param',
            'vesselgeartype_param',
            'vesseldatemade_param',
            'vesselownername_param',
            'vesselownerid_param',
            'vesselownerphone_param',
            'vesselownersex_param',
            'vesselownerdob_param',
            'vesselowneraddress_param',
            'vesselownercountry_param',
            'vesselownerprovince_param',
            'vesselownercity_param',
            'vesselownerdistrict_param'
          ];

          for(let i=0;i<keys.length;i++) {
            const key = keys[i];
            const val = ship[key] ? ship[key] : null;
            json[key] = val;
          }

          const offlineJson = {
            idshipoffline:json["idshipoffline"],
            vesselname_param:json["vesselname_param"],
            vessellicensenumber_param:json["vessellicensenumber_param"],
            vessellicenseexpiredate_param:json["vessellicenseexpiredate_param"],
            fishinglicensenumber_param:json["fishinglicensenumber_param"],
            fishinglicenseexpiredate_param:json["fishinglicenseexpiredate_param"],
            vesselsize_param:json["vesselsize_param"],
            vesselflag_param:json["vesselflag_param"],
            vesselgeartype_param:json["vesselgeartype_param"],
            vesseldatemade_param:json["vesseldatemade_param"],
            vesselownername_param:json["vesselownername_param"],
            vesselownerid_param:json["vesselownerid_param"],
            vesselownerphone_param:json["vesselownerphone_param"],
            vesselownersex_param:json["vesselownersex_param"],
            vesselownerdob_param:json["vesselownerdob_param"],
            vesselowneraddress_param:json["vesselowneraddress_param"],
            vesselownercountry_param:json['vesselownercountry_param'],
            vesselownerprovince_param:json['vesselownerprovince_param'],
            vesselownercity_param:json['vesselownercity_param'],
            vesselownerdistrict_param:json['vesselownerdistrict_param'],
            vessel_id:json['vesselid_param'],
          }
          
          return this.props.actions.addShip(json,offlineJson)
            .then(()=>{
              return this.props.actions.removeShip({idshipofflineparam:json.idshipoffline})
            });
        });  
      }

      p = p.then(()=>{
        return this.props.actions.getShips();
      });
    } else {
      console.warn('all ships exist');
    }

    return p.then(()=>{
      const ret = {};
      let ships = this.props.stateData.ships.slice();
      for (let key in shipRefs) {
        if (shipRefs.hasOwnProperty(key)) {
          const obj = shipRefs[key];
  
          const index = _.findIndex(ships,{
            vesselname_param:obj.vesselname_param,
            vesselsize_param:obj.vesselsize_param,
            vessellicensenumber_param:obj.vessellicensenumber_param,
            vessellicenseexpiredate_param:obj.vessellicenseexpiredate_param,
            vesselflag_param:obj.vesselflag_param,
            vesselgeartype_param:obj.vesselgeartype_param,  
          })
          
          const goodId = ships[index].idshipoffline;
          ret[key] = goodId;
        }
      }
      

      return ret;
    })
  }

  ensureFishExist(fishRefs) {
    const toCreate = [];
    let fishes = this.props.stateData.fishes.slice();

    for (let key in fishRefs) {
      if (fishRefs.hasOwnProperty(key)) {
        const obj = fishRefs[key];
        const index = _.findIndex(fishes,{
          threea_code:obj.threea_code
        })

        if(index == -1) {
          toCreate.push(obj);
        } else {
          console.warn(obj.threea_code+' exist');

        }
      }
    }

    let p = Promise.resolve();
    const login = this.props.stateLogin;

    if(toCreate.length > 0) {
      for(let i=0;i<toCreate.length;i++) {
        p = p.then(()=>{
          const fish = toCreate[i];
    
          const json = {
            idfishofflineparam:lib.getOfflineId('fish',login.idmsuser),
            idmssupplierparam:login.idmssupplier,
            indnameparam:fish.indname,
            english_nameparam:fish.english_name,
            idltfishparam:fish.idltfish,
            threeacode:fish.threea_code,
            photoparam:fish.photo,
            localnameparam:fish.localname,
            priceparam:fish.price
          }
  
          const offlineJson = {
            idfishoffline:json['idfishofflineparam'],
            indname:json['indnameparam'],
            localname:json['localnameparam'],
            idltfish:json['idltfishparam'],
            threea_code:json['threeacode'],
            scientific_name:'',
            indonesian_name:json['indnameparam'],
            english_name:json['english_nameparam'],
            french_name:'',
            spanish_name:'',
            photo:'',
            price:json['priceparam']
          }
                
          return this.props.actions.addFish(json,offlineJson)
            .then(()=>{
              return this.props.actions.removeFish({idfishofflineparam:json['idfishofflineparam']});
            });
        });  
      }

      p = p.then(()=>{
        return this.props.actions.getFishes();
      });
    } else {
      console.warn('all fish exist');
    }

    return p.then(()=>{
      const ret = {};
      let fishes = this.props.stateData.fishes.slice();
      for (let key in fishRefs) {
        if (fishRefs.hasOwnProperty(key)) {
          const obj = fishRefs[key];
  
          const index = _.findIndex(fishes,{
            threea_code:obj.threea_code
          })
            
          const goodId = fishes[index].idfishoffline;
          ret[key] = goodId;
        }
      }
      
      return ret;
    })
  }

  createEmptyCatch(goodCatchRefs) {
    const login = this.props.stateLogin;
    const uid = login.id;
    const ret = {};
    let p = Promise.resolve();
    
    for (let key in goodCatchRefs) {
      if (goodCatchRefs.hasOwnProperty(key)) {
        const obj = goodCatchRefs[key];

        const catchId = lib.getShortOfflineId('catch',uid.toString(36));
        ret[key] = catchId;

        p = p.then(()=>{
          const json = {
            idtrcatchofflineparam:catchId, //generated 
            idmssupplierparam:login.idmssupplier,
            idfishermanofflineparam:null,
            idbuyerofflineparam:obj.idbuyeroffline,
            purchaseuniquenoparam:catchId, // generated
            idshipofflineparam:obj.idshipoffline,
            idfishofflineparam:obj.idfishoffline,
            purchasedateparam:moment().format('YYYY-MM-DD'), // generated
            purchasetimeparam:'00:00:00',
            catchorfarmedparam:obj.catchorfarmed,
            bycatchparam:obj.bycatch,
            fadusedparam:obj.fadused,
            productformatlandingparam:obj.productformatlanding,
            unitmeasurementparam:obj.unitmeasurement,
            quantityparam:'0',
            weightparam:'0',
            fishinggroundareaparam:obj.fishinggroundarea,
            purchaselocationparam:obj.purchaselocation,
            uniquetripidparam:obj.uniquetripid,
            datetimevesseldepartureparam:obj.datetimevesseldeparture,
            datetimevesselreturnparam:obj.datetimevesselreturn,
            portnameparam:obj.portname,
            fishermannameparam:obj.fishermanname2,
            fishermanidparam:obj.fishermanid,
            fishermanregnumberparam:obj.fishermanregnumber,
            priceperkgparam:'',
            totalpriceparam:'',
            loanexpenseparam:'',
            otherexpenseparam:'',
            postdateparam:'',
            closeparam:'2',
          }

          return this.props.actions.addCatchList(json);
        });
      }
    }

    return p.then(()=>{
        return this.props.actions.getCatchFishes();
      })
      .then(()=>{
        return ret;
      });
  }

  checkExist(supplierName,idfish) {
    const catches = this.props.stateData.catches.slice();
    const check = _.filter(catches,{buyersuppliername:supplierName});
    for(let i=0;i<check.length;i++) {
      const fish = check[i].fish;
      const index = _.findIndex(fish,{upline:idfish});
      
      if(index > -1) return true;
    }

    return false;
  }

  processJson(json) {
    const login = this.props.stateLogin;
    const uid = login.id;

    const ds = json.deliverySheetData;
    const fd = json.fishCatchData;
    const sender = json.sender;
    const catchRefs = json.catchRefs;
    const shipRefs = json.shipRefs;
    const fishRefs = json.fishRefs;

    let senderId = null;
    let shipId2goodShipId = null;
    let fishId2goodFishId = null;
    let catchId2goodCatchId = null;
    let goodCatchRefs = {};

    const exist = this.checkExist(sender.supplierName,fd[0].idfish);

    if(exist) {
      return this.setState({
        show:'error',
        errMsg:'QR CODE ALREADY SCANNED'
      });
    }

    this.ensureSenderExist(sender)
    .then(result=>{
      senderId = result; // idbuyeroffline
      return this.ensureShipExist(shipRefs);
    })
    .then(result=>{
      shipId2goodShipId = result;
      return this.ensureFishExist(fishRefs)
    })
    .then(result=>{
      fishId2goodFishId = result;
      return this.props.actions.synchronizeNow();
    })
    .then(result=>{
      const suppliers = this.props.stateData.suppliers.slice();
      const ships = this.props.stateData.ships.slice();
      const fishes = this.props.stateData.fishes.slice();

      if( _.findIndex(suppliers,{idbuyeroffline:senderId}) == -1 ) {
        throw 'supplier not found!';
      }

      for (let key in catchRefs) {
        if (catchRefs.hasOwnProperty(key)) {
          const obj = catchRefs[key];

          const oldFishId = obj.idfishoffline;
          const oldShipId = obj.idshipoffline;

          const newFishId = fishId2goodFishId[oldFishId];
          const newShipId = shipId2goodShipId[oldShipId];

          if(!newFishId || !newShipId) {
            console.warn('error!');
            throw 'parsing error';
          }

          if( _.findIndex(ships,{idshipoffline:newShipId}) == -1 ) {
            throw 'ship not found!';
          }

          if( _.findIndex(fishes,{idfishoffline:newFishId}) == -1 ) {
            throw 'fish not found!';
          }

          obj.idfishoffline = newFishId;
          obj.idshipoffline = newShipId;
          obj.idbuyeroffline = senderId;
          goodCatchRefs[key] = obj;
        }
      }

      // console.warn('!');
      // console.warn(goodCatchRefs);
      return this.createEmptyCatch(goodCatchRefs);
    })
    .then(result=>{
      catchId2goodCatchId = result;
      let p2 = Promise.resolve();
      for(let i=0;i<fd.length;i++) {
        const fish = fd[i];
        const goodCatchId = catchId2goodCatchId[fish.idtrcatchoffline];

        if(!goodCatchId) throw 'parsing error';
        p2 = p2.then(()=>{
          const fishcatchId = lib.getShortOfflineId('fishcatch',uid.toString(36));
          const newIdFish = lib.getIdFish(uid.toString(36));

          const json = {
            idtrcatchofflineparam:goodCatchId,
            idtrfishcatchofflineparam:fishcatchId, // generated
            amountparam:fish.amount,
            gradeparam:fish.grade,
            descparam:'',
            idfishparam:newIdFish, // generated
            uplineparam:fish.idfish
          }
  
          return this.props.actions.addFishToCatchList(json);
        });
      }

      return p2;
      // return this.addFishCatch(fd,catchId2goodCatchId);
    })
    .then(()=>{
      return this.props.actions.synchronizeNow();
    })
    .then(()=>{
      return this.props.actions.getCatchFishes();
    })
    .then(()=>{
      return this.props.navigation.goBack();
    })
    .catch(err=>{
      console.warn(err);

      this.setState({
        show:'error',
        errMsg:'CAN NOT SCAN QR CODE'
      });
    })


  }

  retrieveDeliverySheet(id) {
    const url = TRAFIZ_URL+'/_api/delivery/getsheet?id='+id;
    axios.get(url)
    .then(result=>{
      if(result.status === 200) {
        const json = JSON.parse(result.data[0].savedtext);        
        this.processJson(json);
      } else throw 'connection error';
    })
    .catch(err=>{
      console.warn(err);
      this.setState({
        show:'error',
        errMsg:'CAN NOT SCAN QR CODE'
      });
    });
  }

  renderScanQRCode() {
    const dim = Dimensions.get('window');
    const w = Math.floor(dim.width * 0.8);

    return (
      <View style={{flex:1}}>
        <QRCodeScanner
          onRead={(result)=>{
            this.processScan(result);
          }}
        />
        <View style={{flex:1,padding:10,justifyContent:'center',alignItems:'center'}}>
          <Text style={{textAlign:'center'}}>{L('SCAN QR CODE ON TRAFIZ APP')}</Text>
        </View>        
      </View>
    );
  }

  render() {
    if( this.props.stateLogin.offline ) {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <Text style={{textAlign:'center'}}>{L('CAN NOT SCAN IN OFFLINE MODE')}</Text>
        </View>
      );
    }

    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    if(this.state.show === 'error') {
      const msg = this.state.errMsg;
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center',padding:5}}>
          <Text style={{textAlign:'center'}}>{L(msg)}</Text>
        </View>
      );
    }

    if(this.state.show === 'process') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <Text style={{textAlign:'center'}}>
            {this.state.data}
          </Text>
        </View>
      );
    }

    return this.renderScanQRCode();
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;