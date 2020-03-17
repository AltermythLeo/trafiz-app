import React, { Component } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions/AppActions';
import { withNavigation } from 'react-navigation';

class Title extends Component {
  // synchronize() {
  //   this.props.navigation.push('SynchronizeScreen');
  // }

  render() {
    let txt = 'TRAFIZ';
    const offline = this.props.stateLogin.offline;
    const connection = this.props.stateApp.connectionStatus;
    if(this.props.txt) txt = this.props.txt;

    // if(offline && connection) {
    //   return (
    //     <View style={{flex:1}}>
    //       <Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>TRAFIZ</Text>
    //       <View style={{alignItems:'center',justifyContent:'center'}}>
    //         <TouchableOpacity onPress={()=>this.synchronize()} >
    //           <Text style={{textAlign:'center',fontSize:10,color:'white',fontWeight:'bold',backgroundColor:'green'}}> TAP TO SYNCHRONIZE </Text>
    //         </TouchableOpacity>
    //       </View>
    //     </View>        
    //   );
    // } else 
    
    if(offline) {
      return (
        <View style={{flex:1}}>
          <Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>{txt}</Text>
          <View style={{alignItems:'center',justifyContent:'center'}}>
            <Text style={{textAlign:'center',fontSize:10,color:'white',fontWeight:'bold',backgroundColor:'red'}}> OFFLINE MODE </Text>
          </View>
        </View>        
      );
    }

    return (
      <View style={{flex:1}}>
        <Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>{txt}</Text>
      </View>
    );
  }
}

class Navicon extends Component {
  toggleDrawer() {
    this.props.navigation.toggleDrawer();
  }

  render() {
    return (
      <TouchableOpacity style={{paddingLeft:10,paddingRight:40,paddingVertical:10}} onPress={()=>this.toggleDrawer()}>
        <FontAwesome name='navicon' size={25} color='white'/>
      </TouchableOpacity>
    );
  }
}

class BackButton extends Component {
  goBack() {
    this.props.navigation.goBack();
  }

  render() {
    return (
      <TouchableOpacity style={{paddingLeft:10,paddingRight:40,paddingVertical:10}} onPress={()=>this.goBack()}>
        <FontAwesome name='arrow-left' size={25} color='white'/>
      </TouchableOpacity>
    );
  }
}

// BackButton = withNavigation(BackButton);

class OnlineIndicator extends Component {
  synchronize() {
    this.props.navigation.navigate('SynchScreen');
  }
  
  render() {
    const offline = this.props.stateLogin.offline;
    const connection = this.props.stateApp.connectionStatus;

    if(offline && connection) {
      return (
        <TouchableOpacity style={{paddingRight:10,paddingLeft:40,paddingVertical:10}} onPress={()=>this.synchronize()}>
          <FontAwesome name='refresh' size={25} color='white'/>
        </TouchableOpacity>
      );
    }

    return null;
  }

  renderOri() {
    const status = this.props.stateApp.connectionStatus;
    const isSynching = this.props.stateApp.synching;
    let col = 'white';
    if(!status) col = 'red';
    let indicator = <FontAwesome name='signal' size={25} color={col} />;
    
    if(isSynching && status) {
      indicator = <FontAwesome name='refresh' size={25} color={col} />
    }

    return (
      <View style={{paddingHorizontal:10}}>
        <View style={{padding:0}}>
          {indicator}
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

OnlineIndicator = connect(
  mapStateToProps,
  mapDispatchToProps
)(OnlineIndicator);

OnlineIndicator = withNavigation(OnlineIndicator);

Title = connect(
  mapStateToProps,
  mapDispatchToProps
)(Title);

export { Navicon, BackButton, OnlineIndicator, Title };

