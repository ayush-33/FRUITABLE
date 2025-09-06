(() => {
  'use strict';

  // Disable form submission if invalid
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();

// Fetch products from API
async function fetchProducts(category = "") {
  try {
    const res = await fetch(`/api/products?category=${category}`);
    if (!res.ok) throw new Error("Failed to fetch products");

    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    const clientRow = document.getElementById("product-client");
    if (clientRow) {
      clientRow.innerHTML = `<div class="col-12"><p class="text-center fw-bold text-danger">Failed to load products</p></div>`;
    }
  }
}

// Render products dynamically in the same style as index.ejs
function renderProducts(products) {
  const clientRow = document.getElementById("product-client");
  if (!clientRow) return;

  clientRow.innerHTML = "";

  if (!products || products.length === 0) {
    clientRow.innerHTML = `<div class="col-12"><p class="text-center fw-bold text-danger">No products found</p></div>`;
    return;
  }

  products.forEach(product => {
    clientRow.innerHTML += `
      <div class="col-md-6 col-lg-4 product-card-container">
        <a href="/product/${product._id}" class="product-links">
          <div class="card product-card mb-4 h-100">
            <div class="image-container">
              <img src="${product.image?.url || '/img/default.jpg'}" alt="${product.name}" class="card-img-top" />
              <span class="category-badge">${product.category || 'Uncategorized'}</span>
            </div>
            <div class="card-body">
              <h5 class="card-title"><b>${product.name || 'No name'}</b></h5>
              <p class="card-text text-center description">${product.description || 'No description'}</p>
              <p class="price"><b>&#8377;${product.price ? Number(product.price).toFixed(2) : '0.00'} / kg</b></p>
            </div>
          </div>
        </a>
      </div>
    `;
  });
}

// Attach event listeners to category buttons
document.addEventListener('DOMContentLoaded', () => {
  const categoryButtons = document.querySelectorAll(".category-btn");
  if (!categoryButtons) return;

  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Fetch products for selected category
      const category = btn.getAttribute("data-category");
      fetchProducts(category);
    });
  });

  // Optionally, fetch all products on page load to make it fully dynamic
  fetchProducts();
});
