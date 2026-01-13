import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

export const DamageModal = () => {
  // Ahora estas propiedades SÍ existen en el contexto
  const { damageReport, clearDamageReport } = useApp();

  if (!damageReport) return null;

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <Surface style={styles.card} elevation={5}>
          <LinearGradient colors={['#8B0000', '#3E0000']} style={styles.header}>
            <MaterialCommunityIcons name="skull-outline" size={50} color="white" />
            <Text variant="headlineSmall" style={{color: 'white', fontWeight: 'bold', marginTop: 10}}>
              DAÑO CRÍTICO
            </Text>
          </LinearGradient>
          
          <View style={styles.content}>
            <Text style={{color: '#FF5555', fontSize: 16, textAlign: 'center', marginBottom: 20}}>
              El tiempo se agotó y tu reputación ha caído.
            </Text>

            <View style={styles.statBox}>
              <Text style={{color: '#FF5555', fontSize: 40, fontWeight: 'bold'}}>-{damageReport.xpLost}</Text>
              <Text style={{color: '#888'}}>XP PERDIDO</Text>
            </View>

            <Text style={{color: 'white', marginTop: 20, marginBottom: 10, alignSelf: 'flex-start'}}>Misiones Fallidas:</Text>
            
            {/* CORRECCIÓN: Tipado explícito para evitar error 'implicitly has any type' */}
            {damageReport.titles.map((title: string, index: number) => (
              <View key={index} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
                 <MaterialCommunityIcons name="close-circle" color="#FF5555" size={16} />
                 <Text style={{color: '#ccc', marginLeft: 10}}>{title}</Text>
              </View>
            ))}

            <Button 
              mode="contained" 
              onPress={clearDamageReport} 
              buttonColor="#333" 
              textColor="#FF5555"
              style={{marginTop: 20, width: '100%'}}
            >
              ACEPTAR CONSECUENCIAS
            </Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(50,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', borderRadius: 20, overflow: 'hidden', backgroundColor: '#1E1E1E' },
  header: { alignItems: 'center', padding: 20 },
  content: { padding: 20, alignItems: 'center' },
  statBox: { borderWidth: 2, borderColor: '#FF5555', padding: 15, borderRadius: 10, alignItems: 'center', width: '100%', borderStyle: 'dashed' }
});