document.querySelectorAll(".cart-item").forEach(cartItem => {
    const plusBtn = cartItem.querySelector(".plus");
    const minusBtn = cartItem.querySelector(".minus");
    const qtySpan = cartItem.querySelector(".qty-count");
    const productTotal = cartItem.querySelector(".product-total");
    
    const priceElement = cartItem.querySelector(".price");
    let quantity = parseInt(qtySpan.textContent);
    const pricePerItem = parseFloat(priceElement.dataset.price);
    plusBtn.addEventListener("click" , () => {
      quantity++;
      updateQuantityAndPrice();
    });

    minusBtn.addEventListener("click", () => {
   if(quantity > 1) {
    quantity--;
    updateQuantityAndPrice();
   }
    });

  updateCartTotal();
  
 
  function updateQuantityAndPrice() {
  qtySpan.textContent = quantity;
  const totalForItem = pricePerItem * quantity;
  productTotal.textContent = totalForItem.toFixed(2);
  
  updateCartTotal();

  // Move fetch here!
  const cartItemId = cartItem.dataset.cartItemId;
  console.log("Updating cart item ID:", cartItemId, "with quantity:", quantity);
  fetch(`/cart/update/${cartItemId}`, {
    method : "POST",
    headers : {
        "Content-Type" : "application/json",
    },
    body : JSON.stringify({ quantity })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      alert("Failed to update quantity on server");
    }
  })
  .catch(() => {
    alert('Network error. Could not update quantity.');
  });
}

});

function updateCartTotal() {
    const allTotals = document.querySelectorAll(".product-total");
    let total = 0;
    allTotals.forEach(el => {
   total += parseFloat(el.textContent);
    });

     const platformFee = 3;
    const finalTotal = total + platformFee;
    document.getElementById("total-price").textContent = total.toFixed(2);
    document.getElementById("total-items").textContent = allTotals.length;
    document.getElementById("final-total-price").textContent = finalTotal.toFixed(2);
}

 document.querySelectorAll(".delete-form").forEach(form => {
    form.addEventListener("submit", function (e) {
      const confirmed = confirm("Are you sure you want to remove this item?");
      if (!confirmed) {
        e.preventDefault(); 
      }
    });
  });