
function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function saveCart(cart) {
  const user = getUser();
  if (user) {
    localStorage.setItem(cart_${user.email}, JSON.stringify(cart));
  }
}

function getCart() {
  const user = getUser();
  if (user) {
    return JSON.parse(localStorage.getItem(cart_${user.email})) || [];
  }
  return [];
}

document.addEventListener("DOMContentLoaded", () => {
 
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const user = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        address: document.getElementById("address").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        password: document.getElementById("password").value,
      };

      fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Registration failed");
          return res.json();
        })
        .then(() => {
          alert("Registration successful. Please log in.");
          window.location.href = "login.html";
        })
        .catch((err) => alert(err.message));
    });
  }

  // ===== Login Page Logic =====
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const credentials = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
      };

      fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Login failed");
          return res.json();
        })
        .then((data) => {
          localStorage.setItem("user", JSON.stringify(data));
          window.location.href = "home.html";
        })
        .catch((err) => alert(err.message));
    });
  }

  const productList = document.getElementById("product-list");
  if (productList) {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((products) => {
        products.forEach((product) => {
          const card = document.createElement("div");
          card.className = "product-card";
          card.innerHTML = `
            <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>₦${product.price}</p>
            <button data-id="${product.id}">Add to Cart</button>
          `;
          productList.appendChild(card);
        });

        document.querySelectorAll("button[data-id]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const user = getUser();
            if (!user) {
              window.location.href = "login.html";
              return;
            }

            const productId = btn.getAttribute("data-id");
            const cart = getCart();
            cart.push(productId);
            saveCart(cart);
            alert("✅ Product added to cart!");
          });
        });
      })
      .catch((err) => console.error("Failed to load products:", err));
  }

  const cartItemsDiv = document.getElementById("cart-items");
  if (cartItemsDiv) {
    const user = getUser();
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const cart = getCart();
    if (cart.length === 0) {
      cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((products) => {
        const productMap = {};
        products.forEach((p) => (productMap[p.id] = p));

        cart.forEach((id) => {
          const product = productMap[id];
          if (!product) return;

          const item = document.createElement("div");
          item.className = "product-card";
          item.innerHTML = `
            <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p>₦${product.price}</p>
          `;
          cartItemsDiv.appendChild(item);
        });
      })
      .catch((err) => console.error("Failed to load cart items:", err));
  }
});


const loginBtn = document.getElementById("loginBtn");
const userInfo = document.getElementById("userInfo");

const currentUser = getUser();
if (loginBtn && userInfo) {
  if (currentUser) {
    loginBtn.style.display = "none";
    userInfo.textContent = 👋 ${currentUser.firstName || currentUser.email};
  } else {
    loginBtn.style.display = "inline-block";
    userInfo.textContent = "";
  }
}

if (!user) {
  window.location.href = "login.html";
  return;
}