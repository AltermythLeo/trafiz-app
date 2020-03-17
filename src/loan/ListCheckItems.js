<CheckBox isChecked={true} />
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
  Dimensions
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
import CheckBox from 'react-native-check-box'

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('STRIKE ITEMS')} />
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
      user:{},
      name:'',
      job:'',
      totalItems:0,
      totalPrice:0,
      rows:[]
    }
  }

  componentDidMount() {
    const msg = this.props.navigation.getParam('msg',{});
    const data = this.props.navigation.getParam('data',{});
    const backToCatch = this.props.navigation.getParam('backToCatch',false);

    const name = data.name;
    const loans = this.props.stateData.loans;
    let job = '';
    let user = null;

    const searchTerm = {
      idmsuser:data.idmsuser,
      idfishermanoffline:data.idfishermanoffline,
      idbuyeroffline:data.idbuyeroffline
    };
    user = Object.assign({},_.find(loans,searchTerm));

    console.warn(user);
    job = data.usertypename;

    let totalItems = 0;
    let totalPrice = 0;
    
    let rows = [];

    if(user) {
      totalPrice = user.estimateTotalLoan;
      const items = [];
      totalItems = user.items.length;
      for(let i=0;i<totalItems;i++) {
        const item = user.items[i];
        if(item.strike) item.hidden = true;
        items.push(item);
      }
      user.items = items;

      const groupByDate = _.groupBy(user.items,(o)=>{
        const m = moment(o.loanDate,'YYYY-MM-DD');
        return m.unix();
      });

      const unsorted = [];
      for(let key in groupByDate) {
        if(groupByDate.hasOwnProperty(key)) {
          unsorted.push({key:Number(key),val:groupByDate[key]});
        }
      }

      const sorted = unsorted.sort(function (a, b) {
        return (a.key - b.key);
      });

      for(let i=0;i<sorted.length;i++) {
        rows.push(sorted[i].val);
      }

      // for(let key in groupByDate) {
      //   if(groupByDate.hasOwnProperty(key)) {
      //     rows.push(groupByDate[key]);
      //   }
      // }
    }

    // for(let i=0;i<rows.length;i++) {
    //   const row = rows[i];
    //   for(let j=0;j<row[i].length;j++) {
    //     row[i][j].originalStrike = row[i][j].strike;
    //   }
    // }

    // console.warn(rows);

    this.setState({
      show:'list',
      user:user,
      name:name,
      job:job,
      totalItems:totalItems,
      totalPrice:totalPrice,
      rows:rows,
      originalRows:JSON.parse(JSON.stringify(rows))
    });

  }

  handleSave() {
    this.setState({show:'busy'});
    const newItems = [];
    const rows = this.state.rows.slice();
    const rows2 = this.state.originalRows.slice();
    for(let i=0;i<rows.length;i++) {
      const items = rows[i];
      const items2 = rows2[i];
      for(let j=0;j<items.length;j++) {
        const item = items[j];
        const item2 = items2[j];
        item.needUpdate = (item.strike != item2.strike);
        newItems.push(item);
      }
    }

    console.warn(rows.length);
    console.warn(rows2.length);

    const backToCatch = this.props.navigation.getParam('backToCatch',false);

    // payloan value from previous page
    const payloanAmount = this.props.navigation.getParam('payloanAmount',0);
    const payloanDate = this.props.navigation.getParam('payloanDate');

    let p = Promise.resolve();

    if(payloanAmount > 0) {
      let payloanDesc = L('Paid for ');
      const arr = [];
      for(let i=0;i<newItems.length;i++) {
        const ni = newItems[i];
        if(!ni.needUpdate) continue;
        const str= ''+ni.desc+' ('+ni.loanDate+')';
        arr.push(str);
      }
      payloanDesc = payloanDesc + arr.join(', ');
      if(newItems.length == 0) payloanDesc = '';
      const borrowerName = this.state.user.name;

      // console.warn({
      //   payloanAmount,
      //   payloanDate,
      //   payloanDesc,
      //   borrowerName
      // })

      const cb = this.props.navigation.getParam('onLoanExpenseEntered',false);
      if(cb) {
        console.warn('onLoanExpenseEntered !!');
        cb(payloanAmount);
      }

      const p = this.props.actions.loanUpdatePaidForUser(this.state.user,
        payloanAmount,payloanDate,payloanDesc,borrowerName);
    }


    p
    .then(()=>{
      return this.props.actions.loanUpdateItemsForUser(this.state.user,newItems);
    })
    .then(()=>{
      return this.props.actions.getLoans();
    })
    .then(result=>{
      this.setState({
        show:'list'
      });

      this.props.navigation.goBack();
      // if(backToCatch) {
      //   this.props.navigation.navigate('CatchCalcCatchListValueScreen');
      // } else {
      //   this.props.navigation.navigate('LoanListItemsScreen',{
      //     msg:'LoanListCheckItemsScreen-to-LoanListItemsScreen',
      //     data:this.state.user
      //   });  
      // }
    })
    .catch(err=>{
      this.setState({
        show:'list'
      });
    })

    // console.warn(newItems);
  }

  checkItem(index1,index2) {
    const rows = this.state.rows.slice();
    const obj = rows[index1][index2];
    const strike = obj.strike ? false : true;
    rows[index1][index2].strike = strike;
    this.setState({rows:rows});
  }

  renderCardItem(data,index) {
    const index1 = index;
    const loanDate = moment(data[0].loanDate,'YYYY-MM-DD');
    const numItem = data.length;
    const dateStr = loanDate.format('DD MMMM YYYY');
    
    let estPrice = 0;
    for(let i=0;i<numItem;i++) {
      if(data[i].strike) continue;
      estPrice += Number(data[i].total);
    }

    const items = data.slice();
    let check = data.slice();
    _.remove(check,{hidden:true});
    if(check.length == 0) return null;
    
    
    return (
      <View>
        <View style={{height:10}} />
        <View style={{backgroundColor:'white',elevation:1}}>
          <View style={{padding:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
            <Text style={{fontWeight:'bold'}}>{dateStr}</Text>
            <Text style={{}}>{numItem} {L('item(s)')}, {L('estimated')} Rp {lib.toPrice(estPrice)}</Text>
          </View>
          {items.map((o,i)=>{
            const index2 = i;
            const key = dateStr+'-'+i;
            const desc = o.desc;
            const total = Number(o.total);
            let strike = false;
            let style = {};
            if(o.strike) {
              strike = true;
              style= {textDecorationLine: 'line-through'};
              // return (
              //   <View key={key} style={{padding:10,flexDirection:'row',borderBottomWidth:1,borderColor:'gainsboro'}}>
              //     <View style={{flex:1,flexDirection:'row',justifyContent:'space-between'}}>
              //       <Text style={style}>{desc}</Text>
              //       <Text style={style}>Rp {lib.toPrice(total)}</Text>
              //     </View>
              //   </View>                
              // );
            }

            if(o.hidden) return null;

            return (
              <View key={key} style={{padding:10,flexDirection:'row',borderBottomWidth:1,borderColor:'gainsboro'}}>
                <CheckBox isChecked={strike} onClick={()=>{
                  this.checkItem(index1,index2);
                }} />
                <View style={{flex:1,flexDirection:'row',paddingLeft:10,justifyContent:'space-between'}}>
                  <Text style={style}>{desc}</Text>
                  <Text style={style}>Rp {lib.toPrice(total)}</Text>
                </View>
              </View>                
            );
          })}
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

    return (
      <View style={{flex:1}}>
        <View style={{padding:10,backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
          <Text style={{fontWeight:'bold'}}>{this.state.name} ({this.state.job})</Text>
          <Text style={{}}>{this.state.totalItems} {L('item(s)')}, {L('estimated')} Rp {lib.toPrice(this.state.totalPrice)}</Text>
        </View>
        <FlatList
          data={this.state.rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderCardItem(item,index)}
        />
        <View style={{padding:0}}>
          <Button raised primary text={L('Save')} onPress={()=>this.handleSave()} />
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