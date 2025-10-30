import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_BASE;

export default function AdminActors() {
  const [actors, setActors] = useState([]);
  const [form, setForm] = useState({ name: "", bio: "", photo: null });

  useEffect(() => {
    fetch(`${API}/api/actors`).then(r => r.json()).then(setActors);
  }, []);

  const addActor = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("bio", form.bio);
    if (form.photo) fd.append("photo", form.photo);

    const res = await fetch(`${API}/api/admin/actors`, {
      method: "POST",
      body: fd
    });
    const data = await res.json();
    setActors((a) => [...a, data]);
    setForm({ name: "", bio: "", photo: null });
  };

  const del = async (id) => {
    await fetch(`${API}/api/admin/actors/${id}`, { method: "DELETE" });
    setActors((a) => a.filter(x => x.id !== id));
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-3">Актёры</h2>
      <form onSubmit={addActor} className="space-y-2 mb-5">
        <input
          type="text"
          placeholder="Имя актёра"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full"
        />
        <textarea
          placeholder="Биография"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Добавить</button>
      </form>

      <ul className="space-y-3">
        {actors.map(a => (
          <li key={a.id} className="border p-3 flex justify-between">
            <div>
              <b>{a.name}</b>
              <p className="text-sm text-gray-600">{(a.bio || "").slice(0, 80)}</p>
              {a.photoUrl && <img src={a.photoUrl} alt="" className="h-20 mt-1" />}
            </div>
            <button onClick={() => del(a.id)} className="text-red-600">Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}