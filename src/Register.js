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
  Picker
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator, Title } from './Navicon';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions/AppActions';

const lib = require('./lib');
const TRAFIZ_URL = lib.TRAFIZ_URL;

const L = require('./dictionary').translate;

class RegisterScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerStyle: {
        backgroundColor: lib.THEME_COLOR,
      },
      headerTitle: (
        <Title />
      ),  
      headerLeft: (
        <BackButton navigation={navigation}/>
      ),
      headerRight: (
        <View />
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      show:'register',
      hp:'',
      name:'',
      supplierId:'',
      password:'',
      password2:'',
      gender:'1',
      address:'',
      province:'',
      city:'',
      district:'',
      businessLicense:'',
      supplierNationalCode:'',
      errMsg:'',
      countries:[],
      provinces:[],
      cities:[],
      country:'',
      province:'',
      city:''
    }
  }

  componentDidMount() {
    this.setState({
      countries:[
        {label:L('Not set'),value:''},
        {label:'INDONESIA',value:'INDONESIA'},
      ],
      provinces:[
        {label:L('Not set'),value:''}
      ],
      cities:[
        {label:L('Not set'),value:''}
      ],
    });
    // const provinces = lib.getProvinces('INDONESIA');
    // const provs = [];
    // const rows = lib.getCity(province);
  }


  handleRegisterOri() {
    this.setState({
      show:'busy'
    });

    lib.delay(1000)
    .then(()=>{
      this.setState({
        show:'temp'
      });
      
      return lib.delay(4000);
    })
    .then(res=>{
      this.props.navigation.goBack();
    })

  }

  setCountry(country) {
    const rows = lib.getProvinces(country);
    const provinces = [{label:L('Not set'),value:''}];
    for(let i=0;i<rows.length;i++) {
      provinces.push({label:rows[i],value:rows[i]});
    }
    this.setState({
      country:country,
      provinces:provinces
    });
  }

  setProvince(prov) {
    const rows = lib.getCity(prov);
    const cities = [{label:L('Not set'),value:''}];
    for(let i=0;i<rows.length;i++) {
      cities.push({label:rows[i],value:rows[i]});
    }

    this.setState({
      province:prov,
      cities:cities
    });
  }

  setCity(city) {
    this.setState({
      city:city
    });
  }


  handleRegister() {
    this.setState({
      show:'busy'
    });

    const name = this.state.name+'';
    const hp = this.state.hp+'';
    const supplierId = this.state.supplierId+'';
    const pass = this.state.password+'';
    const pass2 = this.state.password2+'';

    if(pass.length != 6 || pass !== pass2) {
      return this.setState({
        show:'error',
        errMsg:L('Please reenter your PIN (6 digits) again')
      });
    }

    if(this.state.name.length == 0) {
      return this.setState({
        show:'error',
        errMsg:L('Please enter your name')
      });
    }

    if(this.state.hp.length == 0) {
      return this.setState({
        show:'error',
        errMsg:L('Please enter your phone number')
      });
    }

    const json = {
      name:this.state.name,
      username:this.state.username,
      email:this.state.email,
      phonenumber:hp,
      supplierid:this.state.supplierid,
      password:pass,
      natidtype:this.state.nationalId,
      lang:this.state.lang,

      genre:this.state.gender,
      address:this.state.address,
      province:this.state.province,
      city:this.state.city,
      district:this.state.district,
      businesslicense:this.state.businessLicense,
      natidcode:this.state.supplierNationalCode
    }

    // $nameparam = htmlentities($request->name);
		// $usernameparam = htmlentities($request->username);
		// $emailparam =htmlentities($request->email);
		// $phonenumberparam = htmlentities($request->phonenumber);
		// $supplieridparam = htmlentities($request->supplierid);
		// $passwordparam = htmlentities($request->password);
		// $natidparamparam = htmlentities($request->natidtype);
    // $langparam = htmlentities($request->lang);

    // new api:
    // $nameparam = htmlentities($request->name);
		// $usernameparam = htmlentities($request->username);
		// $emailparam =htmlentities($request->email);
		// $phonenumberparam = htmlentities($request->phonenumber);
		// $supplieridparam = htmlentities($request->supplierid);
		// $passwordparam = htmlentities($request->password);
		// $natidparamparam = htmlentities($request->natidtype);
    // $langparam = htmlentities($request->lang);
    
		// $genreparam = htmlentities($request->genre);
		// $addressparam = htmlentities($request->address);
		// $cityparam = htmlentities($request->city);
		// $districtparam = htmlentities($request->district);
		// $provinceparam = htmlentities($request->province);
		// $businesslicenseparam = htmlentities($request->businesslicense);
    // $suppliernatcodeparam = htmlentities($request->natidcode);
    
    const url = TRAFIZ_URL+'/_api/sup/regis';
    const p = axios.post(url,json)
      .then(result=>{
        if(result.status === 200 && result.data) {
          const data = result.data;
          console.warn('success');
        } else {
          throw null;
        }
      });
    
    p
    .then(res=>{
      this.setState({
        show:'temp'
      });
      
      return lib.delay(4000);
    })
    .then(res=>{
      this.props.navigation.navigate('Login');
    })
    .catch(error=>{
      console.warn(error);
      const msg = L('Can not register user. Please retry later.');
      this.setState({
        show:'error',
        errMsg:msg.toUpperCase()
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

    if( this.state.show === 'temp' ) {
      // return (
      //   <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:15}}>
      //     <Text style={{textAlign:'center'}}>{L('THANK YOU FOR YOUR REGISTRATION')}</Text>
      //     <Text style={{textAlign:'center'}}>{L('OUR TEAM WILL REVIEW YOUR REGISTRATION FOR APPROVAL')}</Text>
      //   </View>
      // );

      return (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:15}}>
          <Text style={{textAlign:'center'}}>{L('Thank you for registering.')}</Text>
          <Text style={{textAlign:'center'}}>{L('Our team will verify your data. For further assistance, please check with your Contact Officer.')}</Text>
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

    let netIndicator = null;
    if( !this.props.stateApp.connectionStatus ) {
      netIndicator = (
        <View style={{backgroundColor:'red',padding:5}}>
          <Text style={{textAlign:'center',color:'white'}}>{L('NO INTERNET CONNECTION')}</Text>
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        {netIndicator}
        {errorIndicator}
        {this.renderRegister()}
      </View>
    )
    
  }

  renderRegister() {
    const countries = this.state.countries;
    const provinces = this.state.provinces;
    const cities = this.state.cities;

    let disableBtn = false;

    if(!disableBtn) disableBtn = (this.state.hp.length == 0);
    if(!disableBtn) disableBtn = (this.state.password.length < 6);
    if(!disableBtn) disableBtn = (this.state.password2.length < 6);
    if(!disableBtn) disableBtn = (this.state.name.length == 0);

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <ScrollView keyboardShouldPersistTaps={'always'} style={{flex:1,padding:10}}>
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({hp:text})}
            value={this.state.hp}
            label={L('Phone Number')+' '+L('(mandatory)')}
          />
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({password:text})}
            value={this.state.password}
            secureTextEntry={true}
            maxLength={6}
            keyboardType='numeric'
            label={L('Enter your PIN')+' '+L('(mandatory/6 digit)')}
          />
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({password2:text})}
            value={this.state.password2}
            secureTextEntry={true}
            maxLength={6}
            keyboardType='numeric'
            label={L('Retype your PIN')+' '+L('(mandatory/6 digit)')}
          />
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({name:text})}
            value={this.state.name}
            label={L('Name')+' '+L('(mandatory)')}
          />
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({supplierId:text})}
            value={this.state.nationalId}
            label={L('National ID')}
          />
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({email:text})}
            value={this.state.email}
            label={L('Email')}
          />
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({supplierId:text})}
            value={this.state.supplierId}
            label={L('Supplier ID (from government)')}
          />
          <View style={{flexDirection:'row',minHeight:64,alignItems:'center'}}>
          <Text>{L('Language')} </Text>
          <Picker
            style={{flex:1}}
            selectedValue={this.state.lang}
            onValueChange={(item, idx) => this.setState({lang:item})}
          >
            <Picker.Item label='Indonesia' value='ID' />
            <Picker.Item label='English' value='EN' />
          </Picker>
          </View>
          <View style={{flexDirection:'row',minHeight:64,alignItems:'center'}}>
            <Text>{L("Sex")}</Text>
            <Picker
              style={{flex:1}}
              selectedValue={this.state.gender}
              onValueChange={(item, idx) => this.setState({gender:item})}
            >
              <Picker.Item label={L('Male')} value='1' />
              <Picker.Item label={L('Female')} value='0' />
            </Picker>
          </View>
          <View style={{flexDirection:'row',minHeight:64,alignItems:'center'}}>
            <Text>{L("Country")}</Text>
            <Picker
              style={{flex:1}}
              selectedValue={this.state.country}
              onValueChange={(item, idx) => this.setCountry(item)}
            >
              {countries.map((obj,index)=>{
                return <Picker.Item key={index} label={obj.label} value={obj.value} />;
              })}
            </Picker>
          </View>
          <View style={{flexDirection:'row',minHeight:64,alignItems:'center'}}>
            <Text>{L("Province")}</Text>
            <Picker
              style={{flex:1}}
              selectedValue={this.state.province}
              onValueChange={(item, idx) => this.setProvince(item)}
            >
              {provinces.map((obj,index)=>{
                return <Picker.Item key={index} label={obj.label} value={obj.value} />;
              })}
            </Picker>
          </View>
          <View style={{flexDirection:'row',minHeight:64,alignItems:'center'}}>
            <Text>{L("City")}</Text>
            <Picker
              style={{flex:1}}
              selectedValue={this.state.city}
              onValueChange={(item, idx) => this.setCity(item)}
            >
              {cities.map((obj,index)=>{
                return <Picker.Item key={index} label={obj.label} value={obj.value} />;
              })}
            </Picker>
          </View>
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({address:text})}
            value={this.state.address}
            label={L('District')}
          />
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({address:text})}
            value={this.state.address}
            label={L('Address')}
          />
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({businessLicense:text})}
            value={this.state.businessLicense}
            label={L('Business License')}
          />
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({supplierNationalCode:text})}
            value={this.state.supplierNationalCode}
            label={L('Supplier National Code')}
          />
          <Text />
          <Text />
          <Text />
        </ScrollView>
        <View style={{}}>
          <Button disabled={disableBtn} raised primary text={L('Register')} onPress={()=>this.handleRegister()} />
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

RegisterScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(RegisterScreen)

export default RegisterScreen;