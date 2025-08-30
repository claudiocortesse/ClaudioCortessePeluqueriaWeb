document.addEventListener("DOMContentLoaded", () => {
  // --- FORMULARIO DE TURNOS A WHATSAPP ---
  const form = document.getElementById("form-turno");
  const confirmacion = document.getElementById("confirmacion");
  const telefono = "543564359460";

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;

    if (!nombre || !fecha || !hora) {
      confirmacion.textContent = "⚠️ Por favor completa todos los campos.";
      return;
    }

    const fechaLegible = new Date(fecha).toLocaleDateString("es-AR");
    const mensaje = `Hola! Soy ${nombre}. Quiero reservar un turno el ${fechaLegible} a las ${hora}.`;
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank") || (window.location.href = url);

    confirmacion.textContent = `✅ Turno enviado por WhatsApp. Te esperamos, ${nombre}!`;
    setTimeout(() => (confirmacion.textContent = ""), 15000);
    form.reset();
  });

  // ---- cargar videos desde backend (Vercel) ----
const API_ENDPOINT = "/api/videos?maxResults=3"; // ruta relativa (hidrateada por Vercel)
const container = document.getElementById("galeria-grid");

async function cargarVideosYouTube() {
  try {
    const resp = await fetch(API_ENDPOINT, { method: "GET" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

      container.innerHTML = "";

      if (!data.items || data.items.length === 0) {
        container.innerHTML = "<p>No hay videos disponibles por el momento.</p>";
        return;
      }

      data.items.forEach(item => {
  const videoId = item.videoId;
  const title = item.title;
  const thumb = item.thumb;

  const card = document.createElement("div");
  card.className = "galeria-item video-card";
  card.innerHTML = `
    <img src="${thumb}" alt="${escapeHtml(title)}" loading="lazy" data-videoid="${videoId}">
    <div class="video-title">${escapeHtml(title)}</div>
  `;
  container.appendChild(card);
});

      // Modal para videos
      container.querySelectorAll("img[data-videoid]").forEach(img => {
        img.addEventListener("click", () => abrirModalVideo(img.dataset.videoid));
      });
    } catch (err) {
      console.error("Error cargando videos de YouTube:", err);
      container.innerHTML = "<p>⚠️ No se pudieron cargar los videos.</p>";
    }
  }

  function abrirModalVideo(videoId) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content video-modal-content">
        <button class="close" title="Cerrar video" aria-label="Cerrar">&times;</button>
        <div class="video-wrap">
          <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
                  frameborder="0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowfullscreen></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelector(".close").addEventListener("click", closeModal);
    modal.querySelector(".modal-backdrop").addEventListener("click", closeModal);
    document.addEventListener("keydown", e => e.key === "Escape" && closeModal(), { once: true });
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, m => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
    ));
  }

  // arrancar al cargar
  cargarVideosYouTube();
});