import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import { Calendar, Ticket, Trophy } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_URL = 'https://app.qhatux.com/api';

export default function RafflesScreen() {
    const router = useRouter();
    const [activos, setActivos] = useState<any[]>([]);
    const [concluidos, setConcluidos] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'activos' | 'concluidos'>('activos');
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);

    const fetchRaffles = async () => {
        try {
            const response = await axios.get(`${API_URL}/marketing/raffles/`);
            const allRaffles = response.data;
            const activosList = allRaffles.filter((r: any) => r.status !== 'Finished' && r.status !== 'Finalizado');
            const concluidosList = allRaffles.filter((r: any) => r.status === 'Finished' || r.status === 'Finalizado');
            setActivos(activosList.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            setConcluidos(concluidosList.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (error) {
            console.error("Error al traer sorteos:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 TIEMPO REAL: Cada vez que el usuario entre a esta pantalla, se descarga la data fresca
    useFocusEffect(
        useCallback(() => {
            fetchRaffles();

            // Y si se queda mirando la pantalla, actualizamos cada 5 segundos
            const interval = setInterval(fetchRaffles, 5000);
            return () => clearInterval(interval);
        }, [])
    );

    const handleJoinRaffle = async (raffleId: string) => {
        setJoiningId(raffleId);
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('Inicia Sesión', 'Debes estar registrado para participar.');
                setJoiningId(null);
                return;
            }
            const response = await axios.post(`${API_URL}/marketing/raffles/${raffleId}/join/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('¡Inscripción Exitosa!', `Tu ticket digital es: ${response.data.digital_ticket}\n¡Guárdalo bien!`, [{ text: '¡Genial!' }]);
            fetchRaffles();
        } catch (error: any) {
            Alert.alert('Aviso', error.response?.data?.error || 'Error al intentar unirse al sorteo.');
        } finally {
            setJoiningId(null);
        }
    };

    const renderActionArea = (item: any) => {
        if (activeTab === 'concluidos' || item.status === 'Finished' || item.status === 'Finalizado') {
            return (
                <View style={[styles.joinButton, { backgroundColor: '#374151', shadowOpacity: 0 }]}>
                    <Text style={[styles.joinButtonText, { color: '#9CA3AF' }]}>SORTEO FINALIZADO</Text>
                </View>
            );
        }
        if (item.status === 'Scheduled' || item.status === 'Programado') {
            return (
                <View style={[styles.joinButton, { backgroundColor: '#F97316', shadowColor: '#F97316' }]}>
                    <Text style={styles.joinButtonText}>PRÓXIMAMENTE</Text>
                </View>
            );
        }
        return (
            <TouchableOpacity style={styles.joinButton} activeOpacity={0.8} disabled={joiningId === item.id} onPress={() => handleJoinRaffle(item.id)}>
                {joiningId === item.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.joinButtonText}>PARTICIPAR AHORA</Text>}
            </TouchableOpacity>
        );
    };

    if (loading) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#F43F5E" /></View>;

    const currentData = activeTab === 'activos' ? activos : concluidos;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
            <Text style={styles.headerTitle}>SORTEOS <Text style={{ color: activeTab === 'activos' ? '#F43F5E' : '#9CA3AF' }}>{activeTab === 'activos' ? 'ACTIVOS' : 'CONCLUIDOS'}</Text></Text>
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tabButton, activeTab === 'activos' && styles.tabButtonActive]} onPress={() => setActiveTab('activos')}><Text style={[styles.tabText, activeTab === 'activos' && styles.tabTextActive]}>En Juego ({activos.length})</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tabButton, activeTab === 'concluidos' && styles.tabButtonActive]} onPress={() => setActiveTab('concluidos')}><Text style={[styles.tabText, activeTab === 'concluidos' && styles.tabTextActive]}>Historial ({concluidos.length})</Text></TouchableOpacity>
            </View>
            {currentData.length === 0 ? (
                <View style={styles.emptyState}><Ticket stroke="#4B5563" width={64} height={64} /><Text style={styles.emptyText}>{activeTab === 'activos' ? 'No hay sorteos abiertos.' : 'No hay historial de sorteos.'}</Text></View>
            ) : (
                <FlatList
                    data={currentData}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => {
                        const dateObj = new Date(item.live_draw_date);
                        let imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Pollo_a_la_brasa_con_papas_fritas_y_ensalada.jpg/800px-Pollo_a_la_brasa_con_papas_fritas_y_ensalada.jpg';
                        if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
                            imageUrl = item.image.startsWith('/') ? `https://app.qhatux.com${item.image}` : item.image;
                        }
                        const mainPrize = item.prizes && item.prizes.length > 0 ? item.prizes[0] : null;

                        return (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.iconBox}><Trophy stroke={activeTab === 'activos' ? "#F43F5E" : "#6B7280"} width={24} height={24} /></View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.title}>{item.title}</Text>
                                        <Text style={styles.originBadge}>{item.origin === 'Platform' ? 'Qhatux Global' : 'Negocio Local'}</Text>
                                    </View>
                                </View>
                                <Image source={{ uri: imageUrl }} style={styles.raffleImage} />
                                {mainPrize ? <Text style={styles.prize}>{mainPrize.winners_count}x {mainPrize.name}</Text> : null}
                                <View style={styles.dateTimeRow}>
                                    <Calendar stroke={activeTab === 'activos' ? "#4ADE80" : "#6B7280"} width={24} height={24} />
                                    <Text style={activeTab === 'activos' ? styles.dateGreen : styles.dateInactive}>{dateObj.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</Text>
                                    <Text style={styles.timeSeparator}>•</Text>
                                    <Text style={activeTab === 'activos' ? styles.timeBlue : styles.dateInactive}>{dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                                {renderActionArea(item)}
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B1121', padding: 20 },
    centerContainer: { flex: 1, backgroundColor: '#0B1121', justifyContent: 'center', alignItems: 'center' },
    backButton: { marginTop: 40, marginBottom: 10, width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#1F2937', borderRadius: 12, padding: 4, marginBottom: 24 },
    tabButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    tabButtonActive: { backgroundColor: '#374151' },
    tabText: { color: '#9CA3AF', fontWeight: 'bold', fontSize: 14 },
    tabTextActive: { color: '#FFF' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
    emptyText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 16, textAlign: 'center' },
    card: { backgroundColor: '#1F2937', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#374151', overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconBox: { backgroundColor: '#0B1121', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#374151' },
    title: { color: '#FFF', fontSize: 20, fontWeight: '900' },
    originBadge: { color: '#A78BFA', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
    raffleImage: { width: '100%', height: 180, borderRadius: 16, marginBottom: 16, backgroundColor: '#0B1121', resizeMode: 'cover' },
    prize: { color: '#D1D5DB', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    dateTimeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'center' },
    dateGreen: { color: '#4ADE80', fontSize: 17, fontWeight: '900', marginLeft: 10, letterSpacing: 1 },
    timeBlue: { color: '#38BDF8', fontSize: 17, fontWeight: '900', letterSpacing: 1 },
    timeSeparator: { color: '#6B7280', fontSize: 18, marginHorizontal: 10 },
    dateInactive: { color: '#9CA3AF', fontSize: 17, fontWeight: '900', marginLeft: 10, letterSpacing: 1 },
    joinButton: { backgroundColor: '#F43F5E', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#F43F5E', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    joinButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
});