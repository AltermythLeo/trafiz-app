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
        <Title txt={L('SELECT LOAN TYPE')} />
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
      filter:'',
      newItemName:'Pertalite',
      newItemUnit:'Liter',
      newItemPrice:'10000',
    }
  }

  componentDidMount() {
    Promise.resolve()
    .then(result=>{
      this.setState({show:'list'});
    })
  }

  handleSelect(item) {
    const nav = this.props.navigation;
    nav.goBack();
    nav.state.params.onReturnSelect(item);
  }

  handleAdd() {
    const login = this.props.stateLogin;
    const idmssupplier = login.idmssupplier;
    const uid = login.id;

    const itemName = this.state.newItemName;
    const itemUnit = this.state.newItemUnit;
    const itemPrice = this.state.newItemPrice;
    if(itemName.length > 0 && itemUnit.length > 0 && itemPrice.length > 0 ) {
      this.setState({show:'busy'});
      const newItem = {name:itemName,unit:itemUnit,price:itemPrice};
      // this.props.actions.addCustomItem(newItem);

      const loantypeId = lib.getShortOfflineId('loantype',uid.toString(36));        
      const json = {
        idmstypeitemloanofflineparam:loantypeId,
        typenameparam:itemName,
        unitparam:itemUnit,
        priceperunitparam:itemPrice,
        idmssupplierparam:idmssupplier
      }
      
      const offlineJson = {
        idmstypeitemloanoffline:loantypeId,
        typename:itemName,
        unit:itemUnit,
        priceperunit:itemPrice,
        idmssupplier:idmssupplier
      };

      this.props.actions.addLoanType(json,offlineJson)
      .then(()=>{
        return this.props.actions.getLoanType()
      })
      .then(()=>{
        this.setState({show:'list'});
      })
      .catch(()=>{
        this.setState({show:'list'});
      });
    }
  }

  handleRemove(item) {
    const json = {
      idmstypeitemloanofflineparam:item.idmstypeitemloanoffline
    }
    this.setState({show:'busy'});
    
    this.props.actions.removeLoanType(json)
    .then(()=>{
      return this.props.actions.getLoanType()
    })
    .then(()=>{
      this.setState({show:'list'});
    })
    .catch(()=>{
      this.setState({show:'list'});
    });
    // this.props.actions.removeCustomItem(index);
  }

  renderItem(item,index) {
    // const name = item.name;
    // const price = item.price;
    // const unit = item.unit;
    const name = item.typename;
    const price = item.priceperunit;
    const unit = item.unit;
    return (
      <View style={{height:68,borderBottomColor:'gainsboro',borderBottomWidth:1,flexDirection:'row'}}>
        <TouchableOpacity style={{flex:1}} onPress={()=>this.handleSelect(item)}>
          <View style={{flex:1,flexDirection:'row',paddingHorizontal:10,alignItems:'center',justifyContent:'space-between'}}>
            <Text style={{fontWeight:'bold'}}>{name}</Text>
            <Text style={{}}>Rp {lib.toPrice(price)}/{unit}</Text>
          </View>
        </TouchableOpacity>
        <View style={{padding:20,alignItems:'center',justifyContent:'center',borderLeftWidth:1,borderColor:'gainsboro'}}>
          <TouchableOpacity style={{flex:1}} onPress={()=>this.handleRemove(item)}> 
            <FontAwesome name="trash" size={30} />
          </TouchableOpacity>
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

    //const rows = this.props.stateData.customitems ? this.props.stateData.customitems : [];
    const rows = this.props.stateData.loantype ? this.props.stateData.loantype.slice() : [];
    _.remove(rows,{lasttransact:'D'})

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{flex:1}}>
          <FlatList
            data={rows}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
          />
          <View style={{padding:10,borderTopWidth:1,borderColor:'gainsboro',flexDirection:'row'}}>
            <View style={{flex:1,paddingRight:10}}>
              <TextField
                tintColor={lib.THEME_COLOR}
                onChangeText={(text) => this.setState({newItemName:text})}
                value={this.state.newItemName}
                label={L('New item name')}
              />
              <View style={{flexDirection:'row'}}>
                <View style={{flex:1}}>
                  <TextField
                    tintColor={lib.THEME_COLOR}
                    onChangeText={(text) => this.setState({newItemUnit:text})}
                    value={this.state.newItemUnit}
                    label={L('Unit definition')}
                  />
                </View>
                <View style={{flex:1}}>
                  <TextField
                    keyboardType='numeric'
                    tintColor={lib.THEME_COLOR}
                    onChangeText={(text) => this.setState({newItemPrice:text})}
                    value={this.state.newItemPrice}
                    label={L('One unit price')}
                  />
                </View>
              </View>
            </View>
            <View>
              <Button style={{flex:1,container:{flex:1}}} raised primary text={L('Add')} onPress={()=>this.handleAdd()} />
            </View>
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

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;