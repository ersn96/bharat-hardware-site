// products.js - simple cart, wishlist, render, checkout via WhatsApp + Firestore order send
function saveProducts(p){ localStorage.setItem('BHET_products', JSON.stringify(p)); }
function getProducts(){ return JSON.parse(localStorage.getItem('BHET_products')||'[]'); }
function renderProducts(){
  const grid = document.getElementById('productsGrid'); if(!grid) return; grid.innerHTML='';
  const list = getProducts();
  list.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<div class="imgwrap"><img src="${p.imgs && p.imgs[0] ? p.imgs[0] : 'assets/products/product_1.png'}" style="width:100%;height:100%;object-fit:cover" /></div>
      <div style="margin-top:8px"><div class="prod-title">${p.title}</div><div class="small">${p.category||p.cat||''}</div></div>
      <div style="margin-top:6px" class="small">${p.desc||''}</div>
      <div style="margin-top:8px" class="prod-price">₹${p.price}</div>
      <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn" onclick="openModal(${p.id})">View</button>
        <button class="ghost" onclick="quickAdd(${p.id})">Add</button>
        <button class="ghost" onclick="toggleWish(${p.id})">♡</button>
        <div style="margin-left:auto" class="small">${p.stock>5? 'In Stock': (p.stock>0? 'Low Stock':'Out of Stock')}</div>
      </div>`;
    grid.appendChild(card);
  });
}
// cart functions
function quickAdd(id){
  const cart = JSON.parse(localStorage.getItem('BHET_cart')||'[]');
  const p = getProducts().find(x=>x.id===id); if(!p) return alert('Product not found'); const existing = cart.find(x=>x.id===id); if(existing) existing.qty++; else cart.push({id:id,qty:1}); localStorage.setItem('BHET_cart', JSON.stringify(cart)); updateCartCount();
}
function updateCartCount(){ const c = JSON.parse(localStorage.getItem('BHET_cart')||'[]'); document.getElementById('cartCount').textContent = c.length; }
function toggleWish(id){ const w = JSON.parse(localStorage.getItem('BHET_wish')||'[]'); const idx = w.indexOf(id); if(idx>-1){ w.splice(idx,1);}else w.push(id); localStorage.setItem('BHET_wish', JSON.stringify(w)); alert('Wishlist updated'); }
function openModal(id){ const p = getProducts().find(x=>x.id===id); if(!p) return; alert(p.title + "\nPrice: ₹"+p.price + "\n\n" + (p.desc||'')); }
function checkoutWhatsApp(){ const cart = JSON.parse(localStorage.getItem('BHET_cart')||'[]'); if(!cart.length) return alert('Cart empty'); const products = getProducts(); let total=0; let text='Order from BHET:%0A'; cart.forEach(it=>{ const pr = products.find(p=>p.id===it.id); if(pr){ total += pr.price * it.qty; text += pr.title + ' x'+it.qty + ' - ₹' + (pr.price*it.qty) + '%0A'; }}); text += 'Total: ₹'+total; // send to firestore too if function exists
  if(typeof sendOrderToFirestore === 'function'){ sendOrderToFirestore({items:cart,total:total,createdAt:Date.now()}); }
  const wa = 'https://wa.me/91' + '7768082083' + '?text=' + text;
  window.open(wa,'_blank');
}
// initial
document.addEventListener('DOMContentLoaded', function(){ if(!localStorage.getItem('BHET_products')){ /* keep existing sample set by index.html */ } renderProducts(); updateCartCount(); });
