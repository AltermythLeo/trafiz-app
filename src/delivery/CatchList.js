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
  Dimensions,
  Alert
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
import CheckBox from 'react-native-check-box'

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('DELIVERY LIST')} />
      ),

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
    this.setState({
      show:'list'
    });

  }

  deleteOneDelivery(data) {
    this.setState({
      show:'busy'
    });

    const batchDeliveries = this.props.stateData.batchDeliveries.slice();
    const fishIdToDelivery = Object.assign({},this.props.stateData.fishIdToDelivery);

    // remove all selected from previous batch deliveries
    const fishId = data.idfish;

    const refId = fishIdToDelivery[fishId].id; // nameBuyer, close, id
    delete fishIdToDelivery[fishId];

    const index = _.findIndex(batchDeliveries,{deliverysheetofflineid:refId});
    if(index > -1) {
      let fish = batchDeliveries[index].fish;
      _.remove(fish,{idfish:fishId});
      batchDeliveries[index].fish = fish;
    }

    this.props.actions.setFishIdToDelivery(fishIdToDelivery);
    this.props.actions.setBatchDeliveries(batchDeliveries);

    return this.props.actions.upsertBatchDeliveries()
      .then(()=>{
        this.setState({
          show:'list'
        });
      });

  }

  setPrice() {
    const ref = this.props.navigation.getParam('data');
    // this.props.navigation.push('DeliveryCalcPriceScreen',{
    //   data:ref
    // });
    this.props.navigation.push('DeliveryPreCalcScreen',{
      data:ref
    });
  }

  closeTransaction() {
    const ref = this.props.navigation.getParam('data');
    this.props.navigation.replace('DeliveryCloseScreen',{
      data:ref
    });    
  }

  renderItem(data,index) {

    const line1 = data.idfish;
    const line2 = data.amount+' kg Grade '+data.grade;
    let btn = (
      <Button style={{flex:1,container:{flex:1,borderWidth:1,borderColor:'gainsboro'}}} 
        primary text={L('Delete')}
        onPress={()=>this.deleteOneDelivery(data)} />
    );

    let info = null;
    if(data.modBy) {
      const txt = '['+data.modBy+']';
      info = <Text style={{fontSize:10}}>{txt.toUpperCase()}</Text>;
    }

    let line3 = null;
    const idtrcatchoffline = data.idtrcatchoffline;
    const catches = this.props.stateData.catches;
    const ref = _.find(catches,{idtrcatchoffline:idtrcatchoffline});
    if(ref) {
      let name = ref.fishermanname;
      if(!name) name = ref.buyersuppliername;
      const pd = ref.purchasedate;
      line3 = <Text>{name}/{pd}</Text>
    }

    return (
      <View style={{backgroundColor:'white',elevation:1,padding:10,flexDirection:'row'}}>
        <View style={{flex:1,justifyContent:'center'}}>
          <Text style={{fontWeight:'bold'}}>{line1}</Text>
          <Text style={{}}>{line2}</Text>
          {line3}
          {info}
        </View>
        <View style={{paddingLeft:10}}>
          {btn}
        </View>
      </View>
    );
  }

  deleteDelivery(mayDelete) {
    this.setState({show:'busy'});
    const ref = this.props.navigation.getParam('data');
    this.props.actions.removeBatchDeliveries(ref.deliverysheetofflineid);
    this.props.actions.upsertBatchDeliveries()
    .then(()=>{
      this.setState({show:'list'});
    })
  }

  render() {
    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    const ref = this.props.navigation.getParam('data');

    const bd = this.props.stateData.batchDeliveries;
    const data = _.find(bd,{deliverysheetofflineid:ref.deliverysheetofflineid})

    if(!data) {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <Text>{L('DELETED')}</Text>
        </View>
      );      
    }
    
    let rows = data.fish;

    let totalWeight = 0;
    let numUnit = rows.length;

    for(let i=0;i<rows.length;i++) {
      totalWeight += Number(rows[i].amount);
    }

    const buyerName = data.buyerName;
    const english = (this.props.stateSetting.language == 'english');

    const unitName = L('unit'); 
    const title = buyerName+' ('+numUnit+' '+unitName+', '+totalWeight+' kg)';

    const calc = 'Rp '+lib.toPrice(data.sellPrice);
    const notes = data.notes;

    const disableClose = (numUnit == 0);
    let mayDelete = (numUnit == 0);

    let btnCalc = null;

    const accessrole = this.props.stateLogin.accessrole; 
    if(accessrole == '1' || accessrole == '2') {
      btnCalc = (
        <View>
          <Button raised text={L('Set Sell Price')} onPress={()=>this.setPrice()} />
          <View style={{height:5}} />
        </View>
      );
    }

    let info = null;
    if(data.modBy) {
      const txt = '['+data.modBy+']';
      info = <Text style={{fontSize:10}}>{txt.toUpperCase()}</Text>;
    }

    return (
      <View style={{flex:1}}>
        <View style={{padding:10,backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
          <Text style={{fontWeight:'bold'}}>{title}</Text>
          {info}
        </View>
        <FlatList
          data={rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItem(item,index)}
          ItemSeparatorComponent={()=><View style={{height:10}} />}
        />
        <View style={{padding:10}}>
          <Text>{L('Sell price:')} <Text style={{fontWeight:'bold'}}>{calc}</Text></Text>
          <Text>{L('Notes:')} {notes}</Text>
        </View>
        <View style={{padding:10,backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          <Button disabled={!mayDelete} raised accent text={L('DELETE')} onPress={()=>this.deleteDelivery()} />
          <View style={{height:5}} />
          {btnCalc}
          <Button disabled={disableClose} raised primary text={L('Close Transaction')} onPress={()=>this.closeTransaction()} />
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data,
    stateSetting: state.Setting
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