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
      customCategory:[],
      refreshing: false
    }
    if(props.navigation.state.params !== undefined && props.navigation.state.params.newCategory)
      this.state.customCategory.Add(props.navigation.state.params.newCategory);
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
    this.props.navigation.push('TransactionListAddNewCategory');
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

  renderItem(item,index) {
    if(this.state.customCategory === undefined)
      return {};
    return (
      <TouchableOpacity style={{backgroundColor:'white'}} onPress={()=>this.handleSelectItem(item)}>
        <View style={{padding:10,
            flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1, alignItems:'center'}}>
            <Text style={{}}>{item}</Text>
            <View style={{flex:1}} />
            <View style={{padding:15}}><FontAwesome name='arrow-right'/></View>
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
    let sortedRows = this.state.customCategory;

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

          {/*Static buttons*/}
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.navigation.push('TransactionListBuyFish')}>
            <View style={{padding:10,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold', fontSize:14}}>{L('Buy Catch')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:15}}><FontAwesome name='arrow-right'/></View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.navigation.push('TransactionListDebtList')}>
            <View style={{padding:10,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold'}}>{L('Debt Payment')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:15}}><FontAwesome name='arrow-right'/></View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.navigation.push('TransactionListGiveLoan')}>
            <View style={{padding:10,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold'}}>{L('Give Loan')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:15}}><FontAwesome name='arrow-right'/></View>
            </View>
          </TouchableOpacity>
          </View>
        </View>
        {/*Static buttons end*/}
        <View style={{flex:1, backgroundColor:'gainsboro'}}>
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