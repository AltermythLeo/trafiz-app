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
  SectionList,
  ScrollView
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
      headerTitle: (
        <Title txt={L('DELIVERY SHEET')} />
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
      rows:[],
      rows2:[],
      rows3:[]
    }
  }

  componentDidMount() {
    const deliverySheet = this.props.navigation.getParam('ds');
    const vd = this.props.navigation.getParam('vd');
    const fishCatchData = this.props.navigation.getParam('fishCatchData');

    const ds = Object.assign({},deliverySheet);

    // hack: test 100 fish
    // const tmp = Object.assign({},fishCatchData[0]);
    // for(let i=0;i<100;i++) {
    //   fishCatchData.push(tmp);
    // }
    
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
      {label:L('Supplier name'),val:ds.supplierName},
      {label:L('National registration supplier code'),val:ds.nationalRegistrationSupplierCode},
      {label:L('Total unit'),val:ds.numberOfFishOrLoin},
      {label:L('Total kg'),val:ds.totalWeight},
      {label:L('Delivery date'),val:ds.deliveryDate},
    ]

    const rows3 = [];
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
          const label = 'Grade '+grade;
          const val = L('total unit')+': ' +arr.length+'. '+L('total weight')+': '+totWeight+ ' kg';
          rows3.push({label,val});
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
    const rows2 = [];

    // fc.fishNameEng = c.indname;
    // fc.fishNameInd = c.englishname;
    // fc.unitName = c.unitmeasurement;
    // fc.species = c.threea_code;
    // fc.vesselName = c.shipname;
    // fc.vesselSize = shipData.vesselsize_param;
    // fc.vesselRegistrationNo = shipData.vessellicensenumber_param;
    // fc.expiredDate = expiredDate;
    // fc.vesselFlag = shipData.vesselflag_param;
    // fc.fishingGround = c.fishinggroundarea;
    // fc.landingSite = c.portname;
    // fc.gearType = shipData.vesselgeartype_param;
    // fc.catchDate = moment(c.purchasedate,'YYYY-MM-DD').format('YY-MM-DD');
    // fc.fishermanName = c.fishermanname ? c.fishermanname : '';
    // fc.landingDate = landingDate;
    // fc.fadused = fadused;
    
    for(let i=0;i<fishCatchData.length;i++) {
      const fish = fishCatchData[i];
      const idfish = fish.idfish;
      const species = fish.species ? fish.species : ds.species;
      const vesselName = fish.vesselName ? fish.vesselName : ds.vesselName;
      const fishermanName = fish.fishermanName ? fish.fishermanName : ds.fishermanName;
      const fishingGround = fish.fishingGround ? fish.fishingGround : ds.fishingGround;
      const landingSite = fish.landingSite ? fish.landingSite : ds.landingSite;
      const landingDate = fish.landingDate ? fish.landingDate : ds.landingDate;
      const unitName = fish.unitName ? fish.unitName : ds.unitName;
      const vesselSize = fish.vesselSize ? fish.vesselSize : ds.vesselSize;
      const vesselRegistrationNo = fish.vesselRegistrationNo ? fish.vesselRegistrationNo : ds.vesselRegistrationNo;
      const expiredDate = fish.expiredDate ? fish.expiredDate : ds.expiredDate;
      const vesselFlag = fish.vesselFlag ? fish.vesselFlag : ds.vesselFlag;
      const gearType = fish.gearType ? fish.gearType : ds.gearType;
      const fadused = fish.fadused ? fish.fadused : ds.fadused;
      const weight = fish.amount;
      const grade = fish.grade;
      const notes = fish.description;
      
      let str = "<tr><td>#0#</td><td>#1#</td><td>#2#</td><td>#3#</td><td>#4#</td><td>#5#</td><td>#6#</td><td>#7#</td><td>#8#</td><td>#9#</td><td>#10#</td></tr>";
      const dataTable2 = [
        ''+(i+1),
        idfish,
        species,
        vesselName,
        fishermanName,
        fishingGround,
        landingSite,
        landingDate,
        grade,
        unitName,
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
        idfish,species,grade,unitName,weight,vesselName,fishermanName,vesselSize
        ,vesselRegistrationNo,expiredDate,vesselFlag,fishingGround
        ,gearType,fadused,landingSite,landingDate];
      qrs = qrs.join(';');
      table2QR.push(qrs);

      const label = idfish;
      const sublabel = [
        L('species'),
        L('vessel name'),
        L('fisherman'),
        L('fishing ground'),
        L('landing site'),
        L('landing date'),
        L('grade'),
        L('unit measurement'),
        L('weight')
      ];
      const vals = dataTable2.slice(2);
      const vals2 = [];
      for(let j=0;j<vals.length;j++) {
        let key = '';
        let val = vals[j];
        if(val && val.length == 0) val = '-';
        if(j<sublabel.length) key = sublabel[j];
        vals2.push(key+': '+val);
      }
      const val = vals2.join('\n');
      rows2.push({label,val});
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
      rows2,
      rows3,
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
    const ww = dim.width;
    let code = this.state.code;
    if(code.length > 1024) code = code.substring(0, 1024);

    return (
      <View style={{flex:1}}>
        <ScrollView style={{flex:1}}>
          <View style={{width:ww,height:ww,alignItems:'center',justifyContent:'center'}}>
            <QRCode
              value={code}
              size={w}
              bgColor='black'
              fgColor='white'/>
          </View>
          <View style={{padding:10}}>
            <Text style={{textAlign:'center',fontSize:10}}>{code}</Text>
          </View>
        </ScrollView>
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
    const rows2 = this.state.rows2;
    const rows3 = this.state.rows3;

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{flex:1}}>
          <SectionList
            renderItem={({ item, index, section }) => this.renderItem(item,index)}
            renderSectionHeader={({section: {title}}) => (
              <View style={{padding:10,backgroundColor:'gray'}}>
                <Text style={{fontWeight: 'bold',color:'white'}}>{title}</Text>
              </View>
            )}
            sections={[
              { title: L('Delivery Sheet'), data: rows },
              { title: L('Fish List'), data: rows2 },
              { title: L('Grade Summary'), data: rows3 },
            ]}
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