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
import { Navicon, BackButton, OnlineIndicator } from '../Navicon';
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
      total:'',
      description:'',
      errMsg:''
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

  handleRemove() {
  }

  handleSave() {
  }

  renderForm() {
    const edit = this.props.navigation.getParam('edit',{});

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
          <View style={{paddingHorizontal:10,height:rowHeight}}>
            <TextField
              tintColor={lib.THEME_COLOR}
              onChangeText={(text) => this.setState({desc:text})}
              value={this.state.desc}
              label={L('Description')}
            />
          </View>
          <View style={{paddingHorizontal:10,height:rowHeight}}>
            <TextField
              keyboardType='numeric'
              tintColor={lib.THEME_COLOR}
              onChangeText={(text) => this.setState({total:text})}
              value={this.state.total}
              label={L('Estimated loan value')+' (Rp)'}
            />
          </View>
          <Text />
          <Text />
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

    const data = this.props.navigation.getParam('data',{});

    let name = data.name;
    const loans = this.props.stateData.loans;
    let job = null;
    let user = null;

    user = _.find(loans,{idmsuser:data.idmsuser});
    job = data.usertypename;

    let totalItems = 0;
    let totalPrice = 0;

    if(user) {
      totalPrice = user.estimateTotalLoan;
      totalItems = user.items.length;
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
        <View style={{flexDirection:'row',backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          <View style={{flex:1,padding:3}}>
            <Button raised primary text={L('Save')} onPress={()=>this.handleSave()} />
          </View>
          <View style={{flex:1,padding:3}}>
            <Button raised accent text={L('Remove')} onPress={()=>this.handleRemove()} />
          </View>
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