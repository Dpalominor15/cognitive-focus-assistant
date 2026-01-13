import React, { useState, useEffect } from 'react'; // useEffect para refrescar el color cada minuto
import { View, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Text, Surface, Button, ProgressBar } from 'react-native-paper';
import { Goal, MoodType } from '../../domain/models/types';
import { useAppTheme } from '../../core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext'; // Importar contexto para usar el helper

interface Props {
  goal: Goal;
  onCheckIn: (text: string, mood: MoodType) => void;
  onHardcore: () => void;
}

export const GoalCard: React.FC<Props> = ({ goal, onCheckIn, onHardcore }) => {
  const theme = useAppTheme();
  const { getTimeColor } = useApp(); // Usamos el helper del contexto
  
  const [showModal, setShowModal] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('fire');
  
  // Refresco automático: Forzamos re-render cada minuto para que el color cambie sin recargar
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000); // Check cada minuto
    return () => clearInterval(timer);
  }, []);

  const progress = goal.targetCheckIns > 0 ? goal.currentCheckIns / goal.targetCheckIns : 0;
  
  // OBTENER COLOR DINÁMICO
  const timeStatus = getTimeColor(goal);
  
  const getGradientColors = () => {
    // Si ya fue castigada, color gris oscuro/muerto
    if (goal.penaltyApplied) return ['#222', '#111']; 

    switch (timeStatus) {
      case 'blue': return ['#00F3FF', '#0066FF'];    // Inicio / Calma
      case 'green': return ['#00B386', '#006644'];   // Buen ritmo
      case 'yellow': return ['#FFD700', '#FF8C00'];  // Advertencia
      case 'red': return ['#FF416C', '#FF4B2B'];     // PELIGRO
      case 'expired': return ['#333', '#000'];       // Expirado (sin castigo aún)
      default: return ['#333', '#222'];
    }
  };

  const getStatusEmoji = () => {
      if (goal.penaltyApplied) return "💀 FALLIDA";
      if (timeStatus === 'blue') return "🛡️ INICIO";
      if (timeStatus === 'green') return "⚡ ACTIVO";
      if (timeStatus === 'yellow') return "⚠️ ATENCIÓN";
      if (timeStatus === 'red') return "🔥 CRÍTICO";
      return "⏳";
  };

  // ... (renderModal y handleSubmit iguales que antes) ...
  const handleSubmit = () => { onCheckIn(journalText || "Check-in", selectedMood); setShowModal(false); setJournalText(''); };
  const renderModal = () => ( /* ... código modal ... */ <Modal visible={showModal} transparent>{/*...*/}</Modal> );

  return (
    <>
      <Surface style={styles.container} elevation={2}>
        <LinearGradient 
            colors={getGradientColors() as any} 
            style={styles.borderGradient} 
            start={{x:0, y:0}} end={{x:0, y:1}}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <Text variant="titleMedium" style={{color: 'white', fontWeight: 'bold'}}>{goal.title}</Text>
                   
                   {/* BADGE DE ESTADO */}
                   <View style={[styles.badge, {backgroundColor: 'rgba(0,0,0,0.5)'}]}>
                      <Text style={[styles.badgeText, {color: timeStatus === 'red' ? '#FF416C' : 'white'}]}>
                        {getStatusEmoji()}
                      </Text>
                   </View>
                </View>
                
                <Text style={{color: '#aaa', fontSize: 11, marginTop: 4}}>
                  Deadline: {new Date(goal.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  {goal.penaltyApplied && <Text style={{color: '#FF5555', fontWeight: 'bold'}}> (PENALIZADA)</Text>}
                </Text>
              </View>
              
              {!goal.isCompleted && !goal.penaltyApplied && (
                 <View style={{flexDirection: 'row'}}>
                   <TouchableOpacity onPress={onHardcore} style={[styles.actionBtn, {backgroundColor: '#3E0000', borderColor: '#FF5555', marginRight: 10}]}>
                     <Text style={{fontSize: 18}}>💀</Text>
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => setShowModal(true)} style={[styles.actionBtn, {backgroundColor: '#333', borderColor: '#555'}]}>
                     <Text style={{fontSize: 18}}>⚡</Text>
                   </TouchableOpacity>
                 </View>
              )}
            </View>

            {goal.type !== 'daily' && (
              <View style={{marginTop: 15}}>
                <ProgressBar progress={progress} color="white" style={{height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)'}} />
              </View>
            )}
          </View>
        </LinearGradient>
      </Surface>
      {renderModal()}
    </>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginVertical: 8, borderRadius: 12, backgroundColor: 'transparent' },
  borderGradient: { borderRadius: 12, paddingLeft: 8 }, // Borde izquierdo más grueso para ver bien el color
  content: { backgroundColor: '#1E1E1E', padding: 16, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  actionBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
});