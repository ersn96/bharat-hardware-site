(function () {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const safeTextToNumber = (txt) => {
    if (!txt) return NaN;
    let n = txt.replace(/[^\d.-]/g, "");
    return parseFloat(n || NaN);
  };

  function initThemeToggle() {
    const btn = document.getElementById("themeToggle") || $("#themeToggle");
    if (!btn) return;
    const setTheme = (theme) => {
      if (theme === "light") {
        document.documentElement.classList.add("light-theme");
        document.documentElement.classList.remove("dark-theme");
        btn.textContent = "Light";
      } else {
        document.documentElement.classList.add("dark-theme");
        document.documentElement.classList.remove("light-theme");
        btn.textContent = "Dark";
      }
      localStorage.setItem("bhet_theme", theme);
    };
    const saved = localStorage.getItem("bhet_theme") || "dark";
    setTheme(saved);
    btn.addEventListener("click", () => {
      const cur = localStorage.getItem("bhet_theme") || "dark";
      setTheme(cur === "dark" ? "light" : "dark");
    });
  }

  function removeCouponUI() {
    const couponEls = [
      "#coupon",
      "input[placeholder='Coupon code']",
      "button[onclick='applyCoupon()']",
      "button.apply-coupon",
      ".coupon-box",
      ".coupon"
    ];
    couponEls.forEach(sel => {
      $$(sel).forEach(el => {
        try { el.style.display = "none"; } catch(e) {}
      });
    });
    try { window.applyCoupon = function () { alert("Coupons are currently not available."); }; } catch (e) {}
    $$("#couponCode, #couponAmt, #couponList, .coupon-creator, .create-coupon").forEach(el=>{ try{ el.style.display='none'; }catch(e){} });
  }

  function relocateReviews() {
    const footer = $("footer") || document.querySelector(".footer") || document.body.appendChild(document.createElement("footer"));
    let reviewsBlock = $("#reviewsSection") || $("#reviewsList") || document.querySelector(".reviews") || null;
    if (!reviewsBlock) {
      const reviewsData = JSON.parse(localStorage.getItem("bhet_reviews") || "{}");
      const anyPid = Object.keys(reviewsData || {})[0];
      if (!anyPid) return;
      reviewsBlock = document.createElement("div");
      reviewsBlock.id = "reviewsSection";
      reviewsBlock.className = "card";
      reviewsBlock.style.margin = "12px 0";
      reviewsBlock.innerHTML = `<h3 style="color:#86efac">Customer Reviews</h3><div id="reviewsList"></div>`;
      document.body.insertBefore(reviewsBlock, footer);
      populateReviewsFromStore();
      return;
    }
    try { reviewsBlock.classList.add("moved-reviews"); footer.parentNode.insertBefore(reviewsBlock, footer); } catch (e) { try { document.body.appendChild(reviewsBlock); } catch(e){} }
    if (!$("#reviewsList")) { const rl = document.createElement("div"); rl.id = "reviewsList"; reviewsBlock.appendChild(rl); populateReviewsFromStore(); }
  }

  function populateReviewsFromStore() {
    const reviewsObj = JSON.parse(localStorage.getItem("bhet_reviews") || "{}");
    const out = $("#reviewsList");
    if (!out) return;
    out.innerHTML = "";
    const keys = Object.keys(reviewsObj || {});
    if (!keys.length) { out.innerHTML = "<div class='small'>No reviews yet</div>"; return; }
    keys.forEach(pid => {
      (reviewsObj[pid] || []).forEach(r => {
        const d = document.createElement("div");
        d.style.borderTop = "1px solid rgba(255,255,255,0.04)";
        d.style.padding = "8px 0";
        d.innerHTML = `<div style="font-weight:700">${r.name||"Customer"} <span style="color:#94a3b8">• ${r.rating||5}★</span></div>
                       <div style="color:#b6f3d0">${r.text||""}</div>
                       ${r.img?'<div style="margin-top:6px"><img src="'+r.img+'" style="max-width:180px;border-radius:6px"/></div>':''}`;
        out.appendChild(d);
      });
    });
  }

  function add30OffBadge() {
    if (!document.getElementById("bhet-30off-style")) {
      const style = document.createElement("style");
      style.id = "bhet-30off-style";
      style.innerHTML = `
.bhet-off-badge{background:linear-gradient(90deg,#16a34a,#86efac);color:#042f1b;padding:4px 8px;border-radius:6px;font-weight:800;font-size:12px;margin-left:8px}
.bhet-discount-price{font-weight:900;color:#b7f5d8;margin-left:8px}
.product-price-wrap{display:flex;align-items:center;gap:8px}
`;
      document.head.appendChild(style);
    }
    const decorateCard = (card) => {
      try {
        const priceNode = card.querySelector(".prod-price, .price, .product-price, .price-tag");
        if (!priceNode) return;
        if (card.dataset.bhetOff === "1") return;
        const priceText = priceNode.textContent || priceNode.innerText || "";
        const pval = safeTextToNumber(priceText);
        if (isNaN(pval)) return;
        const discounted = Math.round(pval * 0.7);
        const wrap = document.createElement("div");
        wrap.className = "product-price-wrap";
        const orig = document.createElement("div");
        orig.className = "original-price small";
        orig.style.textDecoration = "line-through";
        orig.style.opacity = "0.8";
        orig.textContent = "₹" + pval;
        const disc = document.createElement("div");
        disc.className = "bhet-discount-price";
        disc.textContent = "₹" + discounted;
        const badge = document.createElement("div");
        badge.className = "bhet-off-badge";
        badge.textContent = "30% OFF";
        priceNode.innerHTML = "";
        wrap.appendChild(orig);
        wrap.appendChild(disc);
        wrap.appendChild(badge);
        priceNode.appendChild(wrap);
        card.dataset.bhetOff = "1";
      } catch (e) {}
    };
    const grid = document.getElementById("productsGrid") || document.querySelector(".grid") || document.body;
    $$(".card", grid).forEach(decorateCard);
    try {
      const mo = new MutationObserver((mutList) => {
        mutList.forEach(m => {
          (m.addedNodes || []).forEach(node => {
            if (node.nodeType === 1 && node.classList && node.classList.contains("card")) {
              decorateCard(node);
            } else if (node.querySelectorAll) {
              node.querySelectorAll && node.querySelectorAll(".card").forEach(decorateCard);
            }
          });
        });
      });
      mo.observe(grid, { childList: true, subtree: true });
    } catch (e) {}
  }

  function enforceAdminHidden() {
    const selectors = [
      "#admin-login", "#admin-login-box", "#admin-login-modal", "#adminPanel",
      "#adminPanelWrap", "#changePassBox", "#changePass", "#changePasswordPanel",
      "a#admin-link", ".admin-link", ".nav-admin", ".coupon-creator"
    ];
    selectors.forEach(sel => {
      $$(sel).forEach(el => {
        try { el.style.display = "none"; } catch (e) {}
      });
    });
    $$("#mainNav a, nav a").forEach(a => {
      try {
        if ((a.textContent || "").trim().toLowerCase() === "admin") a.style.display = "none";
      } catch (e) {}
    });
    document.addEventListener("keydown", function (e) {
      if (e.shiftKey && (e.key === "A" || e.key === "a")) {
        const loginModal = $("#admin-login") || $("#admin-login-box") || $("#admin-login-modal");
        if (loginModal) {
          loginModal.style.display = "flex";
          const inp = loginModal.querySelector("input");
          if (inp) inp.focus();
          return;
        }
        if (location.origin) {
          window.open("admin.html", "_blank");
        }
      }
    }, false);
  }

  function tryTriggerProductRender() {
    try {
      if (typeof renderProducts === "function") {
        renderProducts();
      } else if (typeof window.renderProducts === "function") {
        window.renderProducts();
      } else {
        if (window.PRODUCTS && window.PRODUCTS.length && typeof populateProducts === "function") {
          populateProducts(window.PRODUCTS);
        }
      }
    } catch (e) {}
  }

  function cleanAdminCouponUI() {
    $$("#couponCode, #couponAmt, #couponList, .coupon-creator, .create-coupon").forEach(el => {
      try { el.style.display = "none"; } catch (e) {}
    });
  }

  function onReady() {
    initThemeToggle();
    removeCouponUI();
    relocateReviews();
    add30OffBadge();
    enforceAdminHidden();
    cleanAdminCouponUI();
    tryTriggerProductRender();
    try { populateReviewsFromStore(); } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  window.BHET = window.BHET || {};
  window.BHET.relocateReviews = relocateReviews;
  window.BHET.add30OffBadge = add30OffBadge;
  window.BHET.triggerRender = tryTriggerProductRender;

})();