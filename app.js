(function(){
  'use strict';
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
  function safeNum(t){ if(!t) return NaN; return parseFloat((t+'').replace(/[^0-9.-]+/g,'')) }
  // Theme toggle
  function initTheme(){
    const btn = document.getElementById('themeToggle');
    if(!btn) return;
    const setTheme = (t)=>{ document.documentElement.classList.toggle('light-theme', t==='light'); localStorage.setItem('bhet_theme', t); btn.textContent = t==='light'?'Light':'Dark'; };
    const s = localStorage.getItem('bhet_theme')||'dark'; setTheme(s);
    btn.addEventListener('click', ()=> setTheme((localStorage.getItem('bhet_theme')||'dark')==='dark'?'light':'dark'));
  }
  // Hide coupon UI
  function removeCoupons(){ ['#coupon','input[placeholder="Coupon code"]','button.apply-coupon','.coupon-box','.coupon'].forEach(sel=> $$(sel).forEach(el=>el.style.display='none')); window.applyCoupon=function(){alert('Coupons disabled');}; }
  // Move reviews
  function relocateReviews(){ const footer=$('footer')||document.body.appendChild(document.createElement('footer')); const r=$('#reviewsSection')||document.getElementById('reviewsSection'); if(r) footer.parentNode.insertBefore(r,footer); }
  // 30% badge
  function decoratePrices(){
    const cards = $$('.card'); cards.forEach(card=>{
      if(card.dataset.bhetOff) return;
      const priceNode = card.querySelector('.prod-price, .price, .product-price');
      if(!priceNode) return;
      const p = safeNum(priceNode.textContent||priceNode.innerText);
      if(isNaN(p)) return;
      const disc = Math.round(p*0.7);
      priceNode.innerHTML='';
      const wrap = document.createElement('div'); wrap.className='product-price-wrap';
      const orig = document.createElement('div'); orig.style.textDecoration='line-through'; orig.style.opacity='0.8'; orig.textContent='₹'+p;
      const newp = document.createElement('div'); newp.className='bhet-discount-price'; newp.textContent='₹'+disc;
      const badge = document.createElement('div'); badge.className='badge-off'; badge.textContent='30% OFF';
      wrap.appendChild(orig); wrap.appendChild(newp); wrap.appendChild(badge); priceNode.appendChild(wrap);
      card.dataset.bhetOff='1';
    });
  }
  // Enforce admin hidden
  function enforceAdmin(){
    ['#admin-login','#adminPanel','.admin-link','a#admin-link','.nav-admin'].forEach(sel=> $$(sel).forEach(el=>el.style.display='none'));
    document.addEventListener('keydown', function(e){ if(e.shiftKey && (e.key==='A' || e.key==='a')){ const m=$('#adminModal'); if(m){ m.style.display='block'; const i=m.querySelector('input'); if(i) i.focus(); } else window.open('admin.html','_blank'); } });
  }
  // Trigger product render if exists
  function triggerRender(){ if(typeof renderProducts==='function') try{ renderProducts(); }catch(e){} }
  document.addEventListener('DOMContentLoaded', ()=>{ initTheme(); removeCoupons(); relocateReviews(); decoratePrices(); enforceAdmin(); triggerRender(); });
  window.BHET={decoratePrices:decoratePrices,triggerRender:triggerRender,relocateReviews:relocateReviews};
})();