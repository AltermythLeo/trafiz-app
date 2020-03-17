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
  TextInput
} from 'react-native';
import _ from 'lodash';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';

const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('REPORT')} />
      ),
      headerLeft: (
        <Navicon navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      show:'busy',
      filter:'',
      refreshing:false
    }
  }

  componentDidMount() {
    this.setState({show:'list'});
  }

  handleSelect(index) {
    if(index == 0) this.props.navigation.push('TransactionReportScreen');
    else if(index == 1) this.props.navigation.push('LoanReportScreen');
    else if(index == 2) this.props.navigation.push('FishermanSupplierFilterScreen');
  }

  renderItem(item,index) {
    const name = item;
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleSelect(index)}>
        <View style={{padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <View style={{flex:1,justifyContent:'center'}}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{name}</Text>
          </View>
          <View style={{width:10}}/>
          <View style={{justifyContent:'center',alignItems:'center'}}>
            <FontAwesome name='arrow-right' />
          </View>
        </View>
      </TouchableOpacity>
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

    let rows = [L('Transaction report'),L('Loan report'),L('Fisherman/supplier report')];

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <FlatList
          data={rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItem(item,index)}
        />
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

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;