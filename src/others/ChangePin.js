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
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';

const lib = require('../lib');
const TRAFIZ_URL = lib.TRAFIZ_URL;

const dictionary = require('../dictionary');
const L = dictionary.translate;

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('CHANGE PIN')} />
      ),
      headerLeft: (
        <Navicon navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      show:'form',
      oldpassword:'',
      password:'',
      password2:''
    }
  }

  handleChange() {
    this.setState({
      show:'busy'
    });
    const login = this.props.stateLogin;
    console.warn(login);

    const oldpassword = this.state.oldpassword+'';
    const pass = this.state.password+'';
    const pass2 = this.state.password2+'';

    if(oldpassword.length != 6) {
      return this.setState({
        show:'error',
        errMsg:L('Please enter current PIN')
      });
    }

    if(pass.length != 6 || pass !== pass2) {
      return this.setState({
        show:'error',
        errMsg:L('Please reenter your PIN (6 digits) again')
      });
    }

    const json = {
      id:login.id,
      oldpassword:oldpassword,
      newpassword:pass,
      retypenewpassword:pass2
    }

    const url = TRAFIZ_URL+'/_api/sup/resetpass';
    const p = axios.post(url,json)
      .then(result=>{
        if(result.status === 200 && result.data.err == 'ok') {
          const data = result.data;
          console.warn('success');

          const user = login.identity+'';
          return this.props.actions.loginUser(user,pass);
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
      this.setState({
        show:'form',
        oldpassword:'',
        password:'',
        password2:'',
        errMsg:''
      });
    })
    .catch(error=>{
      console.warn(error);
      const msg = L('Can not change PIN. Please try again later.');
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
      return (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:15}}>
          <Text style={{textAlign:'center'}}>L('PIN CHANGED SUCCESSFULLY')</Text>
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
    if( this.props.stateLogin.offline ) {
      netIndicator = (
        <View style={{backgroundColor:'red',padding:5}}>
          <Text style={{textAlign:'center',color:'white'}}>L('NO INTERNET CONNECTION')</Text>
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        {netIndicator}
        {errorIndicator}
        {this.renderForm()}
      </View>
    )
    
  }

  renderForm() {
    const disabled = (this.state.password.length != 6) || (this.props.stateLogin.offline);
    
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <ScrollView keyboardShouldPersistTaps={'always'} style={{flex:1,padding:10}}>
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({oldpassword:text})}
            value={this.state.oldpassword}
            secureTextEntry={true}
            maxLength={6}
            keyboardType='numeric'
            label={L('Enter current PIN')}
          />
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({password:text})}
            value={this.state.password}
            secureTextEntry={true}
            maxLength={6}
            keyboardType='numeric'
            label={L('Enter new PIN')}
          />
          <TextField
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({password2:text})}
            value={this.state.password2}
            secureTextEntry={true}
            maxLength={6}
            keyboardType='numeric'
            label={L('Retype new PIN')}
          />
        </ScrollView>
        <View style={{}}>
          <Button disabled={disabled} raised primary text={L('Change PIN')} onPress={()=>this.handleChange()} />
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

Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(Screen)

export default Screen;