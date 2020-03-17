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
  Image
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions/AppActions';

const lib = require('./lib');
const bcrypt = require('react-native-bcrypt');
const L = require('./dictionary').translate;

function bcryptPassword(pass) {
  return new Promise((resolve,reject)=>{
    bcrypt.hash(pass, 8, function(err, hash) {
      if(!err) resolve(hash);
      else reject(err);
    });    
  });
}

function bcryptCompare(pass,hash) {
  return new Promise((resolve,reject)=>{
    bcrypt.compare(pass, hash, (err, res) => {
      if(!err && res) resolve(true);
      else resolve(false);
    });    
  });
}


class LoginCheckScreen extends React.Component {
  componentDidMount() {
    const login = this.props.stateLogin;
    const relogin = login.idmsuser;
    const lang = this.props.stateSetting.language;

    require('./dictionary').setLanguage(lang);

    setTimeout(()=>{
      this.props.navigation.navigate(relogin ? 'Relogin' : 'Login');
    },1000);
  }
  
  render() {
    // const img = 'http://192.168.100.23:3000/small.jpg';
    // <Image 
    // style={{width:100,height:100}}
    // source={{uri:img}} />

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
}

class ReloginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show:'busy',
      password:''
    }
  }

  componentDidMount() {
    let lastLogin = this.props.stateSetting.lastLogin;
    if(!lastLogin) lastLogin = 0;
    const diff = moment().unix() - lastLogin;
    // const offline = this.props.stateLogin.offline;

    if(diff < 3600) {
      if(this.props.stateLogin.accessrole == '1' )
        return this.props.navigation.navigate('HomeOwner');  

      this.props.navigation.navigate('Home');
    } else {
      this.setState({show:'login'});
    }
  }

  handleReset() {
    const warning = L('You have unsaved data. Synch now to prevent data loss. Continue resetting app will lose the unsaved data.');
    if(this.props.stateLogin.offline) {
      Alert.alert(
        L('Warning'),
        warning,
        [
          {text: L('Continue'), onPress: () => {
            this.confirmReset();
          }},
          {text: L('Cancel'), onPress: () => console.log('Cancel Pressed'), style: 'cancel'}
        ]
      )  
    } else {
      this.confirmReset();
    }
  }

  confirmReset() {
    this.props.actions.logoutUser();
    this.props.navigation.navigate('Login');
  }

  handleLogin() {
    this.setState({
      show:'busy'
    });

    const login = this.props.stateLogin;
    const pass = this.state.password+'';
    const hash = login.password;

    let compare = Promise.resolve(pass === login.password);

    //const compare = bcryptCompare(pass,hash)

    compare
    .then(result=>{
      if(!result) throw null;

      const offline = this.props.stateLogin.offline;
      console.warn('relogin!');
      const done = (this.props.stateSetting.synchStep == 8);
      this.props.actions.setSetting('lastLogin',moment().unix());
      if(!done && !offline) this.synchronize(true);
      else { 
        if(this.props.stateLogin.accessrole == '1' )
          return this.props.navigation.navigate('HomeOwner');  

        this.props.navigation.navigate('Home');  
      }
    })
    .catch(err=>{
      console.warn(err);
      const errMsg = L('INVALID PIN');

      return this.setState({
        show:'error',
        errMsg:errMsg
      });

      // Alert.alert('','PIN tidak tepat. Silahkan ulangi kembali.');
      // this.props.navigation.navigate('Login');
    });
  }

  synchronize(resume) {
    this.setState({
      show:'synchronize'
  	});

    this.props.actions.startSynchronize(resume)
    .then(()=>{
      console.warn('synchronize done');
      if(this.props.stateLogin.accessrole == '1' )
        return this.props.navigation.navigate('HomeOwner');  

      return this.props.navigation.navigate('Home');  
    })
    .catch(err=>{
      console.warn(err);
      console.warn('synchronize fail');
      this.setState({
        show:'synchronizeFail'
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

    if(this.state.show === 'synchronize') {
      const step = L('SYNCHRONIZING')+' ('+this.props.stateSetting.synchStep+'/8)';
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
          <Text>{step}</Text>
        </View>
      );
    }

    if(this.state.show === 'synchronizeFail') {
      const step = L('SYNCHRONIZING FAILED')+' ('+this.props.stateSetting.synchStep+'/8)';
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <Text>{step}</Text>
          <Text />
          <Button raised primary text={L('Retry')} onPress={()=>this.synchronize()} />
        </View>
      );
    }


    let errorIndicator = null;
    if( this.state.show === 'error' ) {
      const errMsg = this.state.errMsg;
      errorIndicator = (
        <View style={{backgroundColor:'red',padding:5}}>
          <Text style={{textAlign:'center',color:'white'}}>{errMsg}</Text>
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
        {this.renderLogin()}
      </View>
    )
    
  }

  renderLogin() {
    const styleBtn = {
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:lib.THEME_COLOR,
      padding:15,
      borderRadius:10
    };

    const s1 = Object.assign({},styleBtn,{flex:1});
    const s2 = Object.assign({},styleBtn,{flex:2});
    const disabled = (this.state.password.length != 6);

    const warning = L('Resetting this app will log you out and clear all of your cache. Only the unsaved data will be lost. The saved data is safe in our server. You will need internet connection to login again.');
    
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{flex:2,padding:10,alignItems:'center',justifyContent:'flex-end'}}>
          <Image style={{height:64}} resizeMode='contain' source={require('./logo.png')} />
        </View>
        <View style={{flex:3,padding:10}}>
          <View style={{backgroundColor:'white'}}>
            <TextField
              tintColor={lib.THEME_COLOR}
              onChangeText={(text) => this.setState({password:text})}
              value={this.state.password}
              secureTextEntry={true}
              maxLength={6}
              keyboardType='numeric'
              label={L('Enter your PIN')}
            />
            <View style={{height:10}} />
            <Button raised primary text={L('Login')} onPress={()=>this.handleLogin()} />
          </View>
        </View>
        <View style={{padding:10,backgroundColor:'white'}}>
          <View style={{padding:10}}>
            <Text style={{fontSize:10,textAlign:'center'}}>{warning}</Text>
          </View>
          <Button accent text={L('Reset App')} onPress={()=>this.handleReset()} />
        </View>
      </View>
    );
  }
}

class LoginScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      show:'login',
      username:'',
      password:'',
      errMsg:''
    }
  }

  handleRegister() {
    if( !this.props.stateApp.connectionStatus ) {
      Alert.alert('Warning','Internet connection is required to login.');
      return;
    }
    this.props.navigation.navigate('Register');
  }

  handleLogin() {
    if( !this.props.stateApp.connectionStatus ) {
      Alert.alert('Warning','Internet connection is required to login.');
      return;
    }

    const user = this.state.username+'';
    const pass = this.state.password+'';
    const compare = Promise.resolve(pass);
    //const compare = bcryptPassword(pass);
    
    if(user.length == 0 || pass.length < 6) {
      return this.setState({
        show:'error',
        errMsg:'INVALID PIN'
      });      
    }

    this.setState({
      show:'synchronize'
    });

    compare
    .then(hash =>{
      return this.props.actions.loginUser(user,hash);
    })
    .then(()=>{
      this.synchronize();
    })
    .catch(error=>{
      console.warn(error);
      const msgs = ['INVALID PIN','UNKNOWN SUPPLIER ID','NO SUCH USER AS SUPPLIER'];
      // todo
      this.setState({
        show:'error',
        errMsg:'INVALID PIN'
      });
    });
  }

  synchronize(resume) {
    this.setState({
      show:'synchronize'
    });

    this.props.actions.startSynchronize(resume)
    .then(()=>{
      console.warn('synchronize done');
      this.props.actions.setSetting('lastLogin',moment().unix());
      if(this.props.stateLogin.accessrole == '1' )
        return this.props.navigation.navigate('HomeOwner');  

      return this.props.navigation.navigate('Home');  
    })
    .catch(err=>{
      console.warn(err);
      console.warn('synchronize fail');
      this.setState({
        show:'synchronizeFail'
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

    if(this.state.show === 'synchronize') {
      const step = L('SYNCHRONIZING')+' ('+this.props.stateSetting.synchStep+'/8)';
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
          <Text>{step}</Text>
        </View>
      );
    }

    if(this.state.show === 'synchronizeFail') {
      const step = L('SYNCHRONIZING FAILED')+' ('+this.props.stateSetting.synchStep+'/8)';
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <Text>{step}</Text>
          <Text />
          <Button raised primary text={L('Retry')} onPress={()=>this.synchronize()} />
        </View>
      );
    }

    let errorIndicator = null;
    if( this.state.show === 'error' ) {
      const errMsg = this.state.errMsg;
      errorIndicator = (
        <View style={{backgroundColor:'red',padding:5}}>
          <Text style={{textAlign:'center',color:'white'}}>{errMsg}</Text>
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
        {this.renderLogin()}
      </View>
    )
    
  }

  renderLogin() {
    const styleBtn = {
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:lib.THEME_COLOR,
      padding:15,
      borderRadius:10
    };

    const s1 = Object.assign({},styleBtn,{flex:1});
    const s2 = Object.assign({},styleBtn,{flex:2});
    const disabledLogin = (this.state.password.length != 6);
    
    return (
      <View style={{flex:1,backgroundColor:'white',justifyContent:'center'}}>
        <View>
          <View style={{padding:10,alignItems:'center',justifyContent:'center'}}>
            <Image style={{height:64}} resizeMode='contain' source={require('./logo.png')} />
          </View>
          <View style={{padding:10}}>
            <TextField
              tintColor={lib.THEME_COLOR}
              onChangeText={(text) => this.setState({username:text})}
              value={this.state.username}
              label={L('Enter PHONE / SUPPLIER ID')}
            />
            <TextField
              tintColor={lib.THEME_COLOR}
              onChangeText={(text) => this.setState({password:text})}
              value={this.state.password}
              secureTextEntry={true}
              maxLength={6}
              keyboardType='numeric'
              label={L('Enter your PIN')}
            />
            <View style={{height:10}} />
            <View style={{flexDirection:'row'}}>
              <View style={{flex:1}}>
                <Button raised primary text={L('Register')} onPress={()=>this.handleRegister()} />
              </View>
              <View style={{width:10}} />
              <View style={{flex:2}}>
                <Button disabled={disabledLogin} raised primary text={L('Login')} onPress={()=>this.handleLogin()} />
              </View>
            </View>
          </View>
        </View>
      </View>
  	);
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateSetting: state.Setting,
    stateData: state.Data,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

LoginCheckScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginCheckScreen)

LoginScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginScreen)

ReloginScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ReloginScreen)

export { LoginCheckScreen, LoginScreen, ReloginScreen };