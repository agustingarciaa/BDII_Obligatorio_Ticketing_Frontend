import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { escanearQR } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type Estado =
  | { tipo: 'escaneando' }
  | { tipo: 'procesando' }
  | { tipo: 'exito'; mensaje: string }
  | { tipo: 'error'; mensaje: string };

export default function EscanearScreen() {
  const { token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [estado, setEstado] = useState<Estado>({ tipo: 'escaneando' });
  const procesando = useRef(false);

  const handleBarcode = useCallback(
    async ({ data }: { data: string }) => {
      if (procesando.current || estado.tipo !== 'escaneando') return;
      procesando.current = true;
      setEstado({ tipo: 'procesando' });

      try {
        const res = await escanearQR(token!, data);
        const msg =
          res.mensaje ?? res.message ?? 'Entrada validada correctamente.';
        setEstado({ tipo: 'exito', mensaje: msg });
      } catch (e) {
        setEstado({
          tipo: 'error',
          mensaje: e instanceof Error ? e.message : 'Error al validar.',
        });
      }
    },
    [token, estado.tipo],
  );

  const reiniciar = () => {
    procesando.current = false;
    setEstado({ tipo: 'escaneando' });
  };

  if (!permission) {
    return <View style={styles.safe} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.permisoTexto}>
            Se necesita acceso a la cámara para escanear QR.
          </Text>
          <Pressable style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Permitir cámara</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>
          ⚽ MUNDIAL <Text style={styles.brandGold}>2026</Text>
        </Text>
        <Text style={styles.title}>Escanear QR</Text>
        <Text style={styles.subtitle}>Apuntá la cámara al código de la entrada</Text>
      </View>

      <View style={styles.cameraWrapper}>
        {estado.tipo === 'escaneando' || estado.tipo === 'procesando' ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={
              estado.tipo === 'escaneando' ? handleBarcode : undefined
            }
          />
        ) : null}

        <View style={styles.overlay}>
          <View style={styles.visor} />
        </View>

        {estado.tipo === 'procesando' && (
          <View style={styles.resultOverlay}>
            <ActivityIndicator color="#ffcc29" size="large" />
            <Text style={styles.resultMsg}>Validando entrada...</Text>
          </View>
        )}

        {(estado.tipo === 'exito' || estado.tipo === 'error') && (
          <View style={styles.resultOverlay}>
            <Text style={styles.resultIcon}>
              {estado.tipo === 'exito' ? '✅' : '❌'}
            </Text>
            <Text
              style={[
                styles.resultMsg,
                estado.tipo === 'exito'
                  ? styles.resultMsgExito
                  : styles.resultMsgError,
              ]}>
              {estado.mensaje}
            </Text>
            <Pressable style={styles.btn} onPress={reiniciar}>
              <Text style={styles.btnText}>Escanear otra</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#081226',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 2,
  },
  brand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fafafa',
    letterSpacing: 0.5,
  },
  brandGold: {
    color: '#ffcc29',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fafafa',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  cameraWrapper: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0f1f3d',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visor: {
    width: 220,
    height: 220,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffcc29',
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#081226ee',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 32,
  },
  resultIcon: {
    fontSize: 56,
  },
  resultMsg: {
    fontSize: 17,
    color: '#fafafa',
    textAlign: 'center',
    fontWeight: '500',
  },
  resultMsgExito: {
    color: '#4ade80',
  },
  resultMsgError: {
    color: '#f87171',
  },
  btn: {
    backgroundColor: '#ffcc29',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  btnText: {
    color: '#081226',
    fontSize: 16,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 32,
  },
  permisoTexto: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
});
