import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMessage('Por favor ingresa correo y contraseña.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await axios.post(`${BACKEND_URL}/api/users/login/`, {
                email: email,
                password: password
            });

            const { access, refresh } = response.data;
            await AsyncStorage.setItem('accessToken', access);
            await AsyncStorage.setItem('refreshToken', refresh);

            console.log("Login exitoso. Token guardado.");
            router.replace('/(tabs)/timeline');
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const backendMsg = JSON.stringify(error.response.data);
                setErrorMessage(`Error Django [${status}]: ${backendMsg}`);
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
            <View style={styles.formContainer}>
                <View style={styles.headerContainer}>
                    <View style={styles.logoRing}>
                        <Image source={require('../assets/images/logo_qhatux.png')} style={styles.logo} resizeMode="contain" />
                    </View>
                    <Text style={styles.brandTitle}>QHATUX</Text>
                </View>
                <Text style={styles.subtitle}>Inicia sesión para participar en los sorteos</Text>
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} placeholder="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor={COLORS.muted} editable={!isLoading} />
                </View>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={COLORS.muted} editable={!isLoading} />
                </View>
                <TouchableOpacity style={styles.buttonWrapper} onPress={handleLogin} activeOpacity={0.8} disabled={isLoading}>
                    <LinearGradient colors={[COLORS.pinkAccent, COLORS.orangeAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
                        {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Ingresar</Text>}
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.registerLink} disabled={isLoading} onPress={() => router.push('/register')}>
                    <Text style={styles.registerText}>¿No tienes cuenta? Regístrate aquí</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center' },
    formContainer: { paddingHorizontal: 30, alignItems: 'center' },
    headerContainer: { alignItems: 'center', marginBottom: 5 },
    logoRing: { width: 130, height: 130, borderRadius: 65, borderWidth: 4, borderColor: COLORS.pinkAccent, justifyContent: 'center', alignItems: 'center', marginBottom: 15, backgroundColor: COLORS.bg },
    logo: { width: 105, height: 105 },
    brandTitle: { fontSize: 48, fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-condensed', fontWeight: '900', color: COLORS.brandText, letterSpacing: 2 },
    subtitle: { fontSize: 15, color: COLORS.text, textAlign: 'center', marginBottom: 30 },
    errorText: { color: COLORS.error, marginBottom: 15, fontWeight: 'bold', textAlign: 'center' },
    inputWrapper: { width: '100%', marginBottom: 15 },
    input: { backgroundColor: COLORS.inputBg, height: 55, borderRadius: 12, paddingHorizontal: 18, borderWidth: 1, borderColor: COLORS.border, fontSize: 16, color: COLORS.white },
    buttonWrapper: { width: '100%', marginTop: 15, shadowColor: COLORS.pinkAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
    gradientButton: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: COLORS.white, fontSize: 17, fontWeight: 'bold' },
    registerLink: { marginTop: 25, padding: 10 },
    registerText: { color: COLORS.pinkAccent, fontSize: 15, fontWeight: 'bold' },
});