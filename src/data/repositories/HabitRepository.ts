import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, IHabitRepository } from '../../domain/models/types';
import { STORAGE_KEYS } from '../../core/constants';

// Implementación concreta del contrato IHabitRepository
export class HabitRepository implements IHabitRepository {
  
  // Obtener todos los hábitos
  async getAll(): Promise<Habit[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      // Si devuelve null (primera vez que se abre la app), retornamos array vacío []
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error crítico leyendo hábitos:', e);
      throw new Error('No se pudieron cargar tus hábitos. Intenta reiniciar.');
    }
  }

  // Guardar un nuevo hábito o actualizar uno existente
  async save(habit: Habit): Promise<void> {
    try {
      const currentHabits = await this.getAll();
      
      // Buscamos si ya existe
      const index = currentHabits.findIndex(h => h.id === habit.id);
      
      if (index >= 0) {
        // Actualizar
        currentHabits[index] = habit;
      } else {
        // Crear nuevo
        currentHabits.push(habit);
      }

      // Serializamos a JSON y guardamos (Inyección de dependencia oculta aquí)
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(currentHabits));
    } catch (e) {
      console.error('Error guardando hábito:', e);
      throw new Error('Fallo al guardar. Tus datos están seguros, pero esta acción falló.');
    }
  }

  // Método específico para actualizar (reutiliza save por el principio DRY)
  async update(habit: Habit): Promise<void> {
    return this.save(habit);
  }

  // Eliminar hábito
  async delete(id: string): Promise<void> {
    try {
      const currentHabits = await this.getAll();
      const filteredHabits = currentHabits.filter(h => h.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(filteredHabits));
    } catch (e) {
      console.error('Error eliminando hábito:', e);
    }
  }
}