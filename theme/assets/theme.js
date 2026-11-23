/**
 * ORDON EGYPT — Storefront JS (Ozar Minimal Style)
 */

document.addEventListener('DOMContentLoaded', () => {
  const FREE_SHIPPING_LIMIT = 2000;
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-drawer-overlay');
  const branchesModal = document.getElementById('branches-modal');
  const sizeModal = document.getElementById('size-modal');

  // Drawer Triggers
  document.querySelectorAll('[data-cart-trigger]').forEach(btn => {
    btn.addEventListener('click', () => openCart());
  });
  document.querySelectorAll('[data-cart-close]').forEach(btn => {
    btn.addEventListener('click', () => closeCart());
  });

  // Branches Modal Triggers
  document.querySelectorAll('[data-branches-trigger]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals('branches');
      if (branchesModal) {
        branchesModal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  document.querySelectorAll('[data-branches-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (branchesModal) {
        branchesModal.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    });
  });

  // Size Modal Triggers
  document.querySelectorAll('[data-size-trigger]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals('size');
      if (sizeModal) {
        sizeModal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  document.querySelectorAll('[data-size-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (sizeModal) {
        sizeModal.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    });
  });

  function closeAllModals(except = null) {
    if (except !== 'cart') closeCart();
    if (except !== 'branches' && branchesModal) branchesModal.classList.remove('is-active');
    if (except !== 'size' && sizeModal) sizeModal.classList.remove('is-active');
  }

  function openCart() {
    closeAllModals('cart');
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add('is-active');
      cartOverlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.remove('is-active');
      cartOverlay.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  }

  // Escape key listener
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      if (branchesModal) branchesModal.classList.remove('is-active');
      if (sizeModal) sizeModal.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  });

  // AJAX Quick Add to Shopify Cart (Non-Intrusive UX — never forces drawer open)
  document.querySelectorAll('[data-quick-add]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const variantId = btn.dataset.variantId;
      if (!variantId) return;

      btn.disabled = true;
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>Adding to bag...</span>';

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: 1 })
        });
        if (res.ok) {
          const cartRes = await fetch('/cart.js');
          const cartData = await cartRes.json();
          document.querySelectorAll('.cart-counter-badge').forEach(badge => {
            badge.innerText = cartData.item_count;
            badge.classList.remove('animate-badge-pop');
            void badge.offsetWidth;
            badge.classList.add('animate-badge-pop');
          });
        }
      } catch (err) {
        console.error('Add to cart failed', err);
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  });
});

/* Video Reel Play / Pause & Audio Controls */
function toggleReelPlay(card, event) {
  if (event.target.closest('button') || event.target.closest('a')) return;
  const video = card.querySelector('video');
  const playBadge = card.querySelector('.center-play-badge');
  const playStateIcon = card.querySelector('.play-state-icon');

  document.querySelectorAll('.reel-video').forEach(v => {
    if (v !== video) {
      v.pause();
      const parent = v.closest('.reel-card');
      if (parent) {
        const badge = parent.querySelector('.center-play-badge');
        if (badge) badge.style.opacity = '1';
        const stateIcon = parent.querySelector('.play-state-icon');
        if (stateIcon) stateIcon.innerText = '▶';
      }
    }
  });

  if (video.paused) {
    video.play();
    if (playBadge) playBadge.style.opacity = '0';
    if (playStateIcon) playStateIcon.innerText = '⏸';
  } else {
    video.pause();
    if (playBadge) playBadge.style.opacity = '1';
    if (playStateIcon) playStateIcon.innerText = '▶';
  }
}

function toggleMute(btn, event) {
  event.stopPropagation();
  const card = btn.closest('.reel-card');
  const video = card.querySelector('video');
  const soundIcon = btn.querySelector('.sound-icon');
  if (video.muted) {
    video.muted = false;
    soundIcon.innerText = '🔊';
  } else {
    video.muted = true;
    soundIcon.innerText = '🔇';
  }
}

/* GRC & Consumer Rights Modal */
function openGrcModal() {
  const m = document.getElementById('grc-modal');
  if (m) {
    m.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }
}

function closeGrcModal() {
  const m = document.getElementById('grc-modal');
  if (m) {
    m.classList.remove('is-active');
    document.body.style.overflow = '';
  }
}

