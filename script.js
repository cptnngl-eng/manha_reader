const CACHE_KEY = "nexus_cache_v3";
let list = [], chap = [], p = 0, currentChapters = [];

async function start() {
  const loader = document.getElementById("loader");
  const app = document.getElementById("app");

  // Particles
  particlesJS("particles-js", {
    particles: { number: { value: 80 }, color: { value: "#00ff88" }, shape: { type: "circle" }, opacity: { value: 0.5 }, size: { value: 3 }, line_linked: { enable: true, color: "#00d4ff" }, move: { speed: 2 } },
    interactivity: { events: { onhover: { enable: true, mode: "repulse" } } }
  });

  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    list = JSON.parse(cached);
    render();
    loader.classList.add("hidden");
    app.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch("data.json", { signal: AbortSignal.timeout(8000) });
    list = await res.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify(list));
    render();
  } catch (e) {
    document.getElementById("grid").innerHTML = `<p style="text-align:center; color:#ff6b6b; grid-column:1/-1;">داده‌ها لود نشد. <button onclick="location.reload()" style="background:#00ff88; color:#000; border:none; padding:10px 20px; border-radius:12px; cursor:pointer; margin-top:10px;">تلاش مجدد</button></p>`;
  } finally {
    loader.classList.add("hidden");
    app.classList.remove("hidden");
  }
}

function render(f = list) {
  const grid = document.getElementById("grid");
  grid.innerHTML = f.length ? f.map(m => `
    <div class="card" onclick="openManhwa('${m.l}','${m.t.replace(/'/g, "\\'")}')">
      <img src="${m.i}" alt="${m.t}" loading="lazy" onerror="this.src='https://via.placeholder.com/170x250/111/00ff88?text=نکسوس'">
      <h3>${m.t}</h3>
    </div>
  `).join("") : `<p style="grid-column:1/-1; text-align:center; color:#aaa; padding:50px;">هیچ مانهوایی یافت نشد.</p>`;
}

document.getElementById("search").addEventListener("input", debounce(e => {
  const q = e.target.value.toLowerCase();
  render(list.filter(x => x.t.toLowerCase().includes(q)));
}, 250));

// بقیه توابع مثل قبل (openManhwa, loadChapter, ...) – فقط از data.json استفاده می‌کنه
// برای چپترها هم می‌تونی یه data-chapters.json بسازی

start();
