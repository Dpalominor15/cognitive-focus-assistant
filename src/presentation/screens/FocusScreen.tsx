import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, Surface, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'; // Asegúrate de instalar esto: npm install react-native-countdown-circle-timer
import { SoundManager } from '../../core/audio/SoundManager';

interface Props {
  onComplete: () => void;
  onCancel: () => void;
  goalTitle: string;
}

export const FocusScreen: React.FC<Props> = ({ onComplete, onCancel, goalTitle }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const DURATION = 25 * 60; // 25 minutos Pomodoro Hardcore

  useEffect(() => {
    SoundManager.speak("Modo Hardcore iniciado. No salgas.");
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#434343']} style={styles.background} />
      
      <View style={styles.content}>
        <Text variant="headlineMedium" style={{color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: 10}}>
          HARDCORE MODE
        </Text>
        <Text style={{color: '#FF5555', textAlign: 'center', marginBottom: 40}}>
          Misión: {goalTitle}
        </Text>

        <CountdownCircleTimer
          isPlaying={isPlaying}
          duration={DURATION}
          colors={['#004777', '#F7B801', '#A30000', '#A30000']}
          colorsTime={[DURATION, DURATION * 0.6, DURATION * 0.3, 0]}
          size={250}
          strokeWidth={15}
          onComplete={() => {
            SoundManager.playSound('levelUp');
            onComplete();
            return { shouldRepeat: false };
          }}
        >
          {({ remainingTime }) => {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            return (
              <Text variant="displayMedium" style={{color: 'white'}}>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </Text>
            );
          }}
        </CountdownCircleTimer>

        <View style={styles.controls}>
            {!isPlaying ? (
                <Button mode="contained" onPress={() => setIsPlaying(true)} buttonColor="#00F3FF" style={styles.btn}>
                    INICIAR SECUENCIA
                </Button>
            ) : (
                <Button mode="outlined" onPress={() => setIsPlaying(false)} textColor="#FF5555" style={styles.btn}>
                    PAUSAR
                </Button>
            )}
            
            <Button onPress={onCancel} textColor="#666" style={{marginTop: 20}}>
                ABORTAR MISIÓN (PENALIZACIÓN)
            </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  background: { position: 'absolute', width: '100%', height: '100%' },
  content: { alignItems: 'center', width: '100%' },
  controls: { marginTop: 50, width: '80%' },
  btn: { padding: 5, marginBottom: 10 }
});