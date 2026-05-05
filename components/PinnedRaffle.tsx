import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = 'https://app.qhatux.com/api';

export default function PinnedRaffle() {
    const router = useRouter();

    const [queue, setQueue] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    // 🔥 CEREBRO MEJORADO: Trackea estado inicial y la data previa
    const isInitialLoad = useRef(true);
    const prevDataRef = useRef<any[]>([]);

    // Para saber dentro del setInterval si la cola está vacía o reproduciéndose
    const currentIndexRef = useRef(0);
    const queueLengthRef = useRef(0);
    currentIndexRef.current = currentIndex;
    queueLengthRef.current = queue.length;

    useEffect(() => {
        const fetchRaffles = async () => {
            try {
                const response = await axios.get(`${API_URL}/marketing/raffles/`);

                let activeRaffles = response.data.filter((r: any) =>
                    r.status !== 'Finished' && r.status !== 'Finalizado'
                );

                activeRaffles.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

                if (isInitialLoad.current) {
                    // CASO 1: Recién abre la app -> Muestra TODOS en cola
                    prevDataRef.current = activeRaffles;
                    setQueue(activeRaffles);
                    setCurrentIndex(0);
                    isInitialLoad.current = false;
                } else {
                    // CASO 2: La app ya está abierta -> Busca SOLO los nuevos o modificados
                    const newOrUpdated = activeRaffles.filter(newRaffle => {
                        const oldRaffle = prevDataRef.current.find(r => r.id === newRaffle.id);
                        if (!oldRaffle) return true; // Es nuevo
                        if (oldRaffle.status !== newRaffle.status) return true; // Cambió de estado (ej: de Programado a Abierto)
                        return false;
                    });

                    if (newOrUpdated.length > 0) {
                        prevDataRef.current = activeRaffles; // Actualizamos la memoria

                        if (currentIndexRef.current >= queueLengthRef.current) {
                            // Si el muro estaba limpio (sin banners), mandamos solo el nuevo y empezamos
                            setQueue(newOrUpdated);
                            setCurrentIndex(0);
                        } else {
                            // Si justo estaba mostrando otro banner, lo metemos a la fila sin interrumpir
                            setQueue(prev => [...prev, ...newOrUpdated]);
                        }
                    }
                }
            } catch (error) {
                console.error("Error cargando la cola de sorteos:", error);
            }
        };

        fetchRaffles();
        const interval = setInterval(fetchRaffles, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (queue.length > 0 && currentIndex < queue.length) {
            fadeAnim.setValue(0);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();

            const timer = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }).start(() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setCurrentIndex(prev => prev + 1);
                });
            }, 10000);

            return () => {
                clearTimeout(timer);
                fadeAnim.stopAnimation();
            };
        }
    }, [currentIndex, queue]);

    if (queue.length === 0 || currentIndex >= queue.length) return null;

    const raffle = queue[currentIndex];
    const isLive = raffle.status === 'Live';
    const isOpen = raffle.status === 'Open';

    let imageUrl = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80';
    if (raffle.image && typeof raffle.image === 'string' && raffle.image.trim() !== '') {
        imageUrl = raffle.image.startsWith('/') ? `https://app.qhatux.com${raffle.image}` : raffle.image;
    }

    let badgeStyle = styles.badgeScheduled;
    let dotStyle = styles.dotScheduled;
    let textStyle = styles.textScheduled;
    let statusLabel = 'PRÓXIMO SORTEO';
    let subtitleLabel = `Se sorteará el: ${new Date(raffle.live_draw_date).toLocaleDateString('es-PE')}`;
    let iconColor = "#F97316";

    if (isOpen) {
        badgeStyle = styles.badgeOpen;
        dotStyle = styles.dotOpen;
        textStyle = styles.textOpen;
        statusLabel = 'INSCRIPCIONES ABIERTAS';
        subtitleLabel = 'Toca para reclamar tu ticket'; // 🔥 Texto más corto para la tarjeta pequeña
        iconColor = "#10B981";
    } else if (isLive) {
        badgeStyle = styles.badgeLive;
        dotStyle = styles.dotLive;
        textStyle = styles.textLive;
        statusLabel = '¡SORTEANDO AHORA!';
        subtitleLabel = '¡Entra a ver si ganaste!'; // 🔥 Texto más corto
        iconColor = "#EF4444";
    }

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
                style={[styles.bannerContainer, isLive && styles.bannerLiveBorder]}
                activeOpacity={0.9}
                onPress={() => router.push('/(tabs)/sorteos' as Href)}
            >
                <ImageBackground source={{ uri: imageUrl }} style={styles.imageBackground} imageStyle={{ borderRadius: 14 }}>
                    <View style={styles.darkOverlay} />
                    <View style={styles.content}>
                        <View style={styles.textContainer}>
                            <View style={styles.badgeRow}>
                                <View style={[styles.statusBadge, badgeStyle]}>
                                    <View style={[styles.pulseDot, dotStyle]} />
                                    <Text style={[styles.statusText, textStyle]}>{statusLabel}</Text>
                                </View>
                                {queue.length > 1 && (
                                    <Text style={styles.queueCounter}>({currentIndex + 1}/{queue.length})</Text>
                                )}
                            </View>
                            <Text style={styles.title} numberOfLines={1}>{raffle.title}</Text>
                            <Text style={styles.subtitle} numberOfLines={1}>{subtitleLabel}</Text>
                        </View>
                        <View style={styles.actionIcon}>
                            <Ionicons name={isLive ? "play-circle" : (isOpen ? "ticket" : "calendar")} size={24} color={iconColor} />
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    // 🔥 ALTURA REDUCIDA Y ESTILOS MÁS COMPACTOS
    bannerContainer: { marginBottom: 15, borderRadius: 14, backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151', elevation: 8 },
    bannerLiveBorder: { borderColor: '#EF4444', shadowColor: '#EF4444', shadowOpacity: 0.6 },
    imageBackground: { width: '100%', minHeight: 90, justifyContent: 'center' }, // 🔥 de 120 a 90
    darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11, 17, 33, 0.75)', borderRadius: 14 },
    content: { flexDirection: 'row', alignItems: 'center', padding: 12 }, // 🔥 de 20 a 12
    textContainer: { flex: 1, paddingRight: 10 },
    actionIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }, // 🔥 Reducido tamaño ícono
    badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },

    badgeScheduled: { backgroundColor: 'rgba(249, 115, 22, 0.15)', borderColor: 'rgba(249, 115, 22, 0.3)' },
    badgeOpen: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' },
    badgeLive: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)' },

    pulseDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    dotScheduled: { backgroundColor: '#F97316' },
    dotOpen: { backgroundColor: '#10B981' },
    dotLive: { backgroundColor: '#EF4444' },

    statusText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    textScheduled: { color: '#F97316' },
    textOpen: { color: '#10B981' },
    textLive: { color: '#EF4444' },

    queueCounter: { color: '#6B7280', fontSize: 10, fontWeight: 'bold', marginLeft: 8 },

    title: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', marginBottom: 2 }, // 🔥 Letra un poco más pequeña
    subtitle: { color: '#D1D5DB', fontSize: 12 },
});