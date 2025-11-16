// داده‌ها مستقیماً داخل کد – بدون انتظار
const MANHWA_DATA = [
  {
    t: "Solo Leveling",
    l: "https://manhwaclan.com/manga/solo-leveling/",
    i: "https://manhwaclan.com/wp-content/uploads/WP-manga/data/manga_5f8e8e8e8e8e8/solo-leveling.jpg",
    chapters: [
      { n: "چپتر 1", u: "https://manhwaclan.com/manga/solo-leveling/chapter-1/" },
      { n: "چپتر 2", u: "https://manhwaclan.com/manga/solo-leveling/chapter-2/" }
    ]
  },
  {
    t: "Tower of God",
    l: "https://manhwaclan.com/manga/tower-of-god/",
    i: "https://manhwaclan.com/wp-content/uploads/WP-manga/data/manga_5f8e8e8e8e8e8/tower-of-god.jpg",
    chapters: [
      { n: "چپتر 1", u: "https://manhwaclan.com/manga/tower-of-god/chapter-1/" }
    ]
  },
  {
    t: "The Beginning After The End",
    l: "https://manhwaclan.com/manga/the-beginning-after-the-end/",
    i: "https://manhwaclan.com/wp-content/uploads/WP-manga/data/manga_5f8e8e8e8e8e8/tbate.jpg",
    chapters: [
      { n: "چپتر 1", u: "https://manhwaclan.com/manga/the-beginning-after-the-end/chapter-1/" }
    ]
  }
];

let list = MANHWA_DATA, chap = [], p = 0, currentManhwa = null;

function start() {
  const loader = document.getElementById("loader");
  const app = document.getElementById("app");

  // Particle Background
  particlesJS("particles-js", {
    particles: { number: { value: 80 }, color: { value: "#00ff88" }, shape: { type: "circle" }, opacity: { value: 0.5 }, size: { value: 3 }, line_linked: { enable: true, color: "#00d4ff", opacity: 0.2 }, move: { speed: 1 } },
    interactivity: { events: { onhover: { enable: true, mode: "repulse" } } }
  });

  render();
  setTimeout(() => {
    loader.classList.add("hidden");
    app.classList.remove("hidden");
  }, 300); // فقط 0.3 ثانیه لودینگ
}

function render(f = list) {
  const grid = document.getElementById("grid");
  grid.innerHTML = f.map(m => `
    <div class="card" onclick="openManhwa('${m.t.replace(/'/g, "\\'")}')">
      <img src="${m.i}" alt="${m.t}" loading="lazy" onerror="this.src='https://via.placeholder.com/170x250/111/00ff88?text=نکسوس'">
      <h3>${m.t}</h3>
    </div>
  `).join("");
}

document.getElementById("search")?.addEventListener("input", debounce(e => {
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

function loadChapter() {
  const i = document.getElementById("chapters").value;
  if (!currentManhwa || !currentManhwa.chapters[i]) return;
  const url = currentManhwa.chapters[i].u;
  const imgDiv = document.getElementById("images");
  imgDiv.innerHTML = `<p style="color:#00d4ff; text-align:center; padding:30px;">
    چپتر: <strong>${currentManhwa.chapters[i].n}</strong><br><br>
    <a href="${url}" target="_blank" style="background:#00ff88; color:#000; padding:12px 24px; border-radius:12px; text-decoration:none; font-weight:bold;">
      باز کردن در سایت اصلی
    </a>
  </p>`;
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

// شروع فوری
start();
