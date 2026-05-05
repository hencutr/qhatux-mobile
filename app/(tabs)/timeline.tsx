import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PinnedRaffle from '../../components/PinnedRaffle';

const COLORS = {
    bg: '#0B1121', cardBg: '#1F2937', brandText: '#FFFFFF', text: '#E5E7EB',
    muted: '#9CA3AF', pinkAccent: '#F43F5E', orangeAccent: '#F97316',
};

const MOCK_POSTS = [{
    id: '1', restaurantName: 'Cevichería El Puerto', restaurantId: '1', timeAgo: 'Hace 2 horas',
    content: '¡Hoy tenemos sorteo sorpresa! Por la compra de una leche de tigre participas en la ruleta Qhatux.',
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', likes: 24,
}];

export default function TimelineScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    useEffect(() => {
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            const { title, body } = notification.request.content;
            Alert.alert(title || "¡Nuevo Aviso!", body || "Tira hacia abajo para actualizar tu feed.");
        });
        return () => subscription.remove();
    }, []);

    const renderPost = ({ item }: any) => (
        <View style={styles.postCard}>
            <TouchableOpacity style={styles.postHeader} onPress={() => router.push(`/profile/${item.restaurantId}`)}>
                <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{item.restaurantName.charAt(0)}</Text></View>
                <View><Text style={styles.restaurantName}>{item.restaurantName}</Text><Text style={styles.timeText}>{item.timeAgo}</Text></View>
            </TouchableOpacity>
            <Text style={styles.postContent}>{item.content}</Text>
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="flame" size={26} color={COLORS.orangeAccent} />
                    <Text style={[styles.actionText, { color: COLORS.orangeAccent }]}>{item.likes} ¡Está quemando!</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/profile/${item.restaurantId}`)}>
                    <Ionicons name="restaurant-outline" size={24} color={COLORS.pinkAccent} />
                    <Text style={styles.actionText}>Ver Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <View style={[styles.header, { paddingTop: insets.top + 15 }]}><Text style={styles.headerTitle}>QHATUX</Text></View>
            <FlatList
                data={MOCK_POSTS}
                keyExtractor={(item) => item.id}
                renderItem={renderPost}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                // 🔥 EL BANNER AHORA SIEMPRE ESTÁ VISIBLE EN EL MURO
                ListHeaderComponent={<PinnedRaffle />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { paddingBottom: 15, backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: '#1F2937', alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.brandText, letterSpacing: 1 },
    listContainer: { padding: 15 },
    postCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 15, marginBottom: 20, elevation: 4 },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.orangeAccent, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18 },
    restaurantName: { color: COLORS.brandText, fontSize: 16, fontWeight: 'bold' },
    timeText: { color: COLORS.muted, fontSize: 12 },
    postContent: { color: COLORS.text, fontSize: 14, marginBottom: 15, lineHeight: 20 },
    postImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 15, backgroundColor: '#374151' },
    actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#374151', paddingTop: 15, justifyContent: 'space-around' },
    actionButton: { flexDirection: 'row', alignItems: 'center' },
    actionText: { color: COLORS.pinkAccent, marginLeft: 8, fontWeight: '600' },
});