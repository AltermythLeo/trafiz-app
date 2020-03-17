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
    const ref = this.props.navigation.getParam('deliverySheet');
    const dss = this.props.stateData.deliverySheets;
    const id = ref.batchId;
    const ds = Object.assign({},dss[id]);

    console.warn(ds);

    if( !ds.sender ) {
      this.setState({
        show:'busyUpdate',
        errMsg:null
      });
      
      return this.updateDeliverySheet(ds);
    }

    this.setState({
      show:'list'
    });
  }

  updateDeliverySheet(ds) {
    if(ds && ds.viewData) {
      const newDS = JSON.parse(JSON.stringify(ds));

      const login = this.props.stateLogin;
      const supplierPhone = login.profile.phonenumber;
      const supplierName = login.profile.name; 

      const fishermans = this.props.stateData.fishermans;
      const catches = this.props.stateData.catches;
      const fishes = this.props.stateData.fishes;
      const ships = this.props.stateData.ships;
      const catchRefs = {};
      const shipRefs = {};
      const fishRefs = {};
      const sender = {
        supplierName,
        supplierPhone
      };

      const fish = newDS.fishCatchData;
      for(let i=0;i<fish.length;i++) {
        const fc = fish[i];
        const idtrcatchoffline = fc.idtrcatchoffline;

        if(idtrcatchoffline && !catchRefs[idtrcatchoffline] ) {
          let c = _.find(catches,{idtrcatchoffline:idtrcatchoffline});
          c = Object.assign({},c);
          cRef = Object.assign({},c);
          if(cRef.fish) delete cRef.fish;

          // check fisherman fields in catch
          if(cRef.idfishermanoffline && !cRef.fishermanname2) {
            const fisherman = _.find(fishermans,{idfishermanoffline:cRef.idfishermanoffline});           
            cRef.fishermanname2 = fisherman.name;
            cRef.fishermanid = fisherman.id_param;
            cRef.fishermanregnumber = fisherman.fishermanregnumber;
            console.warn(cRef);
          }

          catchRefs[idtrcatchoffline] = cRef;

          const idfishoffline = c.idfishoffline;
          if( idfishoffline && !fishRefs[idfishoffline] ) {
            let fishData = _.find(fishes,{idfishoffline:idfishoffline});
            if(!fishData) {
              throw 'NO FISH';
            }
            fishData = Object.assign({},fishData);
            fishRefs[idfishoffline] = fishData;  
          }

          const idshipoffline = c.idshipoffline;
          if( idshipoffline && !shipRefs[idshipoffline] ) {
            let shipData = _.find(ships,{idshipoffline:idshipoffline});
            if(!shipData) {
              throw 'NO SHIP';
            }
            shipData = Object.assign({},shipData);
            shipRefs[idshipoffline] = shipData;  
          }
        }
      }

      newDS.sender = sender;
      newDS.catchRefs = catchRefs;
      newDS.shipRefs = shipRefs;
      newDS.fishRefs = fishRefs;

      const deliverySheetId = newDS.deliverySheetData.deliverySheetNo;
      const deliverySheetText = JSON.stringify(newDS);

      this.props.actions.updateDeliverySheetV2(deliverySheetId,deliverySheetText)
        // .then(()=>{
        //   return this.props.actions.getDeliveries();
        // })
        .then(()=>{
          this.setState({
            show:'list'
          });      
        })
        .catch(err=>{
          console.warn('failed to update delivery sheet');
          this.setState({
            show:'error',
            errMsg:L('DELIVERY SHEET CAN NOT BE UPDATED')
          });      
        });
  
    } else {
      this.setState({
        show:'error',
        errMsg:L('DELIVERY SHEET CAN NOT BE UPDATED')
      });      
    }

  }

  setPriceOnline() {
    const ds = this.props.navigation.getParam('deliverySheet');
    this.props.navigation.push('DeliveryPreCalcScreen',{
      ds:ds
    });

    // this.props.navigation.push('DeliveryCalcPriceScreen',{
    //   ds:ds
    // });
  }

  closeTransaction() {
  }

  renderCardItemClosed(data,index) {
    const line1 = data.idfish;
    const line2 = data.amount+' kg Grade '+data.grade;

    let info = null;
    if(data.modBy) {
      const txt = '['+data.modBy+']';
      info = <Text style={{fontSize:10}}>{txt.toUpperCase()}</Text>;
    }

    let line3 = null;
    // console.warn(data);
    if(data.catchDate) {
      const pd = data.catchDate;
      const name = data.fishermanName;
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
    
    //const fishes = viewData.gradeCodes;
    const fishes = fishCatchData.slice();
    const name = viewData.buyerName;
    let fishKind = viewData.fishNameEng.toUpperCase();

    const english = (this.props.stateSetting.language == 'english');
    if(!english) fishKind = viewData.fishNameInd.toUpperCase();

    const totalNum = viewData.numUnit;
    const totalWeight = viewData.totalWeight;
    const unitName = L('unit');

    const title = name+' ('+totalNum+' '+unitName+', '+totalWeight+' kg)';
    
    const totalPrice = viewData.sellPrice;
    const notes = viewData.notes;
    const calc = 'Rp '+lib.toPrice(totalPrice);    
    const space = <View style={{height:5}} />;

    let btnCalc = null;

    const accessrole = this.props.stateLogin.accessrole; 
    if(accessrole == '1' || accessrole == '2') {
      btnCalc = (
        <View>
          <Button raised text={L('Set Sell Price')} onPress={()=>this.setPriceOnline()} />
        </View>
      );
    }

    let info = null;
    if(viewData.modBy) {
      const txt = '['+viewData.modBy+']';
      info = <Text style={{fontSize:10}}>{txt.toUpperCase()}</Text>;
    }

    let errorIndicator = null;
    if( this.state.show === 'error' ) {
      const errMsg = this.state.errMsg;
      errorIndicator = (
        <View style={{backgroundColor:'red',padding:5}}>
          <Text style={{textAlign:'center',color:'white'}}>{errMsg.toUpperCase()}</Text>
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        {errorIndicator}
        <View style={{padding:10,backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
          <Text style={{fontWeight:'bold'}}>{title}</Text>
          {info}
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
          {btnCalc}
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
    
    if(this.state.show === 'busyUpdate') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
          <Text>{L('UPDATING DELIVERY SHEET')}</Text>
        </View>
      );
    }

    return this.renderView();
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