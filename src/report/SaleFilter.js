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
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('SELECT FISHERMAN/SUPPLIER')} />
      ),

      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      show:'list',
      filter:''
    }
  }

  componentDidMount() {
  }

  handleSelect(item,isSupplier) {
    const nav = this.props.navigation;
    nav.goBack();
    nav.state.params.onReturnSelect(item,isSupplier);
  }

  renderItem(item,index,isSupplier) {
    const name = item;
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleSelect(item,isSupplier)}>
        <View style={{flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <View style={{flex:1,justifyContent:'center',alignItems:'flex-start',padding:10}}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderFisherman() {
    const nav = this.props.navigation;
    const rows = nav.state.params.rows1;
    let filteredRows = rows;

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <FlatList
          data={filteredRows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItem(item,index,false)}
        />
      </View>
    );
  }

  renderSupplier() {
    const nav = this.props.navigation;
    const rows = nav.state.params.rows2;
    let filteredRows = rows;

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <FlatList
          data={filteredRows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItem(item,index,true)}
        />
      </View>
    );
  }

  render() {
    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <ScrollableTabView>
        <View style={{flex:1}} tabLabel={L('FISHERMAN')}>{this.renderFisherman()}</View>
        <View style={{flex:1}} tabLabel={L('SUPPLIER')}>{this.renderSupplier()}</View>
      </ScrollableTabView>
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

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;