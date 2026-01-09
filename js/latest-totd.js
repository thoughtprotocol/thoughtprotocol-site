(async function () {
  const mount = document.getElementById("latestTotd");
  if (!mount) return;

  const POSTS_MANIFEST = "totd/posts/manifest.json";

  function parseFrontmatter(raw) {
    const fmMatch = raw.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
    if (!fmMatch) return { meta: {}, body: raw };
    const fm = fmMatch[1];
    const body = fmMatch[2];
    const meta = {};

    fm.split("\n").forEach(line => {
      const idx = line.indexOf(":");
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();

      if (val === "true") val = true;
      if (val === "false") val = false;

      if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
        val = val.slice(1, -1).split(",").map(s => s.trim()).filter(Boolean);
      }

      if (typeof val === "string") {
        val = val.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
      }

      meta[key] = val;
    });

    return { meta, body };
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(String(iso) + "T00:00:00");
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  async function loadManifest() {
    const res = await fetch(POSTS_MANIFEST, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load manifest.json");
    return await res.json();
  }

  async function loadPost(file) {
    const res = await fetch("totd/posts/" + file, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load post: " + file);
    const raw = await res.text();
    const { meta } = parseFrontmatter(raw);
    return { file, meta };
  }

  try {
    const manifest = await loadManifest();
    const files = (manifest.posts || []).map(p => p.file);

    // load meta only (fast)
    const loaded = await Promise.all(files.map(loadPost));

    // newest non-pinned post; fallback to newest overall
    const nonPinned = loaded.filter(p => p.meta.pinned !== true && p.meta.date);
    const list = (nonPinned.length ? nonPinned : loaded).slice();

    list.sort((a, b) => String(b.meta.date || "").localeCompare(String(a.meta.date || "")));
    const latest = list[0];

    if (!latest) {
      mount.innerHTML = `<div class="text-body-secondary">No posts yet.</div>`;
      return;
    }

    const title = escapeHtml(latest.meta.title || "Untitled");
    const date = escapeHtml(formatDate(latest.meta.date || ""));
    const summary = escapeHtml(latest.meta.summary || "");

    mount.innerHTML = `
      <div class="card product-card rounded-4">
        <div class="card-body p-3 p-md-4">
          <div class="small text-body-secondary">${date}</div>
          <h3 class="h5 mt-2 mb-2">${title}</h3>
          ${summary ? `<p class="text-body-secondary mb-3">${summary}</p>` : ""}
          <a class="btn btn-outline-secondary" href="totd.html">Read in Posts</a>
        </div>
      </div>
    `;
  } catch (e) {
    mount.innerHTML = `<div class="text-body-secondary small">Could not load latest post.</div>`;
  }
})();
