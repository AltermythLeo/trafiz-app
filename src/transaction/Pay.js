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
  ScrollView
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

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('PAY LOAN')} />
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
      amount:'0',
      loanIndex:null,
      payloanDate:moment().format('YYYY-MM-DD')
    }
  }

  componentDidMount() {
    const backToCatch = this.props.navigation.getParam('backToCatch',false);
    const data = this.props.navigation.getParam('data',{});
    const loans = this.props.stateData.loans;
    let user = null;
    let loanIndex = null;

    const searchTerm = {
      idmsuser:data.idmsuser,
      idfishermanoffline:data.idfishermanoffline,
      idbuyeroffline:data.idbuyeroffline
    };
    user = _.find(loans,searchTerm);
    loanIndex = _.findIndex(loans,searchTerm);

    // const paidAmount = user.paidAmount ? user.paidAmount : '';

    Promise.resolve()
    .then(result=>{
      this.setState({
        show:'list',
        user:user,
        loanIndex:loanIndex,
        borrowerName:data.name
      });
    });    
  }

  componentWillUnmount() {
    // this.props.actions.loanUpdatePaidForUser(this.state.user,this.state.amount);
  }

  handleSave() {
    this.setState({
      show:'busy'
    });

    this.props.actions.loanUpdatePaidForUser(this.state.user,this.state.amount)
    .then(()=>{

      // amount entered must be shown in loan expense of tangkap ikan
      const nav = this.props.navigation;
      if(nav.state.params.onLoanExpenseEntered) {
        const amount = this.state.amount;
        nav.state.params.onLoanExpenseEntered(amount);
      }
      
      this.setState({
        show:'list',
        amount:'0'
      });
    })
  }

  handleNext() {
    let p = Promise.resolve();

    let onLoanExpenseEntered;
    if( Number(this.state.amount) > 0 ) {
      const nav = this.props.navigation;
      if(nav.state.params.onLoanExpenseEntered) {
        onLoanExpenseEntered = nav.state.params.onLoanExpenseEntered;
        console.warn('onLoanExpenseEntered !');
        // const amount = this.state.amount;
        // nav.state.params.onLoanExpenseEntered(amount);
      }
    }

    p.then(()=>{
      const backToCatch = this.props.navigation.getParam('backToCatch',false);
      const data = this.props.navigation.getParam('data',null);
      this.props.navigation.replace('LoanCheckItemsScreen',{
        data:data,
        backToCatch:backToCatch,
        payloanAmount:this.state.amount,
        payloanDate:this.state.payloanDate,
        onLoanExpenseEntered:onLoanExpenseEntered
      });  
    })

    // let p = Promise.resolve();

    // if( Number(this.state.amount) > 0 ) {
    //   this.setState({
    //     show:'busy'
    //   });
      
    //   p = this.props.actions.loanUpdatePaidForUser(this.state.user,this.state.amount,this.state.borrowerName)
    //     .then(()=>{
    //       return this.props.actions.getLoans();
    //     })
    //     .then(()=>{
    //       // amount entered must be shown in loan expense of tangkap ikan
    //       const nav = this.props.navigation;
    //       if(nav.state.params.onLoanExpenseEntered) {
    //         const amount = this.state.amount;
    //         nav.state.params.onLoanExpenseEntered(amount);
    //       }
          
    //       this.setState({
    //         show:'list',
    //         amount:'0'
    //       });
    //     });
    // }

    // // this.props.actions.loanUpdatePaidForUser(this.state.user,this.state.amount);
    // p.then(()=>{
    //   const backToCatch = this.props.navigation.getParam('backToCatch',false);
    //   const data = this.props.navigation.getParam('data',null);
    //   this.props.navigation.replace('LoanCheckItemsScreen',{
    //     data:data,
    //     backToCatch:backToCatch
    //   });  
    // })
  }

  renderForm() {
    const rowHeight = 68;
    // let amount = Number(this.state.amount);
    const loans = this.props.stateData.loans;
    const loan = loans[this.state.loanIndex];
    const estimateTotalLoan = Number(loan.estimateTotalLoan);
    // if(amount > estimateTotalLoan ) amount = estimateTotalLoan;

    return (
      <View>
        <View style={{paddingHorizontal:10,minHeight:rowHeight,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <Text style={{}}>{L('Pay loan date:')}</Text>
          <MyDateBtn 
            maxDateNow={true}
            placeholder={L('SET DATE')}
            value={this.state.payloanDate} onChangeDate={(str)=>this.setState({payloanDate:str})} />
        </View>
        <View style={{paddingHorizontal:10}}>
          <TextField
            keyboardType='numeric'
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setState({amount:text})}
            value={this.state.amount}
            label={L('Pay loan amount')+' (MAX Rp '+lib.toPrice(estimateTotalLoan)+')'}
          />
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

    const loans = this.props.stateData.loans;
    const loan = loans[this.state.loanIndex];
    const estimateTotalLoan = Number(loan.estimateTotalLoan);
    let disabled = false;
    if(Number(this.state.amount) > estimateTotalLoan ) disabled=true;

    return (
      <View style={{flex:1}}>
        <ScrollView style={{flex:1,backgroundColor:'white'}}>
          {this.renderForm()}
        </ScrollView>
        <View style={{padding:0}}>
          <Button raised primary text={L('Strike Items')} onPress={()=>this.handleNext()} />
        </View>
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