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
import { Button , Checkbox} from 'react-native-material-ui';
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
        <Title txt={L('Pay Loan').toUpperCase()} />
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
      cashAmount:undefined,
      loanData:{},
      note:{},
      isfinal:false,
      refreshing: false
    }
    console.warn(props.navigation.state.params.loanData);
    this.state.loanData=props.navigation.state.params.loanData;
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
    if(lib.toNumber(this.state.cashAmount) < 1)
      this.setState({errMsg:L('Please Set Loan Amount Above Rp 0')});
            
    if(this.state.errMsg.length > 0) return;
    console.warn('SAVING');
  }

  handleOnFinalize()
  {
    this.setState({isfinal:!this.state.isfinal});
  }


 //TODO : RefreshList
  refreshList() {
  }

  onAmountChanged(item)
  {
    num = 'Rp ' + lib.toPrice(lib.toNumber(num));
    this.setState({cashAmount:item});
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

    loanText = lib.toPrice(this.state.loanData.estimateTotalLoan) + ' (' + this.state.loanData.name + ')';

    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}
          <View style={{padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
            <Text style={{fontWeight:'bold'}}>{L('Income Type') + ':'}</Text>
            <Text style={{padding:15}}>{L('Account Receivable Payment').toUpperCase()}</Text>
          </View>
        </View>
        <View style={{flex:1}}>
                <View style={{height:70, padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <Text style={{fontWeight:'bold'}}>{L('Loans')+':'} </Text>
                    <Text style={{padding:15}}>{loanText}</Text>
                </View>
                <View style={{height:70, padding:10, paddingTop:0, paddingBottom:20, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <TextField
                      tintColor={lib.THEME_COLOR}
                      value={this.state.cashAmount}
                      textAlignVertical='top'
                      keyboardType='numeric'
                      placeholder={L('<Set Payment Amount>')}
                      onChangeText={(text) => this.onAmountChanged(text)}
                      label={L('Loan Amount To Pay:')}
                  />
                </View>
                <View style={{height:70}}>
                  <View style={{flex:1, flexDirection:'row'}}>
                    <View style={{width:40}}>
                      <Checkbox checked={this.state.isfinal} onCheck={()=>this.handleOnFinalize()}/>
                    </View>
                    <View style={{width:10}} />
                    <View style={{flex:1,justifyContent:'center'}}>
                      <Text style={{fontWeight:'bold'}}>{L('Paid')} </Text>
                      <Text style={{}}>{L('With this payment, the loan is paid off')} </Text>
                    </View>
                  </View>
                </View>
          </View>
          <View style={{}}>
            <Button style={{container:{height:50}}} primary raised uppercase text={L('Save')}
              disabled={lockButtons}  onPress={()=>this.handleSave()}></Button>
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