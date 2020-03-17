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
import { Navicon, BackButton, OnlineIndicator } from '../Navicon';
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
    this.props.actions.cancelReadyToDeliver(data.fishCatchId);  
  }

  setPrice() {
    const batchId = this.props.navigation.getParam('batchId');
    this.props.navigation.push('DeliveryCalcPriceScreen',{
      batchId:batchId
    });
  }

  setPriceOnline() {
    const ds = this.props.navigation.getParam('deliverySheet');
    this.props.navigation.push('DeliveryCalcPriceScreen',{
      ds:ds
    });
  }

  closeTransaction() {
    const batchId = this.props.navigation.getParam('batchId');
    const bdd = this.props.stateData.batchDeliveryData[batchId];

    const totalPrice = bdd.totalPrice ? Number(bdd.totalPrice) : 0;

    // if(totalPrice == 0) {
    //   Alert.alert(L('Important'),L('Please set price first.'));
    //   return;
    // }

    this.props.navigation.push('DeliveryCloseScreen',{
      batchId:batchId
    });    
  }

  renderCardItem(data,index,closed) {

    const gradeCode = data.gradeCode;
    let btn = (
      <Button style={{flex:1,container:{flex:1,borderWidth:1,borderColor:'gainsboro'}}} 
        disabled = {closed}
        primary text={L('Delete')}
        onPress={()=>this.deleteOneDelivery(data)} />
    );

    if(closed) {
      btn = (
        <Button style={{flex:1,container:{flex:1,borderWidth:1,borderColor:'gainsboro'}}} 
          disabled = {closed}
          primary text={L('Closed')}
          onPress={()=>console.log('!')} />
      );
    }

    return (
      <View style={{backgroundColor:'white',elevation:1,padding:10,flexDirection:'row'}}>
        <View style={{flex:1,justifyContent:'center'}}>
          <TouchableOpacity onPress={()=>this.handleEditOneFish(data)}>
            <Text style={{fontWeight:'bold'}}>{gradeCode}</Text>
          </TouchableOpacity>
        </View>
        <View style={{paddingLeft:10}}>
          {btn}
        </View>
      </View>
    );
  }

  renderCardItemClosed(data,index) {
    return (
      <View style={{backgroundColor:'white',elevation:1,padding:10,flexDirection:'row'}}>
        <View style={{flex:1,justifyContent:'center'}}>
          <Text style={{fontWeight:'bold'}}>{data}</Text>
        </View>
        <View style={{paddingLeft:10}}>
        <Button style={{flex:1,container:{flex:1,borderWidth:1,borderColor:'gainsboro'}}} 
          disabled = {true}
          primary text={L('Closed')}
          onPress={()=>console.log('!')} />
        </View>
      </View>
    );
  }

  showDeliverySheet(ds,fishCatchData,vd) {
    if(!ds) {
      Alert.alert(L('Important'),L('Please close transaction first.'));
      return;
    }

    // const viewData = vd.length > 0 ? vd[0] : {};
    console.warn('vd:',vd);
    this.props.navigation.push('DeliverySheetScreen',{
      ds:ds,
      vd:vd,
      fishCatchData:fishCatchData,
    });    
  }

  renderView() {
    const ref = this.props.navigation.getParam('deliverySheet');
    const dss = this.props.stateData.deliverySheets;

    const id = ref.batchId;
    const ds = Object.assign({},dss[id]);
    
    const deliverySheet = ds.deliverySheetData;
    const fishCatchData = ds.fishCatchData;

    const viewData = ds.viewData;
    
    const fishes = viewData.gradeCodes;
    const name = viewData.buyerName;
    let fishKind = viewData.fishNameEng.toUpperCase();

    const english = (this.props.stateSetting.language == 'english');
    if(!english) fishKind = viewData.fishNameInd.toUpperCase();

    const totalNum = viewData.numUnit;
    const totalWeight = viewData.totalWeight;

    const title = name+' ('+fishKind+', '+totalNum+' unit, '+totalWeight+' kg)';
    const cData = viewData.compliance;
    const c1 = cData[0] ? {color:'blue'} : {color:'gray'};
    const c2 = cData[1] ? {color:'blue'} : {color:'gray'};
    const c3 = cData[2] ? {color:'blue'} : {color:'gray'};

    const compliance = (
      <View style={{flexDirection:'row',alignItems:'flex-end'}}>
        <Text style={c1}> ID</Text>
        <Text style={c2}> EU</Text>
        <Text style={c3}> US</Text>
      </View>
    );

    const totalPrice = viewData.sellPrice;
    const notes = viewData.notes;
    const calc = 'Rp '+lib.toPrice(totalPrice);    
    const space = <View style={{height:5}} />;

    return (
      <View style={{flex:1}}>
        <View style={{padding:10,flexDirection:'row',backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
          <View style={{flex:2}}><Text style={{fontWeight:'bold'}}>{title}</Text></View>
          <View style={{flex:1,alignItems:'flex-end'}}>{compliance}</View>
        </View>
        <FlatList
          data={fishes}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderCardItemClosed(item,index)}
          ItemSeparatorComponent={()=><View style={{height:10}} />}
        />
        <View style={{padding:10}}>
          <Text>{L('Sell price:')} <Text style={{fontWeight:'bold'}}>{calc}</Text></Text>
          <Text>{L('Notes:')} {notes}</Text>
        </View>
        <View style={{padding:10,backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          <Button raised primary text={L('DELIVERY SHEET')} onPress={()=>this.showDeliverySheet(deliverySheet,fishCatchData,viewData)} />
          {space}
          <Button raised accent text={L('Set Sell Price')} onPress={()=>this.setPriceOnline()} />
          {space}
          <Button disabled={true} raised primary text={L('Close Transaction')} onPress={()=>this.closeTransaction()} />
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

    const mode = this.props.navigation.getParam('mode','edit');
    if(mode == 'view') {
      return this.renderView();
    }

    const batchId = this.props.navigation.getParam('batchId');

    const dt = this.props.stateData.readyToDeliver;
    let rows = [];
    rows = _.groupBy(dt,(o)=>{
      return o["batchId"];
    });

    const fishes = rows[batchId] ? rows[batchId] : [];

    let totalWeight = 0;
    let totalNum = 0;

    for(let i=0;i<fishes.length;i++) {
      totalWeight += Number(fishes[i].weight);
      totalNum++;
    }
    
    const bdd = this.props.stateData.batchDeliveryData[batchId];
    const name = bdd.buyerName;
    let fishKind = bdd.speciesName.toUpperCase();
    const english = (this.props.stateSetting.language == 'english');
    if(!english) fishKind = bdd.speciesNameIndo.toUpperCase();

    const title = name+' ('+fishKind+', '+totalNum+' unit, '+totalWeight+' kg)';
    const cData = bdd.compliance;
    const c1 = cData[0] ? {color:'blue'} : {color:'gray'};
    const c2 = cData[1] ? {color:'blue'} : {color:'gray'};
    const c3 = cData[2] ? {color:'blue'} : {color:'gray'};

    const compliance = (
      <View style={{flexDirection:'row',alignItems:'flex-end'}}>
        <Text style={c1}> ID</Text>
        <Text style={c2}> EU</Text>
        <Text style={c3}> US</Text>
      </View>
    );

    let totalPrice = '0';
    let notes = '-';

    const batchDeliveryData = this.props.stateData.batchDeliveryData;
    if(bdd.totalPrice) totalPrice = bdd.totalPrice;
    if(bdd.notes) notes = bdd.notes;  

    let calc = L('NOT SET');
    if(Number(totalPrice) > 0) calc = 'Rp '+lib.toPrice(totalPrice);
    
    const closed = false; //bdd.close ? true : false;
    const space = <View style={{height:5}} />;
    const change = {
      fishes,
      bdd
    }

    const deliverySheet = bdd.deliverySheet;

    return (
      <View style={{flex:1}}>
        <View style={{padding:10,flexDirection:'row',backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
          <View style={{flex:2}}><Text style={{fontWeight:'bold'}}>{title}</Text></View>
          <View style={{flex:1,alignItems:'flex-end'}}>{compliance}</View>
        </View>
        <FlatList
          data={fishes}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderCardItem(item,index,closed)}
          extraData={change}
          ItemSeparatorComponent={()=><View style={{height:10}} />}
        />
        <View style={{padding:10}}>
          <Text>{L('Sell price:')} <Text style={{fontWeight:'bold'}}>{calc}</Text></Text>
          <Text>{L('Notes:')} {notes}</Text>
        </View>
        <View style={{padding:10,backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          <Button raised primary text={L('DELIVERY SHEET')} onPress={()=>this.showDeliverySheet(deliverySheet)} />
          {space}
          <Button disabled={closed} raised accent text={L('Set Sell Price')} onPress={()=>this.setPrice()} />
          {space}
          <Button disabled={closed} raised primary text={L('Close Transaction')} onPress={()=>this.closeTransaction()} />
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