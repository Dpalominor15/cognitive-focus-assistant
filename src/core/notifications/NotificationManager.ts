import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// CONFIGURACIÓN CORRECTA (NUEVA API)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationManager {
  static async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  static async scheduleProgressAlerts(title: string, createdAt: string, deadline: string) {
    // CORRECCIÓN DEL ERROR DE TYPESCRIPT:
    // Ahora debemos ser explícitos con el 'type' y 'repeats'.
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚔️ ¡No te rindas!",
        body: `¿Ya avanzaste con: ${title}? El tiempo corre.`,
        sound: true, // Nota: En Android puede requerir configuración adicional de canales
      },
      trigger: {
        // Usamos el enum oficial para decirle que es un intervalo de tiempo
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60, // 1 hora
        repeats: false,
      },
    });
  }
}