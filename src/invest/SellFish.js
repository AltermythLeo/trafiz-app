import React, { Component } from 'react';
import _ from 'lodash';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import moment from 'moment';
import SellFishView from './views/SellFishView';
import BusyView from './views/BusyView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const SqliteInvest = require('../SqliteInvest');
const UIHelper = require('./UIHelper');
const OldTrafizHelper = require('./OldTrafizHelper');

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
      fishLabel:'',
      fishBuyPrice:0,
      editData:null
    }
  }


  componentDidMount() {
    const stateData = this.props.stateData;
    const stateSetting = this.props.stateSetting;
    const buyFishOfflineID = this.props.navigation.getParam('buyFishOfflineID');

    // query sellfish with buyFishOfflineID
    // if no mean add, if yes mean edit 
    UIHelper.getSellFishData(stateData,buyFishOfflineID)
      .then(data=>{
        const sf = data.sellFish;
        let initialData = null;
        if(sf) initialData = {
          selectedNewUnit:sf.sellUnitName,
          numUnit:''+sf.numUnit,
          sellUnitPrice:''+sf.sellUnitPrice,      
        };
        
        this.setState({
          show:'form',
          catchOfflineID:data.buyFish.catchOfflineID,
          fishLabel:data.buyFish.labelValue,
          fishBuyPrice:data.buyFish.amount,
          editData:data.sellFish,
          initialData:initialData
        });
      })
  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    return (
      <SellFishView 
        fishLabel={this.state.fishLabel}
        fishBuyPrice={this.state.fishBuyPrice}
        initialData={this.state.initialData}
        onClickButtonSave={(json)=>this.saveSellFishData(json)}
      />
    );
  }

  saveSellFishData(json) {
    this.setState({show:'busy'});

    const editData = this.state.editData;
    
    let ts = moment().unix();
    if( editData ) ts = editData.ts;
    const synch = 0;
    const trxdate = moment().format('YYYY-MM-DD HH:mm:ss');
    const idmssupplier = this.props.stateLogin.idmssupplier;
    const idmsuser = this.props.stateLogin.idmsuser;
    const notes = '';
    const buyFishOfflineID = this.props.navigation.getParam('buyFishOfflineID');
    const catchOfflineID = this.state.catchOfflineID;

    let deliveryOfflineID = ''; // todo below
    const amount = json.sellingPrice;
    const sellUnitName = json.selectedNewUnit;
    const numUnit = json.numUnit;
    const sellUnitPrice = json.sellUnitPrice;
    let offlineID;
    let trxoperation = 'C';

    let p = Promise.resolve();

    if(editData) {
      offlineID = editData.offlineID;
      trxoperation = 'U';

      // todo edit delivery
      // p = OldTrafizHelper.editCatch(this.props.actions,this.props.stateData,item.catchOfflineID,json.fishermanName,json.fishingGround,json.portName,json.fishOfflineID,json.price,json.weight,json.grade)
      //   .then(result=>{
      //     json.catchOfflineID = item.catchOfflineID;
      //     json.fishCatchOfflineID = item.fishCatchOfflineID;
      //   });

    } else {
      offlineID = lib.getOfflineId('sellfish',this.props.stateLogin.idmsuser);
      trxoperation = 'C';

      p = this.createDelivery(catchOfflineID,amount,notes)
        .then(result=>{
          deliveryOfflineID = result;
        });
    }

    const dateFilter = this.props.stateInvest.dateFilter;

    return p
      .then(()=>{
        return SqliteInvest.upsertSellFish(offlineID,deliveryOfflineID,buyFishOfflineID,sellUnitName,numUnit,sellUnitPrice,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser);
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