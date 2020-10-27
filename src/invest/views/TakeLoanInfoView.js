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
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';

const lib = require('../../lib');
const L = require('../../dictionary').translate;

class Screen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount() {

    const initialData = this.props.initialData;
    if(initialData) {
      this.setState(initialData);
    }
  }

  renderItem(item,index) {
    return (
      <TouchableOpacity style={{}} onPress={()=>this.props.onClickRow(item)}>
        <View style={{padding:10, height:70, flexDirection:'row', alignItems:'center'}}>
          <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{item.dateValue} Rp {lib.toPrice(item.amount)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const loaner = this.props.loaner;
    const amount = this.props.amount;
    const tenor = this.props.tenor+'x';
    const note = this.props.notes;
    const history = this.props.history;
    const styles=
      StyleSheet.create({
        label:{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK, padding:5, paddingLeft:15},
        boldLabel:{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK, fontWeight:'bold'},
      });
    return (
      <View style={{flex:1}}>
        <View style={{flex:1, backgroundColor:'white'}}>
            <View style={{height:70, padding:10, paddingBottom:20}}>
                <Text style={styles.boldLabel}>{L('Lender Name')+':'} </Text>
                <Text style={styles.label}>{loaner}</Text>
            </View>
            <View style={{height:70, padding:10, paddingBottom:20}}>
                <Text style={styles.boldLabel}>{L('Debt Amount:')} </Text>
                <Text style={styles.label}>{'Rp ' + lib.toPrice(amount)}</Text>
            </View>
            <View style={{height:70, padding:10, paddingBottom:20}}>
                <Text style={styles.boldLabel}>{L('Loan Term') + ':'} </Text>
                <Text style={styles.label}>{tenor}</Text>
            </View>
            <View style={{height:70, padding:10, paddingBottom:20}}>
                <Text style={styles.boldLabel}>{L('Remark') + ':'} </Text>
                <Text style={styles.label}>{note}</Text>
            </View>
            <View style={{flex:1, padding:10}}>
                <Text style={styles.boldLabel}>{L('Payment History') + ':'} </Text>
                <Text />
                <FlatList
                    data={history}
                    keyExtractor={(item,index) => (''+index)}
                    renderItem={({item,index}) => this.renderItem(item,index)}
                />
            </View>
        </View>
        <View style={{}}>
            <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('Pay Loan<2>').replace('<2>','')}
              onPress={()=>this.props.onClickButtonNext()}></Button>
        </View>
      </View>
    );
  }

}

export default Screen;