import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMisSectores, type SectorAsignado } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function MisSectoresScreen() {
  const { token, signOut } = useAuth();
  const [sectores, setSectores] = useState<SectorAsignado[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (isRefresh = false) => {
      if (!token) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const data = await getMisSectores(token);
        setSectores(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar sectores.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>
            ⚽ MUNDIAL <Text style={styles.brandGold}>2026</Text>
          </Text>
          <Text style={styles.title}>Mis Sectores</Text>
          <Text style={styles.subtitle}>Asignaciones activas</Text>
        </View>
        <Pressable onPress={signOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Salir</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#ffcc29" size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => cargar()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : sectores.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No tenés sectores asignados.</Text>
        </View>
      ) : (
        <FlatList
          data={sectores}
          keyExtractor={(item) =>
            `${item.id_estadio}-${item.nombre_sector}-${item.id_evento}`
          }
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => cargar(true)}
              tintColor="#ffcc29"
            />
          }
          renderItem={({ item }) => <SectorCard sector={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function SectorCard({ sector }: { sector: SectorAsignado }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.sectorNombre}>{sector.nombre_sector}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Evento #{sector.id_evento}</Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <MetaItem label="Estadio" value={`#${sector.id_estadio}`} />
        <MetaItem label="Capacidad" value={sector.capacidad_max.toString()} />
      </View>
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#081226',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
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
  signOutBtn: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  signOutText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#f87171',
    fontSize: 15,
    textAlign: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#ffcc29',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  retryText: {
    color: '#081226',
    fontWeight: '700',
    fontSize: 15,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: '#0f1f3d',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e3a5f',
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  sectorNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fafafa',
    flex: 1,
  },
  badge: {
    backgroundColor: '#ffcc2922',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ffcc2955',
  },
  badgeText: {
    color: '#ffcc29',
    fontSize: 12,
    fontWeight: '600',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 24,
  },
  metaItem: {
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 15,
    color: '#fafafa',
    fontWeight: '600',
  },
});
