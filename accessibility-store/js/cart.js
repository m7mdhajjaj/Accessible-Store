$(function () {
  window.cart = JSON.parse(localStorage.getItem("cart")) || [];
  var pendingRemoveIndex = null;
  var lastFocusedElement = null;

  // Focus trap function for modals
  function trapFocus(e, modalId) {
    if (e.key === "Tab" && $(modalId).is(":visible")) {
      var focusableElements = $(modalId)
        .find(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        .filter(":visible");
      var firstElement = focusableElements.first()[0];
      var lastElement = focusableElements.last()[0];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }

    if (e.key === "Escape") {
      closeConfirmModal();
      closeCheckoutModal();
    }
  }

  // Confirm Remove Modal functions
  function openConfirmModal(itemName, index) {
    pendingRemoveIndex = index;
    lastFocusedElement = document.activeElement;
    $("#confirm-modal-message").text(
      'Are you sure you want to remove "' + itemName + '" from your cart?',
    );
    $("#announcements").text(
      "Confirm remove dialog. " +
        itemName +
        ". Press Yes to remove or Cancel to keep.",
    );
    $("#confirm-modal")
      .attr("aria-hidden", "false")
      .fadeIn(function () {
        $("#confirm-no").focus();
      });
    $(document).on("keydown.confirmModal", function (e) {
      trapFocus(e, "#confirm-modal");
    });
  }

  function closeConfirmModal() {
    $("#confirm-modal")
      .attr("aria-hidden", "true")
      .fadeOut(function () {
        $("#announcements").text("Dialog closed");
        if (lastFocusedElement) {
          lastFocusedElement.focus();
        }
      });
    $(document).off("keydown.confirmModal");
    pendingRemoveIndex = null;
  }

  // Checkout Modal functions
  function openCheckoutModal() {
    lastFocusedElement = document.activeElement;
    $("#announcements").text(
      "Order completed successfully! Thank you for your purchase.",
    );
    $("#checkout-modal")
      .attr("aria-hidden", "false")
      .fadeIn(function () {
        $("#checkout-ok").focus();
      });
    $(document).on("keydown.checkoutModal", function (e) {
      trapFocus(e, "#checkout-modal");
    });
  }

  function closeCheckoutModal() {
    $("#checkout-modal")
      .attr("aria-hidden", "true")
      .fadeOut(function () {
        $("#announcements").text("Dialog closed");
        if (lastFocusedElement) {
          lastFocusedElement.focus();
        }
      });
    $(document).off("keydown.checkoutModal");
  }

  // Confirm modal button handlers
  $("#confirm-yes").on("click", function () {
    if (pendingRemoveIndex !== null) {
      var itemName = window.cart[pendingRemoveIndex].name;
      window.cart.splice(pendingRemoveIndex, 1);
      localStorage.setItem("cart", JSON.stringify(window.cart));
      closeConfirmModal();
      displayCart();
      setTimeout(function () {
        announceToScreenReader(itemName + " has been removed successfully");
      }, 500);
    }
  });

  $("#confirm-no").on("click", function () {
    closeConfirmModal();
    setTimeout(function () {
      announceToScreenReader("Remove cancelled. Item kept in cart.");
    }, 300);
  });

  // Checkout modal button handler
  $("#checkout-ok").on("click", function () {
    closeCheckoutModal();
    setTimeout(function () {
      announceToScreenReader(
        "Order completed successfully. Thank you for shopping with us!",
      );
    }, 300);
  });

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
    openConfirmModal(itemName, index);
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
      window.cart = [];
      localStorage.removeItem("cart");
      displayCart();
      openCheckoutModal();
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
