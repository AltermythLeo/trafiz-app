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
        <Title txt={L('CATCH SOURCE')} />
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

  handleSelectFisherman(item) {
    this.props.navigation.replace('CatchCreateDataScreen',{
      fisherman:item,
      supplier:this.state.selectedSupplier
    });
  }

  handleSelectSupplier(item) {
    // this.setState({
    //   show:'fisherman-only',
    //   selectedSupplier:item
    // });
    this.props.navigation.replace('CatchCreateDataScreen',{
      fisherman:null,
      supplier:item
    });
  }

  renderItemFisherman(item,index) {
    const name = item.name;
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleSelectFisherman(item)}>
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

  renderItemSupplier(item,index) {
    const name = item.name_param;
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleSelectSupplier(item)}>
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
    const suppliers = this.props.stateData.suppliers.slice();
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
          renderItem={({item,index}) => {
            return this.renderItemSupplier(item,index);
        }}/>
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

    // console.warn(rows);

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

  renderSupplierFisherman() {
    const fishermans = this.props.stateData.fishermans.slice();
    const rows = fishermans;

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <FlatList
          data={rows}
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

    if(this.state.show === 'fisherman-only') {
      const title = L('SUPPLIER') + '-' + L('FISHERMAN');
      return (
        <View style={{flex:1}}>
          <View style={{padding:15}}>
            <Text style={{textAlign:'center'}}>{title}</Text>
          </View>
          <View style={{flex:1}}>{this.renderFisherman()}</View>
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