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
  Image,
  Picker,
  FlatList
} from 'react-native';
import _ from 'lodash';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { Avatar } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import DatePicker from 'react-native-datepicker';
import { MyDateBtn } from '../myCtl';
import moment from 'moment';

const lib = require('../lib');
const L = require('../dictionary').translate;
const ScrollableTabView = require('react-native-scrollable-tab-view');

class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('ADD DELIVERY')} />
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
      errMsg:''
    }
  }

  componentDidMount() {
    const login = this.props.stateLogin;
    console.warn(login.profile);
  }

  handleSelect(buyerData) {
    this.setState({show:'busy'});

    const login = this.props.stateLogin;
    const uid = Number(login.id);
    const id = lib.getShortOfflineId('ds',uid.toString(36));
    let modBy = null;
    if(login.profile && login.profile.name) modBy = login.profile.name;

    const data = {
      deliverysheetofflineid:id,
      buyerName:buyerData.name_param,
      buyerId:buyerData.idbuyeroffline,
      buyerSupplier:(buyerData.usertypename == "Supplier"),
      fish:[],
      sellPrice:0,
      notes:'',
      transportBy:null,
      transportName:null,
      transportReceipt:null,
      deliverDate:null,
      createdDate:moment().format('YYYY-MM-DD'),
      modBy
    }

    this.props.actions.addBatchDeliveries(data);

    this.props.actions.upsertBatchDeliveries()
    .then(()=>{
      this.props.navigation.goBack();   
    })
    .catch(err=>{
      console.warn('error!');
      console.warn(err);
      this.setState({show:'form',errMsg:L('Can not add delivery')});      
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
    let rows = this.props.stateData.buyers.slice();
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

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <FlatList
          data={sorted}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItem(item,index)}
        />
      </View>
    );
  }

  renderOtherSupplier() {
    let rows = this.props.stateData.suppliers.slice();
    _.remove(rows,{lasttransact:"D"});

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

    return this.renderProcessor();
    // return (
    //   <ScrollableTabView>
    //     <View style={{flex:1}} tabLabel={L('BUYER')}>{this.renderProcessor()}</View>
    //     <View style={{flex:1}} tabLabel={L('SUPPLIER')}>{this.renderOtherSupplier()}</View>
    //   </ScrollableTabView>
    // );
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

DetailScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailScreen)

export default DetailScreen;