import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [mail, setMail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(mail.trim(), contrasena);
      // Si entra, el Gate del layout muestra la app automáticamente
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.brand}>
          ⚽ MUNDIAL <Text style={styles.brandGold}>2026</Text>
        </Text>
        <Text style={styles.title}>Validación de entradas</Text>
        <Text style={styles.subtitle}>Acceso de funcionarios</Text>

        <TextInput
          style={styles.input}
          placeholder="Mail"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="email-address"
          value={mail}
          onChangeText={setMail}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={contrasena}
          onChangeText={setContrasena}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#081226" />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#081226',
  },
  card: {
    gap: 14,
  },
  brand: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#fafafa',
    marginBottom: 4,
  },
  brandGold: {
    color: '#ffcc29',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#fafafa',
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fafafa',
  },
  error: {
    color: '#f87171',
    fontSize: 14,
  },
  button: {
    marginTop: 6,
    backgroundColor: '#ffcc29',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#081226',
    fontSize: 16,
    fontWeight: '700',
  },
});
