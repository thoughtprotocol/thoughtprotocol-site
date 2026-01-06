(async function () {
  const POSTS_BASE = "/totd/posts/";
  const POSTS_MANIFEST = POSTS_BASE + "manifest.json";

  // Lightweight frontmatter parser (--- ... ---)
  function parseFrontmatter(raw) {
    const fmMatch = raw.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
    if (!fmMatch) return { meta: {}, body: raw };

    const fm = fmMatch[1];
    const body = fmMatch[2];
    const meta = {};

    // crude YAML-ish parsing for simple key: value and tags: [a,b]
    fm.split("\n").forEach(line => {
      const idx = line.indexOf(":");
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();

      // booleans
      if (val === "true") val = true;
      if (val === "false") val = false;

      // tags list: [A, B]
      if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
        val = val.slice(1, -1).split(",").map(s => s.trim()).filter(Boolean);
      }

      // strip surrounding quotes
      if (typeof val === "string") {
        val = val.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
      }

      meta[key] = val;
    });

    return { meta, body };
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function normalizeTag(tag) {
    return String(tag || "").trim();
  }

  function formatDate(iso) {
    // show as Month Day, Year (local)
    const d = new Date(iso + "T00:00:00");
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  const pinnedContainer = document.getElementById("totdPinned");
  const postsContainer = document.getElementById("totdPosts");
  const filterContainer = document.getElementById("totdFilters");

  if (!pinnedContainer || !postsContainer || !filterContainer) return;

  // Load dependencies (Marked + Highlight.js)
  // Marked must be loaded before this script in HTML.
  // Highlight.js auto-highlights when called.
  function renderMarkdown(md) {
    const html = window.marked.parse(md);
    return html;
  }

  async function loadManifest() {
    const res = await fetch(POSTS_MANIFEST, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load manifest.json");
    return await res.json();
  }

  async function loadPost(file) {
    const res = await fetch(POSTS_BASE + file, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load post: " + file);
    const raw = await res.text();
    const { meta, body } = parseFrontmatter(raw);
    return { file, meta, body };
  }

  function postCard(post) {
    const title = escapeHtml(post.meta.title || "Untitled");
    const date = escapeHtml(formatDate(post.meta.date || ""));
    const summary = escapeHtml(post.meta.summary || "");
    const tags = Array.isArray(post.meta.tags) ? post.meta.tags.map(normalizeTag) : [];

    const tagPills = tags.map(t => `
      <span class="badge badge-outline d-inline-flex align-items-center gap-1">
        <i class="bi bi-tag-fill"></i>${escapeHtml(t)}
      </span>
    `).join("");

    const isCode = tags.map(t => t.toLowerCase()).includes("code");
    const headerIcon = isCode
      ? `<span class="totd-icon"><i class="bi bi-braces-asterisk"></i></span>`
      : `<span class="totd-icon"><i class="bi bi-journal-text"></i></span>`;

    const rendered = renderMarkdown(post.body);

    return `
      <div class="card product-card rounded-4 totd-card animate-in">
        <div class="card-body p-3 p-md-4">
          <div class="d-flex align-items-start justify-content-between gap-3">
            <div class="d-flex gap-2 align-items-center">
              ${headerIcon}
              <div>
                <h3 class="h5 mb-1">${title}</h3>
                <div class="small text-body-secondary">${date}</div>
              </div>
            </div>
          </div>

          ${summary ? `<p class="text-body-secondary mt-3 mb-0">${summary}</p>` : ""}

          ${tagPills ? `<div class="totd-tags mt-3 d-flex flex-wrap gap-2">${tagPills}</div>` : ""}

          <div class="totd-content mt-3">
            ${rendered}
          </div>
        </div>
      </div>
    `;
  }

  function observeAnimations() {
    const cards = document.querySelectorAll(".animate-in");
    if (!("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach(c => io.observe(c));
  }

  function applyHighlighting() {
    if (window.hljs) {
      document.querySelectorAll("pre code").forEach(block => window.hljs.highlightElement(block));
    }
  }

  function buildFilters(allTags, current) {
    const buttons = [
      { key: "All", label: "All" },
      ...allTags.map(t => ({ key: t, label: t }))
    ];

    filterContainer.innerHTML = buttons.map(b => `
      <button type="button"
        class="btn btn-sm ${b.key === current ? "btn-primary" : "btn-outline-secondary"} totd-filter-btn"
        data-tag="${escapeHtml(b.key)}">
        ${escapeHtml(b.label)}
      </button>
    `).join("");

    filterContainer.querySelectorAll("button[data-tag]").forEach(btn => {
      btn.addEventListener("click", () => {
        const tag = btn.getAttribute("data-tag");
        render(tag);
      });
    });
  }

  let posts = [];
  let allTags = [];

  async function init() {
    const manifest = await loadManifest();
    const loaded = await Promise.all((manifest.posts || []).map(p => loadPost(p.file)));
    // Sort newest first
    posts = loaded.sort((a, b) => (b.meta.date || "").localeCompare(a.meta.date || ""));

    const tagSet = new Set();
    posts.forEach(p => {
      (p.meta.tags || []).forEach(t => tagSet.add(normalizeTag(t)));
    });
    allTags = Array.from(tagSet).filter(Boolean).sort((a,b) => a.localeCompare(b));
    buildFilters(allTags, "All");

    render("All");
  }

  function render(tag) {
    const chosen = tag || "All";
    buildFilters(allTags, chosen);

    // pinned
    const pinned = posts.filter(p => p.meta.pinned === true);
    pinnedContainer.innerHTML = pinned.length
      ? pinned.map(postCard).join("")
      : `<div class="text-body-secondary">No pinned posts yet.</div>`;

    // rest, filtered
    const rest = posts.filter(p => p.meta.pinned !== true);
    const filtered = chosen === "All"
      ? rest
      : rest.filter(p => Array.isArray(p.meta.tags) && p.meta.tags.map(normalizeTag).includes(chosen));

    postsContainer.innerHTML = filtered.length
      ? filtered.map(postCard).join("")
      : `<div class="text-body-secondary">No posts found for this tag.</div>`;

    observeAnimations();
    applyHighlighting();
  }

  try {
    await init();
  } catch (e) {
    pinnedContainer.innerHTML = `<div class="text-danger">Could not load TOTD posts.</div>`;
    postsContainer.innerHTML = `<div class="text-body-secondary small">${escapeHtml(String(e))}</div>`;
  }
})();
