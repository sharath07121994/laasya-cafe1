/* ---------------- Theme toggle ---------------- */
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const savedTheme = localStorage.getItem('cafe_theme') || 'light';

function setTheme(theme) {
  body.setAttribute('data-theme', theme);
  localStorage.setItem('cafe_theme', theme);
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
});

/* ------------- Hero slider phrases ------------- */
const phrases = ['Fresh single-origin roasts', 'Handmade desserts', 'Cozy workspace & fast Wi-Fi', 'Barista-crafted drinks'];
let currentPhraseIndex = 0;
const slider = document.querySelector('.slider');

function rotatePhrase() {
  slider.textContent = phrases[currentPhraseIndex];
  currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
}

rotatePhrase();
setInterval(rotatePhrase, 2800);

/* -------------- Scroll nav effect -------------- */
const nav = document.querySelector('header.nav');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 40 ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))' : 'transparent';
});

/* ------------ Section reveal on scroll ----------- */
const sections = document.querySelectorAll('main section');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.18 });

sections.forEach(s => observer.observe(s));

/* --------------- Cart & WhatsApp --------------- */
const cart = {}; // id -> {id, name, price, qty}
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCart');
const whatsappOrderBtn = document.getElementById('whatsappOrder');

function renderCart() {
  cartItemsEl.innerHTML = '';
  const itemIds = Object.keys(cart);
  if (itemIds.length === 0) {
    cartItemsEl.innerHTML = '<p class="small">Cart is empty — add items from the menu.</p>';
    cartTotalEl.textContent = '₹0';
    return;
  }
  let total = 0;
  itemIds.forEach(id => {
    const item = cart[id];
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <div>
        <div class="menu-item-name">${item.name}</div>
        <div class="small">₹${item.price} × ${item.qty}</div>
      </div>
      <div class="cart-item-actions">
        <div class="total-price">₹${item.price * item.qty}</div>
        <div class="qty">
          <button data-decrease="${id}">−</button>
          <span>${item.qty}</span>
          <button data-increase="${id}">+</button>
        </div>
      </div>
    `;
    cartItemsEl.appendChild(row);
    total += item.price * item.qty;
  });
  cartTotalEl.textContent = `₹${total}`;

  // Attach event handlers for quantity buttons
  cartItemsEl.querySelectorAll('[data-increase]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-increase');
      cart[id].qty++;
      renderCart();
    });
  });
  cartItemsEl.querySelectorAll('[data-decrease]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-decrease');
      cart[id].qty--;
      if (cart[id].qty <= 0) {
        delete cart[id];
      }
      renderCart();
    });
  });
}

function addToCart(id, name, price) {
  if (cart[id]) {
    cart[id].qty++;
  } else {
    cart[id] = { id, name, price, qty: 1 };
  }
  renderCart();
}

// Add event listeners for menu buttons
document.querySelectorAll('[data-add]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const row = e.target.closest('.menu-row');
    addToCart(row.dataset.id, row.querySelector('.menu-item-name').textContent, parseInt(row.dataset.price, 10));
  });
});

// Add event listeners for quick add buttons
document.querySelectorAll('[data-add-short]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    addToCart(btn.dataset.id, btn.dataset.name, parseInt(btn.dataset.price, 10));
  });
});

// Clear cart event
clearCartBtn.addEventListener('click', () => {
  for (const key in cart) {
    delete cart[key];
  }
  renderCart();
});

// WhatsApp order event
whatsappOrderBtn.addEventListener('click', () => {
  const phone = '919999999999'; // REPLACE with your WhatsApp number (country code + number)
  const itemIds = Object.keys(cart);

  if (itemIds.length === 0) {
    alert('Your cart is empty. Please add some items to place an order.');
    return;
  }

  let total = 0;
  let orderText = `Hello, I'd like to place an order from *Café Name*:\n\n`;
  itemIds.forEach(id => {
    const item = cart[id];
    orderText += `• ${item.name} x ${item.qty} — ₹${item.price * item.qty}\n`;
    total += item.price * item.qty;
  });

  const notes = document.getElementById('orderNotes').value.trim();
  if (notes) {
    orderText += `\nNotes: ${notes}\n`;
  }
  
  orderText += `\nTotal: ₹${total}\n\nPlease confirm pickup or delivery details.`;

  // Encode and open WhatsApp
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(orderText)}`;
  window.open(url, '_blank');

  alert('Your order is being sent to WhatsApp. Please confirm the details there!');
});

/* initial render */
renderCart();