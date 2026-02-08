$(function () {
  window.cart = JSON.parse(localStorage.getItem("cart")) || [];

  $(document).on("click", ".add-to-cart", function () {
    var productId = $(this).data("id");
    var product = window.productsData.find((p) => p.id === productId);

    announceToScreenReader("Adding " + product.name + " to cart...");

    window.cart.push(product);
    localStorage.setItem("cart", JSON.stringify(window.cart));

    setTimeout(function () {
      announceToScreenReader(product.name + " added to cart successfully");
    }, 300);

    $("#modal-message").text(product.name + " has been added to your cart!");
    if (typeof openModal === "function") {
      openModal();
    }
  });

  if ($("#cart-items").length) {
    displayCart();
  }

  function displayCart() {
    $("#loading").show();
    $("#cart-items").hide();
    announceToScreenReader("Loading cart...");

    setTimeout(function () {
      var cartItems = $("#cart-items");
      var cartTotal = $("#cart-total");
      cartItems.empty();

      if (window.cart.length === 0) {
        cartItems.html("<p>Your cart is empty</p>");
        cartTotal.html("");
        announceToScreenReader("Your cart is empty");
      } else {
        var total = 0;
        cartItems.append(
          '<ul class="cart-list" role="list" aria-label="Cart items"></ul>',
        );
        var cartList = cartItems.find(".cart-list");
        $.each(window.cart, function (index, item) {
          total += item.price;
          cartList.append(
            '<li class="cart-item" aria-labelledby="cart-item-name-' +
              index +
              '">' +
              '<img src="' +
              (item.image || "https://picsum.photos/seed/default/150/100") +
              '" alt="' +
              (item.alt || item.name) +
              '" class="cart-item-image">' +
              '<div class="cart-item-info">' +
              '<h3 id="cart-item-name-' +
              index +
              '">' +
              item.name +
              "</h3>" +
              "<p>" +
              item.description +
              "</p>" +
              '<p class="price" aria-label="Price $' +
              item.price +
              '">$' +
              item.price +
              "</p>" +
              "</div>" +
              '<button class="remove-item" data-index="' +
              index +
              '" aria-label="Remove ' +
              item.name +
              ' from cart">Remove</button>' +
              "</li>",
          );
        });
        cartTotal.html(
          '<h3 role="status" aria-live="polite">Total: $' +
            total.toFixed(2) +
            "</h3>",
        );
        announceToScreenReader(
          "Cart loaded. " +
            window.cart.length +
            " items, total: $" +
            total.toFixed(2),
        );
      }

      $("#loading").hide();
      $("#cart-items").show();
    }, 300);
  }

  $(document).on("click", ".remove-item", function () {
    var index = $(this).data("index");
    var itemName = window.cart[index].name;

    announceToScreenReader("Removing " + itemName + " from cart...");

    window.cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(window.cart));
    displayCart();

    setTimeout(function () {
      announceToScreenReader(itemName + " removed from cart");
    }, 500);
  });

  $("#checkout").on("click", function () {
    if (window.cart.length === 0) {
      announceToScreenReader(
        "Your cart is empty. Please add items before checkout.",
      );
      alert("Your cart is empty!");
      return;
    }

    announceToScreenReader("Processing checkout...");

    setTimeout(function () {
      announceToScreenReader("Thank you for your order!");
      alert("Thank you for your order!");
      window.cart = [];
      localStorage.removeItem("cart");
      displayCart();
    }, 500);
  });

  function announceToScreenReader(message) {
    var announcement = $("#announcements");
    if (announcement.length === 0) {
      $("body").append(
        '<div id="announcements" class="sr-only" aria-live="polite" aria-atomic="true"></div>',
      );
      announcement = $("#announcements");
    }
    announcement.text(message);
  }
});
