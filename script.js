

// =============================================
// 1. INICIALIZACIÓN EMAILJS (con protecciones)
// =============================================
(function () {
  if (typeof emailjs === "undefined") return;
  emailjs.init({
    publicKey: "Ian2xPASkzKQwQryi",
    blockHeadless: true,
    limitRate: {
      throttle: 10000,
    },
  });
})();

// Helper: sanitizar texto (usa DOMPurify si disponible)
function sanitize(str) {
  if (typeof DOMPurify !== "undefined") return DOMPurify.sanitize(str);
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// =============================================
// 2. FORMULARIO DE CONTACTO
// =============================================
const form = document.getElementById("contact-form");
let isSubmitting = false;

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (isSubmitting) return;

    // Obtener datos
    var formData = new FormData(form);
    var data = {
      name: (formData.get("user_name") || "").trim(),
      email: (formData.get("user_email") || "").trim(),
      phone: (formData.get("user_phone") || "").trim(),
      subject: (formData.get("subject") || "").trim(),
      message: (formData.get("message") || "").trim(),
    };

    // Validar
    var errors = validateForm(data);
    if (errors.length > 0) {
      showErrors(errors);
      return;
    }

    // Bloquear doble envío
    isSubmitting = true;
    showLoading(true);
    hideMessages();

    // Verificar que EmailJS está disponible
    if (typeof emailjs === "undefined") {
      showErrors(["Error: el servicio de envío no está disponible. Contacta directamente a info@zaldicode.com"]);
      isSubmitting = false;
      showLoading(false);
      return;
    }

    // Enviar ambos emails en paralelo (al propietario + auto-reply al cliente)
    Promise.all([
      emailjs.sendForm("service_1nksoma", "template_sshmyhr", form),
      emailjs.sendForm("service_1nksoma", "template_kqrq4hp", form),
    ])
      .then(function () {
        showSuccess("Mensaje enviado correctamente. Te responderemos pronto.");
        form.reset();
      })
      .catch(function (error) {
        console.error("[EMAILJS_ERROR]", error);

        if (error && error.status === 429) {
          showErrors(["Demasiados intentos. Espera unos segundos e intenta de nuevo."]);
        } else if (error && error.status === 451) {
          showErrors(["Envío bloqueado por seguridad."]);
        } else {
          showErrors(["Error al enviar el mensaje. Intenta de nuevo o escribe a info@zaldicode.com"]);
        }
      })
      .finally(function () {
        isSubmitting = false;
        showLoading(false);
      });
  });
}

// =============================================
// 3. VALIDACIÓN DEL FORMULARIO
// =============================================
function validateForm(data) {
  var errors = [];

  if (!data.name || data.name.length < 2) {
    errors.push("El nombre es obligatorio (mínimo 2 caracteres)");
  } else if (data.name.length > 100) {
    errors.push("El nombre es demasiado largo");
  }

  if (!data.email) {
    errors.push("El email es obligatorio");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Introduce un email válido");
  }

  if (!data.message || data.message.length < 10) {
    errors.push("El mensaje es obligatorio (mínimo 10 caracteres)");
  } else if (data.message.length > 5000) {
    errors.push("El mensaje es demasiado largo (máximo 5000 caracteres)");
  }

  var privacyCheck = document.getElementById("privacy-check");
  if (privacyCheck && !privacyCheck.checked) {
    errors.push("Debes aceptar la política de privacidad");
  }

  return errors;
}

// =============================================
// 4. UI: MENSAJES DE ERROR / ÉXITO / CARGA
// =============================================
function hideMessages() {
  var errorsEl = document.getElementById("form-errors");
  var successEl = document.getElementById("form-success");
  if (errorsEl) errorsEl.classList.add("hidden");
  if (successEl) successEl.classList.add("hidden");
}

function showErrors(errors) {
  var container = document.getElementById("form-errors");
  var list = document.getElementById("error-list");

  if (!container || !list) {
    alert(errors.join("\n"));
    return;
  }

  list.innerHTML = errors.map(function (e) { return "<div>• " + sanitize(e) + "</div>"; }).join("");
  container.classList.remove("hidden");
  container.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showSuccess(message) {
  var container = document.getElementById("form-success");
  if (!container) {
    alert(message);
    return;
  }
  container.querySelector("div").textContent = "✓ " + message;
  container.classList.remove("hidden");
  container.scrollIntoView({ behavior: "smooth", block: "nearest" });

  setTimeout(function () {
    container.classList.add("hidden");
  }, 6000);
}

function showLoading(show) {
  var spinner = document.getElementById("loading-spinner");
  var btn = document.getElementById("submit-btn");
  if (spinner) spinner.classList.toggle("hidden", !show);
  if (btn) btn.disabled = show;
}

// =============================================
// 5. COOKIES CONSENT
// =============================================
document.addEventListener("DOMContentLoaded", function () {
  var banner = document.getElementById("cookie-banner");
  if (!banner) return;

  var choice = localStorage.getItem("cookiesChoice");
  if (choice) {
    banner.style.display = "none";
  }

  var acceptBtn = document.getElementById("accept-cookies");
  var rejectBtn = document.getElementById("reject-cookies");

  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () {
      localStorage.setItem("cookiesChoice", "accepted");
      banner.style.display = "none";
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener("click", function () {
      localStorage.setItem("cookiesChoice", "rejected");
      banner.style.display = "none";
    });
  }
});

// =============================================
// 6. MENÚ MOBILE
// =============================================
var menuBtn = document.getElementById("menu-btn");
var menuLinks = document.getElementById("menu-links");

if (menuBtn && menuLinks) {
  menuBtn.addEventListener("click", function () {
    menuLinks.classList.toggle("hidden");
    menuLinks.classList.toggle("flex");
  });

  menuLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.innerWidth < 768) {
        menuLinks.classList.add("hidden");
        menuLinks.classList.remove("flex");
      }
    });
  });
}

// =============================================
// 7. ANIMACIONES SCROLL (Fade-in)
// =============================================
var observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".fade-in").forEach(function (el) {
  observer.observe(el);
});

// =============================================
// 8. CONSOLA BRANDING
// =============================================
console.log(
  "%c ZALDICODE %c ¿Buscando cómo está hecha? Hablemos de tu proyecto: info@zaldicode.com",
  "background: #f97316; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
  "color: #f97316; font-weight: bold;"
);
