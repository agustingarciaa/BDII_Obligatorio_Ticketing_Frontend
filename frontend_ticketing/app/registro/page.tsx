"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { saveToken } from "@/lib/auth";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none transition-colors focus:border-gold";

export default function Registro() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    doc_pais: "",
    doc_tipo: "CI",
    doc_numero: "",
    mail: "",
    contrasena: "",
    dir_pais: "",
    dir_localidad: "",
    dir_calle: "",
    dir_numero: "",
    dir_codigo_postal: "",
  });

  const [telefonos, setTelefonos] = useState<string[]>([""]);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setTelefono(index: number, value: string) {
    setTelefonos((tels) => tels.map((t, i) => (i === index ? value : t)));
  }
  function addTelefono() {
    setTelefonos((tels) => [...tels, ""]);
  }
  function removeTelefono(index: number) {
    setTelefonos((tels) =>
      tels.length === 1 ? tels : tels.filter((_, i) => i !== index),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await register({
        doc_pais: form.doc_pais.trim(),
        doc_tipo: form.doc_tipo.trim(),
        doc_numero: form.doc_numero.trim(),
        mail: form.mail.trim(),
        contrasena: form.contrasena,
        dir_pais: form.dir_pais.trim(),
        dir_localidad: form.dir_localidad.trim(),
        dir_calle: form.dir_calle.trim(),
        dir_numero: Number(form.dir_numero),
        dir_codigo_postal: form.dir_codigo_postal.trim(),
        telefonos: (() => {
          const limpios = telefonos.map((t) => t.trim()).filter(Boolean);
          return limpios.length > 0 ? limpios : undefined;
        })(),
      });
      saveToken(token);
      router.push("/dashboard_usuario");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wc-hero flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md"
      >
        <h1 className="text-2xl font-bold text-white">
          Crear cuenta de hincha ⚽
        </h1>
        <p className="-mt-2 text-sm text-white/60">
          Registrate para comprar entradas del Mundial 2026.
        </p>

        <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="País del documento">
            <input
              className={inputClass}
              required
              value={form.doc_pais}
              onChange={(e) => set("doc_pais", e.target.value)}
            />
          </Field>
          <Field label="Tipo">
            <input
              className={inputClass}
              required
              value={form.doc_tipo}
              onChange={(e) => set("doc_tipo", e.target.value)}
            />
          </Field>
        </fieldset>
        <Field label="Número de documento">
          <input
            className={inputClass}
            required
            value={form.doc_numero}
            onChange={(e) => set("doc_numero", e.target.value)}
          />
        </Field>

        <Field label="Mail">
          <input
            type="email"
            className={inputClass}
            required
            value={form.mail}
            onChange={(e) => set("mail", e.target.value)}
          />
        </Field>

        <Field label="Contraseña">
          <input
            type="password"
            className={inputClass}
            required
            value={form.contrasena}
            onChange={(e) => set("contrasena", e.target.value)}
          />
          <span className="text-xs text-white/50">
            Mínimo 8 caracteres, con mayúscula, minúscula y número.
          </span>
        </Field>

        <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="País">
            <input
              className={inputClass}
              required
              value={form.dir_pais}
              onChange={(e) => set("dir_pais", e.target.value)}
            />
          </Field>
          <Field label="Localidad">
            <input
              className={inputClass}
              required
              value={form.dir_localidad}
              onChange={(e) => set("dir_localidad", e.target.value)}
            />
          </Field>
          <Field label="Calle">
            <input
              className={inputClass}
              required
              value={form.dir_calle}
              onChange={(e) => set("dir_calle", e.target.value)}
            />
          </Field>
          <Field label="Número">
            <input
              type="number"
              className={inputClass}
              required
              value={form.dir_numero}
              onChange={(e) => set("dir_numero", e.target.value)}
            />
          </Field>
          <Field label="Código postal">
            <input
              className={inputClass}
              required
              value={form.dir_codigo_postal}
              onChange={(e) => set("dir_codigo_postal", e.target.value)}
            />
          </Field>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Teléfonos (opcional)</span>
            <button
              type="button"
              onClick={addTelefono}
              className="rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              + Agregar
            </button>
          </div>
          {telefonos.map((tel, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={`${inputClass} flex-1`}
                placeholder={`Teléfono ${i + 1}`}
                value={tel}
                onChange={(e) => setTelefono(i, e.target.value)}
              />
              {telefonos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTelefono(i)}
                  aria-label="Quitar teléfono"
                  className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-white/60 transition-colors hover:border-red-400/50 hover:text-red-300"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </fieldset>

        {error && (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-full bg-gold px-5 py-2.5 font-semibold text-night transition-colors hover:bg-gold-deep disabled:opacity-50"
        >
          {loading ? "Creando cuenta…" : "Crear cuenta y comprar entradas"}
        </button>

        <Link
          href="/"
          className="text-center text-sm text-white/60 transition-colors hover:text-white"
        >
          Ya tengo cuenta · Iniciar sesión
        </Link>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-white/70">
      {label}
      {children}
    </label>
  );
}
