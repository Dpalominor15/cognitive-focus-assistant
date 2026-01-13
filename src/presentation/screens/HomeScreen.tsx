import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, FAB, Button, Portal, Modal, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { GoalCard } from '../components/GoalCard'; // Asegúrate de que este archivo ya tenga el cambio de arriba
import { GoalType } from '../../domain/models/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StoreModal } from '../components/StoreModal';
import { FocusScreen } from './FocusScreen';
import { DamageModal } from '../components/DamageModal';
import LottieView from 'lottie-react-native';

export const HomeScreen = () => {
  const { goals, userStats, checkInGoal, addGoal, isPanicMode, togglePanicMode } = useApp();
  const confettiRef = useRef<LottieView>(null);

  const [visible, setVisible] = useState(false);
  const [storeVisible, setStoreVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<GoalType>('daily');
  const [deadline, setDeadline] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [hardcoreGoal, setHardcoreGoal] = useState<string | null>(null);

  const dailyGoals = goals.filter(g => g.type === 'daily' && !g.isCompleted);
  const strategicGoals = goals.filter(g => (g.type === 'weekly' || g.type === 'monthly') && !g.isCompleted);
  const displayedDailyGoals = isPanicMode ? dailyGoals.slice(0, 1) : dailyGoals;
  const showStrategic = !isPanicMode && strategicGoals.length > 0;

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await addGoal(newTitle, newType, deadline, 'work');
    setVisible(false);
    setNewTitle('');
    setNewType('daily');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDeadline(selectedDate);
  };

  const triggerConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.reset();
      confettiRef.current.play(0);
    }
  };

  // MODO HARDCORE ACTIVO
  if (hardcoreGoal) {
    const goal = goals.find(g => g.id === hardcoreGoal);
    return (
      <FocusScreen 
        goalTitle={goal?.title || "Misión"}
        onComplete={() => {
           checkInGoal(hardcoreGoal, {date: new Date().toISOString(), text: "Hardcore Session", mood: 'fire'});
           setHardcoreGoal(null);
           setTimeout(() => triggerConfetti(), 500); // Pequeño delay para asegurar que volvemos al home
        }}
        onCancel={() => setHardcoreGoal(null)}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HEADER */}
        <LinearGradient colors={['#6C63FF', '#4a43b8']} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineMedium" style={{color: 'white', fontWeight: 'bold'}}>Nivel {userStats.level}</Text>
              <Text style={{color: '#ddd'}}>Arquitecto de Vida</Text>
            </View>
            <TouchableOpacity onPress={() => setStoreVisible(true)}>
                <View style={styles.xpBadge}>
                    <MaterialCommunityIcons name="cart-outline" size={20} color="#FFD700" style={{marginRight: 5}} />
                    <Text variant="titleLarge" style={{color: '#FFD700', fontWeight: 'bold'}}>{userStats.xp} XP</Text>
                </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {isPanicMode && (
          <LinearGradient colors={['#FF416C', '#FF4B2B']} style={styles.panicBanner}>
            <Text style={{color: 'white', fontWeight: 'bold', textAlign: 'center'}}>🚨 MODO RESCATE ACTIVADO</Text>
          </LinearGradient>
        )}

        {/* ESTRATÉGICA */}
        {showStrategic && (
          <View style={{marginTop: 20}}>
            <Text style={styles.sectionTitle}>🗺️ CAMPAÑA ESTRATÉGICA</Text>
            {strategicGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onCheckIn={async (text, mood) => {
                  const success = await checkInGoal(goal.id, {date: new Date().toISOString(), text, mood});
                  if (success) triggerConfetti();
                }}
                onHardcore={() => setHardcoreGoal(goal.id)} // <--- CONECTADO AQUÍ
              />
            ))}
          </View>
        )}

        {/* TÁCTICA */}
        <View style={{marginTop: 20}}>
          <Text style={styles.sectionTitle}>⚔️ MISIONES DEL DÍA</Text>
          {displayedDailyGoals.length === 0 ? (
            <Text style={{color: '#555', textAlign: 'center', marginTop: 20, fontStyle: 'italic'}}>
               {isPanicMode ? "Zona despejada." : "Sin órdenes pendientes."}
            </Text>
          ) : (
            displayedDailyGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onCheckIn={async (text, mood) => {
                  const success = await checkInGoal(goal.id, {date: new Date().toISOString(), text, mood});
                  if (success) triggerConfetti();
                }}
                onHardcore={() => setHardcoreGoal(goal.id)} // <--- CONECTADO AQUÍ
              />
            ))
          )}
        </View>
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} color="white" />
      <FAB 
          icon={isPanicMode ? "meditation" : "alert-octagon"} 
          label={isPanicMode ? "Calmado" : "¡PÁNICO!"}
          style={[styles.fabPanic, {backgroundColor: isPanicMode ? '#4CAF50' : '#FF5555'}]} 
          onPress={togglePanicMode} 
          color="white" 
          small
      />

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <Text variant="headlineSmall" style={{color: 'white', fontWeight: 'bold', marginBottom: 15}}>Nueva Orden</Text>
          <TextInput label="Título" value={newTitle} onChangeText={setNewTitle} style={{backgroundColor: '#333', marginBottom: 15}} textColor="white" />
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
            {['daily', 'weekly', 'monthly'].map((t) => (
              <Button key={t} mode={newType === t ? 'contained' : 'outlined'} onPress={() => setNewType(t as any)} compact>
                {t.toUpperCase()}
              </Button>
            ))}
          </View>
          <Button mode="outlined" onPress={() => setShowPicker(true)} textColor="white" style={{borderColor: '#555', marginBottom: 20}}>
            Deadline: {deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Button>
          {showPicker && <DateTimePicker value={deadline} mode="datetime" display="default" onChange={onDateChange} />}
          <Button mode="contained" onPress={handleCreate} buttonColor="#6C63FF">CREAR</Button>
        </Modal>
      </Portal>

      <StoreModal visible={storeVisible} onClose={() => setStoreVisible(false)} />
      <DamageModal />

      <View style={styles.lottieContainer} pointerEvents="none">
        <LottieView ref={confettiRef} source={require('../../../assets/confetti.json')} autoPlay={false} loop={false} style={styles.lottie} resizeMode="cover" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { padding: 20, paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpBadge: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  panicBanner: { padding: 10, margin: 15, borderRadius: 10 },
  sectionTitle: { color: '#888', fontWeight: 'bold', marginLeft: 20, marginBottom: 5, fontSize: 12, letterSpacing: 1 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#6C63FF', borderRadius: 50 },
  fabPanic: { position: 'absolute', margin: 16, left: 0, bottom: 0 },
  modal: { backgroundColor: '#222', padding: 20, margin: 20, borderRadius: 16 },
  lottieContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, elevation: 100, justifyContent: 'center', alignItems: 'center' },
  lottie: { width: '100%', height: '100%' }
});