import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Picker
} from 'react-native';
import _ from 'lodash';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { Avatar } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import DatePicker from 'react-native-datepicker';
import { MyDateBtn } from '../myCtl';
import moment from 'moment';

const Gears = require('../Gears');
const lib = require('../lib');
const L = require('../dictionary').translate;

class DetailScreen extends React.Component {
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
      inputs:[
        {label:'Offline Id',key:'id',value:'',disabled:true},
        {label:L('Transport by'),key:'transportBy',value:'land',ctl:'picker',param:[
          {label:L('Land'),value:'land'},
          {label:L('Air'),value:'air'},
          {label:L('Ship'),value:'ship'}
        ]},
        {label:L('Transport name/id'),key:'transportName',value:''},
        {label:L('Transport receipt'),key:'transportReceipt',value:'',ctl:'camera'},
        {label:L('Delivery date'),key:'deliverDate',value:'',ctl:'datepicker',mandatory:true},
      ],
      errMsg:''
    }
  }

  componentDidMount() {
    const inputs = this.state.inputs.slice();
    this.setState({show:'form',inputs:inputs});
  }

  handleConfirm() {
    this.setState({show:'busy'});

    const arr = this.state.inputs;
    const json = {};
    for(let i=0;i<arr.length;i++) {
      const key = arr[i].key;
      const value = arr[i].value;
      const mandatory = arr[i].mandatory;
      json[key] = value;

      if(value.length == 0 && mandatory) return this.setState({
        show:'error',
        errMsg:arr[i].label+L(' not set')
      });

      if(value.length == 0) {
        json[key] = null;
      }
    }

    let p = Promise.resolve();
    const deliverySheet = this.generateDeliverySheet(json);
    const deliverySheetId = deliverySheet.deliverySheetData.deliverySheetNo;
    const deliverySheetText = JSON.stringify(deliverySheet);

    this.props.actions.closeBatchDelivery(deliverySheetId,deliverySheet);

    // synch to backend
    p = this.props.actions.createDeliverySheetV2(deliverySheetId,deliverySheetText);

    const fishes = deliverySheet.fishCatchIds;
    const login = this.props.stateLogin;
    const jsons = [];
    let tp = 0;
    if(deliverySheet.viewData.sellPrice && deliverySheet.viewData.sellPrice.length > 0) {
      tp = Number(deliverySheet.viewData.sellPrice);
    }

    for(let i=0;i<fishes.length;i++) {
      const iddeliveryoffline = lib.getOfflineId('d',login.idmsuser)+'-'+i;
      const idtrfishcatchoffline = fishes[i];
      const totalprice = Math.floor(tp / fishes.length);
      const desc = deliverySheet.viewData.notes;
      const sendtobuyerdate = json['deliverDate'];
      const deliverydate = json['deliverDate'];
      const transportby = json['transportBy'];
      const transportnameid = json['transportName'];
      const transportreceiptphoto = json['transportName'];;
      const idmsbuyer = ''; // todo
      const idmssupplier = login.idmssupplier;
      const deliverysheetofflineid = deliverySheetId;
      jsons.push({
        iddeliveryoffline,
        idtrfishcatchoffline,
        totalprice,
        desc,
        sendtobuyerdate,
        deliverydate,
        transportby,
        transportnameid,
        transportreceiptphoto,
        idmsbuyer,
        idmssupplier,
        deliverysheetofflineid  
      });
    }

    p
    .then(()=>{
      console.warn('start synch batch delivery');
      return this.props.actions.synchBatchDelivery(jsons);
    })
    .then(()=>{
      return this.props.actions.upsertBatchDeliveries();
    })
    .then(()=>{
      return this.props.actions.getDeliveries();
    })
    .then(()=>{
      console.warn('finish synch batch delivery');
      this.props.navigation.goBack();
    })
    .catch(err=>{
      console.warn('error!');
      console.warn(err);
      this.setState({show:'form'});      
    });
  }

  generateDeliverySheet(json) {
    const ref = this.props.navigation.getParam('data');
    const data = _.find(this.props.stateData.batchDeliveries,{deliverysheetofflineid:ref.deliverysheetofflineid})

    const login = this.props.stateLogin;
    const batchId = data.deliverysheetofflineid;

    let modBy = null;
    if(login.profile && login.profile.name) modBy = login.profile.name;
    const supplierPhone = login.profile.phonenumber;
    const supplierName = login.profile.name;

    const fishCatchIds = []; // idtrfishcatchoffline(s)
    const fishCatchData = []; // catch fish

    // viewData
    const buyerName = data.buyerName;
    const buyerId = data.buyerId;
    const fishNameEng = ''; // every fish
    const fishNameInd = ''; // every fish
    let numUnit = 0;
    let totalWeight = 0;
    const compliance = [false,false,false]; // every fish
    const buyPrice = 0; // skip
    const sellPrice = data.sellPrice;  // batchdelivery sell price
    const gradeCodes = []; // 100A, 200B
    const notes = data.notes; //batchdelivery notes
    const unitName = 'unit';
    const transportBy = data.transportBy;
    const transportName = data.transportName;
    const transportReceipt = data.transportReceipt;
 

    // deliverySheet
    const deliverySheetNo = batchId;
    const nationalRegistrationSupplierCode = login.supplierid ? login.supplierid : '';
    // const supplierName = login.identity ? login.identity : '';
    const deliveryDate = moment(json['deliverDate'],'YYYY-MM-DD').format('YY-MM-DD');
    const species=''; // three a code
    let numberOfFishOrLoin = 0;
    const vesselName=''; // nempel ke ikan
    const vesselSize=''; // nempel ke ikan
    const vesselRegistrationNo=''; // nempel ke ikan
    const expiredDate=''; // nempel ke ikan
    const vesselFlag=''; // nempel ke ikan
    const fishingGround=''; // nempel ke ikan
    const landingSite=''; // nempel ke ikan
    const gearType=''; // nempel ke ikan
    const catchDate=''; // nempel ke ikan
    const fishermanName=''; // nempel ke ikan
    const landingDate=''; // nempel ke ikan
    const fadused=''; // nempel ke ikan

    const catches = this.props.stateData.catches;
    const fishes = this.props.stateData.fishes;
    const ships = this.props.stateData.ships;
    const catchRefs = {};
    const shipRefs = {};
    const fishRefs = {};

    for(let i=0;i<data.fish.length;i++) {
      const fc = Object.assign({},data.fish[i]);

      numUnit++;
      numberOfFishOrLoin = numUnit;
      totalWeight += Number(fc.amount);

      const idtrcatchoffline = fc.idtrcatchoffline;
      let c = _.find(catches,{idtrcatchoffline:idtrcatchoffline});
      c = Object.assign({},c);
      cRef = Object.assign({},c);
      if(cRef.fish) delete cRef.fish;
      catchRefs[idtrcatchoffline] = cRef;

      const idfishoffline = c.idfishoffline;
      let fishData = _.find(fishes,{idfishoffline:idfishoffline});
      if(!fishData) {
        lib.dump(fishes)
        throw 'NO FISH';
      }
      fishData = Object.assign({},fishData);
      console.warn(fishData);
      fishRefs[idfishoffline] = fishData;
      
      const idshipoffline = c.idshipoffline;
      let shipData = _.find(ships,{idshipoffline:idshipoffline});
      if(!shipData) {
        lib.dump(ships)
        throw 'NO SHIP';
      }
      shipData = Object.assign({},shipData);
      console.warn(shipData);
      shipRefs[idshipoffline] = shipData;


      let expiredDate = shipData.fishinglicenseexpiredate_param;
      if(expiredDate) {
        expiredDate = moment(expiredDate,'YYYY-MM-DD').format('YY-MM-DD');
      } else {
        expiredDate = '';
      }
      let landingDate = c.datetimevesselreturn ? c.datetimevesselreturn.split(' ')[0] : '';
      if(landingDate.length > 0) landingDate = moment(landingDate,'YYYY-MM-DD').format('YY-MM-DD');
      const fadused = (c.fadused == '1') ? "Y" : "N";  

      let fishinggroundarea = c.fishinggroundarea;
      if(fishinggroundarea && fishinggroundarea.length > 0) {
        fishinggroundarea = c.fishinggroundarea.split(',')[0];
      }

      let gearType = shipData.vesselgeartype_param;
      gearType = Gears.getAbbr(gearType);

 
      fc.fishNameEng = c.indname;
      fc.fishNameInd = c.englishname;
      fc.unitName = c.unitmeasurement;
      fc.species = c.threea_code;
      fc.vesselName = c.shipname;
      fc.vesselSize = shipData.vesselsize_param;
      fc.vesselRegistrationNo = shipData.vessellicensenumber_param;
      fc.expiredDate = expiredDate;
      fc.vesselFlag = shipData.vesselflag_param;
      fc.fishingGround = fishinggroundarea;
      fc.landingSite = c.portname;
      fc.gearType = gearType;
      fc.catchDate = moment(c.purchasedate,'YYYY-MM-DD').format('YY-MM-DD');
      fc.fishermanName = c.fishermanname2 ? c.fishermanname2 : '';
      if(fc.fishermanName == '' && c.fishermanname ) {
        fc.fishermanName = c.fishermanname;
      }
      fc.landingDate = landingDate;
      fc.fadused = fadused;
      
      fishCatchIds.push(fc.idtrfishcatchoffline); // idtrfishcatchoffline(s)
      fishCatchData.push(fc); // catch fish
      gradeCodes.push((''+fc.amount+''+fc.grade));
    }

    const ds = {
      deliverySheetNo,
      nationalRegistrationSupplierCode,
      supplierName,
      deliveryDate,
      // species,
      numberOfFishOrLoin,
      totalWeight,
      // vesselName,
      // vesselSize,
      // vesselRegistrationNo,
      // expiredDate,
      // vesselFlag,
      // fishingGround,
      // landingSite,
      // gearType,
      // catchDate,
      // fishermanName,
      // landingDate,
      // unitName,
      // fadused
    }

    const viewData = {
      buyerName,
      buyerId, // todo
      fishNameEng, // todo
      fishNameInd,
      numUnit,
      totalWeight,
      compliance,
      buyPrice,
      sellPrice,
      gradeCodes,
      notes,
      unitName,
      modBy,
      transportBy,
      transportName,
      transportReceipt,
    }

    console.warn(viewData);

    const ret = {
      version:2,
      batchId:batchId,
      deliverySheetData:ds,
      viewData:viewData,
      fishCatchIds:fishCatchIds,
      fishCatchData:fishCatchData,
      sender:{
        supplierName,
        supplierPhone
      },
      catchRefs,
      shipRefs,
      fishRefs,  
    };

    lib.dump(ret);
    return ret;
  }

  onCameraReturn(data,msg,index) {
    const newInputs = this.state.inputs.slice();
    newInputs[index].value = data.uri;
    this.setState({inputs:newInputs});
  }

  useCamera(index) {
    this.props.navigation.navigate('CameraScreen', {
      onCameraReturn: (data,msg) => this.onCameraReturn(data,msg,index) 
    });
  }

  render() {
    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    let errorIndicator = null;
    if( this.state.show === 'error' ) {
      const errMsg = this.state.errMsg;
      errorIndicator = (
        <View style={{backgroundColor:'red',padding:5}}>
          <Text style={{textAlign:'center',color:'white'}}>{errMsg.toUpperCase()}</Text>
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        {errorIndicator}
        {this.renderForm()}
      </View>
    )
    
  }

  setInput(index,text) {
    const newInputs = this.state.inputs.slice();
    newInputs[index].value = text;
    this.setState({inputs:newInputs});
  }

  renderItem(obj,index) {
    let s1 = {paddingHorizontal:10,height:64,justifyContent:'center'};
    let s2 = Object.assign({},s1,{flexDirection:'row',justifyContent:'space-between',alignItems:'center'});
    let editable = obj.disabled ? false : true;
    const mandatory = obj.mandatory ? L('(mandatory)') : '';

    if(!editable) return null;

    if(obj.ctl && obj.ctl === 'camera') {
      let photo = (<View style={{width:48,height:48,borderRadius:24,backgroundColor:'gray'}} />);
      if(obj.value.length > 0) {
        const img = obj.value;
        console.warn('imgurl:',obj.value);
        photo = (
          <Image 
          style={{width:48,height:48,borderRadius:24}}
          source={{uri:img}} />
        );
      }
      const takepic = L('TAKE PICTURE');
      return (
        <View key={index} style={s2}>
          <View style={{flex:1,alignItems:'flex-start',justifyContent:'center'}}>
            {photo}
          </View>
          <TouchableOpacity onPress={()=>this.useCamera(index)}>
            <Text style={{fontWeight:'bold'}}>{takepic}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if(obj.ctl && obj.ctl === 'datepicker') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      return (
        <View key={index} style={s2}>
          <Text>{obj.label} {mandatory}</Text>
          <MyDateBtn 
            placeholder={L('TAP TO SET')}
            value={obj.value} onChangeDate={(str)=>this.setInput(index,str)} />
        </View>
      );
    }

    if(obj.ctl && obj.ctl === 'picker') {
      const arr = obj.param;
      return (
        <View key={index} style={s2}>
          <Text style={{}}>{obj.label} {mandatory}</Text>
          <Picker
            style={{flex:1}}
            selectedValue={obj.value}
            onValueChange={(item, idx) => this.setInput(index,item)}
          >
          {arr.map((obj,index)=>{
            return <Picker.Item key={index} label={obj.label} value={obj.value} />;
          })}
          </Picker>
        </View>
      );
    }

    return (
      <View key={index} style={s1}>
        <TextField
          editable={editable}
          tintColor={lib.THEME_COLOR}
          onChangeText={(text) => this.setInput(index,text)}
          value={obj.value}
          label={obj.label+' '+mandatory}
        />
      </View>
    );
  }

  renderForm() {
    const mode = this.props.navigation.getParam('mode','add');

    let bottom = (
      <View style={{flexDirection:'row'}}>
        <View style={{flex:1}}>
          <Button raised primary text={L('Confirm Close')} onPress={()=>this.handleConfirm()} />
        </View>
      </View>  
    );

    let title = L('SET DELIVERY INFORMATION');

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <ScrollView style={{flex:1}}>
          <Text style={{padding:10,textAlign:'center',fontWeight:'bold'}}>{title}</Text>
          {this.state.inputs.map((obj,index)=>{
            return this.renderItem(obj,index);
          })}
          <Text />
        </ScrollView>
        <Text />
        <Text style={{textAlign:'center',fontSize:10}}>
          {L('ON CLOSED TRANSACTION, DELIVERY INFORMATION CAN NOT BE EDITED AGAIN.')}
          {L('CONFIRM CLOSE TO RETRIEVE DELIVERY SHEET')}
        </Text>
        <Text />
        {bottom}
      </View>
    );
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

DetailScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailScreen)

export default DetailScreen;