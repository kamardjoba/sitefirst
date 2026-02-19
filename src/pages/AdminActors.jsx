import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_BASE;

export default function AdminActors() {
  const [actors, setActors] = useState([]);
  const [form, setForm] = useState({ name: "", bio: "", genre: "", photo: null, cast: [], rating: "" });

  useEffect(() => {
    fetch(`${API}/api/artists`).then(r => r.json()).then(setActors);
  }, []);

  const addActor = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("bio", form.bio);
    if (form.genre) fd.append("genre", form.genre);
    if (form.photo) fd.append("photo", form.photo);
    if (form.rating) fd.append("rating", form.rating);
    if (form.cast && form.cast.length > 0) {
      fd.append("cast", JSON.stringify(form.cast));
    }

    const res = await fetch(`${API}/api/admin/artists`, {
      method: "POST",
      body: fd
    });
    const data = await res.json();
    setActors((a) => [...a, data]);
    setForm({ name: "", bio: "", genre: "", photo: null, cast: [], rating: "" });
    // Сброс input file
    const fileInput = document.querySelector('input[type="file"]');
    if(fileInput) fileInput.value = '';
  };

  const del = async (id) => {
    if (!confirm("Удалить актёра и все связанные данные? Это действие необратимо.")) return;
  
    try {
      const res = await fetch(`${API}/api/admin/artists/${id}`, {
        method: "DELETE",
        // если у вас используется авторизация через JWT в header:
        // headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
      });
  
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("Ошибка при удалении: " + (err.error || err.detail || res.statusText));
        return;
      }
  
      // успешно удалено — обновляем список
      setActors((a) => a.filter(x => x.id !== id));
      alert("Актёр успешно удалён");
    } catch (e) {
      console.error("delete actor failed:", e);
      alert("Сетeвая ошибка при удалении");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-3">Актёры</h2>
      <form onSubmit={addActor} className="space-y-2 mb-5">
        <input
          type="text"
          placeholder="Имя артиста *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input w-full"
          required
        />
        <input
          type="text"
          placeholder="Жанр (опционально)"
          value={form.genre}
          onChange={(e) => setForm({ ...form, genre: e.target.value })}
          className="input w-full"
        />
        <input
          type="number"
          step="0.1"
          min="0"
          max="10"
          placeholder="Рейтинг (опционально, от 0 до 10)"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
          className="input w-full"
        />
        <textarea
          placeholder="Биография (опционально)"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="input w-full min-h-[100px]"
        />
        <div>
          <label className="block text-sm mb-2">Состав (опционально) - выберите других артистов</label>
          <select
            multiple
            className="input w-full min-h-[100px]"
            value={form.cast.map(String)}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
              setForm({ ...form, cast: selected });
            }}
          >
            {actors.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <p className="text-xs text-neutral-400 mt-1">Удерживайте Ctrl/Cmd для выбора нескольких</p>
          {form.cast.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.cast.map(id => {
                const actor = actors.find(a => a.id === id);
                return actor ? (
                  <span key={id} className="tag">
                    {actor.name}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, cast: form.cast.filter(c => c !== id) })}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
          className="input w-full"
        />
        <button className="btn">Добавить</button>
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