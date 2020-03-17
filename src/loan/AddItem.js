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

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

const KINDS = [
  {kind:L('Others'),unit:L('UNIT')},
  {kind:L('Oil'),unit:L('GALLONS')},
  {kind:L('Ice'),unit:L('BLOCKS')},
  {kind:L('Cigarette'),unit:L('BOXES')},
  {kind:L('Food'),unit:L('PORTIONS')},
  {kind:L('Money'),unit:L('DOLLAR'),noEstimate:true},
];


class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('ADD LOAN')} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    const loanDate = moment().format('YYYY-MM-DD');
    this.state = {
      show:'busy',
      loanDate:loanDate,
      loanUnitAmount:'0',
      loanEstimatePrice:'0',
      
      loanUnitDefinition:'unit',
      loanTypeName:'',
      loanTypeId:'',

      errMsg:''
    }
  }

  componentDidMount() {
    const data = this.props.navigation.getParam('data',{});
    const searchTerm = {
      idmsuser:data.idmsuser,
      idfishermanoffline:data.idfishermanoffline,
      idbuyeroffline:data.idbuyeroffline
    };

    const user = _.find(this.props.stateData.loans,searchTerm);
    console.warn(user);
    console.warn(data);

    const mode = this.props.navigation.getParam('mode','add');
    if(mode == 'edit') {
      const edit = this.props.navigation.getParam('edit',{});
      const loanTypeId = edit.idmstypeitemloanofflineparam;
      const loantype = this.props.stateData.loantype;
      const loanTypeName = '';
      const loanUnitDefinition = '';
      if(loanTypeId) {
        const lt = _.find(loantype,{idmstypeitemloanoffline:loanTypeId});
        if(lt) {
          loanTypeName = lt.typename;
          loanUnitDefinition = lt.unit;
        }
      }

      return this.setState({
        show:'form',
        loanDate:edit.loanDate,
        loanUnitAmount:edit.unitparam ? edit.unitparam+'' : '0',
        loanEstimatePrice:edit.priceperunitparam ? edit.priceperunitparam+'' : '0',  
        loanUnitDefinition,
        loanTypeName,
        loanTypeId:edit.idmstypeitemloanofflineparam ? edit.idmstypeitemloanofflineparam : '',
      });
    }

    Promise.resolve()
    .then(result=>{
      this.setState({
        show:'form'
      });
    })
  }

  handleAdd() {
    return this.saveLoan()
      .then(ok=>{
        if(ok) {
          console.warn(this.props.stateData.loans);
          this.setState({
            show:'form',
            errMsg:'',
            // loanDate:moment().format('YYYY-MM-DD'),
            loanUnitAmount:'0',
            loanEstimatePrice:'0',
            loanUnitDefinition:'unit',
            loanTypeName:'',
            loanTypeId:'',
          });      
        }
      })
  }

  handleFinish() {
    return this.saveLoan()
    .then(ok=>{
      if(ok) {
        const msg = this.props.navigation.getParam('msg',null);
        if( msg === 'loanlistitem-to-additem' ) {
          return this.props.navigation.goBack();
        }
        this.props.navigation.navigate('Tab2');  
      }
    });
  }

  saveLoan() {
    const user = this.props.navigation.getParam('data',null);

    if(!user) {
      this.setState({
        show:'form',
        errMsg:L('Not allowed')
      });
      return Promise.resolve();
    }

    this.setState({
      show:'busy'
    });

    
    let estPrice = Number(this.state.loanEstimatePrice);
    let unitAmount = Number(this.state.loanUnitAmount);

    if(unitAmount === 0) {
      this.setState({
        show:'form',
        errMsg:L('Unit amount must be filled')
      });
      return Promise.resolve();
    }

    if(estPrice === 0) {
      this.setState({
        show:'form',
        errMsg:L('Estimated price / unit must be filled')
      });
      return Promise.resolve();
    }

    if(this.state.loanTypeName == '' ) {
      this.setState({
        show:'form',
        errMsg:L('Set item first')
      });
      return Promise.resolve();
    }

    if(this.state.loanDate.length == 0) {
      this.setState({
        show:'form',
        errMsg:L('Set loan date first')
      });
      return Promise.resolve();
    }

    const idmstypeitemloanofflineparam = this.state.loanTypeId;
    const unitparam = unitAmount;
    const priceperunitparam = estPrice;
    
    const desc = ''+this.state.loanTypeName+' '+unitAmount+' '+this.state.loanUnitDefinition;
    const total = unitAmount * estPrice;
    
    const login = this.props.stateLogin;
    const uid = Number(login.id);
    const loanId = lib.getShortOfflineId('L',uid.toString(36));
    
    const newItem = {
      idloanoffline:loanId,
      idtrloan:'offline'+moment().valueOf(),
      loanDate:this.state.loanDate,
      desc:desc,
      total:total,
      strike:false,

      idmstypeitemloanofflineparam:idmstypeitemloanofflineparam,
      unitparam:unitparam,
      priceperunitparam:priceperunitparam,

      idfishermanoffline:user.idfishermanoffline,
      idbuyeroffline:user.idbuyeroffline,
    }

    console.warn(user);
    return this.props.actions.loanAddItemForUser(user,newItem)
      .then(()=>{
        return this.props.actions.getLoans();
      })
      .then(()=>{
        return true;
      });
  }

  selectItem() {
    this.props.navigation.navigate('LoanSelectTypeScreen', {
      // onReturnSelect: (data) => this.setState({
      //   loanType:data,
      //   loanEstimatePrice:data.price
      // }) 
      onReturnSelect: (data) => {
        console.warn(data)
        this.setState({
          loanEstimatePrice:data.priceperunit+'',
          loanTypeName:data.typename,
          loanUnitDefinition:data.unit,
          loanTypeId:data.idmstypeitemloanoffline
        }) 
      } 
    });        
  }

  handleRemove() {
    const user = this.props.navigation.getParam('data',null);

    if(!user) {
      this.setState({
        show:'form',
        errMsg:L('Not allowed')
      });
      return Promise.resolve();
    }

    this.setState({
      show:'busy'
    });

    const edit = this.props.navigation.getParam('edit',{});
    const idloanoffline = edit.idloanoffline;
    
    return this.props.actions.loanRemoveItem(user,idloanoffline)
      .then(()=>{
        return this.props.actions.getLoans();
      })
      .then(()=>{
        this.props.navigation.goBack();
      });
  }

  handleSaveEdit() {
    const user = this.props.navigation.getParam('data',null);

    if(!user) {
      this.setState({
        show:'form',
        errMsg:L('Not allowed')
      });
      return Promise.resolve();
    }

    this.setState({
      show:'busy'
    });

    let estPrice = Number(this.state.loanEstimatePrice);
    let unitAmount = Number(this.state.loanUnitAmount);

    if(unitAmount === 0) {
      this.setState({
        show:'form',
        errMsg:L('Unit amount must be filled')
      });
      return Promise.resolve();
    }

    if(estPrice === 0) {
      this.setState({
        show:'form',
        errMsg:L('Estimated price / unit must be filled')
      });
      return Promise.resolve();
    }

    if(this.state.loanTypeName == '' ) {
      this.setState({
        show:'form',
        errMsg:L('Set item first')
      });
      return Promise.resolve();
    }

    if(this.state.loanDate.length == 0) {
      this.setState({
        show:'form',
        errMsg:L('Set loan date first')
      });
      return Promise.resolve();
    }

    const idmstypeitemloanofflineparam = this.state.loanTypeId;
    const unitparam = unitAmount;
    const priceperunitparam = estPrice;
    
    const desc = ''+this.state.loanTypeName+' '+unitAmount+' '+this.state.loanUnitDefinition;
    const total = unitAmount * estPrice;
    
    const login = this.props.stateLogin;
    const uid = Number(login.id);

    const edit = this.props.navigation.getParam('edit',{});
    const idloanoffline = edit.idloanoffline;
    const idtrloan = edit.idtrloan; 
    
    const newItem = {
      idloanoffline,
      idtrloan,
      loanDate:this.state.loanDate,
      desc:desc,
      total:total,
      strike:false,

      idmstypeitemloanofflineparam:idmstypeitemloanofflineparam,
      unitparam:unitparam,
      priceperunitparam:priceperunitparam,

      idfishermanoffline:edit.idfishermanoffline,
      idbuyeroffline:edit.idbuyeroffline,
    }

    return this.props.actions.loanUpdateItem(user,newItem)
      .then(()=>{
        return this.props.actions.getLoans();
      })
      .then(()=>{
        this.props.navigation.goBack();
      });
  }

  renderSelectItemKind() {
    const kind = this.state.loanTypeName;
    let str = L('SET ITEM');
    if(kind && kind.length > 0) str = kind.toUpperCase();

    return ( 
      <TouchableOpacity onPress={()=>this.selectItem()}>
        <Text style={{fontWeight:'bold',textAlign:'right'}}>{str}</Text>
      </TouchableOpacity>
    );
    // return (
    //   <Picker
    //     style={{flex:1}}
    //     selectedValue={kind}
    //     onValueChange={(item, idx) => this.setState({loanType:arr[idx]})}
    //   >
    //     {arr.map((obj,index)=>{
    //       return <Picker.Item key={index} label={obj.kind} value={obj.kind} />;
    //     })}
    //   </Picker>
    // );
  }

  renderForm() {
    let errorIndicator = null;
    if( this.state.errMsg.length > 0 ) {
      const errMsg = this.state.errMsg.toUpperCase();
      errorIndicator = (
        <View style={{backgroundColor:'red',padding:5}}>
          <Text style={{textAlign:'center',color:'white'}}>{errMsg}</Text>
        </View>
      );
    }

    const rowHeight = 68;
    let unitName = L('UNIT');
    if(this.state.loanUnitDefinition) unitName = this.state.loanUnitDefinition.toUpperCase();

    const unitAmount = this.state.loanUnitAmount.length > 0 ? Number(this.state.loanUnitAmount) : 0;
    let estPrice = this.state.loanEstimatePrice.length > 0 ? Number(this.state.loanEstimatePrice) : 0;
    let rowEstPrice = (
        <View style={{paddingHorizontal:10,height:rowHeight}}>
          <TextField
            keyboardType='numeric'
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({loanEstimatePrice:text})}
            value={this.state.loanEstimatePrice}
            label={L('Estimated price')+' / '+unitName}
          />
        </View>
      );

    const totalEstPrice = unitAmount * estPrice;

    return (
      <View style={{paddingVertical:10}}>
        <View style={{backgroundColor:'white',elevation:1}}>
          {errorIndicator}
          <View style={{paddingHorizontal:10,height:rowHeight,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <Text style={{}}>{L('Loan date:')}</Text>
            <MyDateBtn 
              maxDateNow={true}
              placeholder={L('SET DATE')}
              value={this.state.loanDate} onChangeDate={(str)=>this.setState({loanDate:str})} />
          </View>
          <View style={{paddingHorizontal:10,height:rowHeight,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <Text style={{}}>{L('Item kind:')}</Text>
            {this.renderSelectItemKind()}
          </View>
          <View style={{paddingHorizontal:10,height:rowHeight}}>
            <TextField
              keyboardType='number-pad'
              tintColor={lib.THEME_COLOR}
              onChangeText={(text) => this.setState({loanUnitAmount:text})}
              value={this.state.loanUnitAmount}
              label={L('Unit amount')+' ('+unitName+')'}
            />
          </View>
          {rowEstPrice}
          <View style={{height:34,borderBottomWidth:1,borderColor:'gainsboro'}} />
          <View style={{height:rowHeight,paddingHorizontal:10,flexDirection:'row',alignItems:'center'}}>
            <Text style={{}}>{L('Estimated loan value:')} </Text>
            <Text style={{fontWeight:'bold'}}>Rp {lib.toPrice(totalEstPrice)}</Text>
          </View>
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

    const msg = this.props.navigation.getParam('msg',{});
    const data = this.props.navigation.getParam('data',{});

    let name = data.name;
    const loans = this.props.stateData.loans;
    let job = null;
    let user = null;

    const searchTerm = {
      idmsuser:data.idmsuser,
      idfishermanoffline:data.idfishermanoffline,
      idbuyeroffline:data.idbuyeroffline
    };

    user = _.find(loans,searchTerm);
    job = data.usertypename;

    let totalItems = 0;
    let totalPrice = 0;

    if(user) {
      totalPrice = user.estimateTotalLoan;
      totalItems = user.items.length;
    }

    const mode = this.props.navigation.getParam('mode','add');
    let btns = null;

    if(mode == 'edit') {
      btns = (
        <View style={{flexDirection:'row',backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          <View style={{flex:1,padding:3}}>
            <Button raised primary text={L('Save')} onPress={()=>this.handleSaveEdit()} />
          </View>
          <View style={{flex:1,padding:3}}>
            <Button raised accent text={L('Remove')} onPress={()=>this.handleRemove()} />
          </View>
        </View>
      );  
    } else {
      btns = (
        <View style={{padding:0}}>
          <Button raised text={L('Next Loan')} onPress={()=>this.handleAdd()} />
          <Button raised primary text={L('Save')} onPress={()=>this.handleFinish()} />
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        <View style={{padding:10,backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
          <Text style={{fontWeight:'bold'}}>{name} ({job})</Text>
          <Text style={{}}>{totalItems} {L('item(s)')}, {L('estimated')} Rp {lib.toPrice(totalPrice)}</Text>
        </View>
        <ScrollView style={{flex:1}}>
          {this.renderForm()}
        </ScrollView>
        {btns}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data
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