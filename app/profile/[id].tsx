import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
    bg: '#0B1121',
    cardBg: '#1F2937',
    brandText: '#FFFFFF',
    text: '#E5E7EB',
    muted: '#9CA3AF',
    pinkAccent: '#F43F5E',
    orangeAccent: '#F97316',
    star: '#FBBF24', // Amarillo clásico para estrellas
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 15;
const IMAGE_SIZE = (SCREEN_WIDTH - GRID_PADDING * 3) / 2; // Calcula el ancho exacto para 2 columnas

// Datos falsos de perfil (Luego esto vendrá de un fetch a Django usando el [id])
const MOCK_PROFILE = {
    id: '1',
    name: 'Cevichería El Puerto',
    description: 'Especialistas en pescados y mariscos frescos del día. El verdadero sabor del norte en tu plato.',
    location: 'Av. Los Incas 452, Nazca',
    rating: 4.8, // El promedio histórico que calcularás en Django
    reviewsCount: 124,
    // Las imágenes de decoración (Free o Premium)
    gallery: [
        'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1565557612185-1d0fcb3b190c?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=500&q=80',
    ]
};

export default function ProfileScreen() {
    const { id } = useLocalSearchParams(); // Capturamos el ID que manda el Timeline
    const router = useRouter();

    // Función para renderizar la galería en cuadrícula elegante
    const renderGalleryItem = ({ item }: { item: string }) => (
        <Image source={{ uri: item }} style={styles.gridImage} />
    );

    // Cabecera del Perfil (Info, Estrellas y Botón)
    const renderProfileHeader = () => (
        <View style={styles.headerContent}>
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{MOCK_PROFILE.name.charAt(0)}</Text>
            </View>

            <Text style={styles.profileName}>{MOCK_PROFILE.name}</Text>
            <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={COLORS.muted} />
                <Text style={styles.locationText}>{MOCK_PROFILE.location}</Text>
            </View>

            {/* ZONA DE ESTRELLAS HISTÓRICAS */}
            <View style={styles.ratingRow}>
                <Ionicons name="star" size={22} color={COLORS.star} />
                <Text style={styles.ratingText}>{MOCK_PROFILE.rating}</Text>
                <Text style={styles.reviewsText}>({MOCK_PROFILE.reviewsCount} reseñas)</Text>
            </View>

            <Text style={styles.description}>{MOCK_PROFILE.description}</Text>

            {/* BOTÓN: CALIFICAR LOCAL (Este abrirá el modal más adelante) */}
            <TouchableOpacity style={styles.rateButton} activeOpacity={0.8}>
                <Ionicons name="star-outline" size={20} color={COLORS.white} />
                <Text style={styles.rateButtonText}>Dejar mi Calificación</Text>
            </TouchableOpacity>

            <Text style={styles.galleryTitle}>Nuestros Platos</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Barra de Navegación Simple */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.brandText} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Perfil del Local</Text>
                <View style={{ width: 28 }} /> {/* Espaciador para centrar el título */}
            </View>

            {/* Lista que contiene el Header y la Galería */}
            <FlatList
                data={MOCK_PROFILE.gallery}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderGalleryItem}
                numColumns={2} // Cuadrícula de 2 columnas elegante
                ListHeaderComponent={renderProfileHeader}
                contentContainerStyle={styles.scrollContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: COLORS.bg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.cardBg,
    },
    backButton: {
        padding: 5,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.brandText,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerContent: {
        padding: 20,
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.orangeAccent,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 3,
        borderColor: COLORS.pinkAccent,
    },
    avatarText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 40,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.brandText,
        textAlign: 'center',
        marginBottom: 5,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    locationText: {
        color: COLORS.muted,
        fontSize: 14,
        marginLeft: 5,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
    },
    ratingText: {
        color: COLORS.brandText,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    reviewsText: {
        color: COLORS.muted,
        fontSize: 14,
        marginLeft: 8,
    },
    description: {
        color: COLORS.text,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 25,
    },
    rateButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.pinkAccent,
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    rateButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    galleryTitle: {
        width: '100%',
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.brandText,
        marginBottom: 15,
        textAlign: 'left',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: GRID_PADDING,
        marginBottom: GRID_PADDING,
    },
    gridImage: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 12,
        backgroundColor: COLORS.cardBg,
    },
});