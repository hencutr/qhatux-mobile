import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_URL = 'http://10.0.2.2:8000/api';

export default function PinnedRaffle() {
    const [raffle, setRaffle] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchRaffle = async () => {
            try {
                const response = await axios.get(`${API_URL}/marketing/raffles/`);
                // 1. Buscamos si hay un sorteo EN VIVO
                let active = response.data.find((r: any) => r.status === 'Live');
                // 2. Si no hay en vivo, buscamos uno con Inscripciones Abiertas
                if (!active) {
                    active = response.data.find((r: any) => r.status === 'Open');
                }
                if (active) setRaffle(active);
            } catch (error) {
                console.error("Error cargando el sorteo fijado:", error);
            }
        };
        fetchRaffle();
    }, []);

    if (!raffle) return null;

    const isLive = raffle.status === 'Live';

    return (
        <TouchableOpacity
            style={[styles.bannerContainer, isLive && styles.bannerLiveBorder]}
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/sorteos' as Href)}
        >
            <ImageBackground
                source={{ uri: raffle.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' }}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: 16 }}
            >
                {/* Capa oscura para que el texto sea legible */}
                <View style={styles.darkOverlay} />

                <View style={styles.content}>
                    <View style={styles.textContainer}>
                        <View style={styles.badgeRow}>
                            <View style={[styles.statusBadge, isLive ? styles.badgeLive : styles.badgeOpen]}>
                                <View style={[styles.pulseDot, isLive ? styles.dotLive : styles.dotOpen]} />
                                <Text style={[styles.statusText, isLive ? styles.textLive : styles.textOpen]}>
                                    {isLive ? '¡SORTEANDO AHORA!' : 'INSCRIPCIONES ABIERTAS'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.title} numberOfLines={2}>{raffle.title}</Text>
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {isLive ? '¡Entra para ver si eres el ganador!' : 'Toca para reclamar tu ticket digital'}
                        </Text>
                    </View>
                    <View style={styles.actionIcon}>
                        <Ionicons name={isLive ? "play-circle" : "ticket"} size={32} color={isLive ? "#EF4444" : "#F43F5E"} />
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    bannerContainer: {
        marginBottom: 20,
        borderRadius: 16,
        backgroundColor: '#1F2937',
        borderWidth: 1,
        borderColor: '#374151',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    bannerLiveBorder: {
        borderColor: '#EF4444',
        shadowColor: '#EF4444',
        shadowOpacity: 0.6,
    },
    imageBackground: {
        width: '100%',
        minHeight: 120,
        justifyContent: 'center',
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(11, 17, 33, 0.75)', // Oscurece la foto un 75%
        borderRadius: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20, // Padding amplio para UI moderna
    },
    textContainer: {
        flex: 1,
        paddingRight: 15,
    },
    actionIcon: {
        width: 55,
        height: 55,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    badgeOpen: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    badgeLive: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    dotOpen: { backgroundColor: '#10B981' },
    dotLive: { backgroundColor: '#EF4444' },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    textOpen: { color: '#10B981' },
    textLive: { color: '#EF4444' },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 4,
    },
    subtitle: {
        color: '#D1D5DB',
        fontSize: 13,
    },
});