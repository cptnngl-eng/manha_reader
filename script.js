const SITE = "https://manhwaclan.com/";
const PROXY = "https://corsproxy.io/?"; // کار می‌کنه در FR + Irancell
let list = [], chap = [], p = 0, currentChapters = [];

async function start() {
  try {
    const res = await fetch(PROXY + encodeURIComponent(SITE));
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const items = doc.querySelectorAll(".post-item");
    list = Array.from(items).slice(0, 40).map(el => {
      const a = el.querySelector("h3 a, .title a");
      const img = el.querySelector("img");
      return {
        t: a?.textContent.trim() || "بدون نام",
        l: a?.href,
        i: img?.dataset.src || img?.src || "https://via.placeholder.com/150x220/222/00d4ff?text=Manhwa"
      };
    }).filter(x => x.l);
    render();
  } catch (e) {
    document.getElementById("grid").innerHTML = `<p style="text-align:center; color:#ff6b6b; grid-column:1/-1;">خطا در بارگذاری. <button onclick="start()" style="background:#00d4ff; color:#000; border:none; padding:8px 16px; border-radius:10px; cursor:pointer; margin-top:10px;">تلاش مجدد</button></p>`;
  }
}

function render(f = list) {
  const grid = document.getElementById("grid");
  grid.innerHTML = f.length ? f.map(m => `
    <div class="card" onclick="openManhwa('${m.l}','${m.t.replace(/'/g, "\\'")}')">
      <img src="${m.i}" alt="${m.t}" loading="lazy" onerror="this.src='https://via.placeholder.com/150x220/222/00d4ff?text=مانهوا'">
      <h3>${m.t}</h3>
    </div>
  `).join("") : `<p style="grid-column:1/-1; text-align:center; color:#aaa;">هیچ مانهوایی یافت نشد.</p>`;
}

document.getElementById("search").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  render(list.filter(x => x.t.toLowerCase().includes(q)));
});

async function openManhwa(url, title) {
  document.getElementById("title").textContent = title;
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("images").innerHTML = "<p style='color:#00d4ff;'>در حال بارگذاری چپترها...</p>";
  try {
    const res = await fetch(PROXY + encodeURIComponent(url));
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const chaps = Array.from(doc.querySelectorAll(".wp-manga-chapter a")).map(a => ({
      n: a.textContent.trim().replace("Chapter", "چپتر"),
      u: a.href
    })).reverse();
    currentChapters = chaps;
    const sel = document.getElementById("chapters");
    sel.innerHTML = chaps.map((c, i) => `<option value="${i}">${c.n}</option>`).join("");
    if (chaps.length) loadChapter();
  } catch (e) {
    document.getElementById("images").innerHTML = `<p style="color:#ff6b6b;">خطا در لود چپترها. <button onclick="openManhwa('${url}', '${title}')" style="background:#00d4ff; color:#000; border:none; padding:6px 12px; border-radius:8px; cursor:pointer;">تلاش مجدد</button></p>`;
  }
}

async function loadChapter() {
  const i = document.getElementById("chapters").value;
  if (i === undefined || !currentChapters[i]) return;
  const url = currentChapters[i].u;
  document.getElementById("images").innerHTML = "<p style='color:#00d4ff;'>در حال بارگذاری تصاویر...</p>";
  try {
    const res = await fetch(PROXY + encodeURIComponent(url));
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    chap = Array.from(doc.querySelectorAll(".reading-content img")).map(img => img.src).filter(src => src && /\.(jpg|png|webp)$/i.test(src));
    if (!chap.length) throw new Error("No images");
    p = 0;
    showPage();
  } catch (e) {
    document.getElementById("images").innerHTML = `<p style="color:#ff6b6b;">خطا در تصاویر. <button onclick="loadChapter()" style="background:#00d4ff; color:#000; border:none; padding:6px 12px; border-radius:8px; cursor:pointer;">تلاش مجدد</button></p>`;
  }
}

function showPage() {
  const img = chap[p];
  document.getElementById("images").innerHTML = img ? `<img src="${img}" alt="صفحه ${p+1}" loading="lazy">` : "<p>تصویری یافت نشد.</p>";
  document.getElementById("info").textContent = `${p + 1} / ${chap.length}`;
  document.getElementById("prev").disabled = p === 0;
  document.getElementById("next").disabled = p === chap.length - 1;
}

function prev() { if (p > 0) { p--; showPage(); } }
function next() { if (p < chap.length - 1) { p++; showPage(); } }
function closeModal() { document.getElementById("modal").classList.add("hidden"); chap = []; p = 0; }

start();
