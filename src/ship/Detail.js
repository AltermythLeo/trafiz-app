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
import { MyPicker } from '../MyPicker';

const lib = require('../lib');
const Gears = require('../Gears');
const L = require('../dictionary').translate;

class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    // const title = navigation.getParam('headerTitle', null);
    // console.warn(title);
    return {
      headerTitle: (
        <Title txt={L('FISHING VESSEL')} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  // idshipoffline;
  // vesselname_param;
  // vessellicensenumber_param;
  // vessellicenseexpiredate_param;
  // fishinglicensenumber_param;
  // fishinglicenseexpiredate_param;
  // vesselsize_param;
  // vesselflag_param;
  // vesselgeartype_param;
  // vesseldatemade_param;
  // vesselownername_param;
  // vesselownerid_param;
  // vesselownerphone_param;
  // vesselownersex_param;
  // vesselownerdob_param;
  // vesselowneraddress_param;
  // idmsuserparam;

  constructor(props) {
    super(props);
    this.state = {
      show:'busy',
      inputs:[
        {label:'offlineId',key:'idshipoffline',value:'',disabled:true},
        {label:L('Vessel name'),key:'vesselname_param',value:'',mandatory:true},
        {label:L('Unique vessel ID'),key:'vesselid_param',value:''},
        {label:L('Vessel license number'),key:'vessellicensenumber_param',value:''},
        {label:L('Vessel license expire date'),key:'vessellicenseexpiredate_param',value:'',ctl:'datepicker'},
        {label:L('Fishing license number'),key:'fishinglicensenumber_param',value:''},
        {label:L('Fishing license expire date'),key:'fishinglicenseexpiredate_param',value:'',ctl:'datepicker'},
        {label:L('Vessel size (GT)'),key:'vesselsize_param',value:'',keyboardType:'numeric'},
        {label:L('Vessel flag'),key:'vesselflag_param',value:'ID',ctl:'picker',param:[
          {label:L('Indonesia'),value:'ID'},
          {label:L('Singapore'),value:'SG'},
          {label:L('United States'),value:'US'},
          {label:L('Philipine'),value:'PH'}
        ],mandatory:true},
        {label:L('Vessel gear type'),key:'vesselgeartype_param',value:'',ctl:'gears',param:[
        ],mandatory:true},
        {label:L('Vessel made date'),key:'vesseldatemade_param',value:'',ctl:'datepicker'},
        {label:L('Vessel owner name'),key:'vesselownername_param',value:''},
        {label:L('Vessel owner personal ID card'),key:'vesselownerid_param',value:''},
        {label:L('Vessel owner phone'),key:'vesselownerphone_param',value:''},
        {label:L('Vessel owner sex'),key:'vesselownersex_param',value:'1',ctl:'picker',param:[
          {label:L('Male'),value:'1'},
          {label:L('Female'),value:'0'}
        ]},
        {label:L('Vessel owner DOB'),key:'vesselownerdob_param',value:'',ctl:'datepicker'},
        {label:L('Vessel owner address'),key:'vesselowneraddress_param',value:''},
        {label:L('Country'),key:'vesselownercountry_param',value:'',ctl:'country'},
        {label:L('Province'),key:'vesselownerprovince_param',value:'',ctl:'province'},
        {label:L('City'),key:'vesselownercity_param',value:'',ctl:'city'},
        {label:L('District'),key:'vesselownerdistrict_param',value:'',disabled:true},
        {label:'User id',key:'idmsuserparam',value:'',disabled:true},
      ],
      errMsg:''
    }
  }

  componentDidMount() {
    const mode = this.props.navigation.getParam('mode','add');

    if(mode == 'add') this.props.navigation.setParams({headerTitle:L('Add Vessel')});
    else this.props.navigation.setParams({headerTitle:L('Edit Vessel')});

    const login = this.props.stateLogin;

    const inputs = this.state.inputs.slice();
    const idx = inputs.length-1;
    inputs[idx].value = login.idmsuser;

    // const english = (this.props.stateSetting.language == 'english');
    // let gears = Gears.getGear();
    
    // const index = _.findIndex(inputs,{key:'vesselgeartype_param'});

    // if(english) inputs[index].param = gears.eng;
    // else inputs[index].param = gears.ind;

    if(mode === 'add') {
      inputs[0].value = lib.getOfflineId('ship',login.idmsuser);
      this.setState({show:'form',inputs:inputs});
    } else if(mode === 'edit') {
      const data = this.props.navigation.getParam('item');

      // if(item.idshipoffline) inputs[0].value = item.idshipoffline+'';
      // if(item.vesselname_param) inputs[1].value = item.vesselname_param+'';
      // if(item.vessellicensenumber_param) inputs[2].value = item.vessellicensenumber_param+'';
      // if(item.vessellicenseexpiredate_param) inputs[3].value = item.vessellicenseexpiredate_param+'';
      // if(item.fishinglicensenumber_param) inputs[4].value = item.fishinglicensenumber_param+'';
      // if(item.fishinglicenseexpiredate_param) inputs[5].value = item.fishinglicenseexpiredate_param+'';
      // if(item.vesselsize_param) inputs[6].value = item.vesselsize_param+'';
      // if(item.vesselflag_param) inputs[7].value = item.vesselflag_param+'';
      // if(item.vesselgeartype_param) inputs[8].value = item.vesselgeartype_param+'';
      // if(item.vesseldatemade_param) inputs[9].value = item.vesseldatemade_param+'';
      // if(item.vesselownername_param) inputs[10].value = item.vesselownername_param+'';
      // if(item.vesselownerid_param) inputs[11].value = item.vesselownerid_param+'';
      // if(item.vesselownerphone_param) inputs[12].value = item.vesselownerphone_param+'';
      // if(item.vesselownersex_param) inputs[13].value = item.vesselownersex_param+'';
      // if(item.vesselownerdob_param) inputs[14].value = item.vesselownerdob_param+'';
      // if(item.vesselowneraddress_param) inputs[15].value = item.vesselowneraddress_param+'';

      const ref = {
        idshipoffline:'idshipoffline',
        vesselname_param:'vesselname_param',
        vesselid_param:'vessel_id',
        vessellicensenumber_param:'vessellicensenumber_param',
        vessellicenseexpiredate_param:'vessellicenseexpiredate_param',
        fishinglicensenumber_param:'fishinglicensenumber_param',
        fishinglicenseexpiredate_param:'fishinglicenseexpiredate_param',
        vesselsize_param:'vesselsize_param',
        vesselflag_param:'vesselflag_param',
        vesselgeartype_param:'vesselgeartype_param',
        vesseldatemade_param:'vesseldatemade_param',
        vesselownername_param:'vesselownername_param',
        vesselownerid_param:'vesselownerid_param',
        vesselownerphone_param:'vesselownerphone_param',
        vesselownersex_param:'vesselownersex_param',
        vesselownerdob_param:'vesselownerdob_param',
        vesselowneraddress_param:'vesselowneraddress_param',
        vesselownercountry_param:'vesselownercountry_param',
        vesselownerprovince_param:'vesselownerprovince_param',
        vesselownercity_param:'vesselownercity_param',
        vesselownerdistrict_param:'vesselownerdistrict_param',
      }

      console.warn(data);
  
      for(let i=0;i<inputs.length;i++) {
        const inputKey = inputs[i].key;
        const dataKey = ref[inputKey];
        let valueInData = data[dataKey];
        if(valueInData) inputs[i].value = valueInData+'';
      }

      this.setState({show:'form',inputs:inputs});

    }
  }

  handleSave() {
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

    const login = this.props.stateLogin;
    const mode = this.props.navigation.getParam('mode','add');

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

    let p = Promise.resolve();

    if(mode === 'add') {
      p = this.props.actions.addShip(json,offlineJson);
    } else if(mode === 'edit') {
      p = this.props.actions.editShip(json,offlineJson);      
    }

    p
    .then(()=>{
      return this.props.actions.getShips();
    })
    .then(()=>{
      this.setState({show:'form'});
      this.props.navigation.navigate('CreateVesselBoatList');   
    })
    .catch(err=>{
      console.warn(err);
      this.setState({show:'form'});      
    });
  }

  handleRemove() {
    this.setState({show:'busy'});
    const idshipoffline = this.state.inputs[0].value;
    this.props.actions.removeShip({idshipofflineparam:idshipoffline})
    .then(()=>{
      return this.props.actions.getShips();
    })
    .then(()=>{
      this.setState({show:'form'});
      this.props.navigation.navigate('CreateVesselBoatList');   
    })
    .catch(err=>{
      console.warn(err);
      this.setState({show:'form'});      
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

  openGear(index) {
    const english = (this.props.stateSetting.language == 'english');
    let gears = Gears.getGear();
    let rows = [];
    if(english) rows = gears.eng;
    else rows = gears.ind;

    this.props.navigation.navigate('CreateVesselSelectGear', {
      rows: rows,
      onReturnSelect: (text) => this.setInput(index,text)
    });
  }

  openCountry(index) {
    this.props.navigation.navigate('CreateVesselSelect', {
      rows: ['INDONESIA'],
      onReturnSelect: (text) => this.setInput(index,text)
    });
  }

  openProvince(index) {
    const input = _.find(this.state.inputs,{key:'vesselownercountry_param'});
    const country = input.value;
    const rows = lib.getProvinces(country);
    this.props.navigation.navigate('CreateVesselSelect', {
      rows: rows,
      onReturnSelect: (text) => this.setInput(index,text)
    });
  }

  openCity(index) {
    const input = _.find(this.state.inputs,{key:'vesselownerprovince_param'});
    const province = input.value;
    const rows = lib.getCity(province);
    this.props.navigation.navigate('CreateVesselSelect', {
      rows: rows,
      onReturnSelect: (text) => this.setInput(index,text)
    });
  }

  renderItem(obj,index) {
    let s1 = {paddingHorizontal:10,height:64,justifyContent:'center'};
    let s2 = Object.assign({},s1,{flexDirection:'row',justifyContent:'space-between',alignItems:'center'});
    let editable = obj.disabled ? false : true;
    const mandatory = obj.mandatory ? L('(mandatory)') : '';

    if(!editable) return null;

    if(obj.ctl && obj.ctl === 'gears') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      const text = obj.value.length > 0 ? obj.value : L('TAP TO SET');
      return (
        <View key={index} style={s2}>
          <Text>{obj.label} {mandatory}</Text>
          <TouchableOpacity onPress={()=>this.openGear(index)}>
            <Text style={{fontWeight:'bold'}}>{text}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if(obj.ctl && obj.ctl === 'country') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      const text = obj.value.length > 0 ? obj.value : L('TAP TO SET');
      return (
        <View key={index} style={s2}>
          <Text>{obj.label} {mandatory}</Text>
          <TouchableOpacity onPress={()=>this.openCountry(index)}>
            <Text style={{fontWeight:'bold'}}>{text}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if(obj.ctl && obj.ctl === 'province') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      const text = obj.value.length > 0 ? obj.value : L('TAP TO SET');
      return (
        <View key={index} style={s2}>
          <Text>{obj.label} {mandatory}</Text>
          <TouchableOpacity onPress={()=>this.openProvince(index)}>
            <Text style={{fontWeight:'bold'}}>{text}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if(obj.ctl && obj.ctl === 'city') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      const text = obj.value.length > 0 ? obj.value : L('TAP TO SET');
      return (
        <View key={index} style={s2}>
          <Text>{obj.label} {mandatory}</Text>
          <TouchableOpacity onPress={()=>this.openCity(index)}>
            <Text style={{fontWeight:'bold'}}>{text}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if(obj.ctl && obj.ctl === 'gear') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      const text = obj.value.length > 0 ? obj.value : L('TAP TO SET');
      return (
        <View key={index} style={s2}>
          <Text>{obj.label} {mandatory}</Text>
          <TouchableOpacity style={{flex:1}} onPress={()=>this.openGear(index)}>
            <Text style={{textAlign:'right',fontWeight:'bold'}}>{text}</Text>
          </TouchableOpacity>
        </View>
      );
    }

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

    let keyboardType = 'default';
    if(obj.keyboardType) keyboardType = obj.keyboardType;
    return (
      <View key={index} style={s1}>
        <TextField
          editable={editable}
          keyboardType={keyboardType}
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
    const disabled = false;

    let bottom = (
      <View style={{flexDirection:'row'}}>
        <View style={{flex:1}}>
          <Button disabled={disabled} raised primary text={L('Save')} onPress={()=>this.handleSave()} />
        </View>
      </View>  
    );
    let title = L('ADD FISHING VESSEL');

    if(mode === 'edit') {
      title = L('EDIT FISHING VESSEL');
      bottom = (
        <View style={{flexDirection:'row'}}>
          <View style={{flex:1,padding:3}}>
            <Button disabled={disabled} raised primary text={L('Save')} onPress={()=>this.handleSave()} />
          </View>
          <View style={{flex:1,padding:3}}>
            <Button raised accent text={L('Remove')} onPress={()=>this.handleRemove()} />
          </View>
        </View>
      );
    }

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