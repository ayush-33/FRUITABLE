// if (window.location.pathname === "/product/category") {
//   window.location.replace("/");
// }


// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict';

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

// // Script to handle category filtering and product display
// const productRow = document.getElementById('product-row');

// // Function to fetch and render products for a category
// async function fetchAndRenderCategory(category) {
//   let cardsHTML = '';
//   let url = !category
//     ? '/product/api/products'
//     : `/product/api/products?category=${encodeURIComponent(category)}`;

//   try {
//     const res = await fetch(url);
//     if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
//     const data = await res.json();

//     if (!Array.isArray(data)) throw new Error('Invalid data format');
//     if (data.length === 0) {
//       cardsHTML = '<p class="text-center">No products found in this category.</p>';
//     } else {
//       data.forEach(product => {
//         cardsHTML += `
//           <div class="col-md-6 col-lg-4 product-card-container">
//             <a href="/product/${product._id}" class="product-links">
//               <div class="card product-card mb-4 h-100">
//                 <div class="image-container">
//                   <img
//                     src="${product.image?.url || '/img/default.jpg'}"
//                     alt="Product Image"
//                     class="card-img-top"
//                   />
//                   <span class="category-badge">${product.category}</span>
//                 </div>
//                 <div class="card-body">
//                   <h5 class="card-title"><b>${product.name}</b></h5>
//                   <p class="card-text text-center description">
//                     ${product.description || 'No description'}
//                   </p>
//                   <p class="price">
//                     <b> &#8377;${Number(product.price).toFixed(2)} / kg </b>
//                   </p>
//                 </div>
//               </div>
//             </a>
//           </div>
//         `;
//       });
//     }
//     productRow.innerHTML = cardsHTML;
//   } catch (err) {
//     productRow.innerHTML =
//       '<p class="text-center text-danger">Error loading products. Please try again.</p>';
//     console.error("Fetch error:", err);
//   }
// }

// // Helper to update active class on category buttons
// function updateActiveCategory(category) {
//   document.querySelectorAll('.category-btn').forEach(btn => {
//     if ((category && btn.dataset.category === category) || (!category && !btn.dataset.category)) {
//       btn.classList.add('active');
//     } else {
//       btn.classList.remove('active');
//     }
//   });
// }

// // On page load, fetch correct products
// window.addEventListener('DOMContentLoaded', () => {
//   if (!productRow) return;
//   const urlParams = new URLSearchParams(window.location.search);
//   const category = urlParams.get('category') || '';
//   updateActiveCategory(category);
//   fetchAndRenderCategory(category);
// });

// // Click handler to fetch products and update URL dynamically
// document.querySelectorAll('.category-btn').forEach(button => {
//   button.addEventListener('click', async () => {
//     let category = button.dataset.category || '';
//     if (category.toLowerCase() === 'all products') category = '';
//     updateActiveCategory(category);

//     const newUrl = category ? `/?category=${category}` : '/';
//     window.history.pushState({ category }, '', newUrl);

//     fetchAndRenderCategory(category);
//   });
// });

// // Handle browser navigation (back/forward)
// window.addEventListener('popstate', () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const category = urlParams.get('category') || '';
//   updateActiveCategory(category);
//   fetchAndRenderCategory(category);
// });
