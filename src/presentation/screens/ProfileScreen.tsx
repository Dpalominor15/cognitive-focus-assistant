import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Avatar, Surface } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

export const ProfileScreen = () => {
  const { userName, userStats, logout } = useApp();

  return (
    <View style={{flex: 1, backgroundColor: '#121212'}}>
      <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.header}>
        <Avatar.Text size={80} label={userName?.substring(0,2).toUpperCase() || "FQ"} style={{backgroundColor: '#6C63FF'}} />
        <Text variant="headlineMedium" style={{color: 'white', marginTop: 10, fontWeight: 'bold'}}>{userName}</Text>
        <Text variant="titleMedium" style={{color: '#FFD700'}}>Nivel {userStats.level} • {userStats.xp} XP</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text variant="titleLarge" style={{color: 'white', marginBottom: 15, fontWeight: 'bold'}}>🏆 Coleccionables</Text>
        
        {/* Grid de Logros (Simulado por ahora) */}
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((item) => (
            <Surface key={item} style={styles.item} elevation={2}>
               <View style={styles.locked}>
                 <Text style={{fontSize: 24}}>🔒</Text>
                 <Text style={{color: '#666', fontSize: 10, marginTop: 5}}>Nivel {item * 5}</Text>
               </View>
            </Surface>
          ))}
        </View>

        <Text variant="titleLarge" style={{color: 'white', marginVertical: 15, fontWeight: 'bold'}}>⚙️ Sistema</Text>
        <Button mode="outlined" onPress={logout} textColor="#FF5555" style={{borderColor: '#FF5555'}}>
          Cerrar Sesión
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { padding: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  item: { width: '48%', height: 100, backgroundColor: '#222', borderRadius: 12, marginBottom: 15, justifyContent: 'center', alignItems: 'center' },
  locked: { alignItems: 'center', opacity: 0.5 }
});