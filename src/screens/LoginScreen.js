import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn, signInAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const canSubmit = useMemo(() => email.trim().length > 0 && password.trim().length > 0, [email, password]);

  const handleLogin = async () => {
    setErro('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setErro(e.message || 'Não foi possível entrar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.backdropTop} />
        <View style={styles.backdropBottom} />

        <View style={styles.card}>
          <View style={styles.brand}>
            <View style={styles.logoWrap}>
              <Image source={require('../../assets/Verdenovologo.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.title}>VerDeNovo</Text>
            <Text style={styles.subtitle}>Descarte certo. Planeta melhor.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.textLight} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="voce@exemplo.com"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textLight} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, (!canSubmit || loading) && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

          <TouchableOpacity style={styles.guestButton} onPress={signInAsGuest} activeOpacity={0.85}>
            <Text style={styles.guestButtonText}>Continuar como convidado</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    position: 'relative',
  },
  backdropTop: {
    position: 'absolute',
    top: -90,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backdropBottom: {
    position: 'absolute',
    bottom: -100,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 28,
    padding: 20,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
  },
  logo: {
    width: 42,
    height: 42,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  primaryButton: {
    marginTop: 6,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  guestButton: {
    marginTop: 10,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  guestButtonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    color: '#FFD9D9',
    backgroundColor: 'rgba(220,38,38,0.35)',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
