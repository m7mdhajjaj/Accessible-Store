$(function(){
  
  window.cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  $(document).on('click', '.add-to-cart', function() {
    var productId = $(this).data('id');
    var product = window.productsData.find(p => p.id === productId);
    window.cart.push(product);
    localStorage.setItem('cart', JSON.stringify(window.cart)); 
    
    $('#modal-message').text(product.name + ' has been added to your cart!');
    if (typeof openModal === 'function') {
      openModal();
    }
  });
  
  if ($('#cart-items').length) {
    displayCart();
  }

  function displayCart() {
    var cartItems = $('#cart-items');
    var cartTotal = $('#cart-total');
    cartItems.empty();
    
    if (window.cart.length === 0) {
      cartItems.html('<p>Your cart is empty</p>');
      cartTotal.html('');
      return;
    }
    
    var total = 0;
    $.each(window.cart, function(index, item) {
      total += item.price;
      cartItems.append(
        '<div class="cart-item" tabindex="0" role="article" aria-labelledby="cart-item-name-' + index + '">' +
          '<h3 id="cart-item-name-' + index + '">' + item.name + '</h3>' +
          '<p>' + item.description + '</p>' +
          '<p class="price" aria-label="Price $' + item.price + '">$' + item.price + '</p>' +
          '<button class="remove-item" data-index="' + index + '" aria-label="Remove ' + item.name + ' from cart">Remove</button>' +
        '</div>'
      );
    });
    //dsad
    cartTotal.html('<h3 role="status" aria-live="polite">Total: $' + total.toFixed(2) + '</h3>');
  }

  $(document).on('click', '.remove-item', function() {
    var index = $(this).data('index');
    window.cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(window.cart));
    displayCart();
  });

  $('#checkout').on('click', function() {
    if (window.cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    alert('Thank you for your order!');
    window.cart = [];
    localStorage.removeItem('cart');
    displayCart();
  });
  
});
