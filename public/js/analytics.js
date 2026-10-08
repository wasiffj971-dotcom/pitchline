// PITCHLINE analytics layer
// Loads Google Analytics 4 (gtag.js) and exposes small helpers that send the
// standard GA4 ecommerce events. Using Google's standard event and parameter
// names means GA4 fills its built-in Monetization reports automatically, and the
// same fields show up in Power BI.
//
// Event map (where each fires is in app.js):
//   page_view          every route change (SPA, so sent manually)
//   view_item_list     shop grid / home product rails shown
//   select_item        product card clicked
//   view_item          product page opened
//   add_to_wishlist    heart clicked
//   add_to_cart        "Add to bag"
//   remove_from_cart   item removed from bag
//   view_cart          bag page opened
//   begin_checkout     checkout page opened
//   add_shipping_info  shipping step completed
//   add_payment_info   payment step completed
//   purchase           order placed (server-confirmed order id)
//   sign_up / login    account events
//   search             search submitted
//   view_promotion / select_promotion   home page hero banners

(function () {
  const cfg = window.PITCHLINE_CONFIG || {};
  const MEASUREMENT_ID = cfg.gaMeasurementId;
  const BRAND = 'PITCHLINE';
  const CURRENCY = 'USD';
  const debug = /[?&]debug_mode=1/.test(location.search) || localStorageGet('pl_debug') === '1';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  if (MEASUREMENT_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(s);
    gtag('js', new Date());
    // send_page_view false: the app sends page_view itself on each route change.
    gtag('config', MEASUREMENT_ID, { send_page_view: false, debug_mode: debug || undefined });
  }

  function localStorageGet(k) {
    try { return localStorage.getItem(k); } catch { return null; }
  }

  function send(name, params) {
    params = params || {};
    if (debug || !MEASUREMENT_ID) console.log('%c[GA4] ' + name, 'color:#1f6feb;font-weight:bold', params);
    if (MEASUREMENT_ID) gtag('event', name, params);
  }

  // Convert a catalog product into a GA4 "item". The item_category fields are the
  // ones you'll slice by in Power BI: Category > Sport > Gender > Collection.
  function toItem(p, extra) {
    extra = extra || {};
    const item = {
      item_id: p.id,
      item_name: p.name,
      item_brand: BRAND,
      item_category: p.category,
      item_category2: p.sport,
      item_category3: p.gender,
      item_category4: p.collection,
      item_category5: p.color,
      item_variant: extra.size ? p.color + ' / ' + extra.size : p.color,
      price: p.price,
      quantity: extra.quantity || 1,
    };
    if (p.compareAt) item.discount = +(p.compareAt - p.price).toFixed(2);
    if (extra.listName) item.item_list_name = extra.listName;
    if (extra.listId) item.item_list_id = extra.listId;
    if (typeof extra.index === 'number') item.index = extra.index;
    if (extra.coupon) item.coupon = extra.coupon;
    return item;
  }

  function sumValue(items) {
    return +items.reduce((s, i) => s + i.price * (i.quantity || 1), 0).toFixed(2);
  }

  window.Analytics = {
    enabled: !!MEASUREMENT_ID,
    toItem,

    pageView(title) {
      send('page_view', { page_title: title, page_location: location.href, page_path: location.pathname + location.search });
    },

    setUser(user) {
      if (!MEASUREMENT_ID) return;
      // user_id lets GA4 join one person's visits across devices. Never send email or name.
      gtag('config', MEASUREMENT_ID, { user_id: user ? user.id : null, send_page_view: false });
      gtag('set', 'user_properties', {
        favourite_sport: user ? user.favouriteSport : null,
        customer_status: user ? 'member' : 'guest',
      });
    },

    viewItemList(products, listId, listName) {
      if (!products.length) return;
      send('view_item_list', {
        item_list_id: listId,
        item_list_name: listName,
        items: products.slice(0, 200).map((p, i) => toItem(p, { index: i, listId, listName })),
      });
    },
    selectItem(p, listId, listName, index) {
      send('select_item', { item_list_id: listId, item_list_name: listName, items: [toItem(p, { index, listId, listName })] });
    },
    viewItem(p) {
      send('view_item', { currency: CURRENCY, value: p.price, items: [toItem(p)] });
    },
    addToWishlist(p) {
      send('add_to_wishlist', { currency: CURRENCY, value: p.price, items: [toItem(p)] });
    },
    addToCart(p, size, quantity) {
      const items = [toItem(p, { size, quantity })];
      send('add_to_cart', { currency: CURRENCY, value: sumValue(items), items });
    },
    removeFromCart(p, size, quantity) {
      const items = [toItem(p, { size, quantity })];
      send('remove_from_cart', { currency: CURRENCY, value: sumValue(items), items });
    },
    viewCart(lines) {
      const items = lines.map((l) => toItem(l.product, l));
      send('view_cart', { currency: CURRENCY, value: sumValue(items), items });
    },
    beginCheckout(lines, coupon) {
      const items = lines.map((l) => toItem(l.product, l));
      send('begin_checkout', { currency: CURRENCY, value: sumValue(items), coupon: coupon || undefined, items });
    },
    addShippingInfo(lines, tier, coupon) {
      const items = lines.map((l) => toItem(l.product, l));
      send('add_shipping_info', { currency: CURRENCY, value: sumValue(items), shipping_tier: tier, coupon: coupon || undefined, items });
    },
    addPaymentInfo(lines, paymentType, coupon) {
      const items = lines.map((l) => toItem(l.product, l));
      send('add_payment_info', { currency: CURRENCY, value: sumValue(items), payment_type: paymentType, coupon: coupon || undefined, items });
    },
    purchase(order, productLookup) {
      const items = order.lines.map((l) => toItem(productLookup(l.id), { size: l.size, quantity: l.quantity, coupon: order.coupon }));
      send('purchase', {
        transaction_id: order.id,
        currency: CURRENCY,
        value: +(order.total - order.tax - order.shipping).toFixed(2), // revenue excl. tax & shipping
        tax: order.tax,
        shipping: order.shipping,
        coupon: order.coupon || undefined,
        shipping_tier: order.shippingTier,
        payment_type: order.paymentType,
        items,
      });
    },
    signUp() { send('sign_up', { method: 'email' }); },
    login() { send('login', { method: 'email' }); },
    search(term, resultsCount) { send('search', { search_term: term, results_count: resultsCount }); },
    viewPromotion(promos) {
      send('view_promotion', { items: promos.map((p) => ({ promotion_id: p.id, promotion_name: p.name, creative_name: p.creative, creative_slot: p.slot })) });
    },
    selectPromotion(p) {
      send('select_promotion', { promotion_id: p.id, promotion_name: p.name, creative_name: p.creative, creative_slot: p.slot });
    },
    filterUsed(filterName, filterValue) {
      send('filter_products', { filter_name: filterName, filter_value: filterValue });
    },
  };
})();
