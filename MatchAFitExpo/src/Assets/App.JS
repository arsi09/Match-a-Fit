import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native-safe-area-context';
import LoginScreen from '../../main/src/View/Screens/Auth/LoginScreen.JS';

function App() {
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

export default App;