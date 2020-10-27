import React, { Component } from 'react';
import _ from 'lodash';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import moment from 'moment';
import SplitFishView from './views/SplitFishView';
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

    let title = L('Set Sell Price').toUpperCase();
    if(params.title) title = params.title;

    return {
      headerTitle: (
        <Title txt={title} size={lib.THEME_FONT_LARGE} />
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
      fishLabel:'',
      fishWeight:0,
      fishBuyPrice:0,
      readOnly:false
    }
  }


  componentDidMount() {
    const buyFishOfflineID = this.props.navigation.getParam('buyFishOfflineID');

    if(buyFishOfflineID) {
      const stateData = this.props.stateData;
      UIHelper.getSellFishData(stateData,buyFishOfflineID)
        .then(data=>{

      
          const sf = data.sellFish;
          const viewData = {
            selectedNewUnit:sf.sellUnitName,
            numUnit:''+sf.numUnit,
            sellUnitPrice:''+sf.sellUnitPrice,      
          };
          
          const fishes = OldTrafizHelper.getFishes(this.props.stateData,this.props.stateSetting);
          const fish = _.find(fishes,{value:sf.fishOfflineID});
          let grade = sf.grade;
          if(sf.grade == 'A') grade = L('Good/Whole');
          else if(sf.grade == 'C') grade = L('Reject');
          const fishLabel = fish.label+' '+sf.weightBeforeSplit+'KG '+grade;

          this.setState({
            show:'form',
            fishLabel:fishLabel,
            fishWeight:sf.weightBeforeSplit,
            fishBuyPrice:data.buyFish.amount,
            viewData:viewData
          });
        })
    } else {
      const buyFishJson = this.props.navigation.getParam('buyFishJson');
      const fishLabel = this.props.navigation.getParam('fishLabel');
      const fishBuyPrice = this.props.navigation.getParam('fishBuyPrice');
      const fishWeight = this.props.navigation.getParam('fishWeight');
  
      this.setState({
        show:'form',
        buyFishJson:buyFishJson,
        fishLabel:fishLabel,
        fishWeight:fishWeight,
        fishBuyPrice:fishBuyPrice
      });  
    }

  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    return (
      <SplitFishView 
        fishLabel={this.state.fishLabel}
        fishWeight={this.state.fishWeight}
        fishBuyPrice={this.state.fishBuyPrice}
        viewData={this.state.viewData}
        onClickButtonSave={(json)=>this.saveData(json)}
      />
    );
  }

  saveData(sellFishJson) {
    const numSplit = sellFishJson.numUnit;

    this.setState({
      sellFishJson,
      show:'busy',
    });
    lib.delay(10)
    .then(()=>{
      const buyFishJson = this.state.buyFishJson;
      return this.saveBuyFishData(buyFishJson,numSplit);
    })
    .then(buyFishOfflineID=>{
      const sellFishJson = this.state.sellFishJson;
      return this.saveSellFishData(buyFishOfflineID,sellFishJson);
    })
  }

  saveBuyFishData(json,numSplit) {
    const offlineID = lib.getOfflineId('buyfish',this.props.stateLogin.idmsuser);
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
    if(!landingDate || landingDate.length == 0) landingDate = moment().format('YYYY-MM-DD');

    let portName = json.portName;
    if(!portName || portName.length == 0) portName = 'NOT SET';

    const amount = Number(json.price);
    const notes = '';
    const ts = moment(json.purchaseDate).unix();
    const synch = 0;
    const trxoperation = 'C';
    const trxdate = moment(json.purchaseDate).format('YYYY-MM-DD HH:mm:ss');
    const idmssupplier = this.props.stateLogin.idmssupplier;
    const idmsuser = this.props.stateLogin.idmsuser;

    // todo createCatch with split
    p = OldTrafizHelper.createCatchByShip(this.props.actions,this.props.stateLogin,this.props.stateData,fishermanname,fishingground,portName,fishOfflineID,shipOfflineID,amount,weightBeforeSplit,grade,numSplit)
      .then(result=>{
        catchOfflineID = result.catchOfflineID;
      });


    const dateFilter = this.props.stateInvest.dateFilter;

    return p
      .then(()=>{
        return SqliteInvest.upsertBuyFish(offlineID,catchOfflineID,fishOfflineID,shipOfflineID,species,speciesEng,speciesIndo,weightBeforeSplit,grade,fishermanname,fishingground,shipName,shipGear,landingDate,portName,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser);
      })
      .then(()=>{
        return offlineID;
      })

  }


  saveSellFishData(buyFishOfflineID,json) {
    const numSplit = Number(json.numUnit);
    const buyFishJson = this.state.buyFishJson;
    const totWeight = Number(buyFishJson.weight); 

    let ts = moment().unix();
    const synch = 0;
    const trxdate = moment().format('YYYY-MM-DD HH:mm:ss');
    const idmssupplier = this.props.stateLogin.idmssupplier;
    const idmsuser = this.props.stateLogin.idmsuser;
    const notes = '';
    
    const deliveryOfflineID = ''; // todo below
    const amount = json.sellUnitPrice;
    const sellUnitName = json.selectedNewUnit;
    const numUnit = 1;
    const sellUnitPrice = json.sellUnitPrice;
    const trxoperation = 'C';
    const weightOnSplit = Math.floor(totWeight / numSplit);
    const sold = 0;
    const fishOfflineID = buyFishJson.fishOfflineID;
    
    let p = Promise.resolve();
    
    const rows = [];
    for(let i=0;i<numSplit;i++) {
      const index = '-'+i;
      const offlineID = lib.getOfflineId('splitfish',this.props.stateLogin.idmsuser)+index;
      rows.push({
        offlineID,deliveryOfflineID,buyFishOfflineID,sellUnitName,numUnit,sellUnitPrice,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,weightOnSplit,sold,fishOfflineID
      });

      // p = p.then(()=>{
      //   const index = '-'+i;
      //   const offlineID = lib.getOfflineId('splitfish',this.props.stateLogin.idmsuser)+index;
      //   return SqliteInvest.upsertSplitFish(offlineID,deliveryOfflineID,buyFishOfflineID,sellUnitName,numUnit,sellUnitPrice,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,weightOnSplit,sold,fishOfflineID);      
      // })
      // .then(()=>{
      //   return lib.delay(10);  
      // })
    }

    p = SqliteInvest.upsertManySplitFish(rows);
    
    const dateFilter = this.props.stateInvest.dateFilter;

    let delta = 0;
    let startT = moment().unix();
    return Promise.resolve()
      .then(()=>{
        return p;
      })
      .then(()=>{
        delta = moment().unix() - startT;
        startT = moment().unix();
        console.warn('delta1:'+delta);
        return SyncHelper.synchBuyFish();
      })
      .then(()=>{
        delta = moment().unix() - startT;
        startT = moment().unix();
        console.warn('delta2:'+delta);
        return SyncHelper.synchSplitFish();
      })
      .then(()=>{
        delta = moment().unix() - startT;
        startT = moment().unix();
        console.warn('delta3:'+delta);
        return UIHelper.getAddIncomeDataByFilter(this.props.stateData,dateFilter)
      })
      .then(json=>{
        this.props.investActions.setAddIncomeData(json);
        return UIHelper.getHomeDataByFilter(this.props.stateData,dateFilter)
      })
      .then(json=>{
        this.props.investActions.setMainPageData(json);
      })  
      .then(()=>{
        this.props.navigation.navigate('InvestHomeScreen');
      })
      .catch(err=>{
        console.warn(err);
      });
  

  }

  createDelivery(catchOfflineID,sellPrice,notes) {
    return new Promise((resolve,reject)=>{
      let batchDeliveryData;
      let deliveryOfflineID;

      OldTrafizHelper.createDefaultBatchDelivery(this.props.actions,this.props.stateLogin,this.props.stateData)
      .then(data=>{
        batchDeliveryData = data;
        return OldTrafizHelper.addFishToDefaultBatchDelivery(this.props.actions,this.props.stateLogin,this.props.stateData,catchOfflineID,batchDeliveryData);
      })
      .then(()=>{
        return OldTrafizHelper.closeDefaultBatchDelivery(this.props.actions,this.props.stateLogin,this.props.stateData,batchDeliveryData);
      })
      .then(deliverysheetOfflineID=>{
        deliveryOfflineID = deliverysheetOfflineID;
        return OldTrafizHelper.setPriceDefaultBatchDelivery(this.props.actions,this.props.stateLogin,this.props.stateData,deliverysheetOfflineID,sellPrice,notes);
      })
      .then(()=>{
        resolve(deliverysheetOfflineID);
      })
      .catch(err=>{
        console.warn('error!');
        resolve();
      })

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