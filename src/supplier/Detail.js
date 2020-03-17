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
        <Title txt={L('SUPPLIER')} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  // idbuyeroffline;
  // idmssupplier;
  // name_param;
  // id_param;
  // businesslicense_param;
  // contact_param;
  // phonenumber_param;
  // address_param;
  
  // idltusertype;
  // sex_param;
  // nationalcode_param;

  // country_param;
  // province_param;
  // city_param;
  // district_param;
  // completestreetaddress_param;

  constructor(props) {
    super(props);
    this.state = {
      show:'busy',
      inputs:[
        {label:'offlineId',key:'idbuyeroffline',value:'',disabled:true},
        {label:L('Supplier name'),key:'name_param',value:'',mandatory:true},
        {label:L('Supplier personal ID card'),key:'id_param',value:''},
        {label:L('Supplier sex'),key:'sex_param',value:'1',ctl:'picker',disabled:true,param:[
          {label:L('Male'),value:'1'},
          {label:L('Female'),value:'0'}
        ]},
        {label:L('Supplier company name'),key:'companynameparam',value:''},
        {label:L('Supplier business license'),key:'businesslicense_param',value:''},
        {label:L('Expired license date'),key:'businesslicenseexpireddate',ctl:'datepicker',value:''},
        {label:L('Supplier national code'),key:'nationalcode_param',value:'', disabled:true},
        {label:L('Supplier contact person'),key:'contact_param',value:''},
        {label:L('Supplier phone number'),key:'phonenumber_param',value:'',mandatory:true},
        {label:L('Supplier address'),key:'address_param',value:''},
        {label:L('Country'),key:'country_param',value:'',ctl:'country'},
        {label:L('Province'),key:'province_param',value:'',ctl:'province'},
        {label:L('City'),key:'city_param',value:'',ctl:'city'},
        {label:L('District'),key:'district_param',value:'',disabled:true},
        {label:'Complete street address',key:'completestreetaddress_param',value:'',disabled:true},
        {label:'idltusertype',key:'idltusertype',value:'1',disabled:true},
        {label:'Supplier id',key:'idmssupplier',value:'',disabled:true}
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
      inputs[0].value = lib.getOfflineId('supplier',login.idmsuser);
      this.setState({show:'form',inputs:inputs});
    } else if(mode === 'edit') {
      const data = this.props.navigation.getParam('item');

      const ref = {
        idbuyeroffline:'idbuyeroffline',
        name_param:'name_param',
        id_param:'id_param',
        sex_param:'sex_param',
        businesslicense_param:'businesslicense_param',
        nationalcode_param:'nationalcode_param',
        contact_param:'contact_param',
        phonenumber_param:'phonenumber_param',
        address_param:'address_param',
        country_param:'country_param',
        province_param:'province_param',
        city_param:'city_param',
        district_param:'district_param',
        completestreetaddress_param:'completestreetaddress_param',
        companynameparam:'companyname',
        businesslicenseexpireddate:'businesslicenseexpireddate'
      }

      for(let i=0;i<inputs.length;i++) {
        const inputKey = inputs[i].key;
        const dataKey = ref[inputKey];
        const valueInData = data[dataKey];
        if(valueInData) inputs[i].value = valueInData;
      }

      const icp = _.findIndex(inputs,{key:'country_param'});
      if(inputs[icp].value == 'ID') inputs[icp].value = 'INDONESIA';

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

    json['country_param'] = 'ID';

    const login = this.props.stateLogin;
    const mode = this.props.navigation.getParam('mode','add');

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

    let p = Promise.resolve();

    if(mode === 'add') {
      p = this.props.actions.addSupplier(json,offlineJson);
    } else if(mode === 'edit') {
      p = this.props.actions.editSupplier(json,offlineJson);      
    }

    p
    .then(()=>{
      return this.props.actions.getSuppliers();
    })
    .then(()=>{
      this.setState({show:'form'});
      this.props.navigation.navigate('SupplierListScreen');   
    })
    .catch(err=>{
      console.warn(err);
      this.setState({show:'form'});      
    });
  }

  handleRemove() {
    this.setState({show:'busy'});
    const idbuyeroffline = this.state.inputs[0].value;
    this.props.actions.removeSupplier({idbuyerofflineparam:idbuyeroffline})
    .then(()=>{
      return this.props.actions.getSuppliers();
    })
    .then(()=>{
      this.setState({show:'form'});
      this.props.navigation.goBack();   
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

  openCountry(index) {
    this.props.navigation.navigate('SupplierSelectScreen', {
      rows: ['INDONESIA'],
      onReturnSelect: (text) => this.setInput(index,text)
    });
  }

  openProvince(index) {
    const input = _.find(this.state.inputs,{key:'country_param'});
    const country = input.value;
    const rows = lib.getProvinces(country);
    this.props.navigation.navigate('SupplierSelectScreen', {
      rows: rows,
      onReturnSelect: (text) => this.setInput(index,text)
    });
  }

  openCity(index) {
    const input = _.find(this.state.inputs,{key:'province_param'});
    const province = input.value;
    const rows = lib.getCity(province);
    this.props.navigation.navigate('SupplierSelectScreen', {
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

    let bottom = (
      <View style={{flexDirection:'row'}}>
        <View style={{flex:1}}>
          <Button raised primary text={L('Save')} onPress={()=>this.handleSave()} />
        </View>
      </View>  
    );

    let title = L('ADD SUPPLIER');

    if(mode === 'edit') {
      title = L('EDIT SUPPLIER');
      bottom = (
        <View style={{flexDirection:'row'}}>
          <View style={{flex:1,padding:3}}>
            <Button raised primary text={L('Save')} onPress={()=>this.handleSave()} />
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