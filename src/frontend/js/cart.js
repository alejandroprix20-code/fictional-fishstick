/* =============================================
   CART MODULE — localStorage-backed shopping cart
   ============================================= */

const Cart = (() => {
  const STORAGE_KEY = 'nazareth_cart';
  const WHATSAPP_NUMBER = '51978338102';

  function getItems() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    _updateUI();
  }

  function addItem(product, qty = 1) {
    const items = getItems();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 99);
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.image,
        qty
      });
    }
    saveItems(items);
    showToast(`"${product.name}" agregado al carrito.`);
  }

  function addItems(products) {
    const items = getItems();
    products.forEach(product => {
      const qty = product.qty || 1;
      const existing = items.find(i => i.id === product.id);
      if (existing) {
        existing.qty = Math.min(existing.qty + qty, 99);
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          image: product.image,
          qty
        });
      }
    });
    saveItems(items);
    showToast(`Pack agregado: ${products.length} productos en tu carrito.`);
  }

  function removeItem(productId) {
    saveItems(getItems().filter(i => i.id !== productId));
  }

  function updateQty(productId, delta) {
    const items = getItems().map(i => {
      if (i.id === productId) {
        const newQty = i.qty + delta;
        return newQty < 1 ? null : { ...i, qty: Math.min(newQty, 99) };
      }
      return i;
    }).filter(Boolean);
    saveItems(items);
  }

  function clearCart() {
    localStorage.removeItem(STORAGE_KEY);
    _updateUI();
  }

  function getTotal() {
    return getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getCount() {
    return getItems().reduce((sum, i) => sum + i.qty, 0);
  }

  function _updateUI() {
    // Update badge
    document.querySelectorAll('.cart-badge').forEach(el => {
      const count = getCount();
      el.textContent = count;
      el.style.display = count > 0 ? 'inline' : 'none';
    });
    // Re-render cart if open
    if (document.getElementById('cartItemsList')) renderCartPanel();
  }

  function renderCartPanel() {
    const list = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotal');
    const emptyEl = document.getElementById('cartEmpty');
    const actionsEl = document.getElementById('cartActions');
    if (!list) return;

    const items = getItems();
    list.innerHTML = '';

    if (items.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      if (actionsEl) actionsEl.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (actionsEl) actionsEl.style.display = 'block';

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">S/ ${item.price.toFixed(2)} × ${item.qty}</div>
          <div class="d-flex align-items-center gap-2 mt-1">
            <button class="qty-btn" aria-label="Reducir cantidad" onclick="Cart.updateQty(${item.id}, -1)">−</button>
            <span class="qty-display">${item.qty}</span>
            <button class="qty-btn" aria-label="Aumentar cantidad" onclick="Cart.updateQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <div class="d-flex flex-column align-items-end">
          <span class="fw-bold text-green mb-1">S/ ${(item.price * item.qty).toFixed(2)}</span>
          <button class="cart-item-remove" aria-label="Eliminar ${item.name}" onclick="Cart.removeItem(${item.id})">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      `;
      list.appendChild(div);
    });

    if (totalEl) totalEl.textContent = `S/ ${getTotal().toFixed(2)}`;
  }

  function sendToWhatsApp() {
    const items = getItems();
    if (items.length === 0) return;

    const lines = items.map(i =>
      `• ${i.name} x${i.qty} — S/ ${(i.price * i.qty).toFixed(2)}`
    );
    const total = `\n*TOTAL: S/ ${getTotal().toFixed(2)}*`;
    const msg = `Hola Comercial Nazareth! 🛒 Quiero hacer el siguiente pedido:\n\n${lines.join('\n')}${total}\n\n¿Pueden confirmar disponibilidad? Gracias!`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
  }

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const id = 'toast_' + Date.now();
    const el = document.createElement('div');
    el.id = id;
    el.className = 'toast toast-success align-items-center border-0 show';
    el.setAttribute('role', 'alert');
    el.innerHTML = `
      <div class="d-flex">
        <div class="toast-body fw-semibold"><i class="bi bi-check-circle me-2"></i>${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  // Init on load
  function init() {
    _updateUI();
    const panel = document.getElementById('cartOffcanvas');
    if (panel) {
      panel.addEventListener('show.bs.offcanvas', renderCartPanel);
    }
  }

  return { addItem, addItems, removeItem, updateQty, clearCart, getItems, getTotal, getCount, renderCartPanel, sendToWhatsApp, init };
})();

document.addEventListener('DOMContentLoaded', Cart.init);
