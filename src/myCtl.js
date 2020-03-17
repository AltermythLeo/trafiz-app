import React from 'react';
import { 
  View, 
  Text,
  ScrollView,
  TouchableOpacity,
  Button,
  TextInput,
  Switch,
  DatePickerAndroid
} from 'react-native';
import Space from './space';
import moment from 'moment';

class MyInput extends React.Component {
  render() {
    const label = this.props.label;
    const props = this.props;
    return (
      <View>
        <View style={{flexDirection:'row',height:40,alignItems:'center',paddingHorizontal:5}}>
          <Text style={{flex:1}}>{label}</Text>
          <Space />
          <TextInput style={{borderColor:'gainsboro',borderWidth:1,width:150,height:36}} 
            {...props} />
        </View>
        <View style={{height:1,backgroundColor:'gainsboro'}} />
      </View>
    );
  }
}

class MyInfo extends React.Component {
  render() {
    const label = this.props.label;
    return (
      <View>
        <View style={{flexDirection:'row',height:40,alignItems:'center',paddingHorizontal:5}}>
          <Text style={{flex:1}}>{label}</Text>
          <Space />
          <Text>{this.props.value}</Text>
        </View>
        <View style={{height:1,backgroundColor:'gainsboro'}} />
      </View>
    );
  }
}

class MySwitch extends React.Component {
  render() {
    const label = this.props.label;
    const props = this.props;
    return (
      <View>
        <View style={{flexDirection:'row',height:40,alignItems:'center',paddingHorizontal:5}}>
          <Text style={{flex:1}}>{label}</Text>
          <Space />
          <Switch {...props}/>
        </View>
        <View style={{height:1,backgroundColor:'gainsboro'}} />
      </View>
    );
  }
}

class MyDateBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date:''
    }
  }

  changeDate() {
    let p = Promise.resolve();

    if(this.props.maxDateNow) {
      p = DatePickerAndroid.open({
        date: moment().toDate(),
        maxDate: moment().toDate(),
      });
    } else {
      p = DatePickerAndroid.open({
        date: moment().toDate()
      })
    }
    
    p
    .then(result=>{
      if(result.action !== DatePickerAndroid.dismissedAction) {
        const year = result.year;  
        const month = result.month;  
        const day = result.day;
        const d = new Date(year, month, day);
        const m = moment(d);
        const str = m.format('YYYY-MM-DD');
        this.props.onChangeDate(str);
      }

      console.warn(result);
    })
    .catch(err=>{
    });
  }

  render() {
    const placeholder = this.props.placeholder;
    const props = this.props;
    let text = placeholder;
    if(this.props.value && this.props.value.length > 0 ) {
      const ts = moment(this.props.value,'YYYY-MM-DD');
      text = ts.format('D MMMM YYYY');
    }

    return (
      <TouchableOpacity onPress={()=>this.changeDate()}>
        <Text style={{fontWeight:'bold'}}>{text}</Text>
      </TouchableOpacity>
    );
  }
}


export {MyInput,MyInfo,MySwitch,MyDateBtn};