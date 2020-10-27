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
        <Title txt={L('Split Fish').toUpperCase()} />
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
      fishData:'',
      cashAmount:'Rp 0',
      splitAmount:'0',
      selectedNewUnit:'',
      refreshing: false
    }
    this.state.fishData=props.navigation.state.params.fishData;
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
    if(lib.toNumber(this.state.cashAmount) < 1)
      this.setState({show:'form', errMsg:L('Please Set Price Above Rp 0')});
    if(this.state.splitAmount < 1)
      this.setState({show:'form', errMsg:L('Please Set Split Amount Above 0')});
    if(this.state.errMsg.length > 0) 
    {
      console.warn(this.state.errMsg);
      return;
    }
    console.warn('SAVING DATA');
  }

  handleBack()
  {
    //TODO:Go Back
    console.warn('BACK');
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

  onSplitChanged(num)
  {
    num = num.replace(/^0+/, '');
    this.setState({splitAmount:num});
  }

  onAmountChanged(num)
  {
    num = 'Rp ' + lib.toPrice(lib.toNumber(num));
    this.setState({cashAmount:num});
  }

  onSelectUnit(item, index)
  {
    this.setState({selectedNewUnit:item});
    console.warn(item);
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

    let string=this.state.fishData.threea_code + ' ';
    string += (this.props.stateSetting.language == 'english'?this.state.fishData.english_name:this.state.fishData.indname) + ' ';
    string += this.state.fishData.weight + 'kg ' + this.state.fishData.grade + ' 1 ' + this.state.fishData.unit;

    let replacement=L('Whole');

    const sellingPrice=Number(this.state.fishData.priceperkg) * Number(this.state.fishData.weight);

    if(this.state.selectedNewUnit == '1')
      replacement=L('Plate');
    if(this.state.selectedNewUnit == '2')
      replacement=L('Basket');

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
            <View style={{padding:10}}>
                <Text>{string}</Text>
                <Text>Rp {lib.toPrice(this.state.fishData.price)}</Text>
            </View>
          </View>
          <View style={{backgroundColor:'white', padding:10}}>
            <View style={{height:70, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                <Text>{L('New Split Form')} </Text>
                <Picker
                    style={{flex:1}}
                    selectedValue={this.state.selectedNewUnit}
                    onValueChange={(item, idx) => this.onSelectUnit(item, idx)}
                >
                    <Picker.Item label={L('Whole')}  value='0' />
                    <Picker.Item label={L('Plate')}  value='1' />
                    <Picker.Item label={L('Basket')} value='2' />
                </Picker>
            </View>
            <View style={{height:70, padding:10, paddingTop:0, paddingBottom:30, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                <TextField
                    tintColor={lib.THEME_COLOR}
                    value={this.state.splitAmount}
                    keyboardType='numeric'
                    onChangeText={(text) => this.onSplitChanged(text)}
                    label={L('Quantity To Split (<unit>)').replace('<unit>', replacement)}
                />
            </View>
            <View style={{height:70, padding:10, paddingTop:0, paddingBottom:30, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                <TextField
                    tintColor={lib.THEME_COLOR}
                    value={this.state.cashAmount}
                    keyboardType='numeric'
                    onChangeText={(text) => this.onAmountChanged(text)}
                    label={L('Price Per <unit>').replace('<unit>', replacement)}
                />
            </View>
            <View style={{padding:10}}>
                <Text style={{fontWeight:'bold'}}>{L('Total Selling Price')}</Text>
                <Text>Rp {lib.toPrice(sellingPrice)}</Text>
            </View>
            <View style={{padding:10}}>
                <Text style={{fontWeight:'bold'}}>{L('Profit')}</Text>
                <Text>Rp {lib.toPrice(sellingPrice - Number(this.state.fishData.price))}</Text>
            </View>
          </View>
        </View>
        <View style={{flex:1, backgroundColor:'gainsboro'}}>
        </View>
        <View style={{}}>
            <Button style={{container:{height:50}}} primary raised uppercase text={L('Split Fish').toUpperCase()} onPress={()=>this.handleSave()}></Button>
            <Button style={{container:{height:50}}}         raised uppercase text={L('Cancel').toUpperCase()} onPress={()=>this.handleBack()}></Button>
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