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
        <Title txt={L('FISHERMAN')} />
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
        {label:'Offline Id',key:'idfishermanofflineparam',value:'',disabled:true},
        {label:L('Personal ID card'),key:'id_paramparam',value:''},
        {label:L('Name'),key:'nameparam',value:'',mandatory:true},
        {label:L('Sex'),key:'sex_paramparam',value:'1',ctl:'picker',param:[
          {label:L('Male'),value:'1'},
          {label:L('Female'),value:'0'}
        ]},
        {label:L('Nationality'),key:'nat_paramparam',value:'ID',ctl:'picker',param:[
          {label:L('Indonesia'),value:'ID'},
          {label:L('Singapore'),value:'SG'},
          {label:L('United States'),value:'US'},
          {label:L('Philipine'),value:'PH'}
        ]},
        {label:L('Date of birth'),key:'bodparam',value:'',ctl:'datepicker'},
        {label:L('Phone'),key:'phone_paramparam',value:'',mandatory:true},
        {label:L('Job / Title'),key:'jobtitle_paramparam',value:'Captain',ctl:'picker',param:[
          {label:L('Captain'),value:'Captain'},
          {label:L('Crew'),value:'Crew'}
        ]},
        {label:L('Fisherman registration number'),key:'fishermanregnumberparam',value:''},
        {label:L('Address'),key:'address_paramparam',value:''},
        {label:L('Country'),key:'countryparam',value:'',ctl:'country'},
        {label:L('Province'),key:'provinceparam',value:'',ctl:'province'},
        {label:L('City'),key:'cityparam',value:'',ctl:'city'},
        {label:L('District'),key:'districtparam',value:'',disabled:true},
        {label:'Supplier id',key:'idmssupplierparam',value:'',disabled:true}
      ],
      errMsg:''
    }
  }

  componentDidMount() {
    const mode = this.props.navigation.getParam('mode','add');
    const login = this.props.stateLogin;

    const inputs = this.state.inputs.slice();
    const idx = inputs.length-1;
    inputs[idx].value = login.idmssupplier;


    if(mode === 'add') {
      inputs[0].value = lib.getOfflineId('fisherman',login.idmsuser);
      this.setState({show:'form',inputs:inputs});
    } else if(mode === 'edit') {
      const data = this.props.navigation.getParam('item');

      const ref = {
        idfishermanofflineparam:'idfishermanoffline',
        id_paramparam:'id_param',
        nameparam:'name',
        sex_paramparam:'sex_param',
        nat_paramparam:'nat_param',
        bodparam:'bod', // spli(' ')[0];
        phone_paramparam:'phone_param',
        jobtitle_paramparam:'jobtitle_param',
        fishermanregnumberparam:'fishermanregnumber',
        address_paramparam:'address_param',
        countryparam:'country',
        provinceparam:'province',
        cityparam:'city',
        districtparam:'district'
      }
  
      for(let i=0;i<inputs.length;i++) {
        const inputKey = inputs[i].key;
        const dataKey = ref[inputKey];
        let valueInData = data[dataKey];
        if(inputKey == 'bodparam' && valueInData) valueInData = valueInData.split(' ')[0];
        if(valueInData) inputs[i].value = valueInData;
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
    let p = Promise.resolve();

    // {label:'Offline Id',key:'idfishermanofflineparam',value:'',disabled:true},
    // {label:'ID',key:'id_paramparam',value:''},
    // {label:'Name',key:'nameparam',value:'',mandatory:true},
    // {label:'Sex',key:'sex_paramparam',value:'1',ctl:'picker',param:[
    // {label:'Nationality',key:'nat_paramparam',value:'ID',ctl:'picker',param:[
    // {label:'Date of birth',key:'bodparam',value:'',ctl:'datepicker'},
    // {label:'Address',key:'address_paramparam',value:''},
    // {label:'Phone',key:'phone_paramparam',value:'',mandatory:true},
    // {label:'Job / Title',key:'jobtitle_paramparam',value:'Captain',ctl:'picker',param:[
    // {label:'Supplier id',key:'idmssupplierparam',value:'',disabled:true}

    const offlineJson = {
      idfishermanoffline:json['idfishermanofflineparam'],
      name:json['nameparam'],
      bod:json['bodparam'],
      id_param:json['id_paramparam'],
      sex_param:json['sex_paramparam'],
      nat_param:json['nat_paramparam'],
      address_param:json['address_paramparam'],
      phone_param:json['phone_paramparam'],
      jobtitle_param:json['jobtitle_paramparam'],
      country:json['countryparam'],
      province:json['provinceparam'],
      city:json['cityparam'],
      district:json['districtparam'],
      fishermanregnumber:json['fishermanregnumberparam'],

    };

    if(mode === 'add') {
      p = this.props.actions.addFisherman(json,offlineJson);
    } else if(mode === 'edit') {
      p = this.props.actions.editFisherman(json,offlineJson);      
    }

    p
    .then(()=>{
      return this.props.actions.getFishermans();
    })
    .then(()=>{
      this.setState({show:'form'});
      this.props.navigation.navigate('CreateFishermanList');   
    })
    .catch(err=>{
      console.warn(err);
      this.setState({show:'form'});      
    });
  }

  handleRemove() {
    this.setState({show:'busy'});
    const idfishermanofflineparam = this.state.inputs[0].value;
    this.props.actions.removeFisherman({idfishermanofflineparam:idfishermanofflineparam})
    .then(()=>{
      return this.props.actions.getFishermans();
    })
    .then(()=>{
      this.setState({show:'form'});
      this.props.navigation.navigate('CreateFishermanList');   
    })
    .catch(err=>{
      console.warn(err);
      this.setState({show:'form'});      
    });
  }

  onCameraReturn(data,msg,index) {
    const newInputs = this.state.inputs.slice();
    console.warn(data.uri);
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

  setInput(index,text) {
    const newInputs = this.state.inputs.slice();
    newInputs[index].value = text;
    this.setState({inputs:newInputs});
  }

  openCountry(index) {
    this.props.navigation.navigate('FishermanSelectScreen', {
      rows: ['INDONESIA'],
      onReturnSelect: (text) => this.setInput(index,text)
    });
  }

  openProvince(index) {
    const input = _.find(this.state.inputs,{key:'countryparam'});
    const country = input.value;
    const rows = lib.getProvinces(country);
    this.props.navigation.navigate('FishermanSelectScreen', {
      rows: rows,
      onReturnSelect: (text) => this.setInput(index,text)
    });
  }

  openCity(index) {
    const input = _.find(this.state.inputs,{key:'provinceparam'});
    const province = input.value;
    const rows = lib.getCity(province);
    this.props.navigation.navigate('FishermanSelectScreen', {
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
          <Button disabled={disabled} raised primary text={L('Save')} onPress={()=>this.handleSave()} />
        </View>
      </View>  
    );
    let title = L('ADD FISHERMAN');

    if(mode === 'edit') {
      title = L('EDIT FISHERMAN');
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