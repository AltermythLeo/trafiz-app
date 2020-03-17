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
import { Navicon, BackButton, OnlineIndicator } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import moment from 'moment';

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
      show:'busy',
      index:'fisherman'
    }
  }

  componentDidMount() {
    const data = this.props.navigation.getParam('data');
    const login = this.props.stateLogin;

    const ref = {
      idtrcatchofflineparam:'idtrcatchoffline',
      idmssupplierparam:'idmssupplier',
      idfishermanofflineparam:'idfishermanoffline',
      idbuyerofflineparam:'idbuyeroffline',
      idshipofflineparam:'idshipoffline',
      idfishofflineparam:'idfishoffline',
      purchasedateparam:'purchasedate',
      purchasetimeparam:'purchasetime',
      catchorfarmedparam:'catchorfarmed',
      bycatchparam:'bycatch',
      fadusedparam:'fadused',
      purchaseuniquenoparam:'purchaseuniqueno',
      productformatlandingparam:'productformatlanding',
      unitmeasurementparam:'unitmeasurement',
      quantityparam:'quantity',
      weightparam:'weight',
      fishinggroundareaparam:'fishinggroundarea',
      purchaselocationparam:'purchaselocation',
      uniquetripidparam:'uniquetripid',
      datetimevesseldepartureparam:'datetimevesseldeparture',
      datetimevesselreturnparam:'datetimevesselreturn',
      portnameparam:'portname',
      priceperkgparam:'priceperkg',
      totalpriceparam:'totalprice',
      loanexpenseparam:'loanexpense',
      otherexpenseparam:'otherexpense',
      closeparam:'close',
      postdateparam:'postdate'
    }

    const json = {};
    for (let key in ref) {
      if (ref.hasOwnProperty(key)) {
        const val = ref[key];
        json[key] = data[val];
      }
    }

    const uid = login.id;
    const catchId = lib.getShortOfflineId('catch',uid.toString(36));

    const jsonNew = {
      idtrcatchofflineparam:catchId,
      //idmssupplierparam:'idmssupplier',
      idfishermanofflineparam:null,
      idbuyerofflineparam:null,
      //idshipofflineparam:'idshipoffline',
      //idfishofflineparam:'idfishoffline',
      purchasedateparam:moment().format('YYYY-MM-DD'),
      //purchasetimeparam:'purchasetime',
      // catchorfarmedparam:'catchorfarmed',
      // bycatchparam:'bycatch',
      // fadusedparam:'fadused',
      // purchaseuniquenoparam:'purchaseuniqueno',
      // productformatlandingparam:'productformatlanding',
      // unitmeasurementparam:'unitmeasurement',
      quantityparam:'0',
      weightparam:'0',
      // fishinggroundareaparam:'fishinggroundarea',
      // purchaselocationparam:'purchaselocation',
      // uniquetripidparam:'uniquetripid',
      // datetimevesseldepartureparam:'datetimevesseldeparture',
      // datetimevesselreturnparam:'datetimevesselreturn',
      // portnameparam:'portname',
      priceperkgparam:'0',
      totalpriceparam:'0',
      loanexpenseparam:'0',
      otherexpenseparam:'0',
      closeparam:'0',
      postdateparam:moment().format('YYYY-MM-DD')
    }

    const merge = Object.assign(json,jsonNew);
    console.warn(merge);
    this.setState({show:'list',json:merge});
  }

  handleSelectFisherman(item) {
    this.handleSave('fisherman',item);
  }

  handleSelectSupplier(item) {
    this.handleSave('supplier',item);
  }

  handleSave(source,item) {
    this.setState({show:'busy'});

    const json = this.state.json;

    const login = this.props.stateLogin;
    let p = Promise.resolve();

    let fishermanname = null;
    let buyersuppliername = null;

    if(source == 'fisherman') {
      fishermanname = item.name;  
      json['idfishermanofflineparam'] = item.idfishermanoffline;
    }

    if(source == 'supplier') {
      buyersuppliername = item.name_param;
      json['idbuyerofflineparam'] = item.idbuyeroffline;
    }

    const ships = this.props.stateData.ships;
    const ship = _.find(ships,{idshipoffline:json['idshipofflineparam']});
    const fishes = this.props.stateData.fishes;
    const fish = _.find(fishes,{idfishoffline:json['idfishofflineparam']});

    const suppliername = login.identity;
    const shipname = ship.vesselname_param;
    const englishname = fish.english_name;
    const indname = fish.indname;
    const threea_code = fish.threea_code;

    const offlineJson = {
      idtrcatchoffline:json['idtrcatchofflineparam'],
      idmssupplier:json['idmssupplierparam'],
      suppliername:suppliername,
      idfishermanoffline:json['idfishermanofflineparam'],
      idbuyeroffline:json['idbuyerofflineparam'],
      fishermanname:fishermanname,
      buyersuppliername:buyersuppliername,
      idshipoffline:json['idshipofflineparam'],
      shipname:shipname,
      idfishoffline:json['idfishofflineparam'],
      purchasedate:json['purchasedateparam'],
      purchasetime:json['purchasetimeparam'],
      catchorfarmed:json['catchorfarmedparam'],
      bycatch:json['bycatchparam'],
      fadused:json['fadusedparam'],
      purchaseuniqueno:json['purchaseuniquenoparam'],
      productformatlanding:json['productformatlandingparam'],
      unitmeasurement:json['unitmeasurementparam'],
      quantity:json['quantityparam'],
      weight:json['weightparam'],
      fishinggroundarea:json['fishinggroundareaparam'],
      purchaselocation:json['purchaselocationparam'],
      uniquetripid:json['uniquetripidparam'],
      datetimevesseldeparture:json['datetimevesseldepartureparam'], //2018-07-18 00:00:00
      datetimevesselreturn:json['datetimevesselreturnparam'], //2018-07-18 00:00:00
      portname:json['portnameparam'],
      englishname:englishname,
      indname:indname,
      threea_code:threea_code,
      priceperkg:json['priceperkgparam'],
      totalprice:json['totalpriceparam'],
      loanexpense:json['loanexpenseparam'],
      otherexpense:json['otherexpenseparam'],
      postdate:json['postdateparam'],
      fish:[]
    }

    p = this.props.actions.addCatchList(json,offlineJson);

    p
    .then(()=>{
      return this.props.actions.getCatchFishes();
    })
    .then(()=>{
      const catches = this.props.stateData.catches;
      const data = _.find(catches,{idtrcatchoffline:json['idtrcatchofflineparam']});
  
      this.props.navigation.replace('CatchCatchListScreen',{
        data:data
      });
    })
    .catch(err=>{
      console.warn(err);
      this.setState({show:'form'});      
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
    const rows = suppliers;
    // console.warn(rows);

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <FlatList
          data={rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => {
            return this.renderItemSupplier(item,index);
        }}/>
      </View>
    );
  }

  renderFisherman() {
    const fishermans = this.props.stateData.fishermans.slice();
    const rows = fishermans;
    // console.warn(rows);

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