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
import { Navicon, BackButton, OnlineIndicator } from '../Navicon';
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
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      show:'busy'
    }
  }

  componentDidMount() {
    const ref = this.props.navigation.getParam('data');
    const ref2 = this.props.navigation.getParam('data2');

    this.setState({
      catchId:ref.idtrcatchoffline,
      fishCatchId:ref2 ? ref2.idtrfishcatchoffline : null
    });

    lib.delay(1)
    .then(result=>{
      this.setState({show:'list'});
    });
  }

  handleSelect(item) {
    this.setState({show:'busy'});
    const catchId = this.state.catchId;
    const fishCatchId = this.state.fishCatchId;
    const buyerData = item;

    const catches = this.props.stateData.catches;
    let fishCatchBuyerNames = Object.assign({},this.props.stateData.fishCatchBuyerNames);
    const catchData = _.find(catches,{idtrcatchoffline:catchId});
    const fish = catchData.fish;

    const batchId = ''+buyerData.idbuyeroffline+''+catchId;
    const buyerId = buyerData.idbuyeroffline;
    const idmsbuyer = buyerData.idmsbuyer;
    const buyerName = buyerData.name_param;
    const compliance = [false,false,false];
    const speciesName = catchData.englishname;

    const batchDeliveryData = Object.assign({},this.props.stateData.batchDeliveryData);
    if(!batchDeliveryData[batchId]) batchDeliveryData[batchId] = {};
    batchDeliveryData[batchId].batchId = batchId;
    batchDeliveryData[batchId].speciesName = speciesName;
    batchDeliveryData[batchId].speciesNameIndo = catchData.indname;
    batchDeliveryData[batchId].buyerName = buyerName;
    batchDeliveryData[batchId].compliance = compliance;
    batchDeliveryData[batchId].buyerId = buyerId;
    batchDeliveryData[batchId].idmsbuyer = idmsbuyer;
    batchDeliveryData[batchId].notes = '';
    batchDeliveryData[batchId].totalPrice = 0;
    this.props.actions.setBatchDeliveryData(batchDeliveryData);

    let p = lib.delay(100);
    
    if(!fishCatchId) {
      for(let i=0;i<fish.length;i++) {
        if(!fish[i].idfish) continue;
        const fc = fish[i];
        const fishCatchId2 = fc.idtrfishcatchoffline;

        if(fishCatchBuyerNames[fishCatchId2] && fishCatchBuyerNames[fishCatchId2].close) continue;
        fishCatchBuyerNames[fishCatchId2] = {name:buyerName,close:false};
        
        const add = {
          batchId:batchId,
          catchId:catchId,
          fishCatchId:fishCatchId2,
          buyerId:buyerId,
          gradeCode:''+fc.amount+''+fc.grade,
          weight:Number(fc.amount)
        }
        this.props.actions.addReadyToDeliver(add);
      }

      this.props.actions.setFishCatchBuyerName(fishCatchBuyerNames);

    } else {
      fishCatchBuyerNames[fishCatchId] = {name:buyerName,close:false};
      this.props.actions.setFishCatchBuyerName(fishCatchBuyerNames);

      const fc = _.find(fish,{idtrfishcatchoffline:fishCatchId});
      const add = {
        batchId:batchId,
        catchId:catchId,
        fishCatchId:fishCatchId,
        buyerId:buyerId,
        gradeCode:''+fc.amount+''+fc.grade,
        weight:Number(fc.amount)
      }

      this.props.actions.addReadyToDeliver(add);  
    }
    
    p
    .then(()=>{
      return lib.delay(100);
    })
    .then(()=>{
      this.props.navigation.goBack();
    });
  }

  renderItem(item,index) {
    const name = item.name_param;

    return (
      <TouchableOpacity onPress={()=>this.handleSelect(item)}>
        <View style={{flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <View style={{flex:1,padding:10,justifyContent:'center'}}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderProcessor() {
    const rows = this.props.stateData.buyers;

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <FlatList
          data={rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItem(item,index)}
        />
      </View>
    );
  }

  renderOtherSupplier() {
    const rows = this.props.stateData.suppliers;

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <FlatList
          data={rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItem(item,index)}
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
        <View style={{flex:1}} tabLabel={L('BUYER')}>{this.renderProcessor()}</View>
        <View style={{flex:1}} tabLabel={L('SUPPLIER')}>{this.renderOtherSupplier()}</View>
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