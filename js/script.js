/* ===== Configure these (all site settings live here) ===== */
const CONFIG = {
  whatsapp: "919673558365",                                   // country code + number, no + or spaces
  googleFormUrl: "https://forms.gle/WEGbUTJPdr13ibiw7",       // opened by "COMPLETE GUEST DETAILS"
  sheetsEndpoint: "https://script.google.com/macros/s/AKfycbwnVKcU9JYwOkGXZRS_ZZ0jC3fPjEryXDkPBhUGjtXQYBd7VW98WVaBnCxFrtkK1uk1/exec", // Google Apps Script Web app URL (see apps-script/SETUP.md)
  instagramFeedEndpoint: "",                                  // Google Apps Script Web app URL (see apps-script/SETUP.md)
  mapEmbedUrl: "https://www.google.com/maps?q=16.047562711126414%2C73.4746294997459&z=16&output=embed" // Revo's Oasis Resort coordinates
};
/* ===== Navigation ===== */
const nav = document.getElementById("nav"), menu = document.getElementById("menu"), btn = document.getElementById("menuBtn");
const solid = () => nav.classList.toggle("solid", window.scrollY > 40 || document.body.classList.contains("inner"));
solid(); window.addEventListener("scroll", solid, {passive:true});
btn.addEventListener("click", () => { const o = menu.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });
menu.addEventListener("click", e => { if (e.target.closest("a")) { menu.classList.remove("open"); btn.setAttribute("aria-expanded", false); } });
/* ===== Enquiry form: saved to Google Sheets first, success screen only after it is saved ===== */
const form = document.getElementById("enqForm");
if (form) {
  const err = document.getElementById("formErr"), sendBtn = document.getElementById("sendBtn");
  const fallback = document.getElementById("fallback"), done = document.getElementById("done");
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  form.checkin.min = form.checkout.min = today;
  document.getElementById("gfLink").href = CONFIG.googleFormUrl;
  const waText = d => `Hello Revo's Oasis, I would like to enquire.\nName: ${d.name}\nMobile: ${d.mobile}\nEmail: ${d.email || "-"}\nCheck-in: ${d.checkin}\nCheck-out: ${d.checkout}\nGuests: ${d.guests}\nMessage: ${d.message || "-"}`;
  const fail = (msg, d) => {
    err.textContent = msg; fallback.hidden = false;
    document.getElementById("waLink").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(waText(d))}`;
  };
  form.addEventListener("submit", async e => {
    e.preventDefault(); err.textContent = ""; fallback.hidden = true;
    if (form.website.value) return;                       // spam trap
    if (!form.name.value.trim()) return err.textContent = "Enter your full name.";
    const mobile = form.mobile.value.trim();
    const mobileDigits = mobile.replace(/\D/g, "");
    if (!/^\+?[0-9 ]+$/.test(mobile) || mobileDigits.length < 10 || mobileDigits.length > 15) return err.textContent = "Enter a valid mobile number with 10 to 15 digits.";
    if (form.email.value && !form.email.validity.valid) return err.textContent = "Enter a valid email address.";
    if (!form.checkin.value || !form.checkout.value) return err.textContent = "Choose check-in and check-out dates.";
    if (form.checkin.value < today) return err.textContent = "Check-in date cannot be in the past.";
    if (form.checkout.value <= form.checkin.value) return err.textContent = "Check-out must be after check-in.";
    const d = Object.fromEntries(new FormData(form)); delete d.website;
    d.mobile = mobile;
    const guests = Number(d.guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > 30) return err.textContent = "Enter a guest count between 1 and 30.";
    if (!CONFIG.sheetsEndpoint) return fail("Online enquiries are not switched on yet. Your details are still in the form, so please use WhatsApp or call 9673558365.", d);
    sendBtn.disabled = true; sendBtn.textContent = "Sending...";
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 20000);
    try {
      const res = await fetch(CONFIG.sheetsEndpoint, { method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify(d), signal: ctl.signal });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || "not saved");
      form.hidden = true; done.hidden = false; done.focus({preventScroll:true});
      done.scrollIntoView({behavior:"smooth", block:"center"});
    } catch (x) {
      fail("We could not save your enquiry. Nothing was lost: your details are still in the form. Please try again, or send it on WhatsApp.", d);
    } finally { clearTimeout(timer); sendBtn.disabled = false; sendBtn.textContent = "Send enquiry"; }
  });
}
/* ===== Google Map (shows once mapEmbedUrl is set) ===== */
const mapBox = document.getElementById("mapBox");
if (mapBox && CONFIG.mapEmbedUrl) {
  mapBox.innerHTML = `<iframe src="${CONFIG.mapEmbedUrl}" title="Map of Revo's Oasis Resort, Dandi Beach, Malvan" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
}
/* ===== Gallery lightbox (opens only photos that exist) ===== */
const lb = document.getElementById("lb");
if (lb) {
  document.querySelectorAll(".gi").forEach(b => b.addEventListener("click", () => {
    const img = b.querySelector("img"); if (!img) return;
    document.getElementById("lbImg").src = img.src; document.getElementById("lbImg").alt = img.alt; lb.showModal();
  }));
  document.getElementById("lbClose").addEventListener("click", () => lb.close());
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
}
/* ===== Latest Instagram posts (served by the Apps Script JSONP endpoint) ===== */
const instagramFeed = document.getElementById("instagramFeed");
if (instagramFeed) {
  const status = document.getElementById("instagramFeedStatus");
  if (!CONFIG.instagramFeedEndpoint) {
    status.textContent = "Instagram posts will appear here once the feed is connected.";
  } else {
    let feedUrl;
    try {
      feedUrl = new URL(CONFIG.instagramFeedEndpoint);
    } catch {
      status.textContent = "Instagram updates are temporarily unavailable.";
    }
    if (feedUrl && (feedUrl.protocol !== "https:" || feedUrl.hostname !== "script.google.com" || !/^\/macros\/s\/[^/]+\/exec$/.test(feedUrl.pathname))) {
      status.textContent = "Instagram updates are temporarily unavailable.";
      feedUrl = null;
    }
    if (feedUrl) {
      const callbackName = "revosOasisInstagramFeed";
      let finished = false;
      const feedScript = document.createElement("script");
      const timeout = setTimeout(() => finish("Instagram updates are temporarily unavailable."), 12000);
      const finish = message => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        feedScript.remove();
        delete window[callbackName];
        status.textContent = message;
      };
      const safeInstagramUrl = value => {
        try {
          const url = new URL(value);
          return url.protocol === "https:" && (url.hostname === "instagram.com" || url.hostname === "www.instagram.com") ? url.href : "";
        } catch {
          return "";
        }
      };
      window[callbackName] = result => {
        if (!result || !result.ok || !Array.isArray(result.posts)) {
          finish("Instagram updates are temporarily unavailable.");
          return;
        }
        let rendered = 0;
        result.posts.slice(0, 8).forEach(post => {
          const permalink = safeInstagramUrl(post.permalink);
          const imageUrl = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
          if (!permalink || !imageUrl || !/^https:\/\//i.test(imageUrl)) return;
          const link = document.createElement("a");
          const image = document.createElement("img");
          link.href = permalink;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.setAttribute("aria-label", "View Instagram post from Revo's Oasis (opens in a new tab)");
          image.src = imageUrl;
          image.alt = typeof post.caption === "string" && post.caption.trim()
            ? post.caption.trim().slice(0, 180)
            : "Instagram post from Revo's Oasis";
          image.loading = "lazy";
          image.decoding = "async";
          link.append(image);
          instagramFeed.append(link);
          rendered++;
        });
        finish(rendered ? "" : "No Instagram posts are available to show right now.");
      };
      feedScript.onerror = () => finish("Instagram updates are temporarily unavailable.");
      feedUrl.searchParams.set("callback", callbackName);
      feedScript.src = feedUrl.href;
      document.head.append(feedScript);
    }
  }
}
