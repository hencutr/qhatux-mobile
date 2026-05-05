import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 🔥 APUNTANDO A LA NUBE DIRECTO
const BACKEND_URL = 'https://app.qhatux.com';

const COLORS = {
    bg: '#0B1121',
    brandText: '#FFFFFF',
    text: '#E5E7EB',
    muted: '#9CA3AF',
    border: '#374151',
    white: '#FFFFFF',
    inputBg: '#1F2937',
    pinkAccent: '#F43F5E',
    orangeAccent: '#F97316',
    error: '#EF4444'
};

export default function RegisterScreen() {
    const router = useRouter();

    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleRegister = async () => {
        if (!nombres || !apellidos || !telefono || !email || !password) {
            setErrorMessage('Por favor completa todos los campos.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            await axios.post(`${BACKEND_URL}/api/users/registro/`, {
                nombres,
                apellidos,
                telefono,
                email,
                password,
                rol: 'Cliente'
            });

            Alert.alert("Éxito", "Cuenta creada correctamente. Ahora puedes iniciar sesión.");
            router.back();

        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const backendMsg = JSON.stringify(error.response.data);
                setErrorMessage(`Error [${status}]: ${backendMsg}`);
            } else {
                setErrorMessage(`Fallo de red: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.brandText} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Crear Cuenta</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.subtitle}>Únete a Qhatux y descubre los mejores locales</Text>
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} placeholder="Nombres" value={nombres} onChangeText={setNombres} placeholderTextColor={COLORS.muted} editable={!isLoading} />
                </View>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} placeholder="Apellidos" value={apellidos} onChangeText={setApellidos} placeholderTextColor={COLORS.muted} editable={!isLoading} />
                </View>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} placeholder="Teléfono (WhatsApp)" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" placeholderTextColor={COLORS.muted} editable={!isLoading} />
                </View>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} placeholder="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor={COLORS.muted} editable={!isLoading} />
                </View>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={COLORS.muted} editable={!isLoading} />
                </View>
                <TouchableOpacity style={styles.buttonWrapper} onPress={handleRegister} activeOpacity={0.8} disabled={isLoading}>
                    <LinearGradient colors={[COLORS.pinkAccent, COLORS.orangeAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
                        {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Registrarme</Text>}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 15, paddingHorizontal: 15, backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    backButton: { padding: 5 },
    navTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.brandText },
    scrollContent: { padding: 30, alignItems: 'center', paddingBottom: 50 },
    subtitle: { fontSize: 15, color: COLORS.text, textAlign: 'center', marginBottom: 25 },
    errorText: { color: COLORS.error, marginBottom: 15, fontWeight: 'bold', textAlign: 'center' },
    inputWrapper: { width: '100%', marginBottom: 15 },
    input: { backgroundColor: COLORS.inputBg, height: 55, borderRadius: 12, paddingHorizontal: 18, borderWidth: 1, borderColor: COLORS.border, fontSize: 16, color: COLORS.white },
    buttonWrapper: { width: '100%', marginTop: 10, shadowColor: COLORS.pinkAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
    gradientButton: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: COLORS.white, fontSize: 17, fontWeight: 'bold' },
});