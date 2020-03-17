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
    Promise.resolve()
    .then(result=>{
      this.setState({show:'list'});
    })
  }

  refreshList() {
    this.setState({refreshing:true});
    this.props.actions.getLoans()
    .then(()=>{
      this.setState({refreshing:false});
    })
  }

  handleAdd() {
    this.props.navigation.push('LoanListNewScreen');
  }

  handleEdit(data) {
    // console.warn(data);
    this.props.navigation.push('LoanListItemsScreen',{
      msg:'list-to-listitem',
      data:data
    });
  }

  renderItem(item,index) {
    // console.warn(item);
    const name = item.name;
    if(!name || name.length == 0) return null;
    const total = item.estimateTotalLoan;

    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleEdit(item)}>
        <View style={{padding:10,
          flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
          alignItems:'center'}}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{name}</Text>
            <View style={{flex:1}} />
            <Text style={{}}>Rp {lib.toPrice(total)}</Text>
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

    const loans = this.props.stateData.loans.slice();
    const rows = loans; // id name total
    const sorted = rows.sort(function (a, b) {
      let nameA = a.name;
      if(nameA) nameA = nameA.toLowerCase();
      let nameB = b.name;
      if(nameB) nameB = nameB.toLowerCase();
      if (nameA < nameB)
        return -1;
      if (nameA > nameB)
        return 1;
      return 0;
    });


    // filter by search
    // const filterStr = this.state.filter.toLowerCase();
    // const filteredRows = _.filter(rows, function(o) { 
    //   if(!o.name) return false;
    //   const name = o.name ? o.name : '';
    //   return (name.toLowerCase().indexOf(filterStr) > -1);
    // });

    // <View style={{paddingHorizontal:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
    //   <TextInput
    //     placeholder='Search by name..'
    //     selectionColor={lib.THEME_COLOR}
    //     underlineColorAndroid='white'
    //     value={this.state.filter}
    //     onChangeText={ (text) => this.setState({filter:text}) }
    //   />
    // </View>

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{flex:1}}>
          <FlatList
            onRefresh={()=>this.refreshList()}
            refreshing={this.state.refreshing}            
            data={sorted}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
          />
        </View>
        <View style={{}}>
          <Button raised primary text={L('New Borrower')} onPress={()=>this.handleAdd()} />
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