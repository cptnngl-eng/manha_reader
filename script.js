const CACHE_KEY = "nexus_cache_v4";
let list = [], chap = [], p = 0, currentManhwa = null;

async function start() {
  const loader = document.getElementById("loader");
  const app = document.getElementById("app");

  // Particle Background
  particlesJS("particles-js", {
    particles: { number: { value: 100 }, color: { value: "#00ff88" }, shape: { type: "circle" }, opacity: { value: 0.6 }, size: { value: 3 }, line_linked: { enable: true, color: "#00d4ff", opacity: 0.3 }, move: { speed: 1.5 } },
    interactivity: { events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } } }
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
    const res = await fetch("data.json", { signal: AbortSignal.timeout(5000) });
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
    <div class="card" onclick="openManhwa('${m.t.replace(/'/g, "\\'")}')">
      <img src="${m.i}" alt="${m.t}" loading="lazy" onerror="this.src='https://via.placeholder.com/170x250/111/00ff88?text=نکسوس'">
      <h3>${m.t}</h3>
    </div>
  `).join("") : `<p style="grid-column:1/-1; text-align:center; color:#aaa; padding:50px;">هیچ مانهوایی یافت نشد.</p>`;
}

document.getElementById("search").addEventListener("input", debounce(e => {
  const q = e.target.value.toLowerCase();
  render(list.filter(x => x.t.toLowerCase().includes(q)));
}, 200));

function openManhwa(title) {
  currentManhwa = list.find(m => m.t === title);
  if (!currentManhwa) return;
  document.getElementById("title").textContent = title;
  document.getElementById("modal").classList.remove("hidden");
  const sel = document.getElementById("chapters");
  sel.innerHTML = currentManhwa.chapters.map((c, i) => `<option value="${i}">${c.n}</option>`).join("");
  loadChapter();
}

async function loadChapter() {
  const i = document.getElementById("chapters").value;
  if (!currentManhwa || !currentManhwa.chapters[i]) return;
  const url = currentManhwa.chapters[i].u;
  const imgDiv = document.getElementById("images");
  imgDiv.innerHTML = "<p style='color:#00ff88; padding:20px;'>در حال بارگذاری تصاویر...</p>";
  
  // اینجا می‌تونی تصاویر رو هم در data.json ذخیره کنی یا از پروکسی استفاده کنی
  // فعلاً فقط لینک نمایش داده میشه
  imgDiv.innerHTML = `<p style="color:#00d4ff;">چپتر: ${currentManhwa.chapters[i].n}<br><a href="${url}" target="_blank" style="color:#00ff88;">باز کردن در سایت اصلی</a></p>`;
}

function prev() { /* بعداً اضافه میشه */ }
function next() { /* بعداً اضافه میشه */ }
function closeModal() { document.getElementById("modal").classList.add("hidden"); currentManhwa = null; }

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

start();
