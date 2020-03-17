<CheckBox isChecked={true} />
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
  Picker,
  ScrollView
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
      show:'busy',
      fishName:'',
      numUnit:0,
      totalWeight:0,
      perKiloPrice:'0',
      buyPrice:'0',
      loanPaid:'0',
      loanExpense:'0',
      otherExpense:'0',
      unitName:'unit'
    }
  }

  componentDidMount() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});    

    const name = data.fishermanname;
    const shipName = data.shipname;
    let fishName = data.englishname.toUpperCase();
    const english = (this.props.stateSetting.language == 'english');
    if(!english) fishName = data.indname.toUpperCase();

    const fishingLocation = data.fishinggroundarea;

    const unitDef = [
      {label:'individual(s)',value:'1'},
      {label:'basket(s)',value:'0'}  
    ]

    let unitName =_.find(unitDef,{value:''+data.unitmeasurement});
    if(unitName) unitName = unitName.label; else unitName = 'unit';
    this.setState({unitName});

    const fishes = data.fish ? data.fish : [];
    let totalWeight = 0;
    let totalNum = 0;

    for(let i=0;i<fishes.length;i++) {
      const num = Number(fishes[i].amount);
      if(num > 0) {
        totalWeight += Number(fishes[i].amount);
        totalNum++;
      }
    }
    
    const space = <View style={{height:5}} />;
    const priceperkg = Number(data.priceperkg);
    const totalprice = Number(data.totalprice);
    const loanexpense = Number(data.loanexpense);
    const otherexpense = Number(data.otherexpense);
    const netBuyPrice = totalprice - loanexpense - otherexpense;

    const loans = this.props.stateData.loans;

    let pid = data.idmsuserfisherman;
    let loanIndex;
    loanIndex = _.findIndex(loans,{idmsuser:pid});

    this.setState({
      show:'form',
      fishName:fishName,
      numUnit:totalNum+'',
      totalWeight:totalWeight+'',
      perKiloPrice:priceperkg+'',
      buyPrice:totalprice+'',
      otherExpense:otherexpense+'',
      loanExpense:loanexpense+'',
      loanIndex:loanIndex
    });
    
  }

  updateValue(key,value) {
    const state = Object.assign({},this.state);
    state[key] = value;

    if(key == 'perKiloPrice') {
      const buyPrice = this.state.totalWeight * Number(value);
      return this.setState({
        perKiloPrice:value,
        buyPrice:buyPrice+''
      });
    }
    this.setState(state);
  }

  handleSave() {
    this.setState({show:'busy'});
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});    

    const refJson = {
      idtrcatchofflineparam:'idtrcatchoffline',
      idmssupplierparam:'idmssupplier',
      // idmsfishermanparam:'idmsfisherman',
      // idmsbuyersupplierparam:'',
      // idmsshipparam:'idmsship',
      // idmsfishparam:'idmsfish',
      idfishermanofflineparam:'idfishermanoffline',
      idbuyerofflineparam:'idbuyeroffline',
      idshipofflineparam:'idshipoffline',
      idfishofflineparam:'idfishoffline',
      purchasedateparam:'purchasedate',
      purchasetimeparam:'purchasetime',
      catchorfarmedparam:'catchorfarmed',
      bycatchparam:'bycatch',
      fadusedparam:'fadused',
      purchaseuniquenoparam:'purchaseuniqueno',
      productformatlandingparam:'productformatlanding',
      unitmeasurementparam:'unitmeasurement',
      quantityparam:'quantity',
      weightparam:'weight',
      fishinggroundareaparam:'fishinggroundarea',
      purchaselocationparam:'purchaselocation',
      uniquetripidparam:'uniquetripid',
      datetimevesseldepartureparam:'datetimevesseldeparture',
      datetimevesselreturnparam:'datetimevesselreturn',
      portnameparam:'portname',
      priceperkgparam:'priceperkg',
      totalpriceparam:'totalprice',
      loanexpenseparam:'loanexpense',
      otherexpenseparam:'otherexpense',
      postdateparam:'postdate',
      closeparam:'close'
    }

    const json = {};
    for(let key in refJson) {
      if (refJson.hasOwnProperty(key)) {
        const val = refJson[key];
        if(data[val]) json[key] = data[val];
        else json[key] = null;
      }
    }

    json['priceperkgparam'] = this.state.perKiloPrice;
    json['totalpriceparam'] = this.state.buyPrice;
    json['otherexpenseparam'] = this.state.otherExpense;
    json['loanexpenseparam'] = this.state.loanExpense;

    const offlineJson = {
      idtrcatchoffline:json['idtrcatchofflineparam'],
      priceperkg:json['priceperkgparam'],
      totalprice:json['totalpriceparam'],
      loanexpense:json['loanexpenseparam'],
      otherexpense:json['otherexpenseparam']
    }

    this.props.actions.editCatchList(json,offlineJson)   
    .then(()=>{
      return this.props.actions.getCatchFishes();
    })
    .then(()=>{
      this.setState({show:'form'});
      return this.props.navigation.goBack();
    })
    .catch(err=>{
      console.warn(err);
      this.setState({show:'form'});      
    });
  }

  onLoanExpenseEntered(amount) {
    this.setState({loanExpense:amount});
  }

  enterPaidAmount() {
    const loans = this.props.stateData.loans;
    const data = loans[this.state.loanIndex];
    this.props.navigation.push('LoanPayScreen',{
      data:data,
      backToCatch:true,
      onLoanExpenseEntered: (amount) => this.onLoanExpenseEntered(amount) 
    });
  }

  enterDetail() {
    const loans = this.props.stateData.loans;
    const data = loans[this.state.loanIndex];
    this.props.navigation.push('LoanListItemsScreen',{
      data:data
    });
  }

  renderCatchFishBuyPrice() {
    const fishName = this.state.fishName;
    const numUnit = this.state.numUnit;
    const totalWeight = this.state.totalWeight;

    return (
      <View style={{padding:10,backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
        <Text style={{fontWeight:'bold'}}>{fishName} ({numUnit} {this.state.unitName}, {totalWeight} kg)</Text>
        <Text />
        <View style={{height:64,justifyContent:'center'}}>
          <TextField
            keyboardType='numeric'
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.updateValue('perKiloPrice',text)}
            value={this.state.perKiloPrice}
            label={L('Price per kg')+' (Rp)'}
          />
        </View>
        <View style={{height:64,justifyContent:'center'}}>
          <TextField
            keyboardType='numeric'
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.updateValue('buyPrice',text)}
            value={this.state.buyPrice}
            label={L('Buy price')+' (Rp)'}
          />
        </View>
        <Text />
      </View>
    );
  }

  renderCalcResult(netBuyPrice) {
    return (
      <View style={{backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
        <View style={{height:64,padding:10,justifyContent:'center'}}>
          <TextField
            keyboardType='numeric'
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.updateValue('otherExpense',text)}
            value={this.state.otherExpense}
            label={L('Other expense')+' (Rp)'}
          />
        </View>
        <View style={{height:64,flexDirection:'row',padding:10,alignItems:'center'}}>
          <Text style={{}}>{L('Net buy price:')}</Text>
          <Text style={{flex:1,fontSize:24,fontWeight:'bold',textAlign:'right'}}>Rp {lib.toPrice(netBuyPrice)}</Text>
        </View>
      </View>
    );
  }

  renderLoanPanel(totalItems,totalPrice) {
    const disabled = (Number(totalItems) == 0);
    const loanExpenseDisabled = (Number(this.state.loanExpense) > 0);
    let btnDisabled = (disabled || loanExpenseDisabled);
    return (
      <View style={{backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
        <View style={{height:64,padding:10,justifyContent:'center',borderBottomWidth:0,borderColor:'gainsboro'}}>
          <TextField
            keyboardType='numeric'
            editable={false}
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.updateValue('loanExpense',text)}
            value={this.state.loanExpense}
            label={L('Loan payment')+' (Rp)'}
          />
        </View>
        <View style={{padding:10,flexDirection:'row',borderBottomWidth:1,borderColor:'gainsboro'}}>
          <View style={{flex:1}}>
            <Text style={{fontWeight:'bold'}}>{L('Loans')}</Text>
            <Text style={{}}>{totalItems} {L('item(s)')}, {L('estimated')} Rp {lib.toPrice(totalPrice)}</Text>
          </View>
          <View style={{}}>
            <Button disabled={disabled} style={{flex:1,container:{flex:1}}} raised primary text={L('Detail')} onPress={()=>this.enterDetail()} />
          </View>
        </View>
        <View style={{padding:10}} >
          <Button disabled={btnDisabled} raised primary text={L('Loan Payment Input')} onPress={()=>this.enterPaidAmount()} />
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

    const data = this.props.navigation.getParam('data');

    let totalItems = 0;
    let totalPrice = 0;

    const loans = this.props.stateData.loans;
    if(this.state.loanIndex >= 0) {
      const loanIndex = this.state.loanIndex;
      const loan = loans[loanIndex];
      totalPrice = loan.estimateTotalLoan ? loan.estimateTotalLoan : 0;
      totalItems = loan.items ? loan.items.length : 0;
    }

    const netBuyPrice = Number(this.state.buyPrice) - Number(this.state.otherExpense) - Number(this.state.loanExpense);

    return (
      <View style={{flex:1}}>
        <ScrollView keyboardShouldPersistTaps={'always'} style={{flex:1}}>
          {this.renderCatchFishBuyPrice()}
          <View style={{height:10}} />
          {this.renderLoanPanel(totalItems,totalPrice)}
          <View style={{height:10}} />
          {this.renderCalcResult(netBuyPrice)}
        </ScrollView>
        <Button raised primary text={L('Save')} onPress={()=>this.handleSave()} />
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