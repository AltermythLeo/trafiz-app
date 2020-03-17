import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput
} from 'react-native';
import _ from 'lodash';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator } from './Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions/AppActions';
import moment from 'moment';

const lib = require('./lib');
const L = require('./dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerLeft: (
        <BackButton navigation={navigation}/>
      ),
      headerRight: <View />
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      show:'warning',
      errMsg:''
    }
  }

  handleSynch() {
    if( !this.props.stateApp.connectionStatus ) {
      Alert.alert('Warning','Internet connection is required.');
      return;
    }

    this.props.actions.startSynch();

    this.setState({
      show:'synchronize'
    });

    this.props.actions.setOnlineAndSynch()
    .then(()=>{
      this.props.actions.endSynch();
      this.refreshData();
    })
    .catch(err=>{
      this.setState({
        errorData:err,
        show:'fatalError'
      });
      
      this.props.actions.endSynch();
    })

    // this.preSynchronize()
    //   .then(()=>{
    //     this.setState({
    //       show:'synchronize'
    //     });    
    //     return this.props.actions.startSynchronize();
    //   })
    //   .then(()=>{
    //     console.warn('synchronize done');
    //     this.props.actions.setSetting('lastLogin',moment().unix());
    //     return this.props.navigation.goBack();
    //   })
    //   .catch(err=>{
    //     console.warn(err);
    //     console.warn('synchronize fail');
    //     this.setState({
    //       show:'synchronizeFail'
    //     });
    //   });
  }

  refreshData() {
    this.setState({
      show:'synchronize'
    });

    this.props.actions.startSynchronize()
    .then(()=>{
      console.warn('synchronize done');
      this.props.actions.setSetting('lastLogin',moment().unix());
      return this.props.navigation.goBack();
    })
    .catch(err=>{
      console.warn(err);
      console.warn('synchronize fail');
      this.setState({
        show:'synchronizeFail'
      });
    });
  }

  handleReport() {
    const errorData = this.state.errorData;
    this.props.actions.sendSynchErrorByEmail(errorData);
  }

  // preSynchronize() {
  //   this.setState({
  //     show:'preSynchronize'
  //   });

  //   return new Promise((resolve,reject)=>{
  //     this.props.actions.setOnlineAndSynch()
  //     .then(()=>{
  //       resolve();
  //     })
  //     .catch(err=>{
  //       resolve();
  //     });
  //   });
  // }

  synchronize() {
    this.setState({
      show:'synchronize'
    });

    this.props.actions.startSynchronize()
    .then(()=>{
      console.warn('synchronize done');
      this.props.actions.setSetting('lastLogin',moment().unix());
      return this.props.navigation.goBack();
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
      const step = L('SYNCHRONIZING')+' ('+this.props.stateTask.steps+')';
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
          <Text>{step}</Text>
        </View>
      );
    }

    if(this.state.show === 'synchronizeFail') {
      const step = L('SYNCHRONIZING FAILED');
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <Text>{step}</Text>
          <Text />
          <Button raised primary text={L('Retry')} onPress={()=>this.refreshData()} />
        </View>
      );
    }

    if(this.state.show === 'fatalError') {
      return (
        <View style={{flex:1, justifyContent:'center',padding:10}}>
          <Text style={{textAlign:'center'}}>{L('SYNCHRONIZING FAILED')}</Text>
          <Text />
          <Text style={{textAlign:'center'}}>
            {L('PLEASE REPORT TO ADMIN VIA EMAIL. CLICK THE BUTTON BELOW')}
          </Text>
          <Text />
          <Button raised accent text={L('Report')} onPress={()=>this.handleReport()} />
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
          <Text style={{textAlign:'center',color:'white'}}>NO CONNECTION</Text>
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        {netIndicator}
        {errorIndicator}
        {this.renderWarning()}
      </View>
    )
    
  }

  debugTasks() {
    const tasks = this.props.stateTask.tasks.slice();

    for(let i=0;i<tasks.length;i++) {
      const ii = tasks.length - i - 1;
      if(tasks[ii].functionName == 'addcatchv3') {
        if(tasks[ii].param['idtrcatchofflineparam']) delete tasks[ii].param['idtrcatchofflineparam'];
        if(tasks[ii].param['idmssupplierparam']) delete tasks[ii].param['idmssupplierparam'];
        console.warn(tasks[ii].param);
        break;
      }
    }

    this.props.actions.setTasks(tasks);
    // console.warn(tasks);
  }

  renderWarning() {
    const styleBtn = {
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:lib.THEME_COLOR,
      padding:15,
      borderRadius:10
    };

    const msg = "Synchronization will last for minutes. Please don't close the app during the process. Run the synchronization now?";

    return (
      <View style={{flex:1,backgroundColor:'white',justifyContent:'center'}}>
        <View style={{padding:15,flex:1,alignItems:'center',justifyContent:'center'}} >
          <Text style={{textAlign:'center'}}>{L(msg)}</Text>
          <Text />
        </View>
        <Button raised primary text={L('Yes')} onPress={()=>this.handleSynch()} />
      </View>
    );
  }

}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data,
    stateSetting: state.Setting,
    stateTask: state.Task
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;

