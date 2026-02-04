# Cognitive Focus Assistant 🧠🚀

## Descripción
**Cognitive Focus Assistant** es una solución integral de escritorio diseñada para maximizar la productividad humana mediante técnicas de neurociencia aplicada y gestión de tiempo. Integra un temporizador Pomodoro avanzado, un sistema de bloqueo de distracciones a nivel de red y analíticas de rendimiento en tiempo real.

## 🛠 Arquitectura Técnica
El sistema sigue los principios de **Arquitectura Limpia (Clean Architecture)** y **SOLID**:
- **Core Layer:** Lógica pura del temporizador y algoritmos de enfoque.
- **Data Layer:** Persistencia en SQLite con patrones de Repositorio.
- **UI Layer:** Interfaz reactiva desarrollada en PyQt6.
- **Security:** Implementación de privilegios mínimos para la modificación del archivo `hosts` y validación de entradas.

## ✨ Características Principales
- ⏱ **Smart Pomodoro:** Ciclos de trabajo personalizables con transiciones automáticas.
- 🚫 **Distraction Blocker:** Bloqueo de dominios mediante manipulación segura del archivo de hosts de Windows.
- 📊 **Productivity Analytics:** Visualización de datos de enfoque semanales usando Matplotlib.
- 🔒 **Security First:** Los procesos de bloqueo requieren elevación de privilegios controlada.

## 🚀 Instalación y Ejecución (Windows 11)

### Requisitos Previos
- Python 3.10 o superior.
- Permisos de Administrador (para el bloqueo de sitios).

### Configuración
1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/Dpalominor15/cognitive-focus-assistant.git](https://github.com/Dpalominor15/cognitive-focus-assistant.git)
   cd cognitive-focus-assistant
