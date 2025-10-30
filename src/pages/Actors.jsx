import { useActorsStore } from "../store/actors";

export default function Actors() {
  const raw = useActorsStore((s) => s.list) || [];
  const actors = (Array.isArray(raw) ? raw : []).map((a) => ({
    id: a?.id,
    name: a?.name ?? "",
    avatarUrl: a?.avatarUrl ?? "",
    bio: a?.bio ?? "",
  }));

  if (!actors.length) {
    return <div className="p-4">Загрузка актёров...</div>;
  }

  return (
    <section className="grid gap-4 p-4">
      {actors.map((actor) => (
        <article
          key={actor.id}
          className="border rounded-lg p-3 shadow-sm hover:shadow-md transition"
        >
          <h3 className="font-bold text-lg">{actor.name}</h3>

          {actor.avatarUrl && (
            <img
              src={actor.avatarUrl}
              alt={actor.name}
              className="w-full rounded-lg my-2"
            />
          )}

          {/* ✅ защищаем .slice */}
          <p className="text-sm text-neutral-600">
            {(actor.bio || "").slice(0, 150)}
            {actor.bio?.length > 150 ? "..." : ""}
          </p>
        </article>
      ))}
    </section>
  );
}