const SITE = "https://manhwaclan.com/";
const PROXY = "https://api.allorigins.win/raw?url=";
const CACHE_KEY = "manhwa_cache_v2";
let list = [], chap = [], p = 0, currentChapters = [];

// کش هوشمند
const cache = {
  get: (key) => {
    const data = localStorage.getItem(key);
    if (!data) return null;
    const { value, expiry } = JSON.parse(data);
    if (Date.now() > expiry) { localStorage.removeItem(key); return null; }
    return value;
  },
  set: (key, value, ttl = 3600000) => { // 1 ساعت
    const data = { value, expiry: Date.now() + ttl };
    localStorage.setItem(key, JSON.stringify(data));
  }
};

async function start() {
  const loader = document.getElementById("loader");
  const app = document.getElementById("app");

  // از کش استفاده کن
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    list = cached;
    render();
    loader.classList.add("hidden");
    app.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(PROXY + encodeURIComponent(SITE), { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error("Network error");
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const items = doc.querySelectorAll(".post-item");
    list = Array.from(items).slice(0, 50).map(el => {
      const a = el.querySelector("h3 a, .title a");
      const img = el.querySelector("img");
      return {
        t: a?.textContent.trim() || "بدون نام",
        l: a?.href,
        i: img?.dataset.src || img?.src || "https://via.placeholder.com/160x240/222/00d4ff?text=Manhwa"
      };
    }).filter(x => x.l);

    cache.set(CACHE_KEY, list);
    render();
  } catch (e) {
    document.getElementById("grid").innerHTML = `<p style="text-align:center; color:#ff6b6b; grid-column:1/-1;">خطا در اتصال. <button onclick="location.reload()" style="background:#00d4ff; color:#000; border:none; padding:10px 20px; border-radius:12px; cursor:pointer; margin-top:10px;">تلاش مجدد</button></p>`;
  } finally {
    loader.classList.add("hidden");
    app.classList.remove("hidden");
  }
}

function render(f = list) {
  const grid = document.getElementById("grid");
  grid.innerHTML = f.length ? f.map(m => `
    <div class="card" onclick="openManhwa('${m.l}','${m.t.replace(/'/g, "\\'")}')">
      <img src="${m.i}" alt="${m.t}" loading="lazy" onerror="this.src='https://via.placeholder.com/160x240/222/00d4ff?text=مانهوا'">
      <h3>${m.t}</h3>
    </div>
  `).join("") : `<p style="grid-column:1/-1; text-align:center; color:#aaa; padding:40px;">هیچ مانهوایی یافت نشد.</p>`;
}

document.getElementById("search").addEventListener("input", debounce(e => {
  const q = e.target.value.toLowerCase();
  render(list.filter(x => x.t.toLowerCase().includes(q)));
}, 300));

async function openManhwa(url, title) {
  document.getElementById("title").textContent = title;
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("images").innerHTML = "<p style='color:#00d4ff; padding:20px;'>در حال بارگذاری چپترها...</p>";
  try {
    const res = await fetch(PROXY + encodeURIComponent(url), { signal: AbortSignal.timeout(10000) });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const chaps = Array.from(doc.querySelectorAll(".wp-manga-chapter a")).map(a => ({
      n: a.textContent.trim().replace(/Chapter/gi, "چپتر"),
      u: a.href
    })).reverse();
    currentChapters = chaps;
    const sel = document.getElementById("chapters");
    sel.innerHTML = chaps.map((c, i) => `<option value="${i}">${c.n}</option>`).join("");
    if (chaps.length) loadChapter();
  } catch (e) {
    document.getElementById("images").innerHTML = `<p style="color:#ff6b6b;">خطا. <button onclick="location.reload()" style="background:#00d4ff; color:#000; border:none; padding:8px 16px; border-radius:10px; cursor:pointer;">تلاش مجدد</button></p>`;
  }
}

async function loadChapter() {
  const i = document.getElementById("chapters").value;
  if (i === undefined || !currentChapters[i]) return;
  const url = currentChapters[i].u;
  const imgDiv = document.getElementById("images");
  imgDiv.innerHTML = "<p style='color:#00d4ff; padding:20px;'>در حال بارگذاری تصاویر...</p>";
  try {
    const res = await fetch(PROXY + encodeURIComponent(url), { signal: AbortSignal.timeout(15000) });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    chap = Array.from(doc.querySelectorAll(".reading-content img")).map(img => img.src).filter(src => src && /\.(jpg|png|webp|gif)$/i.test(src));
    if (!chap.length) throw new Error("No images");
    p = 0;
    showPage();
  } catch (e) {
    imgDiv.innerHTML = `<p style="color:#ff6b6b;">تصاویر لود نشد. <button onclick="loadChapter()" style="background:#00d4ff; color:#000; border:none; padding:8px 16px; border-radius:10px; cursor:pointer;">تلاش مجدد</button></p>`;
  }
}

function showPage() {
  const img = chap[p];
  const imgDiv = document.getElementById("images");
  imgDiv.innerHTML = img ? `<img src="${img}" alt="صفحه ${p+1}" loading="lazy" class="loading">` : "<p>تصویری یافت نشد.</p>";
  document.getElementById("info").textContent = `${p + 1} / ${chap.length}`;
  document.getElementById("prev").disabled = p === 0;
  document.getElementById("next").disabled = p === chap.length - 1;

  // حذف کلاس loading بعد از لود
  const image = imgDiv.querySelector("img");
  if (image) image.onload = () => image.classList.remove("loading");
}

function prev() { if (p > 0) { p--; showPage(); } }
function next() { if (p < chap.length - 1) { p++; showPage(); } }
function closeModal() { document.getElementById("modal").classList.add("hidden"); chap = []; p = 0; }

// Debounce برای سرچ
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// شروع
start();
