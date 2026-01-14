export type GoalType = 'daily' | 'weekly' | 'monthly';
export type MoodType = 'fire' | 'happy' | 'neutral' | 'tired' | 'stressed';

export interface JournalEntry {
  date: string; // ISO String
  text: string;
  mood: MoodType;
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  
  // Lógica de Tiempo
  deadline: string; // ISO String (Fecha y Hora límite)
  createdAt: string;
  
  // Lógica de Frecuencia (Para Semanales/Mensuales)
  // Ejemplo: Semanal = Requiere 5 check-ins. Mensual = Requiere 20.
  targetCheckIns: number; 
  currentCheckIns: number;
  
  // Estado
  isCompleted: boolean; // ¿Se completó la meta final?
  isArchived: boolean;
  streak: number;
  
  // Historial y Psicología
  lastCheckInDate: string | null; // Para evitar doble check diario
  journal: JournalEntry[];
  
  category: 'health' | 'work' | 'learning' | 'mindset';
  
  // Para saber si ya cobramos el castigo
  penaltyApplied?: boolean;

  completedAt?: string; // Fecha ISO de cuando se completó al 100%
}

export interface UserStats {
  level: number;
  xp: number;
  totalFocusTime: number; // Minutos

  // --- NUEVAS PROPIEDADES ---
  currentStreak: number; // Racha de días seguidos usando la app
  longestStreak: number; // Récord histórico
  lastActiveDate?: string; // Para calcular la racha
  
  // Métricas avanzadas
  dailyGoalsCompleted: number;
  weeklyGoalsCompleted: number;
  monthlyGoalsCompleted: number;
}