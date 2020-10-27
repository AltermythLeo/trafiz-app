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
  DatePickerAndroid,
  Alert
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
        <Title txt={L('CATCH')} />
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
      refreshing:false,
      dateFilter:moment().format('DD MMMM YYYY'),
      busyMsg:''
    }
  }

  componentDidMount() {
    // const newItem = {name:'Offline Item',unit:'unit',price:123};
    // this.props.actions.addCustomItem(newItem);
    // lib.delay(10)
    // .then(()=>{
    //   return this.saveOldLoanType();
    // })
    this.saveOldLoanType()
    .then(()=>{
      this.setState({
        show:'list',
        dateFilter:moment().format('DD MMMM YYYY')
      });  
    })
    .catch(()=>{
      this.setState({
        show:'list',
        dateFilter:moment().format('DD MMMM YYYY')
      });  
    });

    const login = this.props.stateLogin;
    if(login.offline && login.offlineTime > 0) {
      const ts = moment().unix();
      const diff = ts - login.offlineTime;
      if(diff > (7*24*3600)) {
        Alert.alert(L('Warning'),L('You have offline data for a week or more. Please sync IMMEDIATELY to prevent data loss and keep it safe in the server.'));
      }
    }
  }

  saveOldLoanType() {
    const ci = this.props.stateData.customitems ? this.props.stateData.customitems.slice() : [];
    if(ci.length == 0) return Promise.resolve();
    const login = this.props.stateLogin;
    const idmssupplier = login.idmssupplier;
    const uid = login.id;
    console.warn('save the old!');
    for(let i=0;i<ci.length;i++) {
      const obj = ci[i];
      const name = obj.name;
      const unit = obj.unit;
      const price = obj.price;
      const loantypeId = lib.getShortOfflineId('loantype',uid.toString(36))+'-'+i;        
      const json = {
        idmstypeitemloanofflineparam:loantypeId,
        typenameparam:name,
        unitparam:unit,
        priceperunitparam:price,
        idmssupplierparam:idmssupplier
      }

      this.props.actions.saveOldLoanType(json);
    }

    return this.props.actions.synchronizeNow()
      .then(()=>{
        return this.props.actions.getLoanType();
      })
      .then(()=>{
        return this.props.actions.clearCustomItem();
      });
  }

  nextDay(next) {
    const cur = moment(this.state.dateFilter,'DD MMMM YYYY');
    if(!next) {
      const prevDay = cur.subtract(1, 'd');
      const prevDayStr = prevDay.format('DD MMMM YYYY');
      this.setState({dateFilter:prevDayStr});

      this.retrieveChunk(prevDay);
    } else {
      const today = moment().format('DD MMMM YYYY');
      if(today == this.state.dateFilter) return;
      const nextDay = cur.add(1, 'd');
      const nextDayStr = nextDay.format('DD MMMM YYYY');
      this.setState({dateFilter:nextDayStr});

      this.retrieveChunk(nextDay);
    }
  }

  refreshList() {
    this.setState({refreshing:true});
    this.props.actions.getCatchFishes()
    .then(()=>{
      return this.props.actions.getExtraData();
    })
    .then(()=>{
      this.setState({refreshing:false});
    })
  }

  handleAdd() {
    this.props.navigation.push('CatchSelectPlayerScreen');
  }

  handleEdit(item) {
    this.props.navigation.push('CatchCatchListScreen',{
      data:item
    });
  }

  handleAddByQrCode() {
    this.props.navigation.navigate('CatchScanQRCodeScreen');
  }

  synchronize() {
    this.props.navigation.push('SynchScreen');
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
            const col = item.close ? lib.THEME_COLOR : null;
            return <Text key={item.id} style={{fontSize:10,color:col}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[1].map((item,i)=>{
            const col = item.close ? lib.THEME_COLOR : null;
            return <Text key={item.id} style={{fontSize:10,color:col}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[2].map((item,i)=>{
            const col = item.close ? lib.THEME_COLOR : null;
            return <Text key={item.id} style={{fontSize:10,color:col}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[3].map((item,i)=>{
            const col = item.close ? lib.THEME_COLOR : null;
            return <Text key={item.id} style={{fontSize:10,color:col}}>{item.code}</Text>
          })}
        </View>
      </View>
    )    
  }
  
  renderCardItem(data,index) {
    const fishes = data.fish ? data.fish : [];
    let totalWeight = 0;
    let totalNum = 0;

    const fishIdToDelivery = this.props.stateData.fishIdToDelivery;

    const notes = [];
    for(let i=0;i<fishes.length;i++) {
      const num = Number(fishes[i].amount);
      if(num > 0) {
        totalWeight += Number(fishes[i].amount);
        totalNum++;
        const code = fishes[i].amount+''+fishes[i].grade;

        const idtrfishcatchoffline = fishes[i].idtrfishcatchoffline;
        const idfish = fishes[i].idfish;
        let close = false;
        if(fishIdToDelivery[idfish] && fishIdToDelivery[idfish].close) {
          close = true;
        }

        notes.push({id:fishes[i].idtrfishcatchoffline,code:code,close:close});
      }
    }
    
    const totalprice = Number(data.totalprice);
    const loanexpense = Number(data.loanexpense);
    const otherexpense = Number(data.otherexpense);
    const netBuyPrice = totalprice - loanexpense - otherexpense;

    let name = data.fishermanname;
    if(!name) name = '';
    if(data.buyersuppliername) name = data.buyersuppliername;
    
    let fishKind = data.englishname.toUpperCase();

    const english = (this.props.stateSetting.language == 'english');
    if(!english && data.indname && data.indname.length > 0) fishKind = data.indname.toUpperCase();

    const unitDef = [
      {label:'individual(s)',value:'1'},
      {label:'basket(s)',value:'0'}  
    ]

    let unitName =_.find(unitDef,{value:''+data.unitmeasurement});
    if(unitName) unitName = unitName.label; else unitName = 'unit';
    unitName = L(unitName);

    const title = name+' ('+fishKind+', '+totalNum+' '+unitName+', '+totalWeight+' kg)';
    const cData = [false,false,false]; // todo
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

    let calc = L('BUY PRICE NOT SET');
    if(netBuyPrice > 0) calc = 'Rp '+lib.toPrice(netBuyPrice);
    let status = <Text style={{color:'gray',textAlign:'right',fontSize:10}}>{calc}</Text>;

    let row = 4;
    if(notes.length > 16) {
      row = Math.ceil(notes.length / 4);
    }

    const cells = this.renderNotes(notes,row);

    return (
      <TouchableOpacity key={index+''} onPress={()=>this.handleEdit(data)}>
        <View style={{backgroundColor:'white',elevation:1,padding:10}}>
            <View style={{flexDirection:'row'}}>
              <View style={{flex:1}}><Text style={{fontWeight:'bold'}}>{title}</Text></View>
            </View>
          <Text />
          <View style={{flexDirection:'row'}}>
            {cells}
            <View style={{flex:1,justifyContent:'flex-end'}}>{status}</View>
          </View>
        </View>
      </TouchableOpacity>
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

        this.retrieveChunk(m);
      }
    });
  }

  retrieveChunk(m) {
    const mEndStr = m.format('MM YYYY');
    const mEnd = moment(mEndStr,'MM YYYY');
    const mNow = moment();
    const delta = mNow.diff(mEnd,'months');
    if(delta >= 0) {
      const cacheSavedMonth = this.props.stateData.cacheSavedMonth;
      let p = Promise.resolve();
      this.setState({show:'busy',busyMsg:''});
      let needRefresh = false;

      for(let i=0;i<=delta;i++) {

        p = p.then(()=>{
          const mCheck = moment().subtract(i,'month');
          const mCheckStr = mCheck.format('MM YYYY');
          const info = mCheck.format('MMMM YYYY');
          const fm = mCheck.month() + 1;
          const fy = mCheck.year();

          if(cacheSavedMonth[mCheckStr]) {
            console.warn(info+' already downloaded..');
            return;
          }

          needRefresh = true;

          this.setState({busyMsg:'Download data '+info});

          return this.props.actions.getCatchFishesByMonth(fm,fy)
            .then(()=>{
              return this.props.actions.getDeliveriesByMonthYear(fm,fy);
            })
            .then(()=>{
              console.warn(info+' downloaded..');
              return this.props.actions.flagCatchDownloaded(mCheckStr);
            })
        })

      }

      p = p.then(()=>{
        if(needRefresh) {
          return this.props.actions.getCatchFishes()
            .then(()=>{
              return this.props.actions.getExtraData();
            });
        }
      })
      .then(()=>{
        this.setState({show:'list'});
      });

    }

    // const now1 = moment().format('MM YYYY');
    // const now2 = moment().subtract(1,'month').format('MM YYYY');
    // const check = m.format('MM YYYY');

    // if(check === now1 || check === now2 ) {

    // } else {
    //   const fm = m.month() + 1;
    //   const fy = m.year();
    //   this.props.actions.getCatchFishesByMonth(fm,fy)
    //     .then(()=>{
    //       this.refreshList();
    //     });
    // }
  }

  render() {
    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
          <Text />
          <Text style={{textAlign:'center'}}>{this.state.busyMsg}</Text>
        </View>
      );
    }

    const catches = this.props.stateData.catches.slice();
    _.remove(catches,{lasttransact:"D"});
    const rows = catches;

    const offline = this.props.stateLogin.offline;
    const connection = this.props.stateApp.connectionStatus;
    let synchBtn = null;

    // if(offline && connection) {
    //   synchBtn = (
    //     <View>
    //       <Button raised text={L('Synchronize')} onPress={()=>this.synchronize()} />
    //       <View style={{height:5}} />
    //     </View>
    //   );
    // }

    const dateFilter = this.state.dateFilter;

    const filteredRows = _.filter(rows, function(o) { 
      const m = moment(o.purchasedate,'YYYY-MM-DD');
      return (m.format('DD MMMM YYYY') == dateFilter);
    });

    const sorted = filteredRows.sort(function (a, b) {
      let nameA = a.fishermanname ? a.fishermanname : a.buyersuppliername;
      if(nameA) nameA = nameA.toLowerCase();
      let nameB = b.fishermanname ? b.fishermanname : b.buyersuppliername;
      if(nameB) nameB = nameB.toLowerCase();
      if (nameA < nameB)
        return -1;
      if (nameA > nameB)
        return 1;
      return 0;
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
          data={sorted}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderCardItem(item,index)}
          ItemSeparatorComponent={()=><View style={{height:10}} />}
        />
        <View style={{padding:10,backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          {synchBtn}
          <Button raised primary text={L('+CATCH')} onPress={()=>this.handleAdd()} />
          <View style={{height:10}} />
          <Button raised text={L('+CATCH BY QRCODE')} onPress={()=>this.handleAddByQrCode()} />
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

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;