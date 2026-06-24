"use client";

import { useEffect, useState, useCallback } from "react";
import type { Room, Settings } from "@/lib/types";
import {
  getAdminPassword,
  setAdminPassword,
  clearAdminPassword,
} from "@/lib/adminClient";

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);

  // Pulihkan kata laluan dari sessionStorage (kekal semasa sesi tab)
  useEffect(() => {
    const saved = getAdminPassword();
    if (saved) setPassword(saved);
  }, []);

  if (!password) {
    return <LoginGate onSuccess={setPassword} />;
  }
  return <AdminPanel password={password} onLogout={() => {
    clearAdminPassword();
    setPassword(null);
  }} />;
}

// -------------------- Pintu log masuk --------------------
function LoginGate({ onSuccess }: { onSuccess: (pwd: string) => void }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (res.ok) {
        setAdminPassword(pwd);
        onSuccess(pwd);
      } else {
        setErr("Kata laluan salah.");
      }
    } catch {
      setErr("Ralat rangkaian.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-bold text-slate-900">Tetapan Pentadbir</h1>
      <p className="mt-1 text-sm text-slate-600">
        Masukkan kata laluan untuk mengurus bilik dan jenama sistem.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          type="password"
          required
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Kata laluan pentadbir"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Menyemak…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}

// -------------------- Panel pentadbir --------------------
function AdminPanel({
  password,
  onLogout,
}: {
  password: string;
  onLogout: () => void;
}) {
  const authHeaders = useCallback(
    (extra?: Record<string, string>) => ({
      "x-admin-password": password,
      ...(extra ?? {}),
    }),
    [password]
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Tetapan Pentadbir</h1>
        <button
          onClick={onLogout}
          className="text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Log Keluar
        </button>
      </div>

      <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Untuk membatalkan tempahan, buka{" "}
        <a href="/tempahan" className="font-semibold underline">
          Jadual Tempahan
        </a>{" "}
        — butang “Batal” akan muncul kerana anda telah log masuk sebagai pentadbir.
      </p>

      <BrandSettings authHeaders={authHeaders} />
      <RoomManager authHeaders={authHeaders} />
    </div>
  );
}

// -------------------- Tetapan jenama --------------------
function BrandSettings({
  authHeaders,
}: {
  authHeaders: (extra?: Record<string, string>) => Record<string, string>;
}) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/settings", { cache: "no-store" });
    const json = await res.json();
    if (json.settings) {
      setSettings(json.settings);
      setName(json.settings.system_name);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ system_name: name.trim() }),
      });
      const json = await res.json();
      if (!res.ok) setMsg({ type: "err", text: json.error ?? "Gagal." });
      else {
        setSettings(json.settings);
        setMsg({ type: "ok", text: "Nama sistem dikemas kini." });
      }
    } finally {
      setBusy(false);
    }
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/settings/logo", {
        method: "POST",
        headers: authHeaders(), // jangan set Content-Type untuk FormData
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) setMsg({ type: "err", text: json.error ?? "Muat naik gagal." });
      else {
        setSettings(json.settings);
        setMsg({ type: "ok", text: "Logo dikemas kini." });
      }
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">Jenama Sistem</h2>

      <div className="mt-4 flex items-center gap-4">
        {settings?.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.logo_url}
            alt="Logo"
            className="h-16 w-16 rounded border border-slate-200 object-contain"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-400">
            Tiada logo
          </div>
        )}
        <label className="cursor-pointer rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Muat Naik Logo
          <input
            type="file"
            accept="image/*"
            onChange={uploadLogo}
            disabled={busy}
            className="hidden"
          />
        </label>
      </div>

      <form onSubmit={saveName} className="mt-5 flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700">
            Nama Sistem
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Simpan
        </button>
      </form>

      {msg && (
        <p
          className={
            msg.type === "ok"
              ? "mt-3 text-sm text-green-700"
              : "mt-3 text-sm text-red-600"
          }
        >
          {msg.text}
        </p>
      )}
    </section>
  );
}

// -------------------- Pengurusan bilik --------------------
function RoomManager({
  authHeaders,
}: {
  authHeaders: (extra?: Record<string, string>) => Record<string, string>;
}) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/rooms", { cache: "no-store" });
    const json = await res.json();
    setRooms(json.rooms ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function addRoom(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      const json = await res.json();
      if (!res.ok) setMsg({ type: "err", text: json.error ?? "Gagal." });
      else {
        setNewName("");
        setNewDesc("");
        setMsg({ type: "ok", text: "Bilik ditambah." });
        load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function deleteRoom(id: string, name: string) {
    if (!confirm(`Padam bilik "${name}"? Tempahan lama akan dikekalkan.`)) return;
    setMsg(null);
    const res = await fetch(`/api/rooms/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) {
      setMsg({ type: "ok", text: "Bilik dipadam." });
      load();
    } else {
      const json = await res.json();
      setMsg({ type: "err", text: json.error ?? "Gagal padam." });
    }
  }

  async function renameRoom(room: Room) {
    const name = prompt("Nama bilik baharu:", room.name);
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const res = await fetch(`/api/rooms/${room.id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ name: trimmed, description: room.description ?? "" }),
    });
    if (res.ok) {
      setMsg({ type: "ok", text: "Bilik dikemas kini." });
      load();
    } else {
      const json = await res.json();
      setMsg({ type: "err", text: json.error ?? "Gagal." });
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">Urus Bilik</h2>

      <form onSubmit={addRoom} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nama Bilik
          </label>
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="cth: Bilik Mesyuarat"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Keterangan (pilihan)
          </label>
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Tambah Bilik
        </button>
      </form>

      {msg && (
        <p
          className={
            msg.type === "ok"
              ? "mt-3 text-sm text-green-700"
              : "mt-3 text-sm text-red-600"
          }
        >
          {msg.text}
        </p>
      )}

      <ul className="mt-5 divide-y divide-slate-100">
        {rooms.length === 0 && (
          <li className="py-3 text-sm text-slate-400">Belum ada bilik.</li>
        )}
        {rooms.map((room) => (
          <li key={room.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">{room.name}</p>
              {room.description && (
                <p className="text-sm text-slate-500">{room.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => renameRoom(room)}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                onClick={() => deleteRoom(room.id, room.name)}
                className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Padam
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
