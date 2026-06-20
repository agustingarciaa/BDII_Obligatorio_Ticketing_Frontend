'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export const MAX_ENTRADAS = 5;
export const TASA_COMISION = 0.05;

export type CartItem = {
  id_evento: number;
  nombre_sector: string;
  id_estadio: number;
  costo_entrada: number;
  equipos: string; // "Local vs Visitante"
  cantidad: number;
};

type CartCtx = {
  items: CartItem[];
  subtotal: number;
  total: number;
  totalCantidad: number;
  agregar: (item: Omit<CartItem, 'cantidad'>, cantidad: number) => string | null;
  quitar: (id_evento: number, nombre_sector: string) => void;
  cambiarCantidad: (id_evento: number, nombre_sector: string, cantidad: number) => string | null;
  vaciar: () => void;
};

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const totalCantidad = useMemo(
    () => items.reduce((s, i) => s + i.cantidad, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.costo_entrada * i.cantidad, 0),
    [items],
  );

  const total = useMemo(
    () => Math.round(subtotal * (1 + TASA_COMISION) * 100) / 100,
    [subtotal],
  );

  const agregar = useCallback(
    (item: Omit<CartItem, 'cantidad'>, cantidad: number): string | null => {
      let error: string | null = null;
      setItems((prev) => {
        const idx = prev.findIndex(
          (i) =>
            i.id_evento === item.id_evento &&
            i.nombre_sector === item.nombre_sector,
        );
        const actualActual = idx >= 0 ? prev[idx].cantidad : 0;
        const nuevaTotal =
          prev.reduce((s, i, j) => s + (j === idx ? 0 : i.cantidad), 0) +
          actualActual +
          cantidad;

        if (nuevaTotal > MAX_ENTRADAS) {
          error = `No podés superar ${MAX_ENTRADAS} entradas por transacción.`;
          return prev;
        }

        if (idx >= 0) {
          return prev.map((i, j) =>
            j === idx ? { ...i, cantidad: i.cantidad + cantidad } : i,
          );
        }
        return [...prev, { ...item, cantidad }];
      });
      return error;
    },
    [],
  );

  const cambiarCantidad = useCallback(
    (id_evento: number, nombre_sector: string, cantidad: number): string | null => {
      let error: string | null = null;
      setItems((prev) => {
        const otrasCantidades = prev
          .filter(
            (i) =>
              !(i.id_evento === id_evento && i.nombre_sector === nombre_sector),
          )
          .reduce((s, i) => s + i.cantidad, 0);

        if (otrasCantidades + cantidad > MAX_ENTRADAS) {
          error = `No podés superar ${MAX_ENTRADAS} entradas por transacción.`;
          return prev;
        }

        if (cantidad <= 0) {
          return prev.filter(
            (i) =>
              !(i.id_evento === id_evento && i.nombre_sector === nombre_sector),
          );
        }

        return prev.map((i) =>
          i.id_evento === id_evento && i.nombre_sector === nombre_sector
            ? { ...i, cantidad }
            : i,
        );
      });
      return error;
    },
    [],
  );

  const quitar = useCallback((id_evento: number, nombre_sector: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(i.id_evento === id_evento && i.nombre_sector === nombre_sector),
      ),
    );
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, subtotal, total, totalCantidad, agregar, quitar, cambiarCantidad, vaciar }),
    [items, subtotal, total, totalCantidad, agregar, quitar, cambiarCantidad, vaciar],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
