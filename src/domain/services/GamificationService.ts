import { UserStats, GoalType } from '../models/types';
import { GAME_RULES } from '../../core/constants';

export class GamificationService {
  
  static calculateProgress(currentStats: UserStats, xpGained: number): UserStats {
    let newXp = currentStats.xp + xpGained;
    let newLevel = currentStats.level;
    
    // PROTECCIÓN 1: Obtener XP necesaria con valor por defecto seguro (450)
    let xpNeeded = this.getXPForLevel(newLevel) || 450;

    // PROTECCIÓN 2: Límite de seguridad para el bucle (Evita congelamiento)
    let safetyCounter = 0;
    const MAX_LOOPS = 100; // Nunca permitirá más de 100 subidas de nivel de golpe

    while (newXp >= xpNeeded && safetyCounter < MAX_LOOPS) {
      newXp -= xpNeeded;
      newLevel++;
      xpNeeded = this.getXPForLevel(newLevel) || 450;
      safetyCounter++;
    }

    if (safetyCounter >= MAX_LOOPS) {
        console.warn("⚠️ Bucle de nivel detectado y detenido por seguridad.");
    }

    return { 
        ...currentStats, 
        level: newLevel, 
        xp: newXp 
    };
  }

  static getXPForLevel(level: number): number {
    // Si level es 0 o negativo, forzamos nivel 1
    const safeLevel = Math.max(1, level);
    // Usamos valores fallback por si GAME_RULES falla
    const base = GAME_RULES?.LEVEL_BASE || 450;
    const multiplier = GAME_RULES?.LEVEL_MULTIPLIER || 1.2;
    
    return Math.floor(base * Math.pow(multiplier, safeLevel - 1));
  }

  static getXPValue(type: GoalType): number {
    // Valores fallback seguros
    switch (type) {
      case 'weekly': return GAME_RULES?.XP_WEEKLY_COMPLETE || 150;
      case 'monthly': return GAME_RULES?.XP_MONTHLY_COMPLETE || 500;
      case 'daily': default: return GAME_RULES?.XP_DAILY_CHECK || 50;
    }
  }

  // ... Resto de métodos (getInitialStats, etc.) igual ...
  static getInitialStats(): UserStats {
      return { level: 1, xp: 0, totalFocusTime: 0, dailyGoalsCompleted: 0, weeklyGoalsCompleted: 0, monthlyGoalsCompleted: 0 };
  }
}