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

var FORM_ENDPOINT = "https://formsubmit.co/ajax/edbee471a5d216d241888369d9744dc0";
var FORM_TEXT = {
  sending: { en: "Sending...", tr: "Gönderiliyor..." },
  sent: { en: "Thank you! Your message has been sent.", tr: "Teşekkürler! Mesajınız gönderildi." },
  failed: {
    en: "Sorry, the message could not be sent. Please e-mail us at destek@darkozyongame.com.",
    tr: "Üzgünüz, mesaj gönderilemedi. Lütfen destek@darkozyongame.com adresine e-posta gönderin."
  },
  wait: {
    en: "Please wait a few minutes before sending another message.",
    tr: "Yeni bir mesaj göndermeden önce lütfen birkaç dakika bekleyin."
  },
  limit: {
    en: "You have reached today's message limit. Please e-mail us at destek@darkozyongame.com.",
    tr: "Bugünkü mesaj sınırına ulaştınız. Lütfen destek@darkozyongame.com adresine e-posta gönderin."
  },
  links: {
    en: "Please remove links from your message (at most 2 are allowed).",
    tr: "Lütfen mesajınızdaki bağlantıları azaltın (en fazla 2 bağlantı olabilir)."
  }
};
var FORM_MIN_FILL_MS = 4000;
var FORM_COOLDOWN_MS = 3 * 60 * 1000;
var FORM_DAILY_LIMIT = 3;
var FORM_MAX_LINKS = 2;
var FORM_BLACKLIST = "viagra, cialis, casino, betting, porn, crypto investment, bitcoin investment, seo services, backlinks, loan offer";
var formOpenedAt = Date.now();

function readSendLog() {
  try {
    var dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return (JSON.parse(localStorage.getItem("formSends") || "[]")).filter(function (t) { return t > dayAgo; });
  } catch (e) { return []; }
}

function writeSendLog(log) {
  try { localStorage.setItem("formSends", JSON.stringify(log)); } catch (e) {}
}

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
    if (submitButton.disabled) { return; }
    if (fields._honey.value || Date.now() - formOpenedAt < FORM_MIN_FILL_MS) {
      contactForm.reset();
      showStatus("sent", true);
      return;
    }
    var message = fields.message.value.trim();
    if ((message.match(/https?:\/\/|www\./gi) || []).length > FORM_MAX_LINKS) {
      showStatus("links", false);
      return;
    }
    var sendLog = readSendLog();
    if (sendLog.length >= FORM_DAILY_LIMIT) {
      showStatus("limit", false);
      return;
    }
    if (sendLog.length && Date.now() - sendLog[sendLog.length - 1] < FORM_COOLDOWN_MS) {
      showStatus("wait", false);
      return;
    }
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
        message: message,
        _subject: "darkozyongame.com: " + (fields.subject.value.trim() || "New message"),
        _template: "table",
        _blacklist: FORM_BLACKLIST
      })
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (String(data.success) === "true") {
          sendLog.push(Date.now());
          writeSendLog(sendLog);
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
