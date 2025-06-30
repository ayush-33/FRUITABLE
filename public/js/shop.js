document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const productRow = document.getElementById('product-row');
  const sortSelect = document.querySelector('.form-select');
  const priceRange = document.getElementById('price-range');
  const priceValue = document.getElementById('price-value');
  const noProductsMessage = document.getElementById('no-products-message');
  const categoryButtons = document.querySelectorAll('.shop-ctg');

  let allProducts = Array.from(productRow.children); // store initially loaded products
  const originalHTML = productRow.innerHTML;

  // Assign data-index to server rendered products
  allProducts.forEach((p, i) => p.setAttribute('data-index', i));

  // Render products array to DOM
  function renderProducts(products) {
    productRow.innerHTML = '';
    products.forEach(p => productRow.appendChild(p));
  }

  // Sort products by price or default order
  function sortProducts(products, order) {
    return [...products].sort((a, b) => {
      if (order === '1') {
        return parseFloat(a.querySelector('.price').getAttribute('data-price')) - parseFloat(b.querySelector('.price').getAttribute('data-price'));
      } else if (order === '2') {
        return parseFloat(b.querySelector('.price').getAttribute('data-price')) - parseFloat(a.querySelector('.price').getAttribute('data-price'));
      } else {
        // default: restore original index order
        return parseInt(a.getAttribute('data-index')) - parseInt(b.getAttribute('data-index'));
      }
    });
  }

  // Apply price slider filter
  function applyPriceFilter() {
    const selectedPrice = parseInt(priceRange.value);
    const rangeWindow = 10;
    priceValue.textContent = selectedPrice;

    const cards = document.querySelectorAll('.product-card-container');
    let visibleCount = 0;

    cards.forEach(card => {
      const priceText = card.querySelector('.price')?.textContent || '';
      const productPrice = parseFloat(priceText.replace(/[^\d.]/g, ''));

      const inRange = selectedPrice === 0 || (
        productPrice > (selectedPrice - rangeWindow) &&
        productPrice < (selectedPrice + rangeWindow)
      );

      card.style.display = inRange ? 'block' : 'none';
      if (inRange) visibleCount++;
    });

    noProductsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  // Build product card HTML with index
  function buildProductHTML(item, index) {
    return `
      <div class="col-md-6 col-lg-4 product-card-container" data-index="${index}">
        <a href="/product/${item._id}" class="product-links">
          <div class="card product-card">
            <div class="image-container">
              <img src="${item.image?.url || '/img/default.jpg'}" class="card-img-top" alt="${item.name}">
              <span class="category-badge">${item.category}</span>
            </div>
            <div class="card-body">
              <h5 class="card-title fw-bold">${item.name}</h5>
              <p class="card-text">${item.description || 'No description'}</p>
              <h6 class="fw-bold price" data-price="${item.price}">&#8377;${Number(item.price).toFixed(2)} / kg</h6>
              <form method="post" action="/cart/add/${item._id}">
                <button class="btn add-to-cart mb-4">
                  <i class="fa-solid fa-lock"></i> Add to cart
                </button>
              </form>
            </div>
          </div>
        </a>
      </div>
    `;
  }

  // Fetch and render products by category
  async function fetchAndRenderCategory(category) {
    productRow.innerHTML = '<p class="text-center">Loading...</p>';
    try {
      const res = await fetch(`/product/category?category=${category}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      if (data.length === 0) {
        productRow.innerHTML = '<p class="text-center">No products found in this category.</p>';
        return;
      }

      const html = data.map((item, index) => buildProductHTML(item, index)).join('');
      productRow.innerHTML = html;
      allProducts = Array.from(productRow.children);

      // Apply current sorting
      const selectedOrder = sortSelect.value;
      const sorted = sortProducts(allProducts, selectedOrder);
      renderProducts(sorted);

      // Reapply price filter after render
      applyPriceFilter();
    } catch (err) {
      productRow.innerHTML = '<p class="text-center text-danger">Error loading products.</p>';
    }
  }

  // Initial category load from URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  if (initialCategory) {
    fetchAndRenderCategory(initialCategory);
    categoryButtons.forEach(li => {
      li.classList.toggle('active', li.dataset.category === initialCategory);
    });
  }

  // Event listener: Category click
  categoryButtons.forEach(li => {
    li.addEventListener('click', () => {
      const category = li.dataset.category;
      const newUrl = category ? `/product/shop?category=${category}` : '/product/shop';
      history.pushState({ category }, '', newUrl);

      categoryButtons.forEach(item => item.classList.remove('active'));
      li.classList.add('active');

      if (category) {
        fetchAndRenderCategory(category);
      } else {
        productRow.innerHTML = originalHTML;
        allProducts = Array.from(productRow.children);
        allProducts.forEach((p, i) => p.setAttribute('data-index', i)); // reassign indices
        applyPriceFilter();
      }
    });
  });

  // Event listener: Price range slider
  priceRange?.addEventListener('input', applyPriceFilter);

  // Event listener: Sorting select
  sortSelect?.addEventListener('change', () => {
    const order = sortSelect.value;
    const currentCards = Array.from(productRow.children);
    const sorted = sortProducts(currentCards, order);
    renderProducts(sorted);
    applyPriceFilter(); // reapply price filter after sorting
  });

  // Initialize price value text on page load
  if (priceValue && priceRange) {
    priceValue.textContent = priceRange.value;
  }
});
