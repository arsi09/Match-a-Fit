import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import SignUpScreen from '../src/View/Screens/Auth/SignUpScreen';

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SignUpScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});