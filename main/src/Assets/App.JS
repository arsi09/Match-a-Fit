import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native-safe-area-context';
import LoginScreen from './src/View/Screens/Auth/LoginScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LoginScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});