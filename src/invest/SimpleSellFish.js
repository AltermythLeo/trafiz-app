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
import SimpleSellFishView from './views/SimpleSellFishView';
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
        <Title txt={L('Sell Catch').toUpperCase()} size={lib.THEME_FONT_LARGE} />
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
      viewOnly:false
    }
  }

  componentDidMount() {
    const stateData = this.props.stateData;
    const stateSetting = this.props.stateSetting;
    const fishes = OldTrafizHelper.getFishes(stateData,stateSetting);
    
    const simpleSellFishOfflineID = this.props.navigation.getParam('simpleSellFishOfflineID');

    if(simpleSellFishOfflineID) {
      console.warn('Got Simple Fish Offline ID ' + simpleSellFishOfflineID);
      SqliteInvest.getSimpleSellFish(simpleSellFishOfflineID)
      .then(row=>{
          if(row) //check if data exists in simplesellfish table (sell via form)
          {
            const viewData = 
            {
              isQuickSell   : false,
              offlineID     : row.offlineID, //for later look up in table
              trxdate       : row.trxdate,   //to keep datetime unchanged
              ts            : row.ts,        //to keep timestamp unchanged
              weight        : row.weight+'',
              grade         : row.grade,
              amount        : row.amount+'',
              fishOfflineID : row.fishOfflineID
            }
            this.setState({
              show:'form',
              fishes:fishes,
              viewData:viewData
            });
          }else
          {
            SqliteInvest.getSimpleSellFish(simpleSellFishOfflineID, true)
            .then(row=>{
              let weight;
              if(row.weight !== undefined)
                weight = row.weight;
              else
                weight = row.weightOnSplit;
              const viewData = 
                {
                    isQuickSell   : true, //getting quicksell data from splitfish
                    offlineID     : row.offlineID, //for later lookup
                    trxdate       : row.trxdate,   //to keep datetime  unchanged
                    ts            : row.ts,        //to keep timestamp unchanged
                    weight        : weight+'',
                    grade         : row.grade,
                    amount        : row.amount+'',
                    fishOfflineID : row.fishOfflineID
                }
                this.setState({
                    show:'form',
                    fishes:fishes,
                    viewData:viewData
                });
            })
          }
      })
    } else {
      this.setState({
        show:'form',
        fishes:fishes,
      });
    }
    
  }

  render() {
    if(this.state.show==='busy') return <BusyView />;
    return (
      <SimpleSellFishView 
        viewData={this.state.viewData}
        fishes={this.state.fishes}
        onClickButtonSave={(json)=>this.saveData(json)}
      />
    );
  }

  saveData(json) {
    this.setState({show:'busy'});
    let   offlineID;
    const isQuickSell   = json.isQuickSell;
    const fishOfflineID = json.fishOfflineID;
    const grade = json.grade;
    const weight = json.weight;
    const amount = json.price;
    const notes = '';
    let   ts = moment(json.trxdate).unix();
    const synch = 0;
    let   trxoperation = 'C';
    let   trxdate = moment(json.trxdate).format('YYYY-MM-DD HH:mm:ss');
    const idmssupplier = this.props.stateLogin.idmssupplier;
    const idmsuser = this.props.stateLogin.idmsuser;

    console.warn(json);

    //json has valid offlineID? \
    if(json.hasOwnProperty('offlineID') && json.offlineID != null && json.offlineID != 'null')
    {
      console.warn("Updating SellFish Data");
      offlineID = json.offlineID;
//      ts = json.ts;
//      trxdate = json.trxdate;
      json.trxoperation = json.remove ? 'D' : 'U';
    }
    else
    {
      console.warn("Creating New SellFish Data");
      offlineID = lib.getOfflineId('simplesellfish',this.props.stateLogin.idmsuser);
      json.trxoperation = 'C';
    }

    trxoperation = json.trxoperation;
    
    let p = Promise.resolve();


    const dateFilter = this.props.stateInvest.dateFilter;

    return p
      .then(()=>{
        return SqliteInvest.upsertSimpleSellFish(offlineID,fishOfflineID,grade,weight,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser, isQuickSell);
      })
      .then(()=>{
        if(isQuickSell)
          return SyncHelper.synchSplitFish(trxoperation == 'C'); //Only update timestamp if creating new data
        else
          return SyncHelper.synchSimpleSellFish(trxoperation == 'C'); //Only update timestamp if creating new data
      })
      .then(()=>{
        return UIHelper.getAddIncomeDataByFilter(this.props.stateData,dateFilter)
      })
      .then(json=>{
        this.props.investActions.setAddIncomeData(json);
        return UIHelper.getHomeDataByFilter(this.props.stateData,dateFilter)
      })
      .then(json=>{
        this.props.investActions.setMainPageData(json);
        this.props.navigation.navigate('InvestHomeScreen');
      })  

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