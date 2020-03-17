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
import { Navicon, BackButton, OnlineIndicator } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import QRCode from 'react-native-qrcode';
import SendSMS from 'react-native-sms';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';

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
      rows:[]
    }
  }

  componentDidMount() {
    const deliverySheet = this.props.navigation.getParam('ds');
    const vd = this.props.navigation.getParam('vd');
    const fishCatchData = this.props.navigation.getParam('fishCatchData');

    if(fishCatchData) console.warn(fishCatchData);
    const ds = Object.assign({},deliverySheet);

    console.warn(ds);

    // ensure no null
    const keys = [
      'deliverySheetNo',
      'nationalRegistrationSupplierCode',
      'deliveryDate',
      'species',
      'numberOfFishOrLoin',
      'totalWeight',
      'vesselName',
      'vesselSize',
      'vesselRegistrationNo',
      'expiredDate',
      'vesselFlag',
      'fishingGround',
      'landingSite',
      'gearType',
      'catchDate',
      'fishermanName',
      'landingDate',
      'unitName',
      'fadused'
    ];

    for(let i=0;i<keys.length;i++) {
      const key = keys[i];
      if( !ds[key] ) ds[key] = '';
    }

    const rows = [
      {label:L('Delivery sheet no'),val:ds.deliverySheetNo},
      {label:L('National registration supplier code'),val:ds.nationalRegistrationSupplierCode},
      {label:L('Delivery date'),val:ds.deliveryDate},
      {label:L('Species'),val:ds.species},
      {label:L('Number of fish/loin'),val:ds.numberOfFishOrLoin},
      {label:L('Total weight'),val:ds.totalWeight},
      {label:L('Vessel name'),val:ds.vesselName},
      {label:L('Vessel size (GT)'),val:ds.vesselSize},
      {label:L('Vessel registration no'),val:ds.vesselRegistrationNo},
      {label:L('Expired date'),val:ds.expiredDate},
      {label:L('Vessel flag'),val:ds.vesselFlag},
      {label:L('Fishing ground'),val:ds.fishingGround},
      {label:L('Landing site'),val:ds.landingSite},
      {label:L('Gear type'),val:ds.gearType},
      {label:L('Catch date'),val:ds.catchDate}
    ]

    const data3 = [];
    if( fishCatchData ) {
      const groupByGrade = _.groupBy(fishCatchData,(o)=>{
        return o["grade"];
      });

      let strs = [];
      for (let key in groupByGrade) {
        if (groupByGrade.hasOwnProperty(key)) {
          const arr = groupByGrade[key];
          const grade = key;
          let totWeight = 0;
          for(let i=0;i<arr.length;i++) {
            totWeight += Number(arr[i].amount);
          }
          data3.push({grade:grade,num:arr.length,totWeight:totWeight});
        }
      }

    }

    let html = '';
    let title = '<h2>Delivery Sheet TRAFIZ</h2><br />';
    
    let table1 = "<table><tr><td>Delivery sheet no </td><td>#0</td><td>Delivery date</td><td>#4</td></tr><tr><td>Supplier name </td><td>#1</td><td>Supplier registration id</td><td>#5</td></tr><tr><td>Total unit </td><td>#2</td><td></td><td></td></tr><tr><td>Total kg </td><td>#3</td><td></td><td></td></tr></table><br />";
    const dataTable1 = [
      ds.deliverySheetNo,
      ds.supplierName,
      ds.numberOfFishOrLoin, // totUnit
      ds.totalWeight,
      ds.deliveryDate,
      ds.nationalRegistrationSupplierCode
    ];
    for(let i=0;i<dataTable1.length;i++) {
      const val = dataTable1[i];
      const change = '#'+i;
      table1 = table1.replace(change,val);
    }

    let table2 = "<table border=1><tr><th>No</th><th>Fish ID</th><th>Species</th><th>Vessel Name</th><th>Fisherman</th><th>Fishing ground</th><th>Landing site</th><th>Landing date</th><th>Grade</th><th>Unit of measurement</th><th>Weight (kg)</th></tr>";
    const table2QR = [];
    
    for(let i=0;i<fishCatchData.length;i++) {
      const fish = fishCatchData[i];
      const idfish = fish.idfish;
      const weight = fish.amount;
      const grade = fish.grade;
      const notes = fish.description;
      
      let str = "<tr><td>#0#</td><td>#1#</td><td>#2#</td><td>#3#</td><td>#4#</td><td>#5#</td><td>#6#</td><td>#7#</td><td>#8#</td><td>#9#</td><td>#10#</td></tr>";
      const dataTable2 = [
        ''+(i+1),
        idfish,
        ds.species,
        ds.vesselName,
        ds.fishermanName,
        ds.fishingGround,
        ds.landingSite,
        ds.landingDate,
        grade,
        ds.unitName,
        weight
      ];

      for(let j=0;j<dataTable2.length;j++) {
        const val = dataTable2[j];
        const change = '#'+j+'#';
        str = str.replace(change,val);
      }

      table2 += str;

      // Fish ID 
      // Species
      // Grade
      // Unit of Measurement
      // Weight Kg
      // Vessel Name
      // Fisherman
      // Vessel Size
      // Vessel Reg No
      // Vessel License Expired Date
      // Vessel Flag 
      // Fishing Ground
      // Gear Type
      // FAD Use
      // Landing Site
      // Landing Date

      let qrs = [
        idfish,ds.species,grade,ds.unitName,weight,ds.vesselName,ds.fishermanName,ds.vesselSize
        ,ds.vesselRegistrationNo,ds.expiredDate,ds.vesselFlag,ds.fishingGround
        ,ds.gearType,ds.fadused,ds.landingSite,ds.landingDate];
      qrs = qrs.join(';');
      table2QR.push(qrs);
    }

    table2 += "</table><br />";

    const codeFish = table2QR.join('#');
    let code = ds.deliverySheetNo+';'+ds.nationalRegistrationSupplierCode+';'+ds.supplierName+';'+ds.deliveryDate
      +'#'+codeFish;

    let table3 = "<table><tr><td>Total unit per grade</td><td> </td><td>Total weight(kg) per grade</td></tr><tr></tr>";
    for(let i=0;i<data3.length;i++) {
      const str = "<tr><td>Grade "+data3[i].grade+":"+data3[i].num+"</td><td> </td><td>Grade "+data3[i].grade+":"+data3[i].totWeight+" kg</td></tr><tr>";
      table3 += str;
    }
    table3 += "</table>";

    html = title + table1 + table2 + table3;

    this.setState({
      show:'list',
      rows,
      code,
      html
    });
  }

  generatePdf() {
    // let options = {
    //   html: this.state.html,
    //   fileName: 'ds'+moment().unix(),
    //   directory: 'docs',
    // };

    this.setState({show:'busy'});
    //RNHTMLtoPDF.convert(options)
    RNPrint.print({
      html: this.state.html
    })
    .then(file=>{
      this.setState({show:'list'});
    })
    .then(err=>{
      console.warn(err);
      this.setState({show:'list'});
    })
  }

  renderItem(item,index) {
    const label = item.label;
    let val = item.val;
    if(!val || val.length == 0) val = '';
    return (
      <View style={{padding:10,borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <Text style={{fontWeight:'bold'}}>{label}</Text>
          <Text style={{}}>{val}</Text>
      </View>
    );
  }

  renderQRCode() {
    const dim = Dimensions.get('window');
    const w = Math.floor(dim.width * 0.8);

    return (
      <View style={{flex:1}}>
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <QRCode
            value={this.state.code}
            size={w}
            bgColor='black'
            fgColor='white'/>
          <Text />
          <Text />
          <View style={{padding:10}}>
            <Text style={{textAlign:'center',fontSize:10}}>{this.state.code}</Text>
          </View>
        </View>
        <Button raised primary text={L('Show List')} onPress={()=>this.setState({show:'list'})} />
      </View>
    );
  }

  sendSMS() {
    SendSMS.send({
      body: this.state.code,
      recipients: [],
      successTypes: ['sent', 'queued']
    }, (completed, cancelled, error) => {
  
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

    if(this.state.show === 'qrcode') {
      return this.renderQRCode();
    }

    const rows = this.state.rows;

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{flex:1}}>
          <FlatList
            data={rows}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
          />
        </View>
        <View style={{padding:10,backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          <Button raised primary text={L('QR Code')} onPress={()=>this.setState({show:'qrcode'})} />
          <View style={{height:5}} />
          <Button raised text={L('PRINT')} onPress={()=>this.generatePdf()} />
          <View style={{height:5}} />
          <Button raised text={L('Send SMS')} onPress={()=>this.sendSMS()} />
        </View>
      </View>
    );
  }}

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