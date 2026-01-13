import * as Notifications from 'expo-notifications';

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
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') await Notifications.requestPermissionsAsync();
  }

  static async scheduleProgressAlerts(title: string, createdAtIso: string, deadlineIso: string) {
    const start = new Date(createdAtIso).getTime();
    const end = new Date(deadlineIso).getTime();
    const now = new Date().getTime();
    const totalDuration = end - start;

    // Si la tarea es muy corta (menos de 10 min), solo programamos el final
    if (totalDuration < 10 * 60 * 1000) {
        await this.scheduleExact(title, "⏳ ¡TIEMPO AGOTADO!", "Se acabó. Entra para ver las consecuencias.", end);
        return;
    }

    // Calcular momentos clave
    const time75 = start + (totalDuration * 0.25); // Ha pasado 25%, queda 75%
    const time50 = start + (totalDuration * 0.50); // Queda 50%
    const time15 = start + (totalDuration * 0.85); // Queda 15% (Zona Roja)

    // Programar solo si el momento es en el futuro
    if (time75 > now) await this.scheduleExact(title, "🟢 Buen Ritmo (75%)", `Sigues en zona verde con ${title}. Mantén el paso.`, time75);
    if (time50 > now) await this.scheduleExact(title, "🟡 Mitad de Tiempo (50%)", `Atención: ${title} está a la mitad. Acelera.`, time50);
    if (time15 > now) await this.scheduleExact(title, "🔴 ZONA CRÍTICA (15%)", `¡PELIGRO! ${title} está por vencer. ¡TERMINA YA!`, time15);
    
    // Deadline Final
    if (end > now) await this.scheduleExact(title, "💀 DEADLINE ALCANZADO", `Se acabó el tiempo para: ${title}.`, end);
  }

  private static async scheduleExact(title: string, alertTitle: string, body: string, triggerTimestamp: number) {
    await Notifications.scheduleNotificationAsync({
      content: { title: alertTitle, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerTimestamp),
      },
    });
  }

  static async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}