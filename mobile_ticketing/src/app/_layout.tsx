import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/login-screen';
import { AuthProvider, useAuth } from '@/lib/auth-context';

// Gate de autenticación: solo el funcionario de validación ve la app.
// Mientras carga la sesión no renderiza nada (lo cubre el splash);
// sin sesión válida muestra el login en vez de las tabs.
function Gate() {
  const { loading, role } = useAuth();
  if (loading) return null;
  if (role !== 'FUNCIONARIO') return <LoginScreen />;
  return <AppTabs />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Gate />
      </ThemeProvider>
    </AuthProvider>
  );
}
