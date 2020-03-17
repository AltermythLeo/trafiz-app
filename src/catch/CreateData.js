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
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
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
      headerTitle: (
        <Title txt={L('ADD CATCH')} />
      ),

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
        {label:'idtrcatchofflineparam',key:'idtrcatchofflineparam',value:'',disabled:true},
        {label:'idmssupplier',key:'idmssupplierparam',value:'',disabled:true},
        {label:'Fisherman Id',key:'idfishermanofflineparam',value:'',disabled:true},
        {label:'BuyerSupplier Id',key:'idbuyerofflineparam',value:'',disabled:true},
        {label:L('Purchase Unique Number'),key:'purchaseuniquenoparam',value:'',editable:false}, // edit
        {label:L('Vessel Name'),key:'idshipofflineparam',value:'',ctl:'picker',param:[
          {label:'Not set',value:''}
        ],mandatory:true},
        {label:L('Fish Name'),key:'idfishofflineparam',value:'',ctl:'picker',param:[
          {label:'Not set',value:''}
        ],mandatory:true},
        {label:L('Purchase Date'),key:'purchasedateparam',value:'',ctl:'datepicker',mandatory:true,maxDateNow:true},
        {label:L('Purchase Time'),key:'purchasetimeparam',value:'00:00:00',disabled:true}, // edit
        {label:L('Catch or Farmed'),key:'catchorfarmedparam',value:'1',ctl:'picker',param:[
          {label:'Wild Catch',value:'1'},
          {label:'Aqua Culture',value:'0'}
        ],mandatory:true},
        {label:L('By Catch'),key:'bycatchparam',value:'0',ctl:'picker',param:[
          {label:'Yes',value:'1'},
          {label:'No',value:'0'}
        ],mandatory:true},
        {label:L('FAD Use'),key:'fadusedparam',value:'0',ctl:'picker',param:[
          {label:'Yes',value:'1'},
          {label:'No',value:'0'}
        ]},
        {label:L('Product Form At Landing'),key:'productformatlandingparam',value:'1',ctl:'picker',param:[
          {label:'Loin',value:'1'},
          {label:'Whole',value:'0'}
        ],mandatory:true},
        {label:L('Unit Measurement'),key:'unitmeasurementparam',value:'1',ctl:'picker',param:[
          {label:'Individual',value:'1'},
          {label:'Basket',value:'0'}
        ]},
        {label:L('Quantity'),key:'quantityparam',value:'0',disabled:true},
        {label:L('Weight'),key:'weightparam',value:'0',disabled:true},
        {label:L('Fishing Ground/Area'),key:'fishinggroundareaparam',value:'',ctl:'map',mandatory:true},
        {label:L('Purchase Location'),key:'purchaselocationparam',value:''}, // edit
        {label:L('Unique Trip Id of Vessel'),key:'uniquetripidparam',value:'',disabled:true}, // edit
        {label:L('Date of Vessel Departure'),key:'datetimevesseldepartureparam',value:'',ctl:'datepicker',mandatory:true,maxDateNow:true},
        {label:L('Date of Vessel Return'),key:'datetimevesselreturnparam',value:'',ctl:'datepicker',mandatory:true,maxDateNow:true},
        {label:L('Port Name/Landing Site'),key:'portnameparam',value:'',mandatory:true}, // edit
        {label:L('Fisherman name'),key:'fishermannameparam',value:''}, // edit
        {label:L('Fisherman id card'),key:'fishermanidparam',value:''}, // edit
        {label:L('Fisherman register number'),key:'fishermanregnumberparam',value:''}, // edit
        {label:'priceperkgparam',key:'priceperkgparam',value:'',disabled:true}, // edit
        {label:'totalpriceparam',key:'totalpriceparam',value:'',disabled:true}, // edit
        {label:'loanexpenseparam',key:'loanexpenseparam',value:'',disabled:true}, // edit
        {label:'otherexpenseparam',key:'otherexpenseparam',value:'',disabled:true}, //edit
        {label:'postdateparam',key:'postdateparam',value:'',disabled:true}, //edit
      ],
      errMsg:''
    }
  }

  componentDidMount() {
    const mode = this.props.navigation.getParam('mode','add');
    const fisherman = this.props.navigation.getParam('fisherman');
    const supplier = this.props.navigation.getParam('supplier');
    const login = this.props.stateLogin;

    const inputs = this.state.inputs.slice();
    inputs[1].value = login.idmssupplier;
    inputs[2].value = fisherman ? fisherman.idfishermanoffline : null;
    inputs[3].value = supplier ? supplier.idbuyeroffline : null;

    if(fisherman) {
      let index = _.findIndex(inputs,{key:'fishermannameparam'});
      if(index > -1 && fisherman.name) inputs[index].value = fisherman.name;
      index = _.findIndex(inputs,{key:'fishermanidparam'});
      if(index > -1 && fisherman.id_param) inputs[index].value = fisherman.id_param;
      index = _.findIndex(inputs,{key:'fishermanregnumberparam'});
      if(index > -1 && fisherman.fishermanregnumber) inputs[index].value = fisherman.fishermanregnumber;
    }

    // 5 ships
    // 6 fish

    const ships = this.props.stateData.ships;
    const fishes = this.props.stateData.fishes;

    let temp = [];
    for(let i=0;i<ships.length;i++) {
      const ship = ships[i];
      if(ship.lasttransact == 'D') continue;
      const row = {
        label:ship.vesselname_param,
        value:ship.idshipoffline
      }
      temp.push(row);
    }

    let tempSorted = lib.sortLabel(temp);
    tempSorted.unshift({label:'Not set',value:''});
    inputs[5].param = tempSorted;
    
    temp = [];
    for(let i=0;i<fishes.length;i++) {
      const fish = fishes[i];
      if(fish.lasttransact == 'D') continue;
      const row = {
        label:fish.english_name+' ('+fish.threea_code+')',
        labelIndo:fish.indname+' ('+fish.threea_code+')',
        value:fish.idfishoffline
      }
      temp.push(row);
    }
    
    const english = (this.props.stateSetting.language == 'english');
    if(english)
      tempSorted = lib.sortLabel(temp);
    else
      tempSorted = lib.sortLabelIndo(temp);
    tempSorted.unshift({label:'Not set',value:''});
    inputs[6].param = tempSorted;

    const uid = login.id;
    const catchId = lib.getShortOfflineId('catch',uid.toString(36));
    inputs[0].value = catchId;
    inputs[4].value = catchId;
    this.setState({show:'form',inputs:inputs});
  }

  handleSave() {
    this.setState({show:'busy'});

    const arr = this.state.inputs;
    const json = {};
    for(let i=0;i<arr.length;i++) {
      const key = arr[i].key;
      const value = arr[i].value ? arr[i].value : '';
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

    const login = this.props.stateLogin;
    let p = Promise.resolve();

    let fishermanname = null;
    let buyersuppliername = null;

    if(json['idfishermanofflineparam']) {
      const fishermans = this.props.stateData.fishermans;
      const fisherman = _.find(fishermans,{idfishermanoffline:json['idfishermanofflineparam']});
      fishermanname = fisherman.name;  
    }

    if(json['idbuyerofflineparam']) {
      const suppliers = this.props.stateData.suppliers;
      const supplier = _.find(suppliers,{idbuyeroffline:json['idbuyerofflineparam']});
      buyersuppliername = supplier.name_param;
    }

    const ships = this.props.stateData.ships;
    const ship = _.find(ships,{idshipoffline:json['idshipofflineparam']});
    const fishes = this.props.stateData.fishes;
    const fish = _.find(fishes,{idfishoffline:json['idfishofflineparam']});

    const suppliername = login.identity;
    const shipname = ship.vesselname_param;
    const englishname = fish.english_name;
    const indname = fish.indname;
    const threea_code = fish.threea_code;

    const offlineJson = {
      // idtrcatch
      idtrcatchoffline:json['idtrcatchofflineparam'],
      idmssupplier:json['idmssupplierparam'],
      suppliername:suppliername,
      idfishermanoffline:json['idfishermanofflineparam'],
      idbuyeroffline:json['idbuyerofflineparam'],
      //idmsfisherman
      //idmsuserfisherman
      //idmsbuyersupplier
      fishermanname:fishermanname,
      buyersuppliername:buyersuppliername,
      //idmsship
      idshipoffline:json['idshipofflineparam'],
      shipname:shipname,
      //idmsfish
      idfishoffline:json['idfishofflineparam'],
      purchasedate:json['purchasedateparam'],
      purchasetime:json['purchasetimeparam'],
      catchorfarmed:json['catchorfarmedparam'],
      bycatch:json['bycatchparam'],
      fadused:json['fadusedparam'],
      purchaseuniqueno:json['purchaseuniquenoparam'],
      productformatlanding:json['productformatlandingparam'],
      unitmeasurement:json['unitmeasurementparam'],
      quantity:json['quantityparam'],
      weight:json['weightparam'],
      fishinggroundarea:json['fishinggroundareaparam'],
      purchaselocation:json['purchaselocationparam'],
      uniquetripid:json['uniquetripidparam'],
      datetimevesseldeparture:json['datetimevesseldepartureparam'], //2018-07-18 00:00:00
      datetimevesselreturn:json['datetimevesselreturnparam'], //2018-07-18 00:00:00
      portname:json['portnameparam'],
      englishname:englishname,
      indname:indname,
      threea_code:threea_code,
      priceperkg:json['priceperkgparam'],
      totalprice:json['totalpriceparam'],
      loanexpense:json['loanexpenseparam'],
      otherexpense:json['otherexpenseparam'],
      // reqidnull:json[''],
      // requsnull:json[''],
      // reqeunull:json[''],
      // requsaidnull:json[''],
      postdate:json['postdateparam'],
      fishermanname2:json['fishermannameparam'],
      fishermanid:json['fishermanidparam'],
      fishermanregnumber:json['fishermanregnumberparam'],
      fish:[]
        // [{
        // "idtrfishcatch":"fcf3afbc8e6311e89cd1000d3aa384f1",
        // "idtrfishcatchoffline":"fishcatch-d51597cf802411e89cd1000d3aa384f1-1532342070830-1388",
        // "amount":100,
        // "grade":"AAA",
        // "description":"",
        // "idfish":"071F633W"
        // }]
    }

    p = this.props.actions.addCatchList(json,offlineJson);

    p
    .then(()=>{
      return this.props.actions.getCatchFishes();
    })
    .then(()=>{
      this.setState({show:'form'});
      // this.props.navigation.navigate('Tab1');   

      const catches = this.props.stateData.catches;
      const data = _.find(catches,{idtrcatchoffline:json['idtrcatchofflineparam']});

      if(!data) {
        return this.props.navigation.goBack();
      }
  
      this.props.navigation.replace('CatchCatchListScreen',{
        data:data
      });
    })
    .catch(err=>{
      console.warn(err);
      this.setState({show:'form'});      
    });
  }


  onCameraReturn(data,msg,index) {
    const newInputs = this.state.inputs.slice();
    newInputs[index].value = data.uri; // photo
    this.setState({inputs:newInputs});
  }

  useCamera(index) {
    this.props.navigation.navigate('CreateFishermanCamera', {
      msg:L('fisherman photo'),
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

  setInput(index,text,textShown) {
    const newInputs = this.state.inputs.slice();
    newInputs[index].value = text;
    if(textShown) newInputs[index].textShown = textShown;
    this.setState({inputs:newInputs});
  }

  openMap(index) {
    this.props.navigation.navigate('MapScreen', {
      onMapReturn: (longitude,latitude,code) => {
        console.warn(code);
        this.setInput(index,code);
      }
    });
  }

  openFish(index) {
    const english = (this.props.stateSetting.language == 'english');
    this.props.navigation.navigate('CatchSelectFish', {
      onReturnSelect: (data) => {
        if(english)
          this.setInput(index,data.idmsfish,data.english_name);
        else
          this.setInput(index,data.idmsfish,data.indname);
      }
    });
  }

  openShip(index) {
    this.props.navigation.navigate('CatchSelectShip', {
      onReturnSelect: (data) => {
        // console.warn(data);
        this.setInput(index,data.idmsship,data.vesselname_param);
      }
    });
  }

  renderItem(obj,index) {
    let s1 = {paddingHorizontal:10,height:64,justifyContent:'center'};
    let s2 = Object.assign({},s1,{flexDirection:'row',justifyContent:'space-between',alignItems:'center'});
    let editable = obj.disabled ? false : true;
    let mandatory = obj.mandatory ? L('(mandatory)') : '';
    let editable2 = true;
    if(typeof obj.editable === 'boolean' && !obj.editable) editable2 = false;
    
    // if( !obj.mandatory ) return null;
    if( !editable ) return null;

    if(obj.ctl && obj.ctl === 'map') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      const text = obj.value.length > 0 ? obj.value : L('TAP TO SET');
      return (
        <View key={index} style={s2}>
          <Text>{obj.label} {mandatory}</Text>
          <TouchableOpacity onPress={()=>this.openMap(index)}>
            <Text style={{fontWeight:'bold'}}>{text}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // if(obj.ctl && obj.ctl === 'fish') {
    //   const style = Object.assign({},s2,{alignItems:'flex-end'});
    //   let text = obj.value.length > 0 ? obj.value : 'TAP TO SET';
    //   if( obj.textShown && obj.textShown.length > 0 ) text = obj.textShown;
    //   return (
    //     <View key={index} style={s2}>
    //       <Text>{obj.label} {mandatory}</Text>
    //       <TouchableOpacity onPress={()=>this.openFish(index)}>
    //         <Text style={{fontWeight:'bold'}}>{text}</Text>
    //       </TouchableOpacity>
    //     </View>
    //   );
    // }

    // if(obj.ctl && obj.ctl === 'ship') {
    //   const style = Object.assign({},s2,{alignItems:'flex-end'});
    //   let text = obj.value.length > 0 ? obj.value : 'TAP TO SET';
    //   if( obj.textShown && obj.textShown.length > 0 ) text = obj.textShown;
    //   return (
    //     <View key={index} style={s2}>
    //       <Text>{obj.label} {mandatory}</Text>
    //       <TouchableOpacity onPress={()=>this.openShip(index)}>
    //         <Text style={{fontWeight:'bold'}}>{text}</Text>
    //       </TouchableOpacity>
    //     </View>
    //   );
    // }

    if(obj.ctl && obj.ctl === 'camera') {
      let photo = (<View style={{width:48,height:48,borderRadius:24,fnaviggroundColor:'gray'}} />);
      if(obj.value.length > 0) {
        const img = obj.value;
        console.warn('imgurl:',obj.value);
        photo = (
          <Image 
          style={{width:48,height:48,borderRadius:24}}
          source={{uri:img}} />
        );
      }

      return (
        <View key={index} style={s2}>
          <View style={{flex:1,alignItems:'flex-start',justifyContent:'center'}}>
            {photo}
          </View>
          <TouchableOpacity onPress={()=>this.useCamera(index)}>
            <Text style={{fontWeight:'bold'}}>{L('TAKE PICTURE')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if(obj.ctl && obj.ctl === 'datepicker') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      const maxDateNow = obj.maxDateNow ? true : false;
      return (
        <View key={index} style={s2}>
          <Text>{obj.label} {mandatory}</Text>
          <MyDateBtn 
            maxDateNow={maxDateNow}
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
            let label = L(obj.label);
            const english = (this.props.stateSetting.language == 'english');
            if(!english && obj.labelIndo) label = obj.labelIndo;
            return <Picker.Item key={index} label={label} value={obj.value} />;
          })}
          </Picker>
        </View>
      );
    }

    return (
      <View key={index} style={s1}>
        <TextField
          editable={editable2}
          tintColor={lib.THEME_COLOR}
          onChangeText={(text) => this.setInput(index,text)}
          value={obj.value}
          label={obj.label+' '+mandatory}
        />
      </View>
    );
  }

  renderForm() {
    const disabled = (this.state.inputs[0].value.length < 2);

    let bottom = (
      <View style={{flexDirection:'row'}}>
        <View style={{flex:1}}>
          <Button disabled={disabled} raised primary text={L('Save')} onPress={()=>this.handleSave()} />
        </View>
      </View>  
    );

    let title = L('ADD CATCH');

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <ScrollView keyboardShouldPersistTaps={'always'} style={{flex:1}}>
          <Text style={{padding:10,textAlign:'center',fontWeight:'bold'}}>{title}</Text>
          {this.state.inputs.map((obj,index)=>{
            return this.renderItem(obj,index);
          })}
          <Text />
          <Text />
          <Text />
          <Text />
        </ScrollView>
        {bottom}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data,
    stateSetting: state.Setting
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