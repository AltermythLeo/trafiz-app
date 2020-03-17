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

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('PROFILE')} />
      ),
      headerLeft: (
        <Navicon navigation={navigation}/>
      )
    };
  };

  // "id": "58",
  // "name": "testregisdariregis",
  // "username": "asdasdflk",
  // "email": "asdfasf@ajsdhfakjsdf",
  // "phonenumber": "12316352",
  // "supplierid": "a6s57a6s5d",
  // "password": "",
  // "natidtype": "ID",
  // "lang": "EN",
  // "genre": "0",
  // "address": "asdfasdf",
  // "city": "asdfa",
  // "district": "qwerqwer",
  // "province": "zVCzxcv",
  // "businesslicense": "qwerqwer",
  // "natidcode": "6172361317213123",
  // "supplieridexpiredate" : "2018-05-29"

  constructor(props) {
    super(props);
    this.state = {
      show:'busy',
      inputs:[
        {label:'offlineId',key:'id',value:'',disabled:true},
        {label:L('Name'),key:'name',value:'',mandatory:true,disabled:true},
        {label:L('Username'),key:'username',value:'',disabled:true},
        {label:L('Email'),key:'email',value:'',disabled:true},
        {label:L('Phone number'),key:'phonenumber',value:'',mandatory:true,disabled:true},
        {label:L('Supplier ID (from government)'),key:'supplierid',value:''},
        {label:L('Supplier ID expire date'),key:'supplieridexpiredate',value:'',ctl:'datepicker'},
        {label:L('Password'),key:'password',value:'',disabled:true},
        {label:L('natidtype'),key:'natidtype',value:'ID',disabled:true},
        {label:L('Language'),key:'lang',value:'ID',ctl:'picker',param:[
          {label:L('Indonesia'),value:'ID'},
          {label:L('English'),value:'EN'}
        ],disabled:true},
        {label:L('Sex'),key:'genre',value:'1',ctl:'picker',param:[
          {label:L('Male'),value:'1'},
          {label:L('Female'),value:'0'}
        ],disabled:true},
        {label:L('Business License'),key:'businesslicense',value:''},
        {label:L('Supplier National Code'),key:'natidcode',value:''},
        {label:L('Address'),key:'address',value:''},
        {label:L('Country'),key:'country',value:'',ctl:'country'},
        {label:L('Province'),key:'province',value:'',ctl:'province'},
        {label:L('City'),key:'city',value:'',ctl:'city'},
        {label:L('District'),key:'district',value:'',disabled:true},
      ],
      errMsg:''
    }
  }

  componentDidMount() {
    const login = this.props.stateLogin;

    const inputs = this.state.inputs.slice();
    inputs[0].value = login.idmssupplier;

    const ref = {
      id:"id",
      name:"name",
      username:"username",
      email:"email",
      phonenumber:"phonenumber",
      supplierid:"supplierid",
      //natidtype:"natidtype",
      lang:"lang",
      genre:"genre",
      address:"address",
      city:"city",
      district:"district",
      province:"province",
      businesslicense:"businesslicense",
      //natidcode:"natidcode",
      supplieridexpiredate:"supplieridexpiredlicensedate"
    }

    const profile = login.profile;

    for(let i=0;i<inputs.length;i++) {
      const inputKey = inputs[i].key;
      const profileKey = ref[inputKey];
      if( profile[profileKey] ) inputs[i].value = profile[profileKey];
    }

    this.setState({show:'form',inputs:inputs});
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

    if( login.offline ) {
      return this.setState({
        show:'error',
        errMsg:arr[i].label+L('Can not do on offline mode')
      });
    }
  
    let p = this.props.actions.editProfile(json);

    p
    .then(()=>{
      return this.props.actions.getProfile();
    })
    .then(()=>{
      this.setState({show:'form'});
    })
    .catch(err=>{
      console.warn(err);
      this.setState({
        show:'error',
        errMsg:arr[i].label+L('Unknown error')
      });
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
    this.props.navigation.navigate('ProfileSelectScreen', {
      rows: ['INDONESIA'],
      onReturnSelect: (text) => this.setInput(index,text)
    });
  }

  openProvince(index) {
    const input = _.find(this.state.inputs,{key:'country'});
    const country = input.value;
    const rows = lib.getProvinces(country);
    this.props.navigation.navigate('ProfileSelectScreen', {
      rows: rows,
      onReturnSelect: (text) => this.setInput(index,text)
    });
  }

  openCity(index) {
    const input = _.find(this.state.inputs,{key:'province'});
    const province = input.value;
    const rows = lib.getCity(province);
    this.props.navigation.navigate('ProfileSelectScreen', {
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

    let title = L('EDIT PROFILE');

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

Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(Screen)

export default Screen;