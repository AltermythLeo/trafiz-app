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
        <Title txt={L('Get Loan').toUpperCase()} />
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
      loaner:undefined,
      tenor:{},
      instalment:{},
      periode:'daily',
      note:{},
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
    this.setState({errMsg:''});
    if(this.state.loaner === undefined || this.state.loaner.length == 0)
      this.setState({show:'form', errMsg:L('Please Set Loaner\'s Name')});
    if(this.state.tenor === undefined || this.state.tenor.length == 0)
      this.setState({show:'form', errMsg:L('Please Set Tenor Number')});
    if(this.state.instalment === undefined || this.state.instalment.length == 0)
      this.setState({show:'form', errMsg:L('Please Set Instalment Number')});
    if(lib.toNumber(this.state.cashAmount) < 1)
      this.setState({show:'form', errMsg:L('Please Set Loan Amount Above Rp 0')});

    if(this.state.errMsg.length > 0) return;
    console.warn('SAVING DATA');
  }


 //TODO : RefreshList
  refreshList() {
  }

  onAmountChanged(num)
  {
    num = 'Rp ' + lib.toPrice(lib.toNumber(num));
    this.setState({cashAmount:num});
  }

  onLoanerChanged(text)
  {
    this.setState({loaner:text});
  }

  onTenorChanged(obj)
  {
    this.setState({tenor:obj});
  }

  onInstalmentChanged(obj)
  {
    obj = lib.toPrice(lib.toNumber(obj));
    this.setState({instalment:obj});
  }

  onSelectPeriode(obj, index)
  {
    this.setState({periode:obj});
  }

  onNotesChanged(obj)
  {
    this.setState({note:obj});
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

    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}
          <View style={{padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
            <Text style={{fontWeight:'bold'}}>{L('Income Type') + ':'}</Text>
            <Text style={{padding:15}}>{L('Get Loan')}</Text>
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
                    placeholder={L('<Set Loan Amount>')}
                    label={L('Loan Amount')}
                  />
                </View>
                <View style={{height:70, padding:10, paddingTop:0, paddingBottom:30, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <TextField
                        tintColor={lib.THEME_COLOR}
                        value={this.state.loaner}
                        keyboardType='name-phone-pad'
                        onChangeText={(text) => this.onLoanerChanged(text)}
                        placeholder={L('<Set Loaner\'s Name>')}
                        label={L('Lender Name')}
                    />
                </View>
                <View style={{height:70, padding:10, paddingTop:0, paddingBottom:30, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <TextField
                            tintColor={lib.THEME_COLOR}
                            value={this.state.tenor}
                            keyboardType='numeric'
                            onChangeText={(text) => this.onTenorChanged(text)}
                            placeholder={L('<Set Tenor Amount>')}
                            label={L('Loan Term')}
                        />
                </View>
                <View style={{height:70, padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <Text>{L('Debt Period Length')} </Text>
                    <Picker
                        style={{flex:1}}
                        selectedValue={this.state.periode}
                        onValueChange={(item, idx) => this.onSelectPeriode(item, idx)}
                    >
                        <Picker.Item label={L('Daily')} value='Daily' />
                        <Picker.Item label={L('Weekly')} value='Weekly' />
                        <Picker.Item label={L('Monthly')} value='Monthly' />
                    </Picker>
                </View>
                <View style={{height:70, padding:10, paddingTop:0, paddingBottom:30, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <TextField
                            tintColor={lib.THEME_COLOR}
                            value={this.state.instalment}
                            keyboardType='numeric'
                            onChangeText={(text) => this.onInstalmentChanged(text)}
                            placeholder={L('<Set Installment Number>')}
                            label={L('Installment')}
                        />
                </View>
                <View style={{height:70, padding:10, paddingTop:0, paddingBottom:20, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <TextField
                      tintColor={lib.THEME_COLOR}
                      value={this.state.note}
                      multiline={true}
                      textAlignVertical='top'
                      placeholder={L('<Set Miscellanous Note>')}
                      onChangeText={(text) => this.onNotesChanged(text)}
                      label={L('Notes')}
                  />
                </View>
             </ScrollView>
          </View>
          <View style={{}}>
            <Button style={{container:{height:50}}} primary raised uppercase text={L('Save')}
              onPress={()=>this.handleSave()}></Button>
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