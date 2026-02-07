$(function () {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    window.location.href = "products.html";
    return;
  }

  // Load product details
  loadProductDetails(productId);

  function loadProductDetails(id) {
    $("#loading").show();
    $("#product-details").hide();
    announceToScreenReader("Loading product details, please wait...");

    $.ajax({
      url: "data/products.json",
      method: "GET",
      dataType: "json",
      success: function (data) {
        const product = data.find((p) => p.id == id);

        if (product) {
          announceToScreenReader("Product details loaded successfully");
          displayProduct(product);
        } else {
          announceToScreenReader("Product not found");
          alert("Product not found");
          window.location.href = "products.html";
        }
      },
      error: function () {
        announceToScreenReader("Failed to load product details");
        alert("Failed to load product details");
        window.location.href = "products.html";
      },
    });
  }

  function displayProduct(product) {
    $("#loading").hide();
    $("#product-details").show();

    $("#product-title").text(product.name);
    $("#product-category").text(product.category);
    $("#product-description").text(product.description);
    $("#product-price")
      .text("$" + product.price.toFixed(2))
      .attr("aria-label", "Price: $" + product.price.toFixed(2));

    $("#product-image").attr({
      src: product.image || "images/placeholder.png",
      alt: product.name,
    });

    // Set page title
    document.title = product.name + " - Accessibility Store";

    // Add to cart functionality
    $("#add-to-cart")
      .off("click")
      .on("click", function () {
        addToCart(product);

        // Show confirmation via modal if available
        if (typeof showModal === "function") {
          showModal(
            "Added to Cart",
            product.name + " has been added to your cart!",
          );
        } else {
          alert(product.name + " added to cart!");
        }

        // Announce to screen readers
        announceToScreenReader(product.name + " added to cart");
      });

    // Focus on the product title for screen reader users
    setTimeout(function () {
      $("#product-title").focus();
    }, 100);
  }

  function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
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
});
