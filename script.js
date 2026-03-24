console.log(
  "%c ZALDICODE %c ¿Buscando cómo está hecha? Hablemos de tu proyecto: zaldicode@gmail.com",
  "background: #f97316; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
  "color: #f97316; font-weight: bold;",
);

//envío de mails
(function () {
  emailjs.init("Ian2xPASkzKQwQryi");
})();

document
  .getElementById("contact-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    Promise.all([
      // Email para mi
      emailjs.sendForm("service_yvhos5h", "template_sshmyhr", this),

      // Email automático al cliente
      emailjs.sendForm("service_yvhos5h", "template_kqrq4hp", this),
    ])
      .then(() => {
        alert("Mensaje enviado correctamente");
        this.reset();
      })
      .catch((error) => {
        alert("Error al enviar: " + JSON.stringify(error));
      });
  });

//cosas de los cookies
document.addEventListener("DOMContentLoaded", function () {
  const banner = document.getElementById("cookie-banner");
  const choice = localStorage.getItem("cookiesChoice");

  if (choice) {
    banner.style.display = "none";
  }

  document.getElementById("accept-cookies").onclick = () => {
    localStorage.setItem("cookiesChoice", "accepted");
    banner.style.display = "none";

    // Aquí cargarías cookies opcionales (analytics, etc)
  };

  document.getElementById("reject-cookies").onclick = () => {
    localStorage.setItem("cookiesChoice", "rejected");
    banner.style.display = "none";
  };
});
