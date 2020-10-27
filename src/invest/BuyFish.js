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
  Picker
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
import * as investActions from '../actions/InvestActions';
import DatePicker from 'react-native-datepicker';
import { MyDateBtn } from '../myCtl';
import moment from 'moment';
import BuyFishView from './views/BuyFishView';
import BusyView from './views/BusyView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const SqliteInvest = require('../SqliteInvest');
const UIHelper = require('./UIHelper');
const OldTrafizHelper = require('./OldTrafizHelper');
const SyncHelper = require('./SyncHelper');

class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('Buy Catch').toUpperCase()} size={lib.THEME_FONT_LARGE} />
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
      fishes:[],
      ships:[],
      errMsg:'',
      mapValue:'',
      selectedShip:'',
      initialData:null,
      editData:null
    }
    console.warn('Component Constructed');
  }

  componentDidMount() {
    console.warn('Component Mounted');
    const stateData = this.props.stateData;
    const stateSetting = this.props.stateSetting;
    const fishes = OldTrafizHelper.getFishes(stateData,stateSetting);
    const ships = this.props.stateData.ships;
    const defaultSelectedShip = OldTrafizHelper.getDefaultShipOfflineID(this.props.stateData);
    const buyFishOfflineID = this.props.navigation.getParam('buyFishOfflineID');

    if(buyFishOfflineID) {
      UIHelper.getBuyFishData(stateData,buyFishOfflineID)
        .then(data=>{
          console.warn(data);
          if(data.buyFish) {
            const initialData = {
              offlineID:data.buyFish.offlineID,
              catchOfflineID:data.buyFish.catchOfflineID,
              trxdate:data.buyFish.trxdate,
              ts:data.buyFish.ts,
              fishermanName:data.buyFish.fishermanname,
              portName:data.buyFish.portname,
              cashAmount:data.buyFish.amount+'',
              weight:data.buyFish.weightBeforeSplit+'',
              grade:data.buyFish.grade,
              selectedFish:data.buyFish.fishOfflineID,
              selectedShip:data.buyFish.shipOfflineID,
              purchaseDate:data.buyFish.purchaseDate,
              landingDate:data.buyFish.landingDate,
              portName:data.buyFish.portName
            }

            this.setState({
              show:'form',
              fishes:fishes,
              ships:ships,
              defaultSelectedShip:defaultSelectedShip,
              initialData:initialData,
              selectedShip:initialData.selectedShip,
              editData:data.buyFish,
              mapValue:data.buyFish.fishingground
            });
          } else {
            this.setState({
              show:'form',
              fishes,
              ships,
              defaultSelectedShip
            });            
          }
        })
    } else {
      this.setState({
        show:'form',
        fishes,
        ships,
        defaultSelectedShip
      });            
    }

    
  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    return (
      <BuyFishView 
        ships={this.props.stateData.ships}
        fishes={this.state.fishes}
        defaultSelectedShip={this.state.defaultSelectedShip}
        initialData={this.state.initialData}
        errMsg={this.state.errMsg}
        mapValue={this.state.mapValue}
        selectedShip={this.state.selectedShip}
        onClickButtonSave={(json, offlineID, catchOfflineID, trxdate, ts)=>this.saveBuyFishDataAndBack(json, offlineID, catchOfflineID, trxdate, ts)}
        onClickButtonSaveAndSell={(json)=>this.saveBuyFishDataAndSplit(json)}
        onOpenMap={()=>this.openMap()}
        onOpenShipSelect={()=>this.openShipSelect()}
      />
    );
  }

  openMap() {
    this.props.navigation.navigate('BuyFishMapScreen', {
      onMapReturn: (longitude,latitude,code) => {
        console.warn(code);
        this.setState({mapValue:code});
      }
    });
  }

  openShipSelect() {
    this.props.navigation.push('InvestVesselSelectScreen', {prevScreen:'BuyFish',
      onShipSelectReturn: (code) => {
        this.setState({selectedShip:code});
      }
    });
  }

  // saveBuyFishData(json) {
  //   const editData = this.state.editData;

  //   json.ts = moment().unix();
  //   if( editData ) json.ts = editData.ts;
  //   json.synch = 0;
  //   json.trxoperation = 'C';
  //   json.trxdate = moment().format('YYYY-MM-DD HH:mm:ss');
  //   json.idmssupplier = this.props.stateLogin.idmssupplier;
  //   json.idmsuser = this.props.stateLogin.idmsuser;
  //   json.notes = '';

  //   let p = Promise.resolve();

  //   if( !editData) {
  //     json.offlineID = lib.getOfflineId('buyfish',this.props.stateLogin.idmsuser);
  //     json.trxoperation = 'C';

  //     console.warn(json);

  //     p = OldTrafizHelper.createCatch(this.props.actions,this.props.stateLogin,this.props.stateData,json.fishermanName,json.fishingGround,json.portName,json.fishOfflineID,json.price,json.weight,json.grade)
  //       .then(result=>{
  //         json.catchOfflineID = result.catchOfflineID;
  //         json.fishCatchOfflineID = result.fishCatchOfflineID;
  //       });

  //   } else {
  //     json.offlineID = editData.offlineID;
  //     json.trxoperation = 'U';

  //     p = OldTrafizHelper.editCatch(this.props.actions,this.props.stateData,editData.catchOfflineID,json.fishermanName,json.fishingGround,json.portName,json.fishOfflineID,json.price,json.weight,json.grade)
  //       .then(result=>{
  //         json.catchOfflineID = editData.catchOfflineID;
  //         json.fishCatchOfflineID = editData.fishCatchOfflineID;
  //       });

  //   }

  //   const dateFilter = this.props.stateInvest.dateFilter;
  //   const offlineID = json.offlineID;

  //   return p
  //     .then(()=>{
  //       return SqliteInvest.upsertBuyFish(json.offlineID,json.catchOfflineID,json.fishCatchOfflineID,json.price,json.notes,json.ts,json.synch,json.trxoperation,json.trxdate,json.idmssupplier,json.idmsuser);
  //     })
  //     .then(()=>{
  //       return UIHelper.getAddExpenseDataByFilter(this.props.stateData,dateFilter)
  //     })
  //     .then(json=>{
  //       this.props.investActions.setAddExpenseData(json);
  //       return UIHelper.getHomeDataByFilter(this.props.stateData,dateFilter)
  //     })
  //     .then(json=>{
  //       this.props.investActions.setMainPageData(json);
  //       return offlineID;
  //     });  

  // }

  saveBuyFishDataAndSplit(json) {
    const weight = json.weight;
    let grade = json.grade;
    if(grade == 'A') grade = L('Good/Whole');
    else if(grade == 'C') grade = L('Reject');

    const fishOfflineID = json.fishOfflineID;

    const fishes = OldTrafizHelper.getFishes(this.props.stateData,this.props.stateSetting);
    const fish = _.find(fishes,{value:fishOfflineID});
    const fishLabel = fish.label+' '+weight+'KG '+grade;
    const fishBuyPrice = json.price;
    const fishWeight = weight;
    this.props.navigation.push('InvestSplitFishScreen',{
      title:L('Set Sell Price').toUpperCase(),
      buyFishJson:json,
      fishLabel,
      fishBuyPrice,
      fishWeight
    });
  }

  saveBuyFishDataAndBack(json, offlineID, catchOfflineID, trxDate, ts) {
    console.warn(trxDate);
    this.setState({show:'busy'});
    const dateFilter = this.props.stateInvest.dateFilter;

    return this.saveBuyFishData(json,1,offlineID, catchOfflineID, trxDate, ts)
      .then(()=>{
        console.warn("SaveBuyFishData OK");
        return SyncHelper.synchBuyFish(offlineID == null);
      })
      .then(()=>{
        console.warn("Sync Buy Fish OK");
        return UIHelper.getHomeDataByFilter(this.props.stateData,dateFilter)
      })
      .then(json=>{
        this.props.investActions.setMainPageData(json);
      })  
      .then(buyFishOfflineID=>{
        this.props.navigation.navigate('InvestHomeScreen');
      })
      .catch(err=>{
        console.warn(err);
      });
  }

  // copy paste from split fish
  saveBuyFishData(json,numSplit,_offlineID, _catchOfflineID, _trxdate, _ts) {
    let offlineID = _offlineID;
    if(offlineID == null)
      offlineID = lib.getOfflineId('buyfish',this.props.stateLogin.idmsuser);
    
    let catchOfflineID;
    const fishOfflineID = json.fishOfflineID;
    const shipOfflineID = json.shipOfflineID; // todo

    const fish = OldTrafizHelper.getFishByOfflineID(this.props.stateData,fishOfflineID);
    const species = fish.threea_code;
    const speciesEng = fish.english_name;
    const speciesIndo = fish.indname;

    const weightBeforeSplit = Number(json.weight);
    const grade = json.grade;
    let fishermanname = json.fishermanName;
    if(!fishermanname || fishermanname.length == 0) fishermanname = 'NOT SET';
    
    let fishingground = json.fishingGround;
    if(!fishingground || fishingground.length == 0) fishingground = 'NOT SET';

    const ship = OldTrafizHelper.getShipByOfflineID(this.props.stateData,shipOfflineID);
    const shipName = ship.vesselname_param;
    const shipGear = ship.vesselgeartype_param;

    let landingDate = json.landingDate; // todo
    if(!landingDate || landingDate.length == 0) landingDate = moment(lib.selectedDate).format('YYYY-MM-DD');

    let portName = json.portName;
    if(!portName || portName.length == 0) portName = 'NOT SET';

    const amount = Number(json.price);
    const notes = '';
    let   ts = moment(json.purchaseDate).unix();
    const synch = 0;
    let   trxoperation = 'C';
    let   trxdate;
    const idmssupplier = this.props.stateLogin.idmssupplier;
    const idmsuser = this.props.stateLogin.idmsuser;

    trxdate = moment(json.purchaseDate).format('YYYY-MM-DD HH:mm:ss');//moment().format('YYYY-MM-DD HH:mm:ss')
    // todo createCatch with split
    if(_offlineID == null)
    {
      console.warn("Creating New Catch Data");
      p = OldTrafizHelper.createCatchByShip(this.props.actions,this.props.stateLogin,this.props.stateData,fishermanname,fishingground,portName,fishOfflineID,shipOfflineID,amount,weightBeforeSplit,grade,numSplit)
        .then(result=>{
          catchOfflineID = result.catchOfflineID;
        });
      return p
        .then(()=>{
          return SqliteInvest.upsertBuyFish(offlineID,catchOfflineID,fishOfflineID,shipOfflineID,species,speciesEng,speciesIndo,weightBeforeSplit,grade,fishermanname,fishingground,shipName,shipGear,landingDate,portName,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser);
        })
        .then(()=>{
          return offlineID;
        })

    }else
    {
      console.warn("Updating New Catch Data", _trxdate);

      if(_trxdate != null && _trxdate != 'null' && _ts != null)
      {
        trxdate = _trxdate;
        ts = _ts;
      }

      trxoperation = json.remove ? 'D' : "U";
      catchOfflineID = _catchOfflineID;

      //should we edit catch data too?
      //yes

      p = OldTrafizHelper.editCatchByShip(this.props.actions,this.props.stateData,catchOfflineID, fishermanname,fishingground,portName,fishOfflineID,shipOfflineID,amount,weightBeforeSplit,grade)
      .then(result=>{
        if(!result) {
          console.warn('failed to edit catch, fish already delivered');
        }
      });

      return p
        .then(()=>{
          return SqliteInvest.upsertBuyFish(offlineID,catchOfflineID,fishOfflineID,shipOfflineID,species,speciesEng,speciesIndo,weightBeforeSplit,grade,fishermanname,fishingground,shipName,shipGear,landingDate,portName,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser);
        }) 
        .then(()=>{
          return offlineID;
        });
    }
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data,
    stateInvest: state.Invest,
    stateSetting: state.Setting
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
    investActions: bindActionCreators(investActions, dispatch)
  };
}

DetailScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailScreen)

export default DetailScreen;