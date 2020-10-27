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
        <Title txt={L('Expense').toUpperCase()} />
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
      cashAmount:'0',
      weight:'0',
      selectedFish:'-1',
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
//    this.setState({show:'busy'});
    this.setState({errMsg:''});
    if(this.state.weight < 1)
      this.setState({show:'form', errMsg:L('Please Set Weight Above 0 kg')});
    if(this.state.selectedFish =='-1')
      this.setState({show:'form', errMsg:L('Please Select Fish Species')});
    if(lib.toNumber(this.state.cashAmount) < 1)
      this.setState({show:'form', errMsg:L('Please Set Debt Amount Above Rp 0')});
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

  onWeightChanged(num)
  {
    num = num.replace(/^0+/, '')
    this.setState({weight:num});
  }

  onSelectFish(item, index)
  {
    this.setState({selectedFish:item});
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

    //get data to show
    let rows = this.props.stateData.fishes.slice();
    _.remove(rows,{lasttransact:"D"});

    let sortedRows;
    const english = (this.props.stateSetting.language == 'english');

    if(english) 
      sortedRows = _.sortBy(rows, o => o.english_name);
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
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}

          <View style={{padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
            <Text style={{fontWeight:'bold'}}>{L('Income Type') + ':'}</Text>
            <Text style={{padding:15}}>{L('Sell Catch').toUpperCase()}</Text>
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
                    label={L('Price')}
                  />
                </View>
                <View style={{height:70, padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <Text>{L('Fish Species Type')} </Text>
                    <Picker
                        style={{flex:1}}
                        placeHolder={L('<Choose Fish Species>')}
                        selectedValue={this.state.selectedFish}
                        onValueChange={(item, idx) => this.onSelectFish(item, idx)}
                    >
                      <Picker.Item label={L('<Choose Fish Species>')} value='-1'/>
                      {sortedRows.map((obj,index)=>{
                        if(this.props.stateSetting.language == 'english')
                            return <Picker.Item key={index} label={obj.english_name} value={obj.threea_code} />;
                        else
                            return <Picker.Item key={index} label={obj.indname} value={obj.threea_code} />;
                      })}
                    </Picker>
                </View>
                <View style={{height:70, padding:10, paddingTop:0, paddingBottom:20, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <TextField
                      tintColor={lib.THEME_COLOR}
                      value={this.state.weight}
                      keyboardType='numeric'
                      onChangeText={(text) => this.onWeightChanged(text)}
                      label={L('Weight') + ' (kg)'}
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