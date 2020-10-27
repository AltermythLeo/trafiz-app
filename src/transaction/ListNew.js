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
  TextInput,
  Dimensions
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

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('NEW BORROWER')} />
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
      index:'fisherman'
    }
  }

  componentDidMount() {
    this.setState({show:'list'});
  }

  handleSelect(msg,item) {

    const idmsuser = item.name ? item.idmsuser : item.idmsbuyer;
    const name = item.name ? item.name : item.name_param;
    const job = item.name ? L('FISHERMAN') : L('SUPPLIER');

    const data = {
      idmsuser:idmsuser,
      idfishermanoffline:item.idfishermanoffline,
      idbuyeroffline:item.idbuyeroffline,
      name:name,
      usertypename:job,
      items:[],
      estimateTotalLoan:0
    };

    this.props.navigation.push('TransactionAddItemScreen',{
      msg:msg,
      data:data
    });
  }

  renderItemFisherman(item,index) {
    const name = item.name;
    const msg = 'new-fisherman-add-item';
    // const temp = Alert.alert(
    //   'Temporary',
    //   'F');
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleSelect(msg,item)}>
        <View style={{padding:10,
          flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
          alignItems:'center'}}>
            <Text style={{flex:1,fontSize:20,fontWeight:'bold'}}>{name}</Text>
            <View style={{justifyContent:'center',alignItems:'center'}}>
              <FontAwesome name='arrow-right' />
            </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderItemSupplier(item,index) {
    console.warn(item);
    const name = item.name_param;
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleSelect('supplier',item)}>
        <View style={{padding:10,
          flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
          alignItems:'center'}}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{name}</Text>
            <View style={{flex:1}} />
            <View style={{justifyContent:'center',alignItems:'center'}}>
              <FontAwesome name='arrow-right' />
            </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderSupplier() {
    let suppliers = this.props.stateData.suppliers.slice();
    let rows = suppliers;
    _.remove(rows,{lasttransact:"D"});

    const sorted = rows.sort(function (a, b) {
      let nameA = a.name_param;
      if(nameA) nameA = nameA.toLowerCase();
      let nameB = b.name_param;
      if(nameB) nameB = nameB.toLowerCase();
      if (nameA < nameB)
        return -1;
      if (nameA > nameB)
        return 1;
      return 0;
    });

    // console.warn(rows);

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <FlatList
          data={sorted}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItemSupplier(item,index)}
        />
      </View>
    );
  }

  renderFisherman() {
    const fishermans = this.props.stateData.fishermans.slice();
    let rows = fishermans;
    _.remove(rows,{lasttransact:"D"});

    const sorted = rows.sort(function (a, b) {
      let nameA = a.name;
      if(nameA) nameA = nameA.toLowerCase();
      let nameB = b.name;
      if(nameB) nameB = nameB.toLowerCase();
      if (nameA < nameB)
        return -1;
      if (nameA > nameB)
        return 1;
      return 0;
    });

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <FlatList
          data={sorted}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItemFisherman(item,index)}
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

Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(Screen)

export default Screen;