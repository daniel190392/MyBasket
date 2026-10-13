import React from 'react';
import { AppRegistry, View, StyleSheet, Text } from 'react-native';

import { AuthView } from './src/auth/AuthView';

const MainUIModule = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prueba sin librería</Text>
    </View>
  );
};

// Agregamos la definición de estilos
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Blanco puro para descartar transparencias
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
});

AppRegistry.registerComponent('UIComponentsView', () => MainUIModule);
AppRegistry.registerComponent('AuthView', () => AuthView);
