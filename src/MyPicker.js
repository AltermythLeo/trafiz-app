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
import { Navicon, BackButton, OnlineIndicator } from './Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions/AppActions';

const lib = require('./lib');
const L = require('./dictionary').translate;

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
      show:'list',
      filter:''
    }
  }

  componentDidMount() {
  }

  handleSelect(item) {
    const nav = this.props.navigation;
    nav.goBack();
    nav.state.params.onReturnSelect(item.value);
  }

  renderItem(item,index) {
    const name = item.label;
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleSelect(item)}>
        <View style={{flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <View style={{flex:1,justifyContent:'center',alignItems:'flex-start',padding:10}}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{name}</Text>
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

    const nav = this.props.navigation;
    const rows = nav.state.params.rows;
    const filter = this.state.filter;
    let filteredRows;
    // filter by search
    if(filter.length > 0) {
      const filterStr = filter.toLowerCase();
      filteredRows = _.filter(rows, function(o) { 
        return (o.label,toLowerCase().indexOf(filterStr) > -1);
      });  
    } else {
      filteredRows = rows;
    }

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{paddingHorizontal:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
          <TextInput
            placeholder={L('Search by name..')}
            selectionColor={lib.THEME_COLOR}
            underlineColorAndroid='white'
            value={this.state.filter}
            onChangeText={ (text) => this.setState({filter:text}) }
          />
        </View>
        <View style={{flex:1}}>
          <FlatList
            data={filteredRows}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
          />
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

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;