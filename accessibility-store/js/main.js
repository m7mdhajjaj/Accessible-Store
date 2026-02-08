$(function () {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Load featured products on home page
  if ($("#featured-list").length) {
    loadFeaturedProducts();
  }

  // Newsletter form submission
  $(".newsletter-form").on("submit", function (e) {
    e.preventDefault();
    var email = $("#email-input").val();

    if (email) {
      announceToScreenReader("Subscribing to newsletter...");

      // Simulate subscription
      setTimeout(function () {
        announceToScreenReader("Thank you for subscribing to our newsletter!");
        $("#email-input").val("");
        alert("Thank you for subscribing to our newsletter!");
      }, 1000);
    }
  });

  function loadFeaturedProducts() {
    $.ajax({
      url: "data/products.json",
      method: "GET",
      dataType: "json",
      success: function (data) {
        window.productsData = data;
        var featuredList = $("#featured-list");
        featuredList.empty();

        // Show first 3 products as featured
        var featuredProducts = data.slice(0, 3);

        $.each(featuredProducts, function (index, product) {
          featuredList.append(
            '<div class="featured-product">' +
              '<img src="' +
              product.image +
              '" alt="' +
              product.alt +
              '" class="product-image" loading="lazy">' +
              '<h3><a href="product-details.html?id=' +
              product.id +
              '" class="product-link">' +
              product.name +
              "</a></h3>" +
              "<p>" +
              product.description +
              "</p>" +
              '<p class="price" aria-label="Price $' +
              product.price +
              '">$' +
              product.price +
              "</p>" +
              '<button class="add-to-cart" data-id="' +
              product.id +
              '" aria-label="Add ' +
              product.name +
              ' to cart">Add to Cart</button>' +
              "</div>",
          );
        });

        announceToScreenReader("Featured products loaded successfully");
      },
      error: function () {
        $("#featured-list").html("<p>Failed to load featured products.</p>");
        announceToScreenReader("Failed to load featured products");
      },
    });
  }

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

  if ($("#products-list").length) {
    $.ajax({
      url: "data/products.json",
      method: "GET",
      dataType: "json",
      success: function (data) {
        window.productsData = data;
        var productsList = $("#products-list");
        productsList.empty();
        $.each(data, function (index, product) {
          productsList.append(
            '<div class="product"><h3>' +
              product.name +
              "</h3><p>" +
              product.description +
              '</p><p class="price">$' +
              product.price +
              '</p><button class="add-to-cart" data-id="' +
              product.id +
              '">Add to Cart</button></div>',
          );
        });
      },
      error: function () {
        alert("Failed to load product data.");
      },
    });
  }

  $(document).on("click", ".add-to-cart", function () {
    var productId = $(this).data("id");
    var product = window.productsData.find((p) => p.id === productId);
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));

    $("#modal-message").text(product.name + " has been added to your cart!");
    openModal();
  });

  function openModal() {
    window.lastFocusedElement = document.activeElement;
    $("#announcements").text("Product added to cart successfully");
    $("#cart-modal")
      .attr("aria-hidden", "false")
      .fadeIn(function () {
        $("#modal-ok").focus();
      });
    $(document).on("keydown.modal", trapFocus);
  }

  function closeModal() {
    $("#cart-modal")
      .attr("aria-hidden", "true")
      .fadeOut(function () {
        $("#announcements").text("Dialog closed");
        if (window.lastFocusedElement) {
          window.lastFocusedElement.focus();
        }
      });
    $(document).off("keydown.modal");
  }

  function trapFocus(e) {
    if (e.key === "Tab" && $("#cart-modal").is(":visible")) {
      var focusableElements = $("#cart-modal")
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
      closeModal();
    }
  }

  $("#search").on("input", function () {
    var searchTerm = $(this).val().toLowerCase();
    $(".product").each(function () {
      var productName = $(this).find("h3").text().toLowerCase();
      $(this).toggle(productName.includes(searchTerm));
    });
  });

  if ($("#cart-items").length) {
    displayCart();
  }

  function displayCart() {
    var cartItems = $("#cart-items");
    var cartTotal = $("#cart-total");
    cartItems.empty();

    if (cart.length === 0) {
      cartItems.html("<p>Your cart is empty</p>");
      cartTotal.html("");
      return;
    }

    var total = 0;
    $.each(cart, function (index, item) {
      total += item.price;
      cartItems.append(
        '<div class="cart-item"><h3>' +
          item.name +
          "</h3><p>" +
          item.description +
          '</p><p class="price">$' +
          item.price +
          '</p><button class="remove-item" data-index="' +
          index +
          '">Remove</button></div>',
      );
    });

    cartTotal.html("<h3>Total: $" + total.toFixed(2) + "</h3>");
  }

  $(document).on("click", ".remove-item", function () {
    var index = $(this).data("index");
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
  });

  $("#checkout").on("click", function () {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    alert("Thank you for your order!");
    cart = [];
    localStorage.removeItem("cart");
    displayCart();
  });

  $(document).on("click keypress", ".close, #modal-ok", function (e) {
    if (e.type === "click" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      closeModal();
    }
  });

  $(window).on("click", function (event) {
    if ($(event.target).is("#cart-modal")) {
      closeModal();
    }
  });
});
