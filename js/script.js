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

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", function () {
    const img = this.querySelector("img");
    if (img) openImageModal(img.src, img.alt);
  });
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
const initialHash = location.hash.replace("#", "") || "home";
if (initialHash !== "home") navigateTo(initialHash);
