/* =============================================
   PRODUCTS.JS — Products page logic
   ============================================= */

const API = '/api';
let currentCategory = 'todos';
let searchTimeout = null;

function categoryLabel(id) {
  const map = {
    'abarrotes': 'Abarrotes',
    'bebidas-lacteos': 'Bebidas & Lácteos',
    'limpieza-higiene': 'Limpieza & Higiene',
    'panaderia-snacks': 'Panadería & Snacks'
  };
  return map[id] || id;
}

async function fetchProducts(category = 'todos', search = '') {
  const params = new URLSearchParams();
  if (category !== 'todos') params.set('category', category);
  if (search.trim()) params.set('search', search.trim());

  try {
    const res = await fetch(`${API}/products?${params}`);
    if (!res.ok) throw new Error('API no disponible');
    return res.json();
  } catch {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('Catálogo no disponible');
    let products = await res.json();
    if (category !== 'todos') products = products.filter(product => product.category === category);
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }
    return products;
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  const count = document.getElementById('resultsCount');
  if (!grid) return;

  if (count) count.textContent = `${products.length} producto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="col-12 no-results">
        <i class="bi bi-search"></i>
        <p class="fw-semibold">No se encontraron productos.</p>
        <p class="text-muted small">Intenta con otro término o categoría.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="col-6 col-md-4 col-xl-3">
      <article class="product-card" aria-label="${p.name}">
        <div class="product-img-wrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy"
            onerror="this.onerror=null;this.src='https://picsum.photos/seed/nazareth-${p.id}/900/700';">
          ${p.featured ? '<span class="product-badge">Destacado</span>' : ''}
          <div class="product-img-overlay" aria-hidden="true">
            <button class="product-quick-add" onclick="openProductDetail(${p.id})" tabindex="-1">
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
            <button class="btn-add-cart" onclick="openProductDetail(${p.id})" aria-label="Ver ${p.name}">
              <i class="bi bi-eye"></i> Ver
            </button>
          </div>
        </div>
      </article>
    </div>
  `).join('');
}

function showSpinner() {
  const grid = document.getElementById('productsGrid');
  if (grid) grid.innerHTML = `
    <div class="col-12 products-spinner">
      <div class="spinner-border text-success" role="status" style="width:2.5rem;height:2.5rem;">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;
}

async function loadProducts() {
  const search = document.getElementById('searchInput')?.value || '';
  const categoryForSearch = search.trim() ? 'todos' : currentCategory;
  showSpinner();
  try {
    const products = await fetchProducts(categoryForSearch, search);
    renderProducts(products);
  } catch {
    document.getElementById('productsGrid').innerHTML = `
      <div class="col-12 no-results">
        <i class="bi bi-exclamation-circle"></i>
        <p>Error al cargar productos. Verifica que el servidor esté corriendo.</p>
      </div>
    `;
  }
}

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

    // Store product on button for cart action
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
  const next = Math.max(1, Math.min(99, current + delta));
  display.textContent = next;
}

function setActiveFilterBtn(category) {
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.category === category);
  });
}

function setupSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    if (input.value.trim()) {
      setActiveFilterBtn('todos');
    } else {
      setActiveFilterBtn(currentCategory);
    }
    searchTimeout = setTimeout(loadProducts, 380);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { clearTimeout(searchTimeout); loadProducts(); }
  });
}

function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      loadProducts();
    });
  });
}

function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category');
  const q = params.get('search');
  if (cat) {
    currentCategory = cat;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === cat);
    });
  }
  if (q) {
    const input = document.getElementById('searchInput');
    if (input) input.value = q;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  readURLParams();
  setupSearch();
  setupFilters();
  loadProducts();
});
