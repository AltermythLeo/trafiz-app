import XLSX from 'xlsx';
import React, { Component } from 'react';
import {
  Alert,
  Text,
  View,
  ActivityIndicator
} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import {writeFile, readFileAssets, readDirAssets, DocumentDirectoryPath, ExternalDirectoryPath, ExternalStorageDirectoryPath } from 'react-native-fs';
import moment from 'moment';
import { Navicon, BackButton, OnlineIndicator, Title } from './Navicon';
import { Button } from 'react-native-material-ui';
import FileViewer from 'react-native-file-viewer';

const L = require('./dictionary').translate;
const DDP = DocumentDirectoryPath + "/";
const EDP = ExternalDirectoryPath + "/";
const ESDP = ExternalStorageDirectoryPath + "/";
const input = res => res;
const output = str => str;

export default class App extends Component {
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
      data:[],
      errMsg:'',
      fileName:'trafiz.xlsx'
    }
  }

  componentDidMount() {
    const data = this.props.navigation.getParam('data',[]);
    const fn = this.props.navigation.getParam('fn');
    console.warn(data);
    this.setState({data:data,fileName:fn+'.xlsx'});
    this.requestPermission();
  }

  loadTemplate() {
    this.setState({show:'content'});

    // readFileAssets("templatereportcatch.xlsx", 'ascii').then((res) => {
    //   /* parse file */
    //   const wb = XLSX.read(input(res), {type:'binary'});

    //   /* convert first worksheet to AOA */
    //   const wsname = wb.SheetNames[0];
    //   const ws = wb.Sheets[wsname];
    //   const data = XLSX.utils.sheet_to_json(ws, {header:1});

    //   /* update state */
    //   console.warn(data);
    //   this.setState({show:'content'});
    // }).catch((err) => { Alert.alert("importFile Error", "Error " + err.message); });
  }

  requestPermission() {
    const errMsg = 'Permission denied. Please allow storage permission via settings.';
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Trafiz Storage Permission',
        message:
          'Trafiz needs access to your storage to export file.',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    )
    .then(granted => {
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('You can use the storage');
        this.loadTemplate();
      } else {
        console.warn('Storage permission denied');
        this.setState({show:'error',errMsg:errMsg});
      }  
    })
    .catch(err => {
      console.warn(err);
      this.setState({show:'error',errMsg:errMsg});
    })
  }

  handleExport() {
    this.exportFile(this.state.data);
  }

  exportFile(data) {
		/* convert AOA back to worksheet */
		const ws = XLSX.utils.aoa_to_sheet(data);

		/* build new workbook */
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Report");

		/* write file */
    const wbout = XLSX.write(wb, {type:'binary', bookType:"xlsx"});
    const fn = (this.state.fileName).toLowerCase();
    const file = ESDP + fn;
    const fileRetry = DDP + fn;
    console.warn(fn);
    writeFile(file, output(wbout), 'ascii')
    .then((res) =>{
      Alert.alert("Export xlsx success", "Exported to " + file,
      [
        {text: 'OPEN', onPress: () => this.openFile(file)},
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ]);
    })
    .catch((err) => { 
      console.warn(err);
      this.retryWrite(fileRetry,wbout);
    });
  };

  openFile(file) {
    FileViewer.open(file);
  }
  
  retryWrite(file, toWrite) {
    writeFile(file, output(toWrite), 'ascii')
    .then((res) =>{
      Alert.alert("Export xlsx success", "Exported to " + file,
      [
        {text: 'OPEN', onPress: () => this.openFile(file)},
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ]);
    })
    .catch((err) => { 
      console.warn(err.message);
      this.setState({show:'error',errMsg:'Can not save xlsx file. Please retry later.'});
    });
  }

  render() {
    if(this.state.show == 'busy') return (
      <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator />
      </View>
    );

    if(this.state.show == 'error') return (
      <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
        <Text style={{textAlign:'center'}}>{this.state.errMsg}</Text>
      </View>
    );

    const msg = L('Save report to .xlsx format?');
    return (
      <View style={{flex:1,backgroundColor:'white',justifyContent:'center'}}>
        <View style={{padding:15,flex:1,alignItems:'center',justifyContent:'center'}} >
          <Text style={{textAlign:'center'}}>{L(msg)}</Text>
          <Text />
        </View>
        <Button raised primary text={L('Yes')} onPress={()=>this.handleExport()} />
      </View>
    );
  }
}
