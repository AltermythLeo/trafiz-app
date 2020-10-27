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
const img = require('../images/fishIcon.png');

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('SELECT CATEGORY')} />
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

  handleAddCategory() {
    this.props.navigation.push('TransactionListAddNewIncomeCategory');
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

  handleSelectItem(item) {
    console.warn('Handle Item Selected : ' + item);
  }

  //TODO : RefreshList
  refreshList() {
  }

  renderItem(item,index) {
    let nameIndo = item.indname;
    if(nameIndo.length == 0 && item.indname.length > 0 ) nameIndo = item.indname;
    if(nameIndo.length == 0) nameIndo = item.englishname;
    const nameEng = item.englishname;
    const nameLocal = item.localname;
    const code = item.threea_code;
    const english = (this.props.stateSetting.language == 'english');

    const weight = item.weight + 'kg';
    //TODO : where to get grade on catch data?
    const grade = 'AA';
    let   metric = L('Individual');
    if(item.unitmeasurement=='1') metric = L('Plate');
    if(item.unitmeasurement=='2') metric = L('Bucket');

    const name = english ? nameEng : nameIndo;
    const title = code + ' ' + name +  ' ' + weight +  ' ' + grade + ' (' + metric + ')';
    let price   = 'Rp. ' + lib.toPrice(item.totalprice);
    
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleSelectItem(item)}>
        <View style={{flex:1, flexDirection:'row'}}>
          <View style={{flex:1, padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
            <View style={{}}>
              <Image source={require('../images/fishIcon.png')} style={{width: 50, height: 50}}/>
            </View>
            <View style={{width:10}} />
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={{}}>{title}</Text>
              <Text style={{}}>{price}</Text>
            </View>
            <View style={{width:10}} />
            <View style={{justifyContent:'center',alignItems:'center'}}>
              <View style={{padding:15}}><FontAwesome name='arrow-right' /></View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
    let rows = this.props.stateData.catches.slice();
    _.remove(rows,{lasttransact:"D"});

    let sortedRows;
    const english = (this.props.stateSetting.language == 'english');

    if(english) 
      sortedRows = _.sortBy(rows, o => o.englishname);
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
        <View style={{backgroundColor:'white',elevation:1}}>
          {errorIndicator}

          {/*Static buttons*/}
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.navigation.push('TransactionListSellFish')}>
            <View style={{padding:10,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold'}}>{L('Sell Catch')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:15}}><FontAwesome name='arrow-right'/></View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.navigation.push('TransactionListGetLoan')}>
            <View style={{padding:10,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold'}}>{L('Get Loan')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:15}}><FontAwesome name='arrow-right'/></View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.navigation.push('TransactionListLoanList')}>
            <View style={{padding:10,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold'}}>{L('Account Receivable Payment')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:15}}><FontAwesome name='arrow-right'/></View>
            </View>
          </TouchableOpacity>
          </View>
        </View>
        {/*Static buttons end*/}
        <View style={{backgroundColor:'gainsboro', height:10}}></View>
        <View style={{flex:1, backgroundColor:'white'}}>
            <FlatList
                onRefresh={()=>this.refreshList()}
                refreshing={this.state.refreshing}            
                data={sortedRows}
                keyExtractor={(item,index) => (''+index)}
                renderItem={({item,index}) => this.renderItem(item,index)}
            />
        </View>
        <View style={{borderColor:'gray', borderWidth:1, backgroundColor:'white', height:50}}>
          <TouchableOpacity style={{}} onPress={()=>this.handleAddCategory()}>
            <View style={{justifyContent:'center', alignItems:'center', height:50}}>
                <Text style={{fontWeight:'bold'}}>{L('Add New Category').toUpperCase()}</Text>                
            </View>
          </TouchableOpacity>
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