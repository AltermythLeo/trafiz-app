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
import moment from 'moment';
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
        <Title txt={L('SET SELL PRICE')+' (2/2)'} />
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
      totalPrice:'',
      notes:''
    }
  }

  componentDidMount() {
    let totalPrice = '0';
    let notes = '';

    const ds = this.props.navigation.getParam('ds');
    if(ds && ds.viewData) {
      const sellPrice = this.props.navigation.getParam('sellPrice',0);
      totalPrice = sellPrice ? sellPrice+'' : '';
      notes = ''+ds.viewData.notes;  
    } else {
      const ref = this.props.navigation.getParam('data');
      const sellPrice = this.props.navigation.getParam('sellPrice',0);
      const bd = this.props.stateData.batchDeliveries;
      const data = _.find(bd,{deliverysheetofflineid:ref.deliverysheetofflineid})
      totalPrice = sellPrice ? sellPrice+'' : '';
      notes = data.notes ? data.notes+'' : '';  
    }

    Promise.resolve()
    .then(result=>{
      this.setState({
        show:'form',
        totalPrice,
        notes
      });
    })
  }

  handleSave() {
    const fgs = this.props.navigation.getParam('fishGrades',[]);
    const idfish2price = {};
    for(let i=0;i<fgs.length;i++) {
      const idfish = fgs[i].name;
      const price = fgs[i].price;
      idfish2price[idfish] = price;
    }

    const totalPrice = this.state.totalPrice;
    const notes = this.state.notes;
    const login = this.props.stateLogin;
    let modBy = null;
    if(login.profile && login.profile.name) modBy = login.profile.name;

    const ds = this.props.navigation.getParam('ds');
    if(ds && ds.viewData) {
      this.setState({show:'busy'});
      const newDS = JSON.parse(JSON.stringify(ds));

      newDS.viewData.sellPrice = totalPrice;
      newDS.viewData.notes = notes;  
      newDS.viewData.modBy = modBy;  
      const fish = newDS.fishCatchData;
      for(let i=0;i<fish.length;i++) {
        const name = fish[i].idfish;
        const price = idfish2price[name] ? Number(idfish2price[name]) : 0;
        fish[i].sellPrice = price;
      }

      newDS.fishCatchData = fish;

      const deliverySheetId = newDS.deliverySheetData.deliverySheetNo;
      const deliverySheetText = JSON.stringify(newDS);
      const p = this.props.actions.updateDeliverySheetV2(deliverySheetId,deliverySheetText)
        .then(()=>{
          return this.props.actions.getDeliveries();
        })
        .then(()=>{
          this.props.navigation.goBack();          
        });
  
      return p;
    }

    this.setState({show:'busy'});
    const ref = this.props.navigation.getParam('data');
    const bds = this.props.stateData.batchDeliveries.slice();
    const index = _.findIndex(bds,{deliverysheetofflineid:ref.deliverysheetofflineid})
    bds[index].sellPrice = totalPrice;
    bds[index].notes = notes;
    const fish = bds[index].fish ? bds[index].fish : [];
    for(let i=0;i<fish.length;i++) {
      const name = fish[i].idfish;
      const price = idfish2price[name] ? Number(idfish2price[name]) : 0;
      fish[i].sellPrice = price;
    }
    bds[index].fish = fish;
    bds[index].modBy = modBy;

    this.props.actions.setBatchDeliveries(bds);

    this.props.actions.upsertBatchDeliveries()
    .then(()=>{
      this.props.navigation.goBack();   
    });
  }

  renderForm() {
    return (
      <View style={{flex:2,backgroundColor:'white',elevation:1,padding:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
        <View style={{}}>
          <Text> {L('Sell price:')} (Rp)</Text>
          <TextInput
            keyboardType={'numeric'}
            placeholder={L('Enter amount..')}
            value={this.state.totalPrice}
            onChangeText={ (text) => this.setState({totalPrice:text}) }
          />
        </View>
        <Text />
        <View style={{flex:1}}>
          <Text> {L('Notes:')}</Text>
          <TextInput
            placeholder={L('Write notes..')}
            multiline={true}
            value={this.state.notes}
            onChangeText={ (text) => this.setState({notes:text}) }
          />
        </View>
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
      <View style={{flex:1}}>
        {this.renderForm()}
        <View style={{flex:1}} />
        <Button raised primary text={L('Save')} onPress={()=>this.handleSave()} />
      </View>
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