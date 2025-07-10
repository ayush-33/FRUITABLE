document.addEventListener('DOMContentLoaded', () => {
  const productRow = document.getElementById('product-row');
  const sortSelect = document.querySelector('.form-select');
  const priceRange = document.getElementById('price-range');
  const priceValue = document.getElementById('price-value');
  const noProductsMessage = document.getElementById('no-products-message');
  const categoryButtons = document.querySelectorAll('.shop-ctg');
  const paginationContainer = document.querySelector('.pagination');

  if (!productRow) return;

  function buildProductHTML(item, index) {
    return `
      <div class="col-md-6 col-lg-4 product-card-container d-flex" data-index="${index}">
        <a href="/product/${item._id}" class="product-links w-100">
          <div class="card product-card h-100">
            <div class="image-container">
              <img src="${item.image?.url || '/img/default.jpg'}" class="card-img-top" alt="${item.name}">
              <span class="category-badge">${item.category}</span>
            </div>
            <div class="card-body flex-grow-1 d-flex flex-column">
              <h5 class="card-title fw-bold">${item.name}</h5>
              <p class="card-text flex-grow-1">${item.description || 'No description'}</p>
              <h6 class="fw-bold price" data-price="${item.price}">&#8377;${Number(item.price).toFixed(2)} / kg</h6>
              <form method="post" action="/cart/add/${item._id}" class="mt-auto">
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

  function sortProducts(products, order) {
    return [...products].sort((a, b) => {
      const priceA = parseFloat(a.querySelector('.price')?.getAttribute('data-price')) || 0;
      const priceB = parseFloat(b.querySelector('.price')?.getAttribute('data-price')) || 0;
      if (order === '1') return priceA - priceB;
      if (order === '2') return priceB - priceA;
      return parseInt(a.getAttribute('data-index')) - parseInt(b.getAttribute('data-index'));
    });
  }

  function renderProducts(products) {
    productRow.innerHTML = '';
    products.forEach(p => productRow.appendChild(p));
  }

  function applyPriceFilter() {
    const selectedPrice = parseInt(priceRange.value);
    const rangeWindow = 10;
    priceValue.textContent = selectedPrice;

    const cards = document.querySelectorAll('.product-card-container');
    let visibleCount = 0;

    cards.forEach(card => {
      const priceEl = card.querySelector('.price');
      const productPrice = priceEl ? parseFloat(priceEl.getAttribute('data-price')) : 0;

      const inRange = selectedPrice === 0 || (
        productPrice >= (selectedPrice - rangeWindow) &&
        productPrice <= (selectedPrice + rangeWindow)
      );

      card.classList.toggle('d-flex', inRange);
      card.classList.toggle('d-none', !inRange);

      if (inRange) visibleCount++;
    });

    if (noProductsMessage) {
      noProductsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  async function fetchAndRenderCategory(category = '', page = 1) {
    productRow.innerHTML = '<p class="text-center">Loading...</p>';
    try {
      const url = category
        ? `/product/shop/api?category=${category}&page=${page}`
        : `/product/shop/api?page=${page}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();

      if (!data.products.length) {
        productRow.innerHTML = '<p class="text-center">No products found in this category.</p>';
        renderPagination(1, 1, category);
        return;
      }

      // Restore and apply sorting from localStorage
      const savedSortingOrder = localStorage.getItem('shopSortingOrder') || '';
      sortSelect.value = savedSortingOrder;

      // Sort the data array before rendering
      let sortedProducts = [...data.products];
      if (savedSortingOrder === '1') {
        sortedProducts.sort((a, b) => a.price - b.price);
      } else if (savedSortingOrder === '2') {
        sortedProducts.sort((a, b) => b.price - a.price);
      }

      // Build HTML only for sorted products
      const html = sortedProducts.map((item, index) => buildProductHTML(item, index)).join('');
      productRow.innerHTML = html;

      // Always reset price slider to 0 on category/page change
      priceRange.value = '0';
      priceValue.textContent = '0';
      localStorage.setItem('shopPriceSlider', '0');
      applyPriceFilter();

      renderPagination(data.currentPage, data.totalPages, category);

    } catch (err) {
      console.error(err);
      productRow.innerHTML = '<p class="text-center text-danger">Error loading products.</p>';
    }
  }

  function renderPagination(currentPage, totalPages, category) {
    if (!paginationContainer) return;

    let html = '';

    if (currentPage > 1) {
      html += `<li class="page-item">
        <a class="page-link custom-page" data-page="${currentPage - 1}" data-category="${category}" href="#">«</a>
      </li>`;
    } else {
      html += `<li class="page-item disabled">
        <span class="page-link custom-page">«</span>
      </li>`;
    }

    for (let i = 1; i <= totalPages; i++) {
      html += `<li class="page-item ${currentPage == i ? 'active' : ''}">
        <a class="page-link custom-page ${currentPage == i ? 'active-page' : ''}" data-page="${i}" data-category="${category}" href="#">${i}</a>
      </li>`;
    }

    if (currentPage < totalPages) {
      html += `<li class="page-item">
        <a class="page-link custom-page" data-page="${currentPage + 1}" data-category="${category}" href="#">»</a>
      </li>`;
    } else {
      html += `<li class="page-item disabled">
        <span class="page-link custom-page">»</span>
      </li>`;
    }

    paginationContainer.innerHTML = html;

    paginationContainer.querySelectorAll('a[data-page]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        const cat = link.getAttribute('data-category');
        // Update URL for consistency and browser navigation
        history.pushState({}, '', cat ? `/product/shop?category=${cat}&page=${page}` : `/product/shop?page=${page}`);
        fetchAndRenderCategory(cat, page);
      });
    });
  }

  // On page load, always use AJAX for all products/categories
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || '';
  const initialPage = parseInt(urlParams.get('page')) || 1;
  fetchAndRenderCategory(initialCategory, initialPage);

  // Set active class for category buttons
  categoryButtons.forEach(li => {
    li.classList.toggle('active', li.dataset.category === initialCategory);
    li.addEventListener('click', () => {
      const category = li.dataset.category || '';
      history.pushState({ category }, '', category ? `/product/shop?category=${category}&page=1` : '/product/shop?page=1');
      categoryButtons.forEach(item => item.classList.remove('active'));
      li.classList.add('active');
      fetchAndRenderCategory(category, 1);
    });
  });

  priceRange?.addEventListener('input', () => {
    localStorage.setItem('shopPriceSlider', priceRange.value);
    applyPriceFilter();
  });

  sortSelect?.addEventListener('change', () => {
    localStorage.setItem('shopSortingOrder', sortSelect.value);
    // Refetch current page/category with new sort order
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || '';
    const page = parseInt(urlParams.get('page')) || 1;
    fetchAndRenderCategory(category, page);
  });

  // Handle browser navigation (back/forward)
  window.addEventListener('popstate', (event) => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category') || '';
    const page = parseInt(params.get('page')) || 1;
    fetchAndRenderCategory(category, page);
    categoryButtons.forEach(li => {
      li.classList.toggle('active', li.dataset.category === category);
    });
  });
});
