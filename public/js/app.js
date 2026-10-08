// PITCHLINE front end: a small single-page app with no build step.
(function () {
  const $app = document.getElementById('app');
  const A = window.Analytics;
  const state = { products: [], user: null, cart: load('pl_cart', []), wish: load('pl_wish', []), coupon: load('pl_coupon', null) };

  // ---------- helpers ----------
  function load(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  const money = (n) => '$' + Number(n).toFixed(2);
  const byId = (id) => state.products.find((p) => p.id === id);
  async function api(url, opts) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', ...opts });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  }
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function setTitle(t) { document.title = t ? `${t} | PITCHLINE` : 'PITCHLINE | Football Boots, Jerseys & Sportswear'; A.pageView(document.title); }

  function cartLines() {
    return state.cart.map((l) => ({ ...l, product: byId(l.id) })).filter((l) => l.product);
  }
  function updateBadges() {
    const n = state.cart.reduce((s, l) => s + l.quantity, 0);
    const cc = document.getElementById('cart-count'); cc.textContent = n; cc.hidden = !n;
    const wc = document.getElementById('wish-count'); wc.textContent = state.wish.length; wc.hidden = !state.wish.length;
  }
  function saveCart() { save('pl_cart', state.cart); updateBadges(); }

  // ---------- routing ----------
  function navigate(url, replace) {
    if (replace) history.replaceState({}, '', url); else history.pushState({}, '', url);
    render();
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-link]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    document.getElementById('main-nav').classList.remove('open');
    navigate(a.getAttribute('href'));
  });
  window.addEventListener('popstate', render);

  function render() {
    const path = location.pathname;
    const params = new URLSearchParams(location.search);
    window.scrollTo(0, 0);
    document.querySelectorAll('.main-nav a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === path + location.search));
    if (path === '/') return viewHome();
    if (path === '/shop') return viewShop(params);
    if (path.startsWith('/product/')) return viewProduct(decodeURIComponent(path.split('/')[2]));
    if (path === '/cart') return viewCart();
    if (path === '/checkout') return viewCheckout();
    if (path.startsWith('/order/')) return viewConfirmation(path.split('/')[2]);
    if (path === '/account') return viewAccount();
    if (path === '/wishlist') return viewWishlist();
    return viewNotFound();
  }

  // ---------- product card ----------
  function card(p, listId, listName, index) {
    const wished = state.wish.includes(p.id);
    return `<article class="card">
      <a href="/product/${p.id}" data-link class="card-link" data-select="${p.id}" data-list="${listId}" data-list-name="${esc(listName)}" data-index="${index}">
        <div class="card-media">${productArt(p)}
          ${p.isNew ? '<span class="tag">New</span>' : ''}${p.compareAt ? '<span class="tag tag-sale">Sale</span>' : ''}
        </div>
        <div class="card-body">
          <div class="card-price">${money(p.price)}${p.compareAt ? ` <s>${money(p.compareAt)}</s>` : ''}</div>
          <h3>${esc(p.name)}</h3>
          <p class="muted">${esc(p.gender)} · ${esc(p.sport)}</p>
        </div>
      </a>
      <button class="wish-btn ${wished ? 'on' : ''}" data-wish="${p.id}" aria-label="${wished ? 'Remove from' : 'Add to'} wishlist">
        <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>
      </button>
    </article>`;
  }
  // product-card clicks -> select_item ; heart -> add_to_wishlist
  $app.addEventListener('click', (e) => {
    const sel = e.target.closest('[data-select]');
    if (sel) A.selectItem(byId(sel.dataset.select), sel.dataset.list, sel.dataset.listName, +sel.dataset.index);
    const w = e.target.closest('[data-wish]');
    if (w) {
      e.preventDefault();
      const id = w.dataset.wish;
      if (state.wish.includes(id)) { state.wish = state.wish.filter((x) => x !== id); toast('Removed from wishlist'); }
      else { state.wish.push(id); A.addToWishlist(byId(id)); toast('Added to wishlist'); }
      save('pl_wish', state.wish); updateBadges();
      w.classList.toggle('on', state.wish.includes(id));
      if (location.pathname === '/wishlist') viewWishlist();
    }
  }, true);

  // ---------- views ----------
  const PROMOS = [
    { id: 'promo_strike', name: 'Strike Elite launch', creative: 'hero_strike_red', slot: 'hero_main', href: '/product/PL-BT-001' },
    { id: 'promo_kits', name: 'New season kits 26/27', creative: 'tile_kits', slot: 'tile_left', href: '/shop?category=Jerseys' },
    { id: 'promo_run', name: 'Velocity running', creative: 'tile_run', slot: 'tile_right', href: '/shop?sport=Running' },
  ];

  function viewHome() {
    setTitle('');
    const featured = state.products.filter((p) => p.featured);
    const fresh = state.products.filter((p) => p.isNew);
    const strike = byId('PL-BT-001');
    $app.innerHTML = `
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">New · Strike Elite</p>
          <h1>FASTER<br/>THAN<br/>THE PRESS</h1>
          <p>190 grams of pure speed. Built for players who finish before the defence turns.</p>
          <div class="hero-actions">
            <a href="${PROMOS[0].href}" data-link class="btn" data-promo="0">Shop Strike Elite <span class="arrow">→</span></a>
            <a href="/shop?category=Boots" data-link class="btn btn-ghost">All boots</a>
          </div>
        </div>
        <div class="hero-art">${productArt(strike, { bg: '#f6f1e9' })}</div>
      </section>

      <section class="tiles">
        <a href="${PROMOS[1].href}" data-link class="tile tile-blue" data-promo="1">
          <div>${productArt(byId('PL-JR-002'), { bg: 'transparent' })}</div>
          <span>NEW SEASON KITS 26/27 <span class="arrow">→</span></span>
        </a>
        <a href="${PROMOS[2].href}" data-link class="tile tile-lime" data-promo="2">
          <div>${productArt(byId('PL-FW-001'), { bg: 'transparent' })}</div>
          <span>VELOCITY RUNNING <span class="arrow">→</span></span>
        </a>
      </section>

      <section class="rail">
        <div class="rail-head"><h2>TRENDING NOW</h2><a href="/shop" data-link class="link-underline">View all</a></div>
        <div class="grid grid-4">${featured.map((p, i) => card(p, 'home_trending', 'Home - Trending', i)).join('')}</div>
      </section>

      <section class="cats">
        <h2>SHOP BY CATEGORY</h2>
        <div class="cat-row">
          ${['Boots', 'Jerseys', 'Balls', 'Footwear', 'Apparel', 'Accessories'].map((c) => `<a href="/shop?category=${c}" data-link class="cat-pill">${c.toUpperCase()}</a>`).join('')}
        </div>
      </section>

      <section class="rail">
        <div class="rail-head"><h2>NEW ARRIVALS</h2><a href="/shop?new=1" data-link class="link-underline">View all</a></div>
        <div class="grid grid-4">${fresh.slice(0, 4).map((p, i) => card(p, 'home_new', 'Home - New arrivals', i)).join('')}</div>
      </section>

      <section class="banner-dark">
        <h2>MEMBERS GET MORE</h2>
        <p>Sign up for free and get 10% off your first order with code KICKOFF10.</p>
        <a href="/account" data-link class="btn btn-light">Join now <span class="arrow">→</span></a>
      </section>`;
    A.viewPromotion(PROMOS);
    A.viewItemList(featured, 'home_trending', 'Home - Trending');
    A.viewItemList(fresh.slice(0, 4), 'home_new', 'Home - New arrivals');
    $app.querySelectorAll('[data-promo]').forEach((el) => el.addEventListener('click', () => A.selectPromotion(PROMOS[+el.dataset.promo])));
  }

  const FILTERS = ['category', 'sport', 'gender', 'collection'];
  function viewShop(params) {
    const q = (params.get('q') || '').trim();
    let list = state.products.slice();
    FILTERS.forEach((f) => { const v = params.get(f); if (v) list = list.filter((p) => p[f] === v); });
    if (params.get('sale')) list = list.filter((p) => p.compareAt);
    if (params.get('new')) list = list.filter((p) => p.isNew);
    if (q) {
      const t = q.toLowerCase();
      list = list.filter((p) => [p.name, p.category, p.sport, p.gender, p.collection, p.color].join(' ').toLowerCase().includes(t));
    }
    const sort = params.get('sort') || 'featured';
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'new') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

    const active = FILTERS.map((f) => params.get(f)).filter(Boolean);
    const heading = q ? `RESULTS FOR "${esc(q.toUpperCase())}"` : params.get('sale') ? 'SALE' : params.get('new') ? 'NEW ARRIVALS' : active.length ? active.join(' · ').toUpperCase() : 'ALL PRODUCTS';
    const listId = q ? 'search_results' : 'shop_' + (active.join('_').toLowerCase() || (params.get('sale') ? 'sale' : 'all'));
    const listName = q ? 'Search results' : 'Shop - ' + (active.join(' / ') || (params.get('sale') ? 'Sale' : params.get('new') ? 'New' : 'All'));

    const options = (f) => [...new Set(state.products.map((p) => p[f]))].sort();
    setTitle(q ? `Search: ${q}` : heading.charAt(0) + heading.slice(1).toLowerCase());
    $app.innerHTML = `
      <section class="shop">
        <div class="shop-head">
          <h1>${heading} <span class="count">[${list.length}]</span></h1>
        </div>
        <div class="filter-bar">
          ${FILTERS.map((f) => `<label class="select"><span>${f}</span><select data-filter="${f}">
              <option value="">All</option>${options(f).map((o) => `<option ${params.get(f) === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}
            </select></label>`).join('')}
          <label class="select"><span>Sort</span><select data-filter="sort">
            ${[['featured', 'Featured'], ['new', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']].map(([v, l]) => `<option value="${v}" ${sort === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select></label>
          ${active.length || q || params.get('sale') || params.get('new') ? '<a href="/shop" data-link class="link-underline">Clear all</a>' : ''}
        </div>
        ${list.length ? `<div class="grid grid-4">${list.map((p, i) => card(p, listId, listName, i)).join('')}</div>`
          : `<div class="empty"><h2>NO MATCHES</h2><p>Try a different search or clear the filters.</p><a href="/shop" data-link class="btn">Shop everything <span class="arrow">→</span></a></div>`}
      </section>`;
    $app.querySelectorAll('[data-filter]').forEach((sel) => sel.addEventListener('change', () => {
      const p = new URLSearchParams(location.search);
      if (sel.value) p.set(sel.dataset.filter, sel.value); else p.delete(sel.dataset.filter);
      if (sel.value && sel.dataset.filter !== 'sort') A.filterUsed(sel.dataset.filter, sel.value);
      navigate('/shop?' + p.toString());
    }));
    if (q) A.search(q, list.length);
    A.viewItemList(list, listId, listName);
  }

  function viewProduct(id) {
    const p = byId(id);
    if (!p) return viewNotFound();
    setTitle(p.name);
    const related = state.products.filter((x) => x.id !== p.id && (x.collection === p.collection || x.category === p.category)).slice(0, 4);
    let size = p.sizes.length === 1 ? p.sizes[0] : null;
    $app.innerHTML = `
      <nav class="crumbs"><a href="/" data-link>Home</a> / <a href="/shop?category=${p.category}" data-link>${esc(p.category)}</a> / <span>${esc(p.name)}</span></nav>
      <section class="pdp">
        <div class="pdp-media">${productArt(p)}</div>
        <div class="pdp-info">
          <p class="eyebrow">${esc(p.gender)} · ${esc(p.sport)} · ${esc(p.collection)}</p>
          <h1>${esc(p.name.toUpperCase())}</h1>
          <div class="pdp-price">${money(p.price)}${p.compareAt ? ` <s>${money(p.compareAt)}</s> <span class="save">Save ${money(p.compareAt - p.price)}</span>` : ''}</div>
          <p class="pdp-color"><span class="swatch" style="background:${p.colorHex}"></span> ${esc(p.color)}</p>
          <div class="sizes-head"><strong>Select size</strong></div>
          <div class="sizes">${p.sizes.map((s) => `<button class="size ${size === s ? 'on' : ''}" data-size="${esc(s)}">${esc(s)}</button>`).join('')}</div>
          <p class="error" id="size-error" hidden>Please select a size.</p>
          <div class="pdp-actions">
            <button class="btn btn-block" id="add-btn">Add to bag <span class="arrow">→</span></button>
            <button class="btn btn-ghost square wish-btn-pdp ${state.wish.includes(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Wishlist">
              <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>
            </button>
          </div>
          <ul class="perks"><li>Free standard delivery over $100</li><li>Free returns within 30 days</li></ul>
          <details open><summary>Description</summary><p>${esc(p.description)}</p></details>
          <details><summary>Details</summary><ul>${p.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></details>
        </div>
      </section>
      ${related.length ? `<section class="rail"><div class="rail-head"><h2>YOU MAY ALSO LIKE</h2></div>
        <div class="grid grid-4">${related.map((r, i) => card(r, 'pdp_related', 'Product - You may also like', i)).join('')}</div></section>` : ''}`;
    $app.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', () => {
      size = b.dataset.size;
      $app.querySelectorAll('[data-size]').forEach((x) => x.classList.toggle('on', x === b));
      document.getElementById('size-error').hidden = true;
    }));
    document.getElementById('add-btn').addEventListener('click', () => {
      if (!size) { document.getElementById('size-error').hidden = false; return; }
      const existing = state.cart.find((l) => l.id === p.id && l.size === size);
      if (existing) existing.quantity = Math.min(10, existing.quantity + 1); else state.cart.push({ id: p.id, size, quantity: 1 });
      saveCart();
      A.addToCart(p, size, 1);
      toast(`Added ${p.name} (${size}) to your bag`);
    });
    A.viewItem(p);
    if (related.length) A.viewItemList(related, 'pdp_related', 'Product - You may also like');
  }

  async function quote(shippingMethod) {
    return api('/api/cart/quote', { method: 'POST', body: JSON.stringify({ items: state.cart, coupon: state.coupon, shippingMethod }) });
  }

  async function viewCart(skipEvent) {
    setTitle('Your bag');
    const lines = cartLines();
    if (!lines.length) {
      $app.innerHTML = `<section class="empty page"><h1>YOUR BAG IS EMPTY</h1><p>Once you add something to your bag, it will appear here.</p><a href="/shop" data-link class="btn">Get started <span class="arrow">→</span></a></section>`;
      return;
    }
    const q = await quote('standard');
    $app.innerHTML = `
      <section class="cart page">
        <div class="cart-main">
          <h1>YOUR BAG</h1>
          <p class="muted">${lines.reduce((s, l) => s + l.quantity, 0)} items · ${money(q.subtotal)}</p>
          ${lines.map((l, i) => `
            <div class="line">
              <a href="/product/${l.id}" data-link class="line-media">${productArt(l.product)}</a>
              <div class="line-info">
                <div class="line-top"><a href="/product/${l.id}" data-link><strong>${esc(l.product.name.toUpperCase())}</strong></a><span>${money(l.product.price * l.quantity)}</span></div>
                <p class="muted">${esc(l.product.color)} · Size ${esc(l.size)}</p>
                <div class="line-actions">
                  <label class="select small"><span>Qty</span><select data-qty="${i}">${[...Array(10)].map((_, n) => `<option ${l.quantity === n + 1 ? 'selected' : ''}>${n + 1}</option>`).join('')}</select></label>
                  <button class="link-underline" data-remove="${i}">Remove</button>
                </div>
              </div>
            </div>`).join('')}
        </div>
        <aside class="summary">
          <h2>ORDER SUMMARY</h2>
          <div class="row"><span>Subtotal</span><span>${money(q.subtotal)}</span></div>
          ${q.coupon ? `<div class="row good"><span>Promo ${esc(q.coupon)}</span><span>-${money(q.couponDiscount)}</span></div>` : ''}
          <div class="row"><span>Delivery</span><span>${q.shipping ? money(q.shipping) : 'Free'}</span></div>
          <div class="row"><span>VAT (5%)</span><span>${money(q.tax)}</span></div>
          <div class="row total"><span>Total</span><span>${money(q.total)}</span></div>
          <form class="promo" id="promo-form">
            <input id="promo-input" placeholder="Promo code" value="${esc(state.coupon || '')}" aria-label="Promo code" />
            <button class="btn btn-ghost" type="submit">Apply</button>
          </form>
          ${state.coupon && !q.coupon ? '<p class="error">This code does not apply to your bag yet.</p>' : ''}
          <a href="/checkout" data-link class="btn btn-block">Checkout <span class="arrow">→</span></a>
          <p class="muted small">Try codes KICKOFF10 or GOAL20 (orders over $150).</p>
        </aside>
      </section>`;
    $app.querySelectorAll('[data-qty]').forEach((s) => s.addEventListener('change', () => {
      const line = state.cart[+s.dataset.qty];
      const diff = +s.value - line.quantity;
      if (diff > 0) A.addToCart(byId(line.id), line.size, diff);
      if (diff < 0) A.removeFromCart(byId(line.id), line.size, -diff);
      line.quantity = +s.value; saveCart(); viewCart(true);
    }));
    $app.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => {
      const [line] = state.cart.splice(+b.dataset.remove, 1);
      A.removeFromCart(byId(line.id), line.size, line.quantity);
      saveCart(); viewCart(true);
    }));
    document.getElementById('promo-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('promo-input').value.trim();
      if (!code) { state.coupon = null; save('pl_coupon', null); return viewCart(true); }
      try { const c = await api('/api/coupons/validate', { method: 'POST', body: JSON.stringify({ code }) }); state.coupon = c.code; save('pl_coupon', c.code); toast(c.label); viewCart(true); }
      catch (err) { toast(err.message); }
    });
    if (!skipEvent) A.viewCart(lines);
  }

  async function viewCheckout() {
    const lines = cartLines();
    if (!lines.length) return navigate('/cart', true);
    if (!state.user) { sessionStorage.setItem('pl_after_login', '/checkout'); toast('Sign in or create an account to check out'); return navigate('/account', true); }
    setTitle('Checkout');
    A.beginCheckout(lines, state.coupon);
    const ck = { step: 1, shippingMethod: 'standard', paymentType: 'Card', address: { name: state.user.name, line1: '', city: '', country: 'United Arab Emirates' } };

    async function draw() {
      const q = await quote(ck.shippingMethod);
      const stepCls = (n) => (ck.step === n ? 'step on' : ck.step > n ? 'step done' : 'step');
      $app.innerHTML = `
        <section class="checkout page">
          <div class="checkout-main">
            <h1>CHECKOUT</h1>
            <ol class="steps"><li class="${stepCls(1)}">1. Delivery</li><li class="${stepCls(2)}">2. Payment</li><li class="${stepCls(3)}">3. Review</li></ol>
            ${ck.step === 1 ? `
              <form id="ship-form" class="form">
                <label>Full name<input name="name" required value="${esc(ck.address.name)}" /></label>
                <label>Address<input name="line1" required value="${esc(ck.address.line1)}" placeholder="Street and building" /></label>
                <div class="form-row">
                  <label>City<input name="city" required value="${esc(ck.address.city)}" /></label>
                  <label>Country<select name="country">${['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'India', 'United Kingdom', 'United States', 'Germany', 'Other'].map((c) => `<option ${ck.address.country === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
                </div>
                <fieldset class="choices"><legend>Delivery speed</legend>
                  <label class="choice"><input type="radio" name="ship" value="standard" ${ck.shippingMethod === 'standard' ? 'checked' : ''}/> Standard (3-5 days) <span>$7.99 · free over $100</span></label>
                  <label class="choice"><input type="radio" name="ship" value="express" ${ck.shippingMethod === 'express' ? 'checked' : ''}/> Express (1-2 days) <span>$19.99</span></label>
                </fieldset>
                <button class="btn btn-block">Continue to payment <span class="arrow">→</span></button>
              </form>` : ''}
            ${ck.step === 2 ? `
              <form id="pay-form" class="form">
                <fieldset class="choices"><legend>Payment method</legend>
                  ${['Card', 'Apple Pay', 'PayPal', 'Cash on delivery'].map((m) => `<label class="choice"><input type="radio" name="pay" value="${m}" ${ck.paymentType === m ? 'checked' : ''}/> ${m}</label>`).join('')}
                </fieldset>
                <p class="note">Demo store: no real payment is taken and no card details are collected.</p>
                <div class="form-actions"><button type="button" class="link-underline" id="back-1">Back</button><button class="btn">Review order <span class="arrow">→</span></button></div>
              </form>` : ''}
            ${ck.step === 3 ? `
              <div class="review">
                <div><h3>Delivery</h3><p>${esc(ck.address.name)}<br/>${esc(ck.address.line1)}<br/>${esc(ck.address.city)}, ${esc(ck.address.country)}<br/>${esc(q.shippingTier)}</p></div>
                <div><h3>Payment</h3><p>${esc(ck.paymentType)}</p></div>
                <p class="error" id="order-error" hidden></p>
                <div class="form-actions"><button type="button" class="link-underline" id="back-2">Back</button><button class="btn" id="place-btn">Place order · ${money(q.total)} <span class="arrow">→</span></button></div>
              </div>` : ''}
          </div>
          <aside class="summary">
            <h2>ORDER SUMMARY</h2>
            ${q.lines.map((l) => `<div class="mini-line"><div class="mini-media">${productArt(byId(l.id))}</div><div><strong>${esc(l.name)}</strong><p class="muted">Size ${esc(l.size)} · Qty ${l.quantity}</p></div><span>${money(l.price * l.quantity)}</span></div>`).join('')}
            <div class="row"><span>Subtotal</span><span>${money(q.subtotal)}</span></div>
            ${q.coupon ? `<div class="row good"><span>Promo ${esc(q.coupon)}</span><span>-${money(q.couponDiscount)}</span></div>` : ''}
            <div class="row"><span>Delivery</span><span>${q.shipping ? money(q.shipping) : 'Free'}</span></div>
            <div class="row"><span>VAT (5%)</span><span>${money(q.tax)}</span></div>
            <div class="row total"><span>Total</span><span>${money(q.total)}</span></div>
          </aside>
        </section>`;

      if (ck.step === 1) document.getElementById('ship-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        ck.address = { name: f.get('name'), line1: f.get('line1'), city: f.get('city'), country: f.get('country') };
        ck.shippingMethod = f.get('ship');
        A.addShippingInfo(lines, ck.shippingMethod === 'express' ? 'Express' : 'Standard', q.coupon);
        ck.step = 2; draw();
      });
      if (ck.step === 2) {
        document.getElementById('back-1').addEventListener('click', () => { ck.step = 1; draw(); });
        document.getElementById('pay-form').addEventListener('submit', (e) => {
          e.preventDefault();
          ck.paymentType = new FormData(e.target).get('pay');
          A.addPaymentInfo(lines, ck.paymentType, q.coupon);
          ck.step = 3; draw();
        });
      }
      if (ck.step === 3) {
        document.getElementById('back-2').addEventListener('click', () => { ck.step = 2; draw(); });
        document.getElementById('place-btn').addEventListener('click', async (e) => {
          e.target.disabled = true;
          try {
            const { order } = await api('/api/orders', { method: 'POST', body: JSON.stringify({ items: state.cart, coupon: state.coupon, shippingMethod: ck.shippingMethod, paymentType: ck.paymentType, address: ck.address }) });
            A.purchase(order, byId);
            state.cart = []; state.coupon = null; saveCart(); save('pl_coupon', null);
            sessionStorage.setItem('pl_last_order', JSON.stringify(order));
            navigate('/order/' + order.id, true);
          } catch (err) {
            const el = document.getElementById('order-error'); el.textContent = err.message; el.hidden = false; e.target.disabled = false;
          }
        });
      }
    }
    draw();
  }

  function viewConfirmation(id) {
    setTitle('Order confirmed');
    let order = null;
    try { order = JSON.parse(sessionStorage.getItem('pl_last_order')); } catch {}
    $app.innerHTML = `
      <section class="confirm page">
        <div class="check">✓</div>
        <h1>THANK YOU${state.user ? ', ' + esc(state.user.name.split(' ')[0].toUpperCase()) : ''}!</h1>
        <p>Your order <strong>${esc(id)}</strong> is confirmed${order && order.id === id ? ` · total ${money(order.total)}` : ''}.</p>
        <p class="muted">This is a demo store, so nothing will be shipped.</p>
        <div class="hero-actions center"><a href="/account" data-link class="btn">View my orders <span class="arrow">→</span></a><a href="/shop" data-link class="btn btn-ghost">Keep shopping</a></div>
      </section>`;
  }

  async function viewAccount() {
    if (state.user) {
      setTitle('My account');
      const orders = await api('/api/orders').catch(() => []);
      $app.innerHTML = `
        <section class="account page">
          <div class="account-head"><div><p class="eyebrow">Member since ${new Date(state.user.createdAt).toLocaleDateString()}</p><h1>HI ${esc(state.user.name.split(' ')[0].toUpperCase())}</h1><p class="muted">${esc(state.user.email)} · Favourite sport: ${esc(state.user.favouriteSport)}</p></div>
            <button class="btn btn-ghost" id="logout-btn">Log out</button></div>
          <h2>MY ORDERS</h2>
          ${orders.length ? `<div class="orders">${orders.map((o) => `
            <div class="order"><div><strong>${esc(o.id)}</strong><p class="muted">${new Date(o.createdAt).toLocaleString()} · ${o.lines.reduce((s, l) => s + l.quantity, 0)} items · ${esc(o.paymentType)}</p></div><span>${money(o.total)}</span>
            <div class="order-items">${o.lines.map((l) => `<span>${esc(l.name)} (${esc(l.size)}) ×${l.quantity}</span>`).join('')}</div></div>`).join('')}</div>`
          : '<p class="muted">No orders yet. <a href="/shop" data-link class="link-underline">Start shopping</a></p>'}
        </section>`;
      document.getElementById('logout-btn').addEventListener('click', async () => {
        await api('/api/auth/logout', { method: 'POST' }); state.user = null; A.setUser(null); toast('Logged out'); navigate('/');
      });
      return;
    }
    setTitle('Sign in');
    $app.innerHTML = `
      <section class="auth page">
        <div class="auth-card">
          <h1>SIGN IN</h1>
          <form id="login-form" class="form">
            <label>Email<input type="email" name="email" required autocomplete="email" /></label>
            <label>Password<input type="password" name="password" required autocomplete="current-password" /></label>
            <p class="error" id="login-error" hidden></p>
            <button class="btn btn-block">Sign in <span class="arrow">→</span></button>
          </form>
        </div>
        <div class="auth-card dark">
          <h1>JOIN PITCHLINE</h1>
          <p>Free to join. Track orders, save favourites and get 10% off with KICKOFF10.</p>
          <form id="signup-form" class="form">
            <label>Full name<input name="name" required autocomplete="name" /></label>
            <label>Email<input type="email" name="email" required autocomplete="email" /></label>
            <label>Password<input type="password" name="password" required minlength="6" autocomplete="new-password" /></label>
            <label>Favourite sport<select name="favouriteSport">${['Football', 'Running', 'Basketball', 'Training', 'Lifestyle'].map((s) => `<option>${s}</option>`).join('')}</select></label>
            <p class="error" id="signup-error" hidden></p>
            <button class="btn btn-light btn-block">Create account <span class="arrow">→</span></button>
          </form>
        </div>
      </section>`;
    const after = () => { const to = sessionStorage.getItem('pl_after_login') || '/account'; sessionStorage.removeItem('pl_after_login'); navigate(to, true); };
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try { const { user } = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(e.target))) }); state.user = user; A.setUser(user); A.login(); toast('Welcome back, ' + user.name.split(' ')[0]); after(); }
      catch (err) { const el = document.getElementById('login-error'); el.textContent = err.message; el.hidden = false; }
    });
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try { const { user } = await api('/api/auth/signup', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(e.target))) }); state.user = user; A.setUser(user); A.signUp(); toast('Welcome to PITCHLINE, ' + user.name.split(' ')[0]); after(); }
      catch (err) { const el = document.getElementById('signup-error'); el.textContent = err.message; el.hidden = false; }
    });
  }

  function viewWishlist() {
    setTitle('Wishlist');
    const list = state.wish.map(byId).filter(Boolean);
    $app.innerHTML = list.length
      ? `<section class="shop"><div class="shop-head"><h1>MY WISHLIST <span class="count">[${list.length}]</span></h1></div><div class="grid grid-4">${list.map((p, i) => card(p, 'wishlist', 'Wishlist', i)).join('')}</div></section>`
      : `<section class="empty page"><h1>YOUR WISHLIST IS EMPTY</h1><p>Tap the heart on any product to save it here.</p><a href="/shop" data-link class="btn">Browse products <span class="arrow">→</span></a></section>`;
  }

  function viewNotFound() {
    setTitle('Page not found');
    $app.innerHTML = `<section class="empty page"><h1>OFFSIDE!</h1><p>That page doesn't exist.</p><a href="/" data-link class="btn">Back to home <span class="arrow">→</span></a></section>`;
  }

  // ---------- header: search + mobile menu ----------
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('search-input').value.trim();
    if (q) navigate('/shop?q=' + encodeURIComponent(q));
  });
  document.getElementById('menu-btn').addEventListener('click', () => document.getElementById('main-nav').classList.toggle('open'));

  // ---------- boot ----------
  (async function init() {
    $app.innerHTML = '<div class="loading">Loading…</div>';
    const [products, me] = await Promise.all([api('/api/products'), api('/api/auth/me').catch(() => ({ user: null }))]);
    state.products = products;
    state.user = me.user;
    A.setUser(state.user);
    state.cart = state.cart.filter((l) => byId(l.id));
    updateBadges();
    render();
  })();
})();
