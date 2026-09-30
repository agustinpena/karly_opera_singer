/* ---------- Load dynamic content ---------- */
async function fetchJSON(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return [];
    return await r.json();
  } catch (e) {
    return [];
  }
}

async function renderDynamicConcerts() {
  const homeList = document.getElementById("homeConcertList");
  const fullList = document.getElementById("concertList");
  const items = await fetchJSON("/api/concerts-admin.php");

  if (!items.length) {
    const emptyMsg =
      '<div class="empty-state" style="text-align:center;padding:2rem;color:var(--text-dim);font-style:italic;">Próximamente.</div>';
    if (homeList) homeList.innerHTML = emptyMsg;
    if (fullList) fullList.innerHTML = emptyMsg;
    return;
  }

  // Home shows only the first 3
  if (homeList) {
    homeList.innerHTML = items
      .slice(0, 3)
      .map(
        (c) => `
      <div class="concert-item fade-in">
        <div class="concert-date">
          <span class="day">${c.day}</span>
          <span class="month">${c.month}</span>
        </div>
        <div class="concert-info">
          <h3>${c.title}</h3>
          <div class="venue">${c.venue} · ${c.city}</div>
        </div>
        <a href="#concerts" data-link="concerts" class="btn btn-outline">Detalles</a>
      </div>
    `,
      )
      .join("");
  }

  // Full list shows all
  if (fullList) {
    fullList.innerHTML = items
      .map(
        (c) => `
      <div class="concert-item fade-in">
        <div class="concert-date">
          <span class="day">${c.day}</span>
          <span class="month">${c.month}</span>
        </div>
        <div class="concert-info">
          <h3>${c.title}</h3>
          <div class="venue">${c.venue} · ${c.city}</div>
        </div>
        <a href="${c.link || "#"}" class="btn btn-primary" target="_blank" rel="noopener">Entradas</a>
      </div>
    `,
      )
      .join("");
  }

  // Re-attach navigation links in the home list
  if (homeList) {
    homeList.querySelectorAll("[data-link]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.dataset.link;
        if (target) {
          history.pushState({ page: target }, "", `#${target}`);
          navigateTo(target);
        }
      });
    });
  }

  setTimeout(initFadeObserver, 100);
}

async function renderDynamicPress() {
  const list = document.getElementById("pressList");
  if (!list) return;
  const items = await fetchJSON("/api/press-admin.php");
  if (!items.length) {
    list.innerHTML =
      '<div class="empty-state" style="text-align:center;padding:2rem;color:var(--text-dim);font-style:italic;">Próximamente.</div>';
    return;
  }
  list.innerHTML = items
    .map(
      (p) => `
    <article class="press-item fade-in">
      <div class="press-meta">
        <span class="press-outlet">${p.outlet}</span>
        <span class="press-date">${p.date}</span>
      </div>
      <h3>"${p.title}"</h3>
      <p class="press-excerpt">${p.excerpt}</p>
      ${p.author ? `<p class="press-excerpt"><em>${p.author}</em></p>` : ""}
      ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" class="press-link">${p.linkText || "Leer más"}</a>` : ""}
    </article>
  `,
    )
    .join("");
  setTimeout(initFadeObserver, 100);
}

async function renderDynamicGallery() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;
  const items = await fetchJSON("/api/gallery-admin.php");
  if (!items.length) {
    grid.innerHTML =
      '<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-dim);font-style:italic;">Próximamente.</div>';
    return;
  }
  grid.innerHTML = items
    .map(
      (src, i) => `
    <div class="gallery-item fade-in">
      <img src="${src}" alt="Galería ${i + 1}" loading="lazy" />
    </div>
  `,
    )
    .join("");
  grid.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", function () {
      const img = this.querySelector("img");
      if (img) openImageModal(img.src, img.alt);
    });
  });
  setTimeout(initFadeObserver, 100);
}

/* ---------- Header scroll ---------- */
const header = document.getElementById("header");
if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  });
}

/* ---------- Mobile menu ---------- */
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");
if (hamburger && nav) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    nav.classList.toggle("open");
  });
}

/* ---------- Fade-in on Scroll ---------- */
let fadeObserver;
function initFadeObserver() {
  if (fadeObserver) fadeObserver.disconnect();
  fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
  );
  document
    .querySelectorAll(".fade-in:not(.visible)")
    .forEach((el) => fadeObserver.observe(el));
}
initFadeObserver();

/* ---------- Page Routing ---------- */
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-link]");

function navigateTo(pageId) {
  pages.forEach((p) => p.classList.toggle("active", p.id === pageId));
  document.querySelectorAll(".nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.link === pageId);
  });
  window.scrollTo({ top: 0, behavior: "instant" });
  if (nav) nav.classList.remove("open");
  if (hamburger) hamburger.classList.remove("open");
  setTimeout(initFadeObserver, 50);
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.link;
    if (target) {
      history.pushState({ page: target }, "", `#${target}`);
      navigateTo(target);
    }
  });
});

window.addEventListener("popstate", () => {
  const hash = location.hash.replace("#", "") || "home";
  navigateTo(hash);
});

/* ---------- Gallery Modal ---------- */
const imageModal = document.getElementById("imageModal");
const imageModalClose = document.getElementById("imageModalClose");
const modalImage = document.getElementById("modalImage");

function openImageModal(src, alt) {
  if (!imageModal) return;
  modalImage.src = src;
  modalImage.alt = alt || "Image";
  imageModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeImageModal() {
  if (!imageModal) return;
  imageModal.classList.remove("active");
  document.body.style.overflow = "";
}

if (imageModalClose) {
  imageModalClose.addEventListener("click", closeImageModal);
}
if (imageModal) {
  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) closeImageModal();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeImageModal();
});

/* ---------- Contact form ---------- */
const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      formStatus.className = "form-status error";
      formStatus.textContent = "Por favor, complete todos los campos.";
      return;
    }
    if (!emailRe.test(email)) {
      formStatus.className = "form-status error";
      formStatus.textContent = "Por favor, ingrese un correo válido.";
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;

    try {
      const response = await fetch("/api/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await response.json();

      if (data.success) {
        formStatus.className = "form-status success";
        formStatus.textContent = "✓ Gracias, su mensaje ha sido enviado.";
        form.reset();
      } else {
        formStatus.className = "form-status error";
        formStatus.textContent =
          data.message || "Hubo un error. Intente de nuevo.";
      }
    } catch (error) {
      console.error("Error sending message:", error);
      formStatus.className = "form-status error";
      formStatus.textContent = "Error de conexión. Intente más tarde.";
    } finally {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      setTimeout(() => {
        formStatus.className = "form-status";
        formStatus.textContent = "";
      }, 6000);
    }
  });
}

/* ---------- Init ---------- */
renderDynamicConcerts();
renderDynamicPress();
renderDynamicGallery();

const initialHash = location.hash.replace("#", "") || "home";
if (initialHash !== "home") navigateTo(initialHash);
