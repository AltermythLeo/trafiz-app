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
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
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
      headerTitle: (
        <Title txt={L('DELIVERY')} />
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
      refreshing:false
    }
  }

  componentDidMount() {
    this.setState({
      show:'list'
    });
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

  handleAdd() {
    this.props.navigation.push('DeliveryAddScreen',{
    });
  }
  
  handleSelect(data) {
    const select = this.props.navigation.getParam('select',false);
    if(select) {
      this.setState({show:'busy'});
      const catchData = this.props.navigation.getParam('data');
      const catchDataFish = catchData.fish;
      const selected = this.props.navigation.getParam('selected',[]);

      const fishToInsert = [];
      for(let i=0;i<catchDataFish.length;i++) {
        const toCheck = catchDataFish[i].idfish;
        if(selected.indexOf(toCheck) > -1) fishToInsert.push(catchDataFish[i]);
      }

      const batchDeliveries = this.props.stateData.batchDeliveries.slice();
      const indexToInsert = _.findIndex(batchDeliveries,{deliverysheetofflineid:data.deliverysheetofflineid});
      const fishIdToDelivery = Object.assign({},this.props.stateData.fishIdToDelivery);
  
      // remove all selected from previous batch deliveries
      console.warn(fishIdToDelivery);
      for(let i=0;i<selected.length;i++) {
        const fishId = selected[i];
        if(!fishIdToDelivery[fishId]) {
          fishIdToDelivery[fishId] = {nameBuyer:null,close:false,id:null};
        }
        const ref = fishIdToDelivery[fishId]; // nameBuyer, close, id
  
        if(!ref.close && ref.id) {
          const index = _.findIndex(batchDeliveries,{deliverysheetofflineid:ref.id});
          if(index > -1) {
            let fish = batchDeliveries[index].fish;
            _.remove(fish,{idfish:fishId});
            batchDeliveries[index].fish = fish;
          }
        }
      }  

      // deliverysheetofflineid:id,
      // buyerName:buyerData.name_param,
      // buyerId:buyerData.idbuyeroffline,
      // buyerSupplier:(buyerData.usertypename == "Supplier"),
      // fish:[],
      // sellPrice:0,
      // notes:'',
      // transportBy:null,
      // transportName:null,
      // transportReceipt:null,
      // deliverDate:null

      const login = this.props.stateLogin;
      let modBy = null;
      if(login.profile && login.profile.name) modBy = login.profile.name;
  
      // fish array:
      const fish = batchDeliveries[indexToInsert].fish;
      // add selected to batch deliveries
      for(let i=0;i<fishToInsert.length;i++) {
        const oneFish = Object.assign({},fishToInsert[i]);
        
        const fishId = oneFish.idfish;
        fishIdToDelivery[fishId] = {nameBuyer:data.buyerName,close:false,id:data.deliverysheetofflineid};
        oneFish.idtrcatchoffline = catchData.idtrcatchoffline;
        if(modBy) oneFish.modBy = modBy;
        
        fish.push(oneFish);
      }

      batchDeliveries[indexToInsert].fish = fish;

      this.props.actions.setFishIdToDelivery(fishIdToDelivery);
      this.props.actions.setBatchDeliveries(batchDeliveries);

      // console.warn(fishIdToDelivery);
      // console.warn(batchDeliveries);

      return this.props.actions.upsertBatchDeliveries()
        .then(()=>{
          this.props.navigation.goBack();   
        });
    }

    this.props.navigation.push('DeliveryCatchListScreen',{
      data
    });
  }

  renderItem(data,index) {

    // const data = {
    //   deliverysheetofflineid,
    //   buyerName,
    //   fish,
    //   sellPrice,
    //   notes,
    //   transportBy,
    //   transportName,
    //   transportReceipt,
    //   deliverDate
    // }

    let createdDate = '';
    if(data.createdDate) {
      createdDate = ', '+data.createdDate;
    }

    const notes = [];
    const numUnit = data.fish.length;
    let totalWeight = 0;
    for(let i=0;i<data.fish.length;i++) {
      const fish = data.fish[i];
      // "idtrfishcatch":null,
      // "idtrfishcatchoffline":null,
      // "amount":null,
      // "grade":null,
      // "description":null,
      // "idfish":null,
      // idtrcatchoffline

      const id = ''+index+''+i;
      const code = fish.amount + '' +fish.grade;
      notes.push({id:id,code:code});
      totalWeight += Number(fish.amount);
    }
    
    const buyerName = data.buyerName;
    const english = (this.props.stateSetting.language == 'english');

    const unitName = L('unit'); 
    const title = buyerName+' ('+numUnit+' '+unitName+', '+totalWeight+' kg'+createdDate+')';

    let calc = L('SELL PRICE NOT SET');
    if(Number(data.sellPrice) > 0 ) calc = 'Rp '+lib.toPrice(data.sellPrice);
    let status = <Text style={{color:'gray',textAlign:'right',fontSize:10}}>{calc}</Text>;

    let row = 4;
    if(notes.length > 16) {
      row = Math.ceil(notes.length / 4);
    }

    const cells = this.renderNotes(notes,row);

    return (
      <View key={index+''}>
        <TouchableOpacity onPress={()=>this.handleSelect(data)}>
          <View style={{backgroundColor:'white',elevation:1,padding:10}}>
            <View style={{flexDirection:'row'}}>
              <View style={{flex:1}}><Text style={{fontWeight:'bold'}}>{title}</Text></View>
            </View>
            <Text />
            <View style={{flexDirection:'row'}}>
              {cells}
              <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                {status}
              </View>
            </View>
          </View>
        </TouchableOpacity>
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

    const raws = this.props.stateData.batchDeliveries;
    const rows = [];
    for(let i=0;i<raws.length;i++) {
      if(raws[i].hidden) continue;
      rows.push(raws[i]);
    }

    const sorted = rows.sort(function (a, b) {
      let A = moment(a.createdDate,'YYYY-MM-DD').unix();
      let B = moment(b.createdDate,'YYYY-MM-DD').unix();
      return A-B;
    });


    return (
      <View style={{flex:1}}>
        <FlatList
          data={sorted}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItem(item,index)}
          ItemSeparatorComponent={()=><View style={{height:10}} />}
        />
        <View style={{padding:10,backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          <Button raised primary text={L('Add Delivery')} onPress={()=>this.handleAdd()} />
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