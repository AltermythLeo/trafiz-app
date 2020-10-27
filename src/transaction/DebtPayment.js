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
import { Button , Checkbox} from 'react-native-material-ui';
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
        <Title txt={L('Debt').toUpperCase()} />
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
      loanData:{},
      note:{},
      isfinal:false,
      refreshing: false
    }
    console.warn(props.navigation.state.params.loanData);
    this.state.loanData=props.navigation.state.params.loanData;
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
        console.warn('SAVING');
  }

  handleOnFinalize()
  {
    this.setState({isfinal:!this.state.isfinal});
  }


 //TODO : RefreshList
  refreshList() {
  }

  renderItem(item,index) {
    console.warn(item);

    return (
      <TouchableOpacity style={{}} onPress={()=>this.handlePay(item)}>
        <View style={{padding:10, height:30, flexDirection:'row', alignItems:'center'}}>
            <Text style={{}}>{item.date}</Text>
            <View style={{width:20}} />
            <Text style={{}}>Rp {lib.toPrice(item.amount)}</Text>
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

    const tenor = '10x';
    const note = 'Dummy data';
    const historyData=[{date:'10-Okt-2019', amount:100000}, {date:'10-Sep-2019', amount:100000}, {date:'10-Agu-2019', amount:100000}];
    const history=historyData.slice();

    let lockButtons = false;

    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}
        </View>
        <View style={{flex:1, backgroundColor:'white'}}>
            <View style={{height:70, padding:10}}>
                <Text style={{fontWeight:'bold'}}>{L('Loan Provider:')} </Text>
                <Text style={{padding:15}}>{this.state.loanData.name}</Text>
            </View>
            <View style={{height:70, padding:10}}>
                <Text style={{fontWeight:'bold'}}>{L('Debt Amount:')} </Text>
                <Text style={{padding:15}}>{lib.toPrice(this.state.loanData.estimateTotalLoan)}</Text>
            </View>
            <View style={{height:70, padding:10}}>
                <Text style={{fontWeight:'bold'}}>{L('Tenor') + ':'} </Text>
                <Text style={{padding:15}}>{tenor}</Text>
            </View>
            <View style={{height:70, padding:10}}>
                <Text style={{fontWeight:'bold'}}>{L('Remark') + ':'} </Text>
                <Text style={{padding:15}}>{note}</Text>
            </View>
            <View style={{flex:1, padding:10}}>
                <Text style={{fontWeight:'bold'}}>{L('Payment History :')} </Text>
                <FlatList
                    onRefresh={()=>this.refreshList()}
                    refreshing={this.state.refreshing}            
                    data={history}
                    keyExtractor={(item,index) => (''+index)}
                    renderItem={({item,index}) => this.renderItem(item,index)}
                />
            </View>
        </View>
        <View style={{}}>
            <Button style={{container:{height:50}}} primary raised uppercase text={L('Pay Loan')}
              disabled={lockButtons}  onPress={()=>this.handleSave()}></Button>
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