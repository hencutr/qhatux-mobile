import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Tabs } from 'expo-router';
import { Gift, Home, Ticket } from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 🔥 1. Le decimos a la app cómo comportarse cuando llega una push y la app está abierta
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,  // <-- Reemplaza a shouldShowAlert
        shouldShowList: true,    // <-- Reemplaza a shouldShowAlert
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const COLORS = {
    cardBg: '#1F2937',
    muted: '#9CA3AF',
    pinkAccent: '#F43F5E',
};

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    // 🔥 2. Apenas carga el menú, pedimos permisos y capturamos el Token
    useEffect(() => {
        async function setupNotifications() {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#F43F5E',
                });
            }

            if (Device.isDevice) {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;
                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }
                if (finalStatus !== 'granted') {
                    console.log('El usuario no dio permisos para notificaciones.');
                    return;
                }

                // Sacamos el token único de este celular
                try {
                    // 🔥 Buscamos el ID del proyecto o inventamos uno temporal para que Expo no llore
                    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? 'qhatux-dev-123';

                    const tokenData = await Notifications.getExpoPushTokenAsync({
                        projectId: projectId,
                    });
                    const expoPushToken = tokenData.data;
                    console.log("🎫 EXPO PUSH TOKEN OBTENIDO:", expoPushToken);

                    // Se lo mandamos silenciosamente a Django
                    const tokenStr = await AsyncStorage.getItem('accessToken');
                    if (tokenStr) {
                        await axios.post('http://10.0.2.2:8000/api/users/update-token/',
                            { expo_push_token: expoPushToken },
                            { headers: { Authorization: `Bearer ${tokenStr}` } }
                        );
                        console.log("✅ Token guardado en la base de datos.");
                    }
                } catch (error) {
                    console.log("Error obteniendo o enviando el token:", error);
                }
            }
        }

        setupNotifications();
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.cardBg,
                    borderTopWidth: 1,
                    borderTopColor: '#374151',
                    height: 65 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: COLORS.pinkAccent,
                tabBarInactiveTintColor: COLORS.muted,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '900',
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="timeline"
                options={{
                    title: 'Explorar',
                    tabBarIcon: ({ color }) => <Home color={color} size={28} />,
                }}
            />
            <Tabs.Screen
                name="sorteos"
                options={{
                    title: 'Sorteos',
                    tabBarIcon: ({ color }) => <Gift color={color} size={28} />,
                }}
            />
            <Tabs.Screen
                name="tickets"
                options={{
                    title: 'Mis Tickets',
                    tabBarIcon: ({ color }) => <Ticket color={color} size={28} />,
                }}
            />
        </Tabs>
    );
}