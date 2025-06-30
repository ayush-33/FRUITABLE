// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()

// Script to handle category filtering and product display
const productRow = document.getElementById('product-row');
const originalHTML = productRow.innerHTML;

// ✅ Function to fetch and render products for a category
async function fetchAndRenderCategory(category) {
  let cardsHTML = '';
  try {
    const res = await fetch(`/product/category?category=${category}`);
    const data = await res.json();
    if (data.length === 0) {
      cardsHTML = '<p class="text-center">No products found in this category.</p>';
    } else {
      data.forEach(product => {
        cardsHTML += `
          <div class="col h-100">
            <a href="/product/${product._id}" class="product-links">
              <div class="card product-card mb-4 h-100">
                <div class="image-container">
                  <img
                    src="${product.image?.url || '/img/default.jpg'}"
                    alt="Product Image"
                    class="card-img-top"
                  />
                  <span class="category-badge">${product.category}</span>
                </div>
                <div class="card-body">
                  <h5 class="card-title"><b>${product.name}</b></h5>
                  <p class="card-text text-center description">
                    ${product.description}
                  </p>
                  <p class="price">
                    <b> &#8377;${Number(product.price).toFixed(2)} / kg </b>
                  </p>
                </div>
              </div>
            </a>
          </div>
        `;
      });
    }
    productRow.innerHTML = cardsHTML;
  } catch (err) {
    productRow.innerHTML = '<p class="text-center text-danger">Error loading products.</p>';
  }
}

// ✅ On page load, check URL for category and fetch products
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');

  if (category) {
    fetchAndRenderCategory(category);

    // Set active class on matching button
    document.querySelectorAll('.category-btn').forEach(btn => {
      if (btn.dataset.category === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
});

// ✅ Click handler to fetch products and update URL
document.querySelectorAll('.category-btn').forEach(button => {
  button.addEventListener('click', async (e) => {
    const category = button.dataset.category;

    // Update URL without reload
    const newUrl = category ? `/product?category=${category}` : '/product';
    window.history.pushState({ category }, '', newUrl);

    // Update active class styles
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    if (category) {
      fetchAndRenderCategory(category);
    } else {
      productRow.innerHTML = originalHTML;
    }
  });
});