/* Privacy Toast */
function acceptPrivacy() {
  const toast = document.getElementById('privacy-toast');
  if (toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }
  localStorage.setItem('ordon_privacy_accepted', '1');
}

if (localStorage.getItem('ordon_privacy_accepted') === '1') {
  const toast = document.getElementById('privacy-toast');
  if (toast) toast.remove();
}

/* Quick-Shop Mobile Bottom Sheet (CRO) */
let currentQuickItem = null;
let selectedSize = 'L';
let selectedQty = 1;

function openQuickShop(title, price, image, spec) {
  currentQuickItem = { title, price, image, spec };
  selectedSize = 'L';
  selectedQty = 1;

  const t = document.getElementById('qs-title');
  const p = document.getElementById('qs-price');
  const img = document.getElementById('qs-image');
  const sp = document.getElementById('qs-spec');
  const q = document.getElementById('qs-qty');

  if (t) t.innerText = title;
  if (p) p.innerText = `LE ${price.toLocaleString()}.00 EGP`;
  if (img) img.src = image;
  if (sp) sp.innerText = spec || '100% COTTON • STREETWEAR FIT';
  if (q) q.innerText = selectedQty;

  document.querySelectorAll('#qs-size-grid .size-pill').forEach(btn => {
    if (btn.innerText.trim() === 'L') {
      btn.classList.add('is-selected');
    } else {
      btn.classList.remove('is-selected');
    }
  });

  updateFitHint('L');
  updateQuickShopWhatsAppLink();

  const overlay = document.getElementById('quick-shop-overlay');
  const sheet = document.getElementById('quick-shop-sheet');
  if (overlay) overlay.classList.add('is-active');
  if (sheet) sheet.classList.add('is-active');
  document.body.style.overflow = 'hidden';
}

function closeQuickShop() {
  const overlay = document.getElementById('quick-shop-overlay');
  const sheet = document.getElementById('quick-shop-sheet');
  if (overlay) overlay.classList.remove('is-active');
  if (sheet) sheet.classList.remove('is-active');
  document.body.style.overflow = '';
  currentQuickItem = null;
}

function selectQuickSize(btn, size) {
  document.querySelectorAll('#qs-size-grid .size-pill').forEach(b => b.classList.remove('is-selected'));
  btn.classList.add('is-selected');
  selectedSize = size;
  updateFitHint(size);
  updateQuickShopWhatsAppLink();
}

function updateFitHint(size) {
  const hint = document.getElementById('qs-fit-hint');
  if (!hint) return;
  const hints = {
    'M': 'Size M مناسب لوزن 55 إلى 70 كجم (طول 72 سم).',
    'L': 'Size L مناسب لوزن 70 إلى 85 كجم (طول 75 سم) — الأكثر طلباً.',
    'XL': 'Size XL مناسب لوزن 85 إلى 100 كجم (طول 78 سم).',
    '2XL': 'Size 2XL مناسب لوزن 100 إلى 118 كجم (طول 81 سم).'
  };
  hint.innerHTML = hints[size] || '';
}

function changeQsQty(delta) {
  selectedQty = Math.max(1, selectedQty + delta);
  const q = document.getElementById('qs-qty');
  if (q) q.innerText = selectedQty;
  updateQuickShopWhatsAppLink();
}

function updateQuickShopWhatsAppLink() {
  if (!currentQuickItem) return;
  const btn = document.getElementById('qs-whatsapp-btn');
  if (!btn) return;
  const total = currentQuickItem.price * selectedQty;
  const text = `مرحباً فريق Ordon، أريد طلب القطعة التالية:%0A• ${currentQuickItem.title} - مقاس: ${selectedSize} - عدد: ${selectedQty}%0Aالإجمالي: ${total} EGP%0Aالعنوان:`;
  btn.href = `https://wa.me/201065052442?text=${text}`;
}

function confirmQuickShopAdd() {
  if (!currentQuickItem) return;
  if (typeof addToCart === 'function') {
    addToCart(currentQuickItem.title, currentQuickItem.price, selectedSize, currentQuickItem.image, selectedQty);
  }
  closeQuickShop();
}
