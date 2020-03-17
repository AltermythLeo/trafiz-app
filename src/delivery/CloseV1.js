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
    const login = this.props.stateLogin;
    inputs[0].value = lib.getOfflineId('delivery',login.idmsuser);
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

    const batchId = this.props.navigation.getParam('batchId');
    const bdd = this.props.stateData.batchDeliveryData[batchId];
    let p = Promise.resolve();
    const deliverySheet = this.generateDeliverySheet(json);

    this.props.actions.setDeliverySheet(batchId,deliverySheet);

    // synch to backend
    const deliverySheetId = deliverySheet.deliverySheetData.deliverySheetNo;
    const deliverySheetText = JSON.stringify(deliverySheet);
    p = this.props.actions.synchDeliverySheet(deliverySheetId,deliverySheetText);

    // iddeliveryoffline;
    // idtrfishcatchoffline;
    // totalprice;
    // desc;
    // sendtobuyerdate;
    // deliverydate;
    // transportby;
    // transportnameid;
    // transportreceiptphoto;
    // idmsbuyer;
    // idmssupplier;
    // deliverysheetofflineid;

    const fishes = deliverySheet.fishCatchIds;
    const login = this.props.stateLogin;
    const totalPrice = bdd.totalPrice ? Number(bdd.totalPrice) : 0;
    const avgPrice = Math.floor(totalPrice/fishes.length);
    const jsons = [];

    for(let i=0;i<fishes.length;i++) {
      const iddeliveryoffline = lib.getOfflineId('d',login.idmsuser)+'-'+i;
      const idtrfishcatchoffline = fishes[i];
      const totalprice = avgPrice;
      const desc = bdd.notes;
      const sendtobuyerdate = json['deliverDate'];
      const deliverydate = json['deliverDate'];
      const transportby = json['transportBy'];
      const transportnameid = json['transportName'];
      const transportreceiptphoto = json['transportName'];;
      const idmsbuyer = bdd.idmsbuyer;
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
      console.warn('oke 1');
      return this.props.actions.synchBatchDelivery(jsons);
    })
    .then(()=>{
      console.warn('oke 2');
      this.setState({show:'form'});
      this.props.navigation.navigate('Tab3');   
    })
    .catch(err=>{
      console.warn('error!');
      console.warn(err);
      this.setState({show:'form'});      
    });

  }

  generateDeliverySheet(json) {
    // Delivery Sheet No : number delivery sheet
    // National  Registration Supplier Code : kode supplier yang terregistrasi nasional (pemerintah)
    // Delivery Date : tanggal pengiriman ikan ke processor dengan format ( yy - MM - dd ) Contohnya: 18-06-21
    // Species : Kode ASFIS ( 3 character ) contohnya : YFT, BET
    // Number of Fish or Loin : Jumlah total ikan atau loin  dalam angka ( pieces )
    // TotalWeight : Jumlah Total Berat Ikan atau Loin dalam angka
    // VesselName : nama kapal
    // VesselSize: ukuran kapal dalam format angka
    // VesselRegistrationNo: Nomor Registrasi Kapal
    // ExpiredDate : Tanggal Berakhirnya Ijin Operational Kapal dengan format ( yy - MM - dd ) Contohnya: 18-06-21
    // Vessel Flag : Bendera Kapal, menggunakan 2 character country, misalnya Indonesia, ditulis ID
    // Fishing Ground :  lokasi penangkapan ikan
    // Landing Site :  lokasi pendaratan kapal 
    // GearType: Jenis Umpan ( ditulis menggunakan 2 karakter saja, misalnya GearType HL  untuk  handline, PL untuk  pole and line, PS: untuk pursent)
    // CatchDate : Tanggal Penangkapan Ikan dengan format ( yy - MM - dd ) Contohnya: 18-06-21

    const login = this.props.stateLogin;
    const uid = Number(login.id);
    //const dsId = lib.getOfflineId('ds',login.idmsuser);
    const dsId = lib.getShortOfflineId('ds',uid.toString(36));
    const suppName = login.identity ? login.identity : '';
    const suppId = login.supplierid ? login.supplierid : '';

    const batchId = this.props.navigation.getParam('batchId');
    const bdd = this.props.stateData.batchDeliveryData[batchId];
    bdd.close = true;

    const fishCatchBuyerNames = Object.assign({},this.props.stateData.fishCatchBuyerNames);

    let rows = [];
    rows = _.groupBy(this.props.stateData.readyToDeliver,(o)=>{
      return o["batchId"];
    });
    const fishes = rows[batchId] ? rows[batchId] : [];
    const fishCatchIds = [];
    const gradeCodes = [];

    let totalWeight = 0;
    let totalNum = 0;

    for(let i=0;i<fishes.length;i++) {
      totalWeight += Number(fishes[i].weight);
      totalNum++;

      fishCatchIds.push(fishes[i].fishCatchId);
      gradeCodes.push(fishes[i].gradeCode);
    }

    const catchId = fishes[0].catchId;
    const catches = this.props.stateData.catches;
    let c = _.find(catches,{idtrcatchoffline:catchId});
    c = Object.assign({},c);

    const idfishoffline = c.idfishoffline;
    const fishData = _.find(this.props.stateData.fishes,{idfishoffline:idfishoffline});
    const idshipoffline = c.idshipoffline;
    const shipData = _.find(this.props.stateData.ships,{idshipoffline:idshipoffline});
    const idfishermanoffline = c.idfishermanoffline;
    const fishermanData = _.find(this.props.stateData.fishermans,{idfishermanoffline:idfishermanoffline});
    const idbuyeroffline = c.idbuyeroffline;
    let supplierData = null;
    if(idbuyeroffline) {
      supplierData = _.find(this.props.stateData.suppliers,{idbuyeroffline:idbuyeroffline});
    }
    const buyerId = bdd.buyerId;
    let buyerData = _.find(this.props.stateData.buyers,{idbuyeroffline:buyerId});
    if(!buyerData) buyerData = _.find(this.props.stateData.suppliers,{idbuyeroffline:buyerId});

    const oldFish = c.fish ? c.fish : [];
    const fishCatchData = [];
    let originalWeight = 0;
    for(let i=0;i<oldFish.length;i++) {
      const id = oldFish[i].idtrfishcatchoffline;
      if(oldFish[i].amount) originalWeight += Number(oldFish[i].amount);
      if(fishCatchIds.indexOf(id) > -1) {
        fishCatchData.push(oldFish[i]);
      }
    }

    delete c.fish;

    const unitDef = [
      {label:'individual(s)',value:'1',label2:'whole'},
      {label:'basket(s)',value:'0',label2:'basket'}  
    ]

    let unitName = _.find(unitDef,{value:''+c.unitmeasurement});
    let unitName2 = '';
    if(unitName.label) {
      unitName2 = unitName.label2; 
      unitName = unitName.label; 
    } else {
      unitName = 'unit';
      unitName2 = 'unit';
    }

    let landingDate = c.datetimevesselreturn ? c.datetimevesselreturn.split(' ')[0] : '';
    if(landingDate.length > 0) landingDate = moment(landingDate,'YYYY-MM-DD').format('YY-MM-DD');
    const fadused = (c.fadused == '1') ? "Y" : "N";
    // const totalPrice = c.totalprice ? Number(c.totalprice) : 0;
    // const loanExpense = c.loanexpense ? Number(c.loanexpense) : 0;
    // const otherExpense = c.otherexpense ? Number(c.otherexpense) : 0;
    // let netPrice = totalPrice - loanExpense - otherExpense;
    // if(netPrice < 0) netPrice = 0;

    // let buyPrice = 0;
    // if(originalWeight > 0) buyPrice = Math.floor((totalWeight/originalWeight) * netPrice);
    // console.warn(fishData);

    let expiredDate = shipData.fishinglicenseexpiredate_param;
    if(expiredDate) {
      expiredDate = moment(expiredDate,'YYYY-MM-DD').format('YY-MM-DD');
    } else {
      expiredDate = '';
    }
    const ds = {
      deliverySheetNo:dsId,
      nationalRegistrationSupplierCode:suppId,
      supplierName:suppName,
      deliveryDate:moment(json['deliverDate'],'YYYY-MM-DD').format('YY-MM-DD'),
      species:fishData.threea_code,
      numberOfFishOrLoin:totalNum,
      totalWeight:totalWeight,
      vesselName:c.shipname,
      vesselSize:shipData.vesselsize_param,
      vesselRegistrationNo:shipData.vessellicensenumber_param,
      expiredDate:expiredDate,
      vesselFlag:shipData.vesselflag_param,
      fishingGround:c.fishinggroundarea,
      landingSite:c.portname,
      gearType:shipData.vesselgeartype_param,
      catchDate:moment(c.purchasedate,'YYYY-MM-DD').format('YY-MM-DD'),
      fishermanName:c.fishermanname ? c.fishermanname : '',
      landingDate:landingDate,
      unitName:unitName2,
      fadused:fadused
    }

    const viewData = {
      buyerName:bdd.buyerName,
      fishNameEng:bdd.speciesName,
      fishNameInd:bdd.speciesNameIndo,
      numUnit:totalNum,
      totalWeight:totalWeight,
      compliance:bdd.compliance,
      buyPrice:0,
      sellPrice:bdd.totalPrice ? bdd.totalPrice : 0,
      gradeCodes:gradeCodes,
      notes:bdd.notes ? bdd.notes : '',
      unitName:unitName
    }

    const ret = {
      // catchData:c,
      // fishCatchData:fishCatchData,
      // fishData:fishData,
      // fishermanData:fishermanData,
      // supplierData:supplierData,
      // shipData:shipData,
      // deliveryData:json,
      // buyerData:buyerData,
      batchId:batchId,
      deliverySheetData:ds,
      viewData:viewData,
      fishCatchIds:fishCatchIds,
      fishCatchData:fishCatchData
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
    const disabled = (this.state.inputs[0].value.length < 2);

    let bottom = (
      <View style={{flexDirection:'row'}}>
        <View style={{flex:1}}>
          <Button disabled={disabled} raised primary text={L('Confirm Close')} onPress={()=>this.handleConfirm()} />
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