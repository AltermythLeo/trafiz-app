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

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('LOAN LIST')} />
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
    }
  }

  componentDidMount() {
    const data = this.props.navigation.getParam('data',null);
    console.warn(data);
    Promise.resolve()
    .then(result=>{
      this.setState({show:'list'});
    })
  }

  handleAdd() {
    const data = this.props.navigation.getParam('data',null);
    this.props.navigation.push('LoanAddItemScreen',{
      msg:'loanlistitem-to-additem',
      data:data
    });
  }

  handleEdit(o) {
    console.warn(o);
    const data = this.props.navigation.getParam('data',null);
    this.props.navigation.push('LoanAddItemScreen',{
      mode:'edit',
      data:data,
      edit:o
    });
  }

  handlePay() {
    const data = this.props.navigation.getParam('data',null);
    this.props.navigation.push('LoanPayScreen',{
      msg:'LoanListItems-to-LoanPayScreen',
      data:data
    });
  }

  handleRemove(o) {
    console.warn(o);
    const data = this.props.navigation.getParam('data',null);
    this.props.navigation.push('LoanEditItemScreen',{
      data:data,
      edit:o
    });
    // this.setState({
    //   show:'busy'
    // });

    // const ref = this.props.navigation.getParam('data',{});
    // const idmsuser = ref.idmsuser;

    // this.props.actions.loanRemoveItem(idmsuser,idloanoffline)
    // .then(()=>{
    //   return this.props.actions.getLoans();
    // })
    // .then(result=>{
    //   this.setState({
    //     show:'list'
    //   });
    // });

  }

  renderCardItem(data,index) {
    const loanDate = moment(data[0].loanDate,'YYYY-MM-DD');
    const numItem = data.length;
    const dateStr = loanDate.format('DD MMMM YYYY');
    
    let estPrice = 0;
    for(let i=0;i<numItem;i++) {
      if(data[i].strike) continue;
      estPrice += Number(data[i].total);
    }

    const items = data;

    return (
      <View>
        <View style={{height:10}} />
        <View style={{backgroundColor:'white',elevation:1}}>
          <View style={{padding:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
            <Text style={{fontWeight:'bold'}}>{dateStr}</Text>
            <Text style={{}}>{numItem} {L('item(s)')}, {L('estimated')} Rp {lib.toPrice(estPrice)}</Text>
          </View>
          {items.map((o,i)=>{
            const key = dateStr+'-'+i;
            const desc = o.desc;
            const total = Number(o.total);

            let style = {};
            if(o.strike)
              style= {textDecorationLine: 'line-through'};
            
            let info = null;
            if(o.namecreator) {
              let txt = '[' + o.namecreator;
              if(o.namelasttrans) txt = '['+o.namelasttrans;
              txt = txt + ']';
              info = <Text style={{fontSize:10}}>{txt.toUpperCase()}</Text>;
            }

            const idloanoffline = o.idloanoffline;

            if(o.strike) {
              return (
                <View key={key} style={{flexDirection:'row',borderBottomWidth:1,borderColor:'gainsboro'}}>
                  <View style={{flex:1,padding:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                    <View style={{flex:2}}>
                      <Text style={style}>{desc}</Text>
                      {info}
                    </View>
                    <Text style={Object.assign({flex:1,textAlign:'right'},style)}>Rp {lib.toPrice(total)}</Text>
                  </View>
                </View>
              );                
            }

            return (
              <View key={key} style={{flexDirection:'row',borderBottomWidth:1,borderColor:'gainsboro'}}>
                <TouchableOpacity onPress={()=>this.handleEdit(o)} style={{flex:1,padding:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                  <View style={{flex:2}}>
                    <Text style={style}>{desc}</Text>
                    {info}
                  </View>
                  <Text style={Object.assign({flex:1,textAlign:'right'},style)}>Rp {lib.toPrice(total)}</Text>
                </TouchableOpacity>
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

    const msg = this.props.navigation.getParam('msg',{});
    const data = this.props.navigation.getParam('data',{});

    const name = data.name;
    const loans = this.props.stateData.loans;
    let job = '';
    let user = null;

    user = _.find(loans,{
      idmsuser:data.idmsuser,
      idfishermanoffline:data.idfishermanoffline,
      idbuyeroffline:data.idbuyeroffline
    });

    job = data.usertypename;

    let totalItems = 0;
    let totalPrice = 0;
    
    let rows = [];

    if(user) {
      totalPrice = user.estimateTotalLoan;
      totalItems = user.items.length;
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

      // console.warn(sorted);
      const check = [];
      for(let i=0;i<sorted.length;i++) {
        rows.push(sorted[i].val);
        check.push(sorted[i].key);
      }

      // console.warn(check);

      // for(let key in groupByDate) {
      //   if(groupByDate.hasOwnProperty(key)) {
      //     rows.push(groupByDate[key]);
      //   }
      // }

    }

    const hideButtons = this.props.navigation.getParam('hideButtons',false);
    let buttons = (
      <View style={{padding:0}}>
        <Button raised accent text={L('Pay Loan')} onPress={()=>this.handlePay()} />
        <Button raised primary text={L('Add Loan')} onPress={()=>this.handleAdd()} />
      </View>
    );
    if(hideButtons) buttons = null;

    return (
      <View style={{flex:1}}>
        <View style={{padding:10,backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
          <Text style={{fontWeight:'bold'}}>{name} ({job})</Text>
          <Text style={{}}>{totalItems} {L('item(s)')}, {L('estimated')} Rp {lib.toPrice(totalPrice)}</Text>
        </View>
        <FlatList
          data={rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderCardItem(item,index)}
        />
        {buttons}
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