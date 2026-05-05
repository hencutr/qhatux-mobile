import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Tabs } from 'expo-router';
import { Gift, Home, Ticket } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const COLORS = { cardBg: '#1F2937', muted: '#9CA3AF', pinkAccent: '#F43F5E' };

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const [sorteosActivos, setSorteosActivos] = useState(0);

    useEffect(() => {
        async function cargarSorteosActivos() {
            try {
                const response = await axios.get('https://app.qhatux.com/api/marketing/raffles/');
                const activos = response.data.filter((r: any) => r.status !== 'Finished' && r.status !== 'Finalizado');
                setSorteosActivos(activos.length);
            } catch (error) {
                console.log("Error consultando sorteos para el badge:", error);
            }
        }

        cargarSorteosActivos();

        // 🔥 TIEMPO REAL PARA EL MENÚ INFERIOR (Polling cada 5 segundos)
        const interval = setInterval(cargarSorteosActivos, 5000);

        async function setupNotifications() {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default', importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250], lightColor: '#F43F5E',
                });
            }
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') return;

            try {
                const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? 'qhatux-dev-123';
                const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: projectId });
                const expoPushToken = tokenData.data;

                const tokenStr = await AsyncStorage.getItem('accessToken');
                if (tokenStr) {
                    await axios.post('https://app.qhatux.com/api/users/update-token/',
                        { expo_push_token: expoPushToken },
                        { headers: { Authorization: `Bearer ${tokenStr}` } }
                    );
                }
            } catch (error) {
                console.log("Ignorando error de Firebase temporalmente.");
            }
        }

        setupNotifications();

        return () => clearInterval(interval);
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.cardBg, borderTopWidth: 1, borderTopColor: '#374151',
                    height: 65 + insets.bottom, paddingBottom: insets.bottom > 0 ? insets.bottom : 10, paddingTop: 10,
                },
                tabBarActiveTintColor: COLORS.pinkAccent, tabBarInactiveTintColor: COLORS.muted,
                tabBarLabelStyle: { fontSize: 12, fontWeight: '900', marginTop: 4 },
            }}
        >
            <Tabs.Screen name="timeline" options={{ title: 'Explorar', tabBarIcon: ({ color }) => <Home color={color} size={28} /> }} />
            <Tabs.Screen
                name="sorteos"
                options={{
                    title: 'Sorteos', tabBarIcon: ({ color }) => <Gift color={color} size={28} />,
                    tabBarBadge: sorteosActivos > 0 ? sorteosActivos : undefined,
                    tabBarBadgeStyle: { backgroundColor: '#10B981', color: '#ffffff', fontWeight: 'bold' }
                }}
            />
            <Tabs.Screen name="tickets" options={{ title: 'Mis Tickets', tabBarIcon: ({ color }) => <Ticket color={color} size={28} /> }} />
        </Tabs>
    );
}