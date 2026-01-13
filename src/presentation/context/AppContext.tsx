import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AppState } from 'react-native';
import { Goal, UserStats, GoalType, JournalEntry } from '../../domain/models/types';
import { GamificationService } from '../../domain/services/GamificationService';
import { SoundManager } from '../../core/audio/SoundManager';
import { NotificationManager } from '../../core/notifications/NotificationManager';
import { STORAGE_KEYS, GAME_RULES, STORE_ITEMS } from '../../core/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DamageReport { xpLost: number; titles: string[]; }

// Definición de colores según urgencia
export type TimeStatus = 'blue' | 'green' | 'yellow' | 'red' | 'expired';

interface AppContextType {
  userName: string | null;
  login: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  goals: Goal[];
  userStats: UserStats;
  loading: boolean;
  addGoal: (title: string, type: GoalType, deadline: Date, category: Goal['category']) => Promise<void>;
  checkInGoal: (id: string, journalEntry: JournalEntry) => Promise<boolean>;
  
  isPanicMode: boolean;
  togglePanicMode: () => void;
  buyItem: (itemId: string) => Promise<boolean>;
  inventory: string[];
  
  damageReport: DamageReport | null;
  clearDamageReport: () => void;
  
  // Helper de color visual
  getTimeColor: (goal: Goal) => TimeStatus;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(GamificationService.getInitialStats());
  const [inventory, setInventory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [damageReport, setDamageReport] = useState<DamageReport | null>(null);

  // --- LÓGICA DE TIEMPO Y COLOR ---
  const getTimeColor = (goal: Goal): TimeStatus => {
    if (goal.isCompleted) return 'blue'; // Completado es azul/calma
    
    const start = new Date(goal.createdAt).getTime();
    const end = new Date(goal.deadline).getTime();
    const now = new Date().getTime();

    if (now > end) return 'expired'; // Ya venció

    const total = end - start;
    const remaining = end - now;
    const percentageLeft = remaining / total;

    if (percentageLeft > 0.75) return 'blue';   // > 75%
    if (percentageLeft > 0.50) return 'green';  // 50% - 75%
    if (percentageLeft > 0.15) return 'yellow'; // 15% - 50%
    return 'red';                               // < 15% (Pánico)
  };

  // --- INICIALIZACIÓN ---
  useEffect(() => {
    const init = async () => {
      await NotificationManager.requestPermissions();
      await loadData(); // Carga inicial
      setLoading(false);
    };
    init();

    // LISTENER DE APP STATE (CORREGIDO)
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // console.log("App volvió al primer plano. Verificando daños...");
        await loadDataAndCheckPunishment(); 
      }
    });

    return () => subscription.remove();
  }, []);

  const loadData = async () => {
      const storedName = await AsyncStorage.getItem('USER_NAME');
      const goalsJson = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      const statsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
      const invJson = await AsyncStorage.getItem('USER_INVENTORY');
      
      if (storedName) setUserName(storedName);
      if (goalsJson) setGoals(JSON.parse(goalsJson));
      if (statsJson) setUserStats(JSON.parse(statsJson));
      if (invJson) setInventory(JSON.parse(invJson));
  };

  // Esta función recarga del disco Y aplica castigos. Es la "Fuente de la Verdad".
  const loadDataAndCheckPunishment = async () => {
    const goalsJson = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
    const statsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
    
    if (!goalsJson || !statsJson) return;

    let currentGoals: Goal[] = JSON.parse(goalsJson);
    let currentStats: UserStats = JSON.parse(statsJson);
    const now = new Date();

    // FILTRAR: ¿Qué venció, no está completo y no ha sido castigado?
    const missedGoals = currentGoals.filter(g => 
      !g.isCompleted &&           
      !g.penaltyApplied &&        
      new Date(g.deadline) < now  
    );

    if (missedGoals.length > 0) {
      let xpLost = 0;
      
      // Aplicar penalización usando las reglas corregidas
      const updatedGoals = currentGoals.map(g => {
        if (missedGoals.find(mg => mg.id === g.id)) {
          // Usamos la constante correcta para penalización
          const penalty = GAME_RULES.XP_PENALTY_MISSED_DEADLINE || 50; 
          xpLost += penalty;
          return { ...g, penaltyApplied: true }; // MARCAR PARA NO REPETIR
        }
        return g;
      });

      const newXp = Math.max(0, currentStats.xp - xpLost);
      const updatedStats = { ...currentStats, xp: newXp };

      // Guardar cambios CRÍTICOS
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updatedStats));
      
      // Actualizar estado visual
      setGoals(updatedGoals);
      setUserStats(updatedStats);
      setDamageReport({ xpLost, titles: missedGoals.map(g => g.title) });
      SoundManager.playSound('failure'); 
    } else {
        // Si no hay castigos, solo actualizamos la vista por si acaso hubo cambios externos
        setGoals(currentGoals);
        setUserStats(currentStats);
    }
  };

  const saveAll = async (newGoals: Goal[], newStats: UserStats, newInv?: string[]) => {
    setGoals(newGoals);
    setUserStats(newStats);
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
    await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(newStats));
    if (newInv) {
      setInventory(newInv);
      await AsyncStorage.setItem('USER_INVENTORY', JSON.stringify(newInv));
    }
  };

  const login = async (name: string) => { setUserName(name); await AsyncStorage.setItem('USER_NAME', name); };
  const logout = async () => { setUserName(null); await AsyncStorage.removeItem('USER_NAME'); };
  
  const addGoal = async (title: string, type: GoalType, deadline: Date, category: Goal['category']) => {
    const createdAt = new Date().toISOString();
    let targetCheckIns = type === 'weekly' ? 5 : type === 'monthly' ? 20 : 1;
    
    const newGoal: Goal = {
      id: Date.now().toString(),
      title, type, deadline: deadline.toISOString(), createdAt,
      targetCheckIns, currentCheckIns: 0, isCompleted: false, isArchived: false,
      streak: 0, lastCheckInDate: null, journal: [], category, penaltyApplied: false
    };

    // Programar notificaciones inteligentes
    await NotificationManager.scheduleProgressAlerts(title, createdAt, deadline.toISOString());

    const updatedGoals = [...goals, newGoal];
    await saveAll(updatedGoals, userStats);
    SoundManager.playSound('success'); 
  };

  const checkInGoal = async (id: string, journalEntry: JournalEntry): Promise<boolean> => {
    const goalIndex = goals.findIndex(g => g.id === id);
    if (goalIndex === -1) return false;
    
    const goal = goals[goalIndex];
    const newCurrentCheckIns = goal.currentCheckIns + 1;
    
    // Verificar si se completó
    let isCompleted = newCurrentCheckIns >= goal.targetCheckIns;
    
    // Actualizar meta
    const updatedGoal = { 
        ...goal, 
        currentCheckIns: newCurrentCheckIns, 
        isCompleted, 
        completedAt: isCompleted ? new Date().toISOString() : undefined, // Guardar fecha de éxito
        journal: [...goal.journal, journalEntry] 
    };
    
    // Calcular ganancia de XP usando el Servicio corregido
    let xpGained = 0;
    if (isCompleted) {
        xpGained = GamificationService.getXPValue(goal.type);
        SoundManager.playSound('levelUp');
    } else {
        xpGained = 15; // XP por check-in simple
        SoundManager.playSound('success');
    }
    
    // Bonus por Panic Mode
    if (isPanicMode) { 
        setIsPanicMode(false); 
        xpGained += 50; 
    }

    // Actualizar progreso del usuario
    const newStats = GamificationService.calculateProgress(userStats, xpGained);
    
    const newGoals = [...goals];
    newGoals[goalIndex] = updatedGoal;
    
    await saveAll(newGoals, newStats);
    return true;
  };

  const togglePanicMode = () => { setIsPanicMode(!isPanicMode); SoundManager.speak(isPanicMode ? "Normalizando." : "Modo Rescate."); };
  const buyItem = async (itemId: string) => { /* ... lógica de tienda ... */ return true; }; 
  const clearDamageReport = () => setDamageReport(null);

  return (
    <AppContext.Provider value={{ 
      userName, login, logout, goals, userStats, loading, addGoal, checkInGoal, 
      isPanicMode, togglePanicMode, buyItem, inventory, 
      damageReport, clearDamageReport, getTimeColor 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de un AppProvider');
  return context;
};