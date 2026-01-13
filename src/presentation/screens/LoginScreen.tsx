import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

export const LoginScreen = () => {
  const { login } = useApp();
  const [name, setName] = useState('');

  return (
    <LinearGradient colors={['#000000', '#1A1A2E']} style={styles.container}>
      <View style={styles.content}>
        <Text variant="displayMedium" style={styles.title}>FOCUS<Text style={{color:'#6C63FF'}}>QUEST</Text></Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Tu sistema operativo de vida.</Text>
        
        <Surface style={styles.card} elevation={4}>
          <Text style={{color: 'white', marginBottom: 10}}>¿Cómo te llamamos, Arquitecto?</Text>
          <TextInput 
            value={name} 
            onChangeText={setName} 
            mode="outlined"
            placeholder="Ej. Neo, Stark..."
            textColor="white"
            style={{backgroundColor: '#222', marginBottom: 20}}
            theme={{colors: {primary: '#6C63FF', outline: '#444'}}}
          />
          <Button 
            mode="contained" 
            onPress={() => name.trim() && login(name)}
            buttonColor="#6C63FF"
            contentStyle={{height: 50}}
          >
            INICIAR SISTEMA
          </Button>
        </Surface>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  content: { padding: 30 },
  title: { color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: '#888', textAlign: 'center', marginBottom: 50 },
  card: { padding: 20, backgroundColor: '#1E1E1E', borderRadius: 16 }
});