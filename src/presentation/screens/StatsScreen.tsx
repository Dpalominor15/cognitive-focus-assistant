import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importaciones de tu Arquitectura
import { useApp } from '../context/AppContext';
import { GamificationService } from '../../domain/services/GamificationService';
import { Goal } from '../../domain/models/types';

const screenWidth = Dimensions.get('window').width;

// --- HELPERS DE LÓGICA ---
const isGoalExpired = (goal: Goal): boolean => {
    return !goal.isCompleted && new Date(goal.deadline) < new Date();
};

const getGoalReason = (goal: Goal): string => {
    if (!goal.journal || goal.journal.length === 0) return "Sin registros.";
    // Acceso seguro al último elemento
    const lastEntry = goal.journal[goal.journal.length - 1];
    return `${lastEntry.mood.toUpperCase()}: ${lastEntry.text}`;
};

export const StatsScreen = () => {
    const { userStats, goals } = useApp();
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    
    // Estado dummy para manejar el tipo de detalle si quieres expandirlo luego
    const [detailType, setDetailType] = useState<'missions' | 'focus'>('missions');

    // 1. CÁLCULO DE NIVEL CORREGIDO
    const nextLevelXP = GamificationService.getXPForLevel(userStats.level); 
    const prevLevelXP = userStats.level === 1 ? 0 : GamificationService.getXPForLevel(userStats.level - 1); 
    
    const xpGainedInThisLevel = userStats.xp - prevLevelXP;
    const xpNeededForThisLevel = nextLevelXP - prevLevelXP;
    
    let progressPercent = xpNeededForThisLevel > 0 ? (xpGainedInThisLevel / xpNeededForThisLevel) : 0;
    if (progressPercent < 0) progressPercent = 0;
    if (progressPercent > 1) progressPercent = 1;

    // 2. DATOS PARA GRÁFICAS (Reales)
    const weeklyData = useMemo(() => {
        const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (6 - i));
            return d;
        });

        return last7Days.map(date => {
            const dayGoals = goals.filter(g => new Date(g.createdAt).toDateString() === date.toDateString());
            const completed = dayGoals.filter(g => g.isCompleted).length;
            const failed = dayGoals.filter(g => isGoalExpired(g)).length;

            let frontColor = '#4ABFF4'; 
            if (failed > 0) frontColor = '#FF5555'; 
            else if (completed >= 3) frontColor = '#7928CA'; 

            return {
                value: completed + (failed * 0.5) + 0.2, 
                label: days[date.getDay()],
                frontColor,
                topLabelComponent: () => <Text style={{color:'gray', fontSize:9}}>{completed}</Text>
            };
        });
    }, [goals]);

    // 3. DATOS DE HEATMAP
    const renderHeatmap = () => {
        return (
            <View style={styles.heatmapGrid}>
                {Array.from({ length: 14 }).map((_, index) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (13 - index));
                    
                    const hasActivity = goals.some(g => 
                        new Date(g.createdAt).toDateString() === d.toDateString() && g.isCompleted
                    );
                    
                    const color = hasActivity ? '#00F3FF' : '#333';
                    const opacity = hasActivity ? 1 : 0.5;

                    return <View key={index} style={[styles.heatmapCell, { backgroundColor: color, opacity }]} />;
                })}
            </View>
        );
    };

    const handleMissionClick = () => {
        setDetailType('missions');
        setDetailModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.background} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text variant="headlineMedium" style={styles.pageTitle}>CENTRO DE MANDO</Text>

                {/* --- 1. TARJETA DE NIVEL --- */}
                <Surface style={styles.levelCard} elevation={4}>
                    <LinearGradient colors={['#7928CA', '#FF0080']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientCard}>
                        <View style={styles.row}>
                            <View>
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>NIVEL ACTUAL</Text>
                                <Text style={{ color: 'white', fontSize: 42, fontWeight: 'bold', lineHeight: 45 }}>{userStats.level}</Text>
                                <Text style={{ color: 'white', fontSize: 12 }}>
                                    Siguiente nivel en {Math.floor(nextLevelXP - userStats.xp)} XP
                                </Text>
                            </View>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons name="crown" size={40} color="#FFD700" />
                            </View>
                        </View>
                        <View style={styles.xpTrack}>
                            <View style={[styles.xpFill, { width: `${progressPercent * 100}%` }]} />
                        </View>
                    </LinearGradient>
                </Surface>

                {/* --- 2. RENDIMIENTO --- */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>RENDIMIENTO DE COMBATE (7 DÍAS)</Text>
                    <View style={styles.chartContainer}>
                        <BarChart
                            data={weeklyData}
                            barWidth={22}
                            noOfSections={3}
                            barBorderRadius={4}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            hideRules
                            yAxisTextStyle={{ color: '#666' }}
                            xAxisLabelTextStyle={{ color: '#ccc', fontSize: 10 }}
                            height={150}
                            width={screenWidth - 80}
                            isAnimated
                        />
                    </View>
                </View>

                {/* --- 3. CONSISTENCIA --- */}
                <View style={styles.sectionContainer}>
                    <View style={styles.row}>
                        <Text style={styles.sectionHeader}>CONSISTENCIA (ÚLTIMAS 2 SEMANAS)</Text>
                        <Text style={{ color: '#00F3FF', fontSize: 10 }}>🔥 Racha Activa</Text>
                    </View>
                    <Surface style={styles.heatmapCard}>
                        {renderHeatmap()}
                        <Text style={styles.heatmapLegend}>Cada cuadro es un día. No rompas la cadena.</Text>
                    </Surface>
                </View>

                {/* --- 4. GRID DE ESTADÍSTICAS --- */}
                <View style={styles.statsGrid}>
                    <TouchableOpacity style={styles.statBoxTouch} onPress={handleMissionClick}>
                        <Surface style={styles.statBox}>
                            <MaterialCommunityIcons name="target" size={24} color="#00F3FF" />
                            <Text style={styles.statNumber}>{goals.filter(g => g.isCompleted).length}</Text>
                            <Text style={styles.statLabel}>Misiones Completas</Text>
                            <Text style={styles.tapHint}>(Ver Detalle)</Text>
                        </Surface>
                    </TouchableOpacity>

                    <Surface style={styles.statBox}>
                        <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFD700" />
                        <Text style={styles.statNumber}>{userStats.xp}</Text>
                        <Text style={styles.statLabel}>XP Total</Text>
                    </Surface>

                    <Surface style={styles.statBox}>
                        <MaterialCommunityIcons name="clock-outline" size={24} color="#FF0080" />
                        <Text style={styles.statNumber}>{Math.round(userStats.totalFocusTime / 60)}h</Text>
                        <Text style={styles.statLabel}>Horas de Foco</Text>
                    </Surface>
                </View>
            </ScrollView>

            {/* --- MODAL DE DETALLE --- */}
            <Modal
                animationType="slide"
                visible={detailModalVisible}
                onRequestClose={() => setDetailModalVisible(false)}
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>HISTORIAL DE MISIONES</Text>
                        <IconButton icon="close" iconColor="white" onPress={() => setDetailModalVisible(false)} />
                    </View>

                    <ScrollView contentContainerStyle={{padding: 20}}>
                        {/* SECCIÓN FALLIDAS */}
                        <Text style={[styles.sectionHeader, {color: '#FF5555', marginTop: 10}]}>💀 ZONA DE PELIGRO (FALLIDAS)</Text>
                        {goals.filter(g => isGoalExpired(g)).length === 0 ? (
                            <Text style={{color:'#666', fontStyle:'italic', marginBottom: 20}}>Nada por aquí. ¡Bien hecho!</Text>
                        ) : (
                            goals.filter(g => isGoalExpired(g)).map(goal => (
                                <Surface key={goal.id} style={[styles.detailCard, {borderLeftColor: '#FF5555'}]}>
                                    <View>
                                        <Text style={styles.detailTitle}>{goal.title}</Text>
                                        <Text style={styles.detailReason}>Causa: {getGoalReason(goal)}</Text>
                                    </View>
                                    <MaterialCommunityIcons name="skull-outline" size={24} color="#FF5555" />
                                </Surface>
                            ))
                        )}

                        {/* SECCIÓN COMPLETADAS */}
                        <Text style={[styles.sectionHeader, {color: '#00F3FF'}]}>⚔️ VICTORIAS</Text>
                        {goals.filter(g => g.isCompleted).map(goal => (
                            <Surface key={goal.id} style={[styles.detailCard, {borderLeftColor: '#00F3FF'}]}>
                                <View>
                                    <Text style={styles.detailTitle}>{goal.title}</Text>
                                    {/* CORRECCIÓN AQUÍ: Usamos el servicio para obtener la XP */}
                                    <Text style={styles.detailSub}>+{GamificationService.getXPValue(goal.type)} XP</Text>
                                </View>
                                <MaterialCommunityIcons name="check-circle" size={24} color="#00F3FF" />
                            </Surface>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    background: { position: 'absolute', left: 0, right: 0, top: 0, height: 300 },
    scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
    pageTitle: { color: 'white', fontWeight: 'bold', marginBottom: 20, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },

    // Level Card
    levelCard: { borderRadius: 20, marginBottom: 25, elevation: 8, backgroundColor: 'transparent' },
    gradientCard: { padding: 20, borderRadius: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconContainer: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 50 },
    xpTrack: { height: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 4, marginTop: 15, overflow: 'hidden' },
    xpFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 4 },

    // Sections
    sectionContainer: { marginBottom: 25 },
    sectionHeader: { color: '#888', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
    chartContainer: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 16, alignItems: 'center' },

    // Heatmap
    heatmapCard: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 16 },
    heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    heatmapCell: { width: '13%', aspectRatio: 1, borderRadius: 4, marginBottom: 5 },
    heatmapLegend: { color: '#555', fontSize: 10, marginTop: 10, fontStyle: 'italic', textAlign: 'center' },

    // Stats Grid
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    statBoxTouch: { width: '31%' },
    statBox: { width: '100%', backgroundColor: '#1E1E1E', padding: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 110 },
    statNumber: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
    statLabel: { color: '#666', fontSize: 9, textAlign: 'center', marginTop: 2 },
    tapHint: { color: '#4ABFF4', fontSize: 8, marginTop: 4, fontStyle: 'italic' },

    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: '#121212' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
    modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    detailCard: { 
        backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 10, 
        borderLeftWidth: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
    },
    detailTitle: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    detailReason: { color: '#aaa', fontSize: 12, marginTop: 2, fontStyle: 'italic' },
    detailSub: { color: '#FFD700', fontSize: 12 }
});