import { QrCode, Ticket, Trophy } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TicketsScreen() {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<'tickets' | 'prizes'>('tickets');

    // Estos datos luego los traeremos con axios.get()
    const MOCK_TICKETS = [
        { id: '1', title: 'Gran Quesada por el Día de ABC', ticketNumber: 'TKT-9A8B7C6D', date: 'Hoy, 8:00 PM' }
    ];

    const MOCK_PRIZES = [
        { id: '1', title: 'Pollo a la Brasa Entero', raffleName: 'Sorteo de Inauguración', dateWon: '15 de Mayo, 2026' }
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.headerTitle}>MI <Text style={{ color: '#F43F5E' }}>BÓVEDA</Text></Text>

            {/* SEGMENTED CONTROL (Pestañas Superiores) */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'tickets' && styles.tabActive]}
                    onPress={() => setActiveTab('tickets')}
                    activeOpacity={0.8}
                >
                    <Ticket color={activeTab === 'tickets' ? '#FFF' : '#9CA3AF'} size={20} />
                    <Text style={[styles.tabText, activeTab === 'tickets' && styles.tabTextActive]}>Mis Tickets</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'prizes' && styles.tabActivePrizes]}
                    onPress={() => setActiveTab('prizes')}
                    activeOpacity={0.8}
                >
                    <Trophy color={activeTab === 'prizes' ? '#FFF' : '#9CA3AF'} size={20} />
                    <Text style={[styles.tabText, activeTab === 'prizes' && styles.tabTextActive]}>Mis Premios</Text>
                </TouchableOpacity>
            </View>

            {/* CONTENIDO: TICKETS */}
            {activeTab === 'tickets' && (
                <FlatList
                    data={MOCK_TICKETS}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Ticket stroke="#374151" width={80} height={80} />
                            <Text style={styles.emptyText}>No tienes tickets activos</Text>
                            <Text style={styles.emptySubtext}>Participa en los sorteos para obtener tus tickets digitales.</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <View style={styles.ticketCard}>
                            <View style={styles.ticketTop}>
                                <Text style={styles.ticketTitle}>{item.title}</Text>
                                <Text style={styles.ticketDate}>Sorteo: {item.date}</Text>
                            </View>
                            {/* Línea punteada simulando el rasgado del ticket */}
                            <View style={styles.dashedLine} />
                            <View style={styles.ticketBottom}>
                                <View>
                                    <Text style={styles.ticketLabel}>TU CÓDIGO DE PARTICIPACIÓN</Text>
                                    <Text style={styles.ticketCode}>{item.ticketNumber}</Text>
                                </View>
                                <View style={styles.qrIconWrapper}>
                                    <QrCode color="#F43F5E" size={32} />
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* CONTENIDO: PREMIOS */}
            {activeTab === 'prizes' && (
                <FlatList
                    data={MOCK_PRIZES}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Trophy stroke="#374151" width={80} height={80} />
                            <Text style={styles.emptyText}>Aún no has ganado</Text>
                            <Text style={styles.emptySubtext}>¡Sigue participando, la suerte llegará pronto!</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <View style={styles.prizeCard}>
                            <View style={styles.prizeGlow} />
                            <View style={styles.prizeIconWrapper}>
                                <Trophy color="#FBBF24" size={36} />
                            </View>
                            <View style={styles.prizeInfo}>
                                <Text style={styles.prizeTitle}>{item.title}</Text>
                                <Text style={styles.prizeRaffle}>{item.raffleName}</Text>
                                <Text style={styles.prizeDate}>Ganado el {item.dateWon}</Text>
                            </View>
                            <TouchableOpacity style={styles.claimButton}>
                                <Text style={styles.claimButtonText}>Reclamar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B1121', paddingHorizontal: 20 },
    headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: 2, marginBottom: 25 },

    // Pestañas (Segmented Control)
    tabContainer: { flexDirection: 'row', backgroundColor: '#1F2937', borderRadius: 16, pading: 4, marginBottom: 25 },
    tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
    tabActive: { backgroundColor: '#374151', shadowColor: '#000', elevation: 2 },
    tabActivePrizes: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)' },
    tabText: { color: '#9CA3AF', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
    tabTextActive: { color: '#FFF', fontWeight: '900' },

    // Estados vacíos
    emptyState: { alignItems: 'center', marginTop: 80, opacity: 0.6 },
    emptyText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 20 },
    emptySubtext: { color: '#9CA3AF', fontSize: 15, marginTop: 10, textAlign: 'center', paddingHorizontal: 20 },

    // UI de Ticket Digital
    ticketCard: { backgroundColor: '#1F2937', borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#374151' },
    ticketTop: { padding: 25 },
    ticketTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', marginBottom: 8 },
    ticketDate: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
    dashedLine: { height: 1, borderWidth: 1, borderColor: '#374151', borderStyle: 'dashed', marginHorizontal: 20 },
    ticketBottom: { padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    ticketLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 6 },
    ticketCode: { color: '#F43F5E', fontSize: 24, fontWeight: '900', fontFamily: 'monospace', letterSpacing: 2 },
    qrIconWrapper: { backgroundColor: 'rgba(244, 63, 94, 0.1)', padding: 12, borderRadius: 16 },

    // UI de Premio Ganado
    prizeCard: { backgroundColor: '#111827', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)', overflow: 'hidden' },
    prizeGlow: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, backgroundColor: '#FBBF24', opacity: 0.1, borderRadius: 75 },
    prizeIconWrapper: { backgroundColor: 'rgba(251, 191, 36, 0.15)', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    prizeInfo: { marginBottom: 20 },
    prizeTitle: { color: '#FBBF24', fontSize: 22, fontWeight: '900', marginBottom: 4 },
    prizeRaffle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
    prizeDate: { color: '#9CA3AF', fontSize: 13 },
    claimButton: { backgroundColor: '#FBBF24', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
    claimButtonText: { color: '#78350F', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});