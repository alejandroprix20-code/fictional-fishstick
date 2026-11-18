/* =============================================
   MAIN.JS — Homepage logic
   ============================================= */

const API = '/api';

async function loadFeaturedProducts() {
  try {
    let products;
    try {
      const res = await fetch(`${API}/products?featured=true`);
      if (!res.ok) throw new Error();
      products = await res.json();
    } catch {
      const res = await fetch('data/products.json');
      const catalog = await res.json();
      products = catalog.filter(product => product.featured);
    }
    buildCarousel(products);
    buildFeaturedGrid(products.slice(0, 4));
  } catch (err) {
    console.error('Error cargando productos:', err);
  }
}

function buildCarousel(products) {
  const inner = document.getElementById('carouselInner');
  const indicators = document.getElementById('carouselIndicators');
  if (!inner || !products.length) return;

  inner.innerHTML = '';
  indicators.innerHTML = '';

  products.forEach((p, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.dataset.bsTarget = '#featuredCarousel';
    dot.dataset.bsSlideTo = i;
    dot.setAttribute('aria-label', `Producto ${i + 1}`);
    if (i === 0) { dot.classList.add('active'); dot.setAttribute('aria-current', 'true'); }
    indicators.appendChild(dot);

    const item = document.createElement('div');
    item.className = `carousel-item${i === 0 ? ' active' : ''}`;
    item.innerHTML = `
      <div class="carousel-product-slide">
        <div class="carousel-product-visual">
          <span class="carousel-product-number">${String(i + 1).padStart(2, '0')}</span>
          <img src="${p.image}" alt="${p.name}" class="carousel-product-img" loading="${i === 0 ? 'eager' : 'lazy'}"
            onerror="this.onerror=null;this.src='https://picsum.photos/seed/nazareth-${p.id}/900/700';">
          <span class="carousel-product-stock">Disponible hoy</span>
        </div>
        <div class="carousel-product-body">
          <div class="product-category mb-2">${categoryLabel(p.category)}</div>
          <h3>${p.name}</h3>
          <p style="font-size:.9rem;color:var(--ink-3);line-height:1.65;margin-bottom:1.2rem;">${p.description}</p>
          <div class="carousel-price">S/ ${p.price.toFixed(2)} <span style="font-size:.55em;font-family:var(--f-body);font-weight:400;color:var(--ink-3);">/ ${p.unit}</span></div>
          <button class="btn-primary-organic" style="font-size:.88rem;padding:.65rem 1.6rem;" onclick='Cart.addItem(${JSON.stringify(p)})'>
            Agregar al carrito
          </button>
        </div>
      </div>
    `;
    inner.appendChild(item);
  });
}

function buildFeaturedGrid(products) {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  grid.innerHTML = products.map(p => productCardHTML(p)).join('');
  // Re-init tilt on new cards
  if (window.initTiltOnNew) window.initTiltOnNew();
}

function categoryLabel(id) {
  const map = {
    'abarrotes':       'Abarrotes',
    'bebidas-lacteos': 'Bebidas & Lácteos',
    'limpieza-higiene':'Limpieza & Higiene',
    'panaderia-snacks':'Panadería & Snacks'
  };
  return map[id] || id;
}

function productCardHTML(p) {
  const safeProduct = JSON.stringify(p).replace(/'/g, "&#39;");
  return `
    <div class="col-6 col-md-4 col-lg-3">
      <article class="product-card" aria-label="${p.name}">
        <div class="product-img-wrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy"
            onerror="this.onerror=null;this.src='https://picsum.photos/seed/nazareth-${p.id}/900/700';">
          ${p.featured ? '<span class="product-badge">Destacado</span>' : ''}
          <div class="product-img-overlay" aria-hidden="true">
            <button class="product-quick-add" onclick='openProductDetail(${p.id})' tabindex="-1">
              <i class="bi bi-eye"></i> Ver detalle
            </button>
          </div>
        </div>
        <div class="product-body">
          <div class="product-category">${categoryLabel(p.category)}</div>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.description}</p>
          <div class="product-footer">
            <div>
              <div class="product-price">S/ ${p.price.toFixed(2)}</div>
              <span class="product-price-unit">por ${p.unit}</span>
            </div>
            <button class="btn-add-cart" onclick='Cart.addItem(${safeProduct})' aria-label="Agregar ${p.name} al carrito">
              <i class="bi bi-basket2-fill"></i> Agregar
            </button>
          </div>
        </div>
      </article>
    </div>
  `;
}

const NAZARETH_PACKS = {
  desayuno: [7, 19, 20],
  despensa: [1, 3, 4, 5],
  limpieza: [13, 14, 15, 18]
};

async function addNazarethPack(packId, button) {
  const ids = NAZARETH_PACKS[packId];
  if (!ids || !button) return;

  const originalText = button.innerHTML;
  button.disabled = true;
  button.innerHTML = 'Agregando...';

  try {
    const products = await Promise.all(ids.map(async id => {
      const response = await fetch(`${API}/products/${id}`);
      if (!response.ok) throw new Error('Producto no disponible');
      return response.json();
    }));
    Cart.addItems(products);
    button.innerHTML = 'Pack agregado <span aria-hidden="true">✓</span>';
    setTimeout(() => { button.innerHTML = originalText; button.disabled = false; }, 1800);
  } catch {
    button.innerHTML = 'Intenta nuevamente';
    setTimeout(() => { button.innerHTML = originalText; button.disabled = false; }, 1800);
  }
}
window.addNazarethPack = addNazarethPack;

async function openProductDetail(id) {
  try {
    let p;
    try {
      const res = await fetch(`${API}/products/${id}`);
      if (!res.ok) throw new Error();
      p = await res.json();
    } catch {
      const res = await fetch('data/products.json');
      const products = await res.json();
      p = products.find(product => product.id === id);
      if (!p) throw new Error();
    }

    document.getElementById('modalProductImg').src = p.image;
    document.getElementById('modalProductImg').alt = p.name;
    document.getElementById('modalProductImg').onerror = function () {
      this.onerror = null;
      this.src = `https://picsum.photos/seed/nazareth-${p.id}/900/700`;
    };
    document.getElementById('modalProductCategory').textContent = categoryLabel(p.category);
    document.getElementById('modalProductName').textContent = p.name;
    document.getElementById('modalProductDesc').textContent = p.description;
    document.getElementById('modalProductPrice').textContent = `S/ ${p.price.toFixed(2)}`;
    document.getElementById('modalProductUnit').textContent = `por ${p.unit}`;
    document.getElementById('modalQtyDisplay').textContent = 1;

    const addBtn = document.getElementById('modalAddToCart');
    addBtn.onclick = () => {
      const qty = parseInt(document.getElementById('modalQtyDisplay').textContent);
      Cart.addItem(p, qty);
      bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    };

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
  } catch {
    alert('No se pudo cargar el detalle del producto.');
  }
}

function adjustModalQty(delta) {
  const display = document.getElementById('modalQtyDisplay');
  const current = parseInt(display.textContent);
  display.textContent = Math.max(1, Math.min(99, current + delta));
}

window.openProductDetail = openProductDetail;
window.adjustModalQty = adjustModalQty;

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedProducts();
});
