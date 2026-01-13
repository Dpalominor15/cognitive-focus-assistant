import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Text, Surface, Button, IconButton } from 'react-native-paper';
import { STORE_ITEMS } from '../../core/constants';
import { useApp } from '../context/AppContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const StoreModal: React.FC<Props> = ({ visible, onClose }) => {
  const { userStats, buyItem, inventory } = useApp();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.header}>
            <Text variant="headlineMedium" style={{color: 'white', fontWeight: 'bold'}}>MERCADO NEGRO</Text>
            <Text style={{color: '#FFD700', fontSize: 18}}>Saldo: {userStats.xp} XP</Text>
            <IconButton icon="close" iconColor="white" onPress={onClose} style={{position: 'absolute', right: 10, top: 10}} />
        </LinearGradient>

        <ScrollView contentContainerStyle={{padding: 20}}>
            {STORE_ITEMS.map(item => {
                const isOwned = inventory.includes(item.id);
                return (
                    <Surface key={item.id} style={styles.itemCard} elevation={2}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name={item.icon as any} size={30} color="#00F3FF" />
                        </View>
                        <View style={{flex: 1, marginLeft: 15}}>
                            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>{item.name}</Text>
                            <Text style={{color: '#888', fontSize: 12}}>{item.description}</Text>
                        </View>
                        <Button 
                            mode={isOwned ? "outlined" : "contained"} 
                            onPress={() => !isOwned && buyItem(item.id)}
                            buttonColor={isOwned ? 'transparent' : '#6C63FF'}
                            textColor={isOwned ? '#4CAF50' : 'white'}
                            disabled={isOwned}
                        >
                            {isOwned ? "Comprado" : `${item.cost} XP`}
                        </Button>
                    </Surface>
                );
            })}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 30, paddingTop: 50, alignItems: 'center' },
  itemCard: { flexDirection: 'row', backgroundColor: '#222', padding: 15, borderRadius: 12, marginBottom: 15, alignItems: 'center' },
  iconBox: { width: 50, height: 50, borderRadius: 10, backgroundColor: 'rgba(0, 243, 255, 0.1)', justifyContent: 'center', alignItems: 'center' }
});