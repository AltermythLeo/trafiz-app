/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { createStackNavigator, createSwitchNavigator, createBottomTabNavigator } from 'react-navigation';

class LoginCheckScreen extends React.Component {
  componentDidMount() {
    const isLogin = false;

    setTimeout(()=>{
      this.props.navigation.navigate(isLogin ? 'App' : 'Login');
    },1000);
  }
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
}

class DummyScreen extends React.Component {
  render() {
    return (
      <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
        <Text>DUMMY</Text>
      </View>
    );
  }
}

class MenuScreen1 extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <Text>MENU 1</Text>
        </View>
        <View style={{padding:10}}>
          <Button
            title="NEXT"
            onPress={() => this.props.navigation.navigate('Menu11')}
          />
        </View>
      </View>
    );
  }
}

class MenuScreen2 extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <Text>MENU 2</Text>
        </View>
        <View style={{padding:10}}>
          <Button
            title="NEXT"
            onPress={() => this.props.navigation.navigate('Menu21')}
          />
        </View>
      </View>
    );
  }
}


class LoginScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <Text>LOGIN SCREEN</Text>
        </View>
        <View style={{padding:10}}>
          <Button
            title="LOGIN"
            onPress={() => this.props.navigation.navigate('App')}
          />
        </View>
      </View>
    );
  }
}

const TabStack1 = createStackNavigator({ 
  Menu1: MenuScreen1,
  Menu11: DummyScreen
});

const TabStack2 = createStackNavigator({ 
  Menu2: MenuScreen2,
  Menu21: DummyScreen
});

const AppStack = createBottomTabNavigator({ 
  Tab1: TabStack1,
  Tab2: TabStack2
},{
  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, tintColor }) => {
      const { routeName } = navigation.state;
      let iconName;
      if(routeName === 'Tab1') iconName = 'ios-information-circle';
      else if(routeName === 'Tab2') iconName = 'ios-options';
      return <Ionicons name={iconName} size={25} color={tintColor} />;
    },
  }),
  tabBarOptions: {
    activeTintColor: 'tomato',
    inactiveTintColor: 'gray',
  },
}
);

const LoginStack = createStackNavigator({ 
  Login: LoginScreen
},
{
  headerMode: 'none'
});

const RootStack = createSwitchNavigator(
  {
    LoginCheck: LoginCheckScreen,
    App: AppStack,
    Login: LoginStack,
  },
  {
    initialRouteName: 'LoginCheck',
  }
);

export default class App extends Component {

  render() {
    return (
      <RootStack />
    );
  }
}
