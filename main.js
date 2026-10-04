function setLang(lang) {
  document.body.className = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll(".lang button").forEach(function (button) {
    button.classList.toggle("active", button.dataset.set === lang);
  });
  try { localStorage.setItem("lang", lang); } catch (e) {}
}

document.querySelectorAll(".lang button").forEach(function (button) {
  button.addEventListener("click", function () { setLang(button.dataset.set); });
});

var savedLang = null;
try { savedLang = localStorage.getItem("lang"); } catch (e) {}
setLang(savedLang || ((navigator.language || "").toLowerCase().indexOf("tr") === 0 ? "tr" : "en"));

var FORM_ENDPOINT = "https://formsubmit.co/ajax/destek@darkozyongame.com";
var FORM_TEXT = {
  sending: { en: "Sending...", tr: "Gönderiliyor..." },
  sent: { en: "Thank you! Your message has been sent.", tr: "Teşekkürler! Mesajınız gönderildi." },
  failed: {
    en: "Sorry, the message could not be sent. Please e-mail us at destek@darkozyongame.com.",
    tr: "Üzgünüz, mesaj gönderilemedi. Lütfen destek@darkozyongame.com adresine e-posta gönderin."
  }
};

var contactForm = document.getElementById("contact-form");
if (contactForm) {
  var formStatus = document.getElementById("form-status");
  var submitButton = contactForm.querySelector("button[type=submit]");
  var showStatus = function (key, ok) {
    formStatus.textContent = FORM_TEXT[key][document.body.className === "tr" ? "tr" : "en"];
    formStatus.className = "form-status" + (ok === true ? " ok" : ok === false ? " error" : "");
  };

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var fields = contactForm.elements;
    if (fields._honey.value) { return; }
    submitButton.disabled = true;
    showStatus("sending");
    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        phone: fields.phone.value.trim() || "-",
        subject: fields.subject.value.trim() || "-",
        message: fields.message.value.trim(),
        _subject: "darkozyongame.com: " + (fields.subject.value.trim() || "New message"),
        _template: "table"
      })
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (String(data.success) === "true") {
          contactForm.reset();
          showStatus("sent", true);
        } else {
          showStatus("failed", false);
        }
      })
      .catch(function () { showStatus("failed", false); })
      .then(function () { submitButton.disabled = false; });
  });
}

var logoStage = document.querySelector(".logo-stage");
if (logoStage && window.matchMedia("(hover: hover)").matches) {
  var logoTilt = logoStage.querySelector(".logo-tilt");
  logoStage.addEventListener("pointermove", function (event) {
    var rect = logoStage.getBoundingClientRect();
    var x = (event.clientX - rect.left) / rect.width - 0.5;
    var y = (event.clientY - rect.top) / rect.height - 0.5;
    logoTilt.style.transform = "rotateY(" + (x * 16) + "deg) rotateX(" + (-y * 16) + "deg)";
  });
  logoStage.addEventListener("pointerleave", function () {
    logoTilt.style.transform = "";
  });
}

var year = document.getElementById("year");
if (year) { year.textContent = new Date().getFullYear(); }
