export const STORAGE_KEYS = {
  GOALS: '@focusquest_goals_prod_v1', // Nueva llave para limpiar datos viejos
  USER_STATS: '@focusquest_stats_prod_v1',
};

export const GAME_RULES = {
  // Sistema de Recompensas (Dopamina)
  XP_DAILY_CHECK: 15,          // Check-in normal
  XP_WEEKLY_COMPLETE: 100,     // Completar meta semanal
  XP_MONTHLY_COMPLETE: 500,    // Completar meta mensual (Boss Raid)
  
  // Sistema de Castigo (Aversión a la pérdida)
  XP_PENALTY_MISSED_DEADLINE: -30,
  
  // Curva de Nivel
  LEVEL_BASE: 200,
  LEVEL_MULTIPLIER: 1.2,
};

// ... (mantiene lo anterior: STORAGE_KEYS, GAME_RULES)

export const STORE_ITEMS = [
  {
    id: 'freeze_streak',
    name: '❄️ Congelar Racha',
    description: 'Protege tu racha por 24h si fallas un día.',
    cost: 500,
    icon: 'snowflake'
  },
  {
    id: 'wallpaper_cyber',
    name: '🌆 Fondo Cyberpunk',
    description: 'Desbloquea el tema visual Neon City.',
    cost: 1000,
    icon: 'city-variant-outline'
  },
  {
    id: 'sound_pack_retro',
    name: '👾 Sonidos Retro',
    description: 'Efectos de sonido estilo 8-bits.',
    cost: 300,
    icon: 'controller-classic'
  }
];