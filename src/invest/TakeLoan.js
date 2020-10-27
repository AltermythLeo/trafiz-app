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
import TakeLoanView from './views/TakeLoanView';
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
        <Title txt={L('Get Loan').toUpperCase()} size={lib.THEME_FONT_LARGE} />
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
      initialData:null,
      editData:null
    }
  }

  componentDidMount() {
    const stateData = this.props.stateData;
    const stateSetting = this.props.stateSetting;
    
    const takeLoanOfflineID = this.props.navigation.getParam('takeLoanOfflineID');

    if(takeLoanOfflineID) {
      UIHelper.getTakeLoanData(stateData,takeLoanOfflineID)
        .then(data=>{

          if(data.takeLoan) {
            const tl = data.takeLoan;
            const initialData = {
              offlineID     : tl.offlineID, //for later lookup
              trxdate       : tl.trxdate,   //to keep datetime  unchanged
              ts            : tl.ts,        //to keep timestamp unchanged
              notes:tl.notes,
              payperiod:tl.payperiod,
              tenor:tl.tenor+'',
              installment:tl.installment+'',
              amount:tl.amount+'',
              loaner:tl.creditor        
            }

            this.setState({
              show:'form',
              initialData:initialData,
              editData:data.takeLoan
            });
          } else {
            this.setState({
              show:'form'
            });            
          }
        })
    } else {
      this.setState({
        show:'form'
      });            
    }
  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    return (
      <TakeLoanView 
        initialData={this.state.initialData}
        onClickButtonSave={(json)=>this.saveTakeLoanAndBack(json)}
      />
    );
  }

  saveTakeLoan(json) {
    const editData = this.state.editData;

    let p = Promise.resolve();

/*    if( !editData) {
      json.offlineID = lib.getOfflineId('takeloan',this.props.stateLogin.idmsuser);
      json.trxoperation = 'C';

    } else {
      json.offlineID = editData.offlineID;
      json.trxoperation = 'U';
    }*/

    json.synch        = 0;
    json.idmssupplier = this.props.stateLogin.idmssupplier;
    json.idmsuser     = this.props.stateLogin.idmsuser;
    json.ts           = moment(json.trxdate).unix();
    json.trxdate      = moment(json.trxdate).format('YYYY-MM-DD HH:mm:ss');  

    //json has valid offlineID? \
    if(json.hasOwnProperty('offlineID') && json.offlineID != null && json.offlineID != 'null')
    {
      console.warn("Updating Take Loan Data");
      json.trxoperation = json.remove ? 'D' : 'U';
    }
    else
    {
      console.warn("Creating New Take Loan Data");
//      json.ts           = moment(json.trxdate).unix();
      json.trxoperation = 'C';
 //     json.trxdate      = moment(json.trxdate).format('YYYY-MM-DD HH:mm:ss');  
      json.offlineID    = lib.getOfflineId('takeloan',this.props.stateLogin.idmsuser);
    }
    
    const dateFilter = this.props.stateInvest.dateFilter;

    return p
      .then(()=>{
        const j = json;
        return SqliteInvest.upsertTakeLoan(j.offlineID,j.loaner,j.tenor,j.installment,j.payperiod,j.amount,j.notes,j.ts,j.synch,j.trxoperation,j.trxdate,j.idmssupplier,j.idmsuser);
      })
      .then(()=>{
        return SyncHelper.synchTakeLoan(json.trxoperation == 'C');
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
      });  

  }

  saveTakeLoanAndBack(json) {
    this.setState({show:'busy'});
    return this.saveTakeLoan(json)
      .then(()=>{
        this.props.navigation.navigate('InvestHomeScreen');
      })
      .catch(err=>{
        console.warn(err);
      });
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