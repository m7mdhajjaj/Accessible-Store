$(function () {
  if ($("#products-list").length) {
    loadProducts();
  }

  function loadProducts() {
    // Show loading state
    $("#loading").show();
    $("#products-list").hide();

    $.ajax({
      url: "data/products.json",
      method: "GET",
      dataType: "json",
      success: function (data) {
        window.productsData = data;

        // Hide loading state
        $("#loading").hide();
        $("#products-list").show();

        // Check if there's a search query in the URL
        var urlParams = new URLSearchParams(window.location.search);
        var searchTerm = urlParams.get("search");

        if (searchTerm) {
          $("#search").val(searchTerm);
          filterProducts(searchTerm);
          // Focus on first product when coming from search
          setTimeout(function () {
            $(".product").first().focus();
          }, 100);
        } else {
          displayProducts(data);
          updateSearchResults(data.length, "");
        }
      },
      error: function () {
        $("#loading").hide();
        $("#products-list").show();
        alert("Failed to load product data.");
      },
    });
  }

  function displayProducts(data) {
    var productsList = $("#products-list");
    productsList.empty();

    if (data.length === 0) {
      productsList.append("<p>No products found.</p>");
      return;
    }

    $.each(data, function (index, product) {
      productsList.append(
        '<div class="product" data-product-id="' +
          product.id +
          '" tabindex="0" role="button" aria-labelledby="product-name-' +
          product.id +
          '" aria-describedby="product-desc-' +
          product.id +
          '" style="cursor: pointer;">' +
          '<h3 id="product-name-' +
          product.id +
          '">' +
          product.name +
          "</h3>" +
          '<p id="product-desc-' +
          product.id +
          '">' +
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

    // Add click event to products
    $(".product").on("click", function (e) {
      if (!$(e.target).hasClass("add-to-cart")) {
        var productId = $(this).data("product-id");
        window.location.href = "product-details.html?id=" + productId;
      }
    });

    // Add keyboard support
    $(".product").on("keypress", function (e) {
      if (e.which === 13 || e.which === 32) {
        // Enter or Space
        e.preventDefault();
        if (!$(e.target).hasClass("add-to-cart")) {
          var productId = $(this).data("product-id");
          window.location.href = "product-details.html?id=" + productId;
        }
      }
    });

    // Prevent add to cart button from triggering product click
    $(".add-to-cart").on("click", function (e) {
      e.stopPropagation();
    });
  }

  function filterProducts(searchTerm, category) {
    category = category || "all";

    var filtered = window.productsData.filter(function (product) {
      var matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      var matchesCategory =
        category === "all" ||
        product.category.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    displayProducts(filtered);
    updateSearchResults(filtered.length, searchTerm, category);
  }

  $("#search").on("input", function () {
    var searchTerm = $(this).val();
    var category = $("#category-filter").val();
    filterProducts(searchTerm, category);
  });

  $("#category-filter").on("change", function () {
    var category = $(this).val();
    var searchTerm = $("#search").val();
    filterProducts(searchTerm, category);
  });

  function updateSearchResults(count, searchTerm, category) {
    var $resultMessage = $("#search-results");
    var categoryText = category && category !== "all" ? " in " + category : "";

    // Ensure screen reader announces the results
    $resultMessage.attr({
      "aria-live": "polite",
      "aria-atomic": "true",
      role: "status",
    });

    if (searchTerm === "" && (!category || category === "all")) {
      $resultMessage.text("Showing all " + count + " products");
    } else if (count === 0) {
      $resultMessage.text(
        "No products found" +
          (searchTerm ? ' matching "' + searchTerm + '"' : "") +
          categoryText,
      );
    } else if (count === 1) {
      $resultMessage.text(
        "Found 1 product" +
          (searchTerm ? ' matching "' + searchTerm + '"' : "") +
          categoryText,
      );
    } else {
      $resultMessage.text(
        "Found " +
          count +
          " products" +
          (searchTerm ? ' matching "' + searchTerm + '"' : "") +
          categoryText,
      );
    }
  }
});
