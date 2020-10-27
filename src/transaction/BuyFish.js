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
  ScrollView,
  Picker
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
import { MyDateBtn } from '../myCtl';
import { MyPicker } from '../MyPicker';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('Expense').toUpperCase()} />
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
      errMsg:'',
      cashAmount:'Rp 0',
      weight:'0',
      grade:'0',
      selectedFish:'-1',
      selectedUnit:'0',
      selectedForm:'0',
      refreshing: false
    }
  }

  componentDidMount() {

    Promise.resolve()
    .then(result=>{
      this.setState({
        show:'form'
      });
    })
  }

  handleSave() {
    if(this.validateInput() === false)
    {
      return;
    }

    this.setState({show:'busy'});

    const arr = this.state.inputs;
    const json = {};

    const login = this.props.stateLogin;
    let p = Promise.resolve();

    let fishermanname = null;
    let buyersuppliername = null;

    if(json['idfishermanofflineparam']) {
      const fishermans = this.props.stateData.fishermans;
      const fisherman = _.find(fishermans,{idfishermanoffline:json['idfishermanofflineparam']});
      fishermanname = fisherman.name;  
    }

    if(json['idbuyerofflineparam']) {
      const suppliers = this.props.stateData.suppliers;
      const supplier = _.find(suppliers,{idbuyeroffline:json['idbuyerofflineparam']});
      buyersuppliername = supplier.name_param;
    }

    const fish   = this.props.stateData.fishes.find((element)=>{return element.threea_code===this.state.selectedFish});

    const suppliername = login.identity;
    const shipname = '';
    const englishname = fish.english_name;
    const indname = fish.indname;
    const threea_code = fish.threea_code;

    const offlineJson = {
      // idtrcatch
      idtrcatchoffline:json['idtrcatchofflineparam'],
      idmssupplier:json['idmssupplierparam'],
      suppliername:suppliername,
      idfishermanoffline:json['idfishermanofflineparam'],
      idbuyeroffline:json['idbuyerofflineparam'],
      //idmsfisherman
      //idmsuserfisherman
      //idmsbuyersupplier
      fishermanname:fishermanname,
      buyersuppliername:buyersuppliername,
      //idmsship
      idshipoffline:json['idshipofflineparam'],
      shipname:shipname,
      //idmsfish
      idfishoffline:json['idfishofflineparam'],
      purchasedate:json['purchasedateparam'],
      purchasetime:json['purchasetimeparam'],
      catchorfarmed:json['catchorfarmedparam'],
      bycatch:json['bycatchparam'],
      fadused:json['fadusedparam'],
      purchaseuniqueno:json['purchaseuniquenoparam'],
      productformatlanding:json['productformatlandingparam'],
      unitmeasurement:json['unitmeasurementparam'],
      quantity:json['quantityparam'],
      weight:json['weightparam'],
      fishinggroundarea:json['fishinggroundareaparam'],
      purchaselocation:json['purchaselocationparam'],
      uniquetripid:json['uniquetripidparam'],
      datetimevesseldeparture:json['datetimevesseldepartureparam'], //2018-07-18 00:00:00
      datetimevesselreturn:json['datetimevesselreturnparam'], //2018-07-18 00:00:00
      portname:json['portnameparam'],
      englishname:englishname,
      indname:indname,
      threea_code:threea_code,
      priceperkg:json['priceperkgparam'],
      totalprice:json['totalpriceparam'],
      loanexpense:json['loanexpenseparam'],
      otherexpense:json['otherexpenseparam'],
      // reqidnull:json[''],
      // requsnull:json[''],
      // reqeunull:json[''],
      // requsaidnull:json[''],
      postdate:json['postdateparam'],
      fishermanname2:json['fishermannameparam'],
      fishermanid:json['fishermanidparam'],
      fishermanregnumber:json['fishermanregnumberparam'],
      fish:[]
        // [{
        // "idtrfishcatch":"fcf3afbc8e6311e89cd1000d3aa384f1",
        // "idtrfishcatchoffline":"fishcatch-d51597cf802411e89cd1000d3aa384f1-1532342070830-1388",
        // "amount":100,
        // "grade":"AAA",
        // "description":"",
        // "idfish":"071F633W"
        // }]
    }

    p = this.props.actions.addCatchList(json,offlineJson);

    p
    .then(()=>{
      this.setState({show:'form'});
      // this.props.navigation.navigate('Tab1');   

      const catches = this.props.stateData.catches;
      const data = _.find(catches,{idtrcatchoffline:json['idtrcatchofflineparam']});
      this.props.navigation.goBack();
      return this.props.navigation.goBack();  
    })
    .catch(err=>{
      console.warn(err);
      this.setState({show:'form'});      
    });
  }

  validateInput()
  {
    let _errMsg = '';
    if(this.state.weight < 1)
      _errMsg = L('Please Set Weight Above 0 kg');
    if(this.state.grade < 1)
      _errMsg = L('Please Select Fish Grade');
    if(this.state.selectedFish ==='-1')
      _errMsg = L('Please Select Fish Species');
    if(lib.toNumber(this.state.cashAmount) < 1)
      _errMsg = L('Please Set Price Above Rp 0');
    
    this.setState({show:'form', errMsg:_errMsg});
    return _errMsg.length === 0;
  }

  handleSplit(item) {
    if(this.validateInput() === false)
    {
      return;
    }
    let fishData    = this.props.stateData.fishes.find((element)=>{return element.threea_code===item});
    fishData.weight = this.state.weight;
    fishData.grade  = this.state.grade;
    fishData.price  = this.state.cashAmount;
    fishData.unit   = (this.state.selectedUnit == '0' ? L('Whole') : L('Basket'));
    this.props.navigation.navigate('TransactionListSplitFish', {fishData});
  }

  saveTransaction() {
    const user = this.props.navigation.getParam('data',null);

    if(!user) {
      this.setState({
        show:'form',
        errMsg:L('Not allowed')
      });
      return Promise.resolve();
    }
  }

  handleSelectItem() {
    console.warn('Handle Item Selected');
  }


  handleEdit(data) {
    console.warn("TO DO:Handle Edit");
  }

 //TODO : RefreshList
  refreshList() {
  }

  onAmountChanged(num)
  {
    num = 'Rp ' + lib.toPrice(lib.toNumber(num));
    this.setState({cashAmount:num});
  }

  onWeightChanged(num)
  {
    num = num.replace(/^0+/, '')
    this.setState({weight:num});
  }

  onSelectGrade(item, index)
  {
    this.setState({grade:item});
    console.warn(item);
  }

  onSelectFish(item, index)
  {
    this.setState({selectedFish:item});
    console.warn(item);
  }

  onSelectForm(item, index)
  {
    this.setState({selectedForm:item});
    console.warn(item);
  }

  onSelectUnit(item, index)
  {
    this.setState({selectedUnit:item});
    console.warn(item);
  }

  render() {
    let errorIndicator = null;
    //Error Message
    if( this.state.errMsg.length > 0 ) {
      const errMsg = this.state.errMsg.toUpperCase();
      errorIndicator = (
        <View style={{backgroundColor:'red',padding:5}}>
          <Text style={{textAlign:'center',color:'white'}}>{errMsg}</Text>
        </View>
      );
    }

    //get data to show
    let rows = this.props.stateData.fishes.slice();
    _.remove(rows,{lasttransact:"D"});

    let sortedRows;
    const english = (this.props.stateSetting.language == 'english');

    if(english) 
      sortedRows = _.sortBy(rows, o => o.english_name);
    else 
      sortedRows = _.sortBy(rows, o => o.indname);

    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}

          <View style={{padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
            <Text style={{fontWeight:'bold'}}>{L('Expense Type') + ':'}</Text>
            <Text style={{padding:15}}>{L('Buy Catch').toUpperCase()}</Text>
          </View>
        </View>
        <View style={{flex:1}}>
            <ScrollView style={{backgroundColor:'white'}}>
                <View style={{height:70, padding:10, paddingTop:0, paddingBottom:30, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                  <TextField
                    tintColor={lib.THEME_COLOR}
                    value={this.state.cashAmount}
                    keyboardType='numeric'
                    onChangeText={(text) => this.onAmountChanged(text)}
                    label={L('Price')}
                  />
                </View>
                <View style={{height:70, padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <Text>{L('Fish Species Type')} </Text>
                    <Picker
                        style={{flex:1}}
                        placeHolder={L('<Choose Fish Species>')}
                        selectedValue={this.state.selectedFish}
                        onValueChange={(item, idx) => this.onSelectFish(item, idx)}
                    >
                      <Picker.Item label={L('<Choose Fish Species>')} value='-1'/>
                      {sortedRows.map((obj,index)=>{
                        if(this.props.stateSetting.language == 'english')
                            return <Picker.Item key={index} label={obj.english_name} value={obj.threea_code} />;
                        else
                            return <Picker.Item key={index} label={obj.indname} value={obj.threea_code} />;
                      })}
                    </Picker>
                </View>
                <View style={{height:70, padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <Text>{L('Product Form At Landing')} </Text>
                    <Picker
                        style={{flex:1}}
                        selectedValue={this.state.selectedForm}
                        onValueChange={(item, idx) => this.onSelectForm(item, idx)}
                    >
                        <Picker.Item label={L('Loin')} value='0' />
                        <Picker.Item label={L('Individual')} value='1' />
                    </Picker>
                </View>
                <View style={{height:70, padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <Text>{L('Unit Measurement')} </Text>
                    <Picker
                        style={{flex:1}}
                        selectedValue={this.state.selectedUnit}
                        onValueChange={(item, idx) => this.onSelectUnit(item, idx)}
                    >
                        <Picker.Item label={L('Whole')} value='0' />
                        <Picker.Item label={L('Basket')} value='1' />
                    </Picker>
                </View>
                <View style={{height:70, padding:10, paddingTop:0, paddingBottom:20, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <TextField
                      tintColor={lib.THEME_COLOR}
                      value={this.state.weight}
                      keyboardType='numeric'
                      onChangeText={(text) => this.onWeightChanged(text)}
                      label={L('Weight') + ' (kg)'}
                  />
                </View>
                <View style={{height:70, padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <Text>{L('Grade')} </Text>
                    <Picker
                        style={{flex:1}}
                        selectedValue={this.state.grade}
                        onValueChange={(item, idx) => this.onSelectGrade(item, idx)}
                    >
                        <Picker.Item label='-' value='0' />
                        <Picker.Item label='AAA' value='AAA' />
                        <Picker.Item label='AA'  value='AA' />
                        <Picker.Item label='A'   value='A' />
                        <Picker.Item label='B'   value='B' />
                        <Picker.Item label='C'   value='C' />
                        <Picker.Item label='CCC' value='CCC' />
                    </Picker>
                </View>
             </ScrollView>
          </View>
          <View style={{}}>
            <Button style={{container:{height:50}}} primary raised uppercase text={L('Save')}
              onPress={()=>this.handleSave()}></Button>
            <Button style={{container:{height:50}}}         raised uppercase text={L('Save And Split')}
              onPress={()=>this.handleSplit(this.state.selectedFish)}></Button>
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

Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(Screen)

export default Screen;