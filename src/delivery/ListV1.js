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
  DatePickerAndroid
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
import * as Api from './Api';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

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
      show:'busy',
      refreshing:false
    }
  }

  downloadDeliverySheets(arr) {
    let p = lib.delay(1000);

    for(let i=0;i<arr.length;i++) {
      const id = arr[i];
      p = p.then(result=>{
        return Api.getDeliverySheet(id);
      })
      .then(result=>{
        if(result.batchId) {
          const batchId = result.batchId;
          const deliverySheet = result;
          this.props.actions.setDeliverySheet(batchId,deliverySheet);  
        }
        return lib.delay(1000);
      });
    }

    return p;
  }

  componentDidMount() {
    // const login = this.props.stateLogin;
    // const idmssupplier = login.idmssupplier;
    // Api.getDeliverySheetOfflineIds(idmssupplier)
    // .then(result=>{
    //   console.warn(result);
    //   return this.downloadDeliverySheets(result);
    // })

    this.setState({
      show:'list',
      dateFilter:moment().format('DD MMMM YYYY')
    });
  }

  nextDay(next) {
    const cur = moment(this.state.dateFilter,'DD MMMM YYYY');
    if(!next) {
      const prevDay = cur.subtract(1, 'd');
      const prevDayStr = prevDay.format('DD MMMM YYYY');
      this.setState({dateFilter:prevDayStr});
    } else {
      const today = moment().format('DD MMMM YYYY');
      if(today == this.state.dateFilter) return;
      const nextDay = cur.add(1, 'd');
      const nextDayStr = nextDay.format('DD MMMM YYYY');
      this.setState({dateFilter:nextDayStr});
    }
  }

  refreshList() {
    this.setState({refreshing:true});
    this.props.actions.getDeliveries()
    .then(()=>{
      this.setState({refreshing:false});
    })
  }

  handleEdit(batchId) {
    this.props.navigation.push('DeliveryCatchListScreen',{
      batchId:batchId
    });
  }

  handleView(deliverySheet) {
    this.props.navigation.push('DeliveryCatchListScreen',{
      mode:'view',
      deliverySheet    });
  }

  renderNotes(notes,row) {
    const arr = [];
    let index = 0;
    for(let x=0;x<4;x++) {
      const tmp = [];
      for(let y=0;y<row;y++) {
        if(index >= notes.length) break;
        tmp.push(notes[index]);
        index++;
      }
      arr.push(tmp);
    }

    return (
      <View style={{flex:2,flexDirection:'row'}}>
        <View style={{flex:1}}>
          {arr[0].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[1].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[2].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[3].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
      </View>
    )    
  }
  
  renderViewData(deliverySheet,index) {
    const viewData = deliverySheet.viewData;
    const notes = [];
    for(let i=0;i<viewData.gradeCodes.length;i++) {
      const code = viewData.gradeCodes[i];
      const id = ''+index+''+i;
      notes.push({id:id,code:code});
    }
    
    const buyerName = viewData.buyerName;
    let fishName = viewData.fishNameEng.toUpperCase();

    const english = (this.props.stateSetting.language == 'english');
    if(!english && viewData.fishNameInd) fishName = viewData.fishNameInd.toUpperCase();
    let unitName = viewData.unitName ? viewData.unitName : 'unit';
    unitName = L(unitName); 


    const title = buyerName+' ('+fishName+', '+viewData.numUnit+' '+unitName+', '+viewData.totalWeight+' kg)';
    const cData = viewData.compliance;
    const c1 = cData[0] ? {color:'blue'} : {color:'gray'};
    const c2 = cData[1] ? {color:'blue'} : {color:'gray'};
    const c3 = cData[2] ? {color:'blue'} : {color:'gray'};

    const compliance = (
      <View style={{flexDirection:'row',alignItems:'flex-end'}}>
        <Text style={c1}> ID</Text>
        <Text style={c2}> EU</Text>
        <Text style={c3}> US</Text>
      </View>
    );

    const calc = 'Rp '+lib.toPrice(viewData.sellPrice);
    let status = <Text style={{color:'gray',textAlign:'right',fontSize:10}}>{calc}</Text>;

    let row = 4;
    if(notes.length > 16) {
      row = Math.ceil(notes.length / 4);
    }

    const cells = this.renderNotes(notes,row);

    return (
      <View key={index+''}>
        <TouchableOpacity onPress={()=>this.handleView(deliverySheet)}>
          <View style={{backgroundColor:'white',elevation:1,padding:10}}>
            <View style={{flexDirection:'row'}}>
              <View style={{flex:2}}><Text style={{fontWeight:'bold'}}>{title}</Text></View>
              <View style={{flex:1,alignItems:'flex-end'}}>{compliance}</View>
            </View>
            <Text />
            <View style={{flexDirection:'row'}}>
              {cells}
              <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                <View style={{backgroundColor:lib.THEME_COLOR}}>
                  <Text style={{textAlign:'right',color:'white'}}> {L('DELIVERED')} </Text>
                </View>
                {status}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderCardItem(data,index) {
    if(data.viewData) {
      return this.renderViewData(data,index);
    }
    const fishes = data ? data : [];
    const batchId = data[0].batchId;
    let totalWeight = 0;
    let totalNum = 0;

    const notes = [];
    for(let i=0;i<fishes.length;i++) {
      totalWeight += Number(fishes[i].weight);
      totalNum++;
      const code = fishes[i].gradeCode;
      const id = fishes[i].fishCatchId;
      notes.push({id:id,code:code});
    }
    
    const bdd = this.props.stateData.batchDeliveryData[batchId];
    const name = bdd.buyerName;
    let fishKind = bdd.speciesName.toUpperCase();
    if(bdd.speciesNameIndo) {
      const english = (this.props.stateSetting.language == 'english');
      if(!english) fishKind = bdd.speciesNameIndo.toUpperCase();
    }

    const unitDef = [
      {label:'individual(s)',value:'1'},
      {label:'basket(s)',value:'0'}  
    ]

    let unitName =_.find(unitDef,{value:''+data.unitmeasurement});
    if(unitName) unitName = unitName.label; else unitName = 'unit';
    unitName = L(unitName);

    const title = name+' ('+fishKind+', '+totalNum+' '+unitName+', '+totalWeight+' kg)';
    const cData = bdd.compliance;
    const c1 = cData[0] ? {color:'blue'} : {color:'gray'};
    const c2 = cData[1] ? {color:'blue'} : {color:'gray'};
    const c3 = cData[2] ? {color:'blue'} : {color:'gray'};

    const compliance = (
      <View style={{flexDirection:'row',alignItems:'flex-end'}}>
        <Text style={c1}> ID</Text>
        <Text style={c2}> EU</Text>
        <Text style={c3}> US</Text>
      </View>
    );

    let calc = 'NOT SET';
    const netSellPrice = bdd.totalPrice ? bdd.totalPrice : 0;
    if(netSellPrice > 0) calc = 'Rp '+lib.toPrice(netSellPrice);
    let status = <Text style={{color:'gray',textAlign:'right',fontSize:10}}>{calc}</Text>;

    let row = 4;
    if(notes.length > 16) {
      row = Math.ceil(notes.length / 4);
    }

    const cells = this.renderNotes(notes,row);

    return (
      <View key={index+''}>
        <TouchableOpacity onPress={()=>this.handleEdit(batchId)}>
          <View style={{backgroundColor:'white',elevation:1,padding:10}}>
            <View style={{flexDirection:'row'}}>
              <View style={{flex:2}}><Text style={{fontWeight:'bold'}}>{title}</Text></View>
              <View style={{flex:1,alignItems:'flex-end'}}>{compliance}</View>
            </View>
            <Text />
            <View style={{flexDirection:'row'}}>
              {cells}
              <View style={{flex:1,justifyContent:'flex-end'}}>{status}</View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  showCalendar() {
    const cur = moment(this.state.dateFilter,'DD MMMM YYYY');

    DatePickerAndroid.open({
      date: cur.toDate()
    })
    .then(result=>{
      if(result.action !== DatePickerAndroid.dismissedAction) {
        const year = result.year;  
        const month = result.month;  
        const day = result.day;
        const d = new Date(year, month, day);
        const m = moment(d);
        const str = m.format('DD MMMM YYYY');
        this.setState({
          dateFilter:str
        });
      }
    });
  }

  render() {
    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    const dt = this.props.stateData.readyToDeliver;
    let rows = [];
    rows = _.groupBy(dt,(o)=>{
      return o["batchId"];
    });

    const ds = this.props.stateData.deliverySheets;
    for (let key in ds) {
      if (ds.hasOwnProperty(key)) {
        rows[key] = Object.assign({},ds[key]);
      }
    }

    rows = _.toArray(rows);

    const dateFilter = this.state.dateFilter;

    const filteredRows = _.filter(rows, function(o) { 
      if( !o.deliverySheetData ) return true;
      const deliveryDate = o.deliverySheetData.deliveryDate;
      const m = moment(deliveryDate,'YY-MM-DD');
      return (m.format('DD MMMM YYYY') == dateFilter);
    });

    return (
      <View style={{flex:1}}>
        <View>
          <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <TouchableOpacity onPress={()=>this.nextDay(false)}>
              <View style={{padding:15}}><FontAwesome name='arrow-left' size={25} /></View>
            </TouchableOpacity>
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
              <TouchableOpacity onPress={()=>this.showCalendar()}>
                <Text>{dateFilter}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={()=>this.nextDay(true)}>
              <View style={{padding:15}}><FontAwesome name='arrow-right' size={25} /></View>
            </TouchableOpacity>
          </View>
          <View style={{height:10}} />
        </View>

        <FlatList
          onRefresh={()=>this.refreshList()}
          refreshing={this.state.refreshing}                    
          data={filteredRows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderCardItem(item,index)}
          ItemSeparatorComponent={()=><View style={{height:10}} />}
        />
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

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;