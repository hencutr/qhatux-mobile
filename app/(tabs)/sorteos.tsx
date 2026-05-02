import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Calendar, Ticket, Trophy } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_URL = 'http://10.0.2.2:8000/api';

export default function RafflesScreen() {
    const router = useRouter();
    const [raffles, setRaffles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);

    const fetchOpenRaffles = async () => {
        try {
            const response = await axios.get(`${API_URL}/marketing/raffles/`);
            const openRaffles = response.data.filter((r: any) => r.status === 'Open');
            setRaffles(openRaffles);
        } catch (error) {
            console.error("Error al traer sorteos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpenRaffles();
    }, []);

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

            Alert.alert(
                '¡Inscripción Exitosa!',
                `Tu ticket digital es: ${response.data.digital_ticket}\n¡Guárdalo bien!`,
                [{ text: '¡Genial!' }]
            );

            fetchOpenRaffles();

        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Error al intentar unirse al sorteo.';
            Alert.alert('Aviso', errorMsg);
        } finally {
            setJoiningId(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#F43F5E" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Botón de retroceso para volver al Timeline */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>SORTEOS <Text style={{ color: '#F43F5E' }}>ACTIVOS</Text></Text>

            {raffles.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ticket stroke="#4B5563" width={64} height={64} />
                    <Text style={styles.emptyText}>No hay sorteos abiertos.</Text>
                    <Text style={styles.emptySubtext}>Vuelve más tarde para más sorpresas.</Text>
                </View>
            ) : (
                <FlatList
                    data={raffles}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconBox}>
                                    <Trophy stroke="#F43F5E" width={24} height={24} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.originBadge}>
                                        {item.origin === 'Platform' ? 'Qhatux Global' : 'Negocio Local'}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.prize}>{item.prize_description}</Text>

                            <View style={styles.dateContainer}>
                                <Calendar stroke="#6B7280" width={16} height={16} />
                                <Text style={styles.dateText}>
                                    Sorteo en vivo: {new Date(item.live_draw_date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.joinButton}
                                activeOpacity={0.8}
                                disabled={joiningId === item.id}
                                onPress={() => handleJoinRaffle(item.id)}
                            >
                                {joiningId === item.id ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.joinButtonText}>PARTICIPAR AHORA</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
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
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
    emptyText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 16, textAlign: 'center' },
    emptySubtext: { color: '#6B7280', fontSize: 14, marginTop: 8, textAlign: 'center' },
    card: { backgroundColor: '#1F2937', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconBox: { backgroundColor: '#0B1121', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#374151' },
    title: { color: '#FFF', fontSize: 20, fontWeight: '900' },
    originBadge: { color: '#A78BFA', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
    prize: { color: '#9CA3AF', fontSize: 14, fontStyle: 'italic', marginBottom: 16 },
    dateContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B1121', padding: 12, borderRadius: 12, marginBottom: 20 },
    dateText: { color: '#9CA3AF', fontSize: 12, fontWeight: 'bold', marginLeft: 8 },
    joinButton: { backgroundColor: '#F43F5E', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#F43F5E', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    joinButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
});