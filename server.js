// PITCHLINE store server
// Express API + static front end. Users and orders are kept in a small JSON file
// (data/db.json) so the project runs with no database setup.

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const products = require('./data/products');

const PORT = process.env.PORT || 3000;
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || ''; // e.g. G-XXXXXXXXXX
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret-in-production';
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// ---------- tiny JSON "database" ----------
function loadDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { users: [], orders: [] };
  }
}
let db = loadDb();
function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const COUPONS = {
  KICKOFF10: { type: 'percent', value: 10, label: '10% off your order' },
  GOAL20: { type: 'percent', value: 20, label: '20% off orders over $150', minSubtotal: 150 },
};
const SHIPPING = {
  standard: { label: 'Standard (3-5 days)', price: 7.99, freeOver: 100 },
  express: { label: 'Express (1-2 days)', price: 19.99 },
};

// Password hashing with Node's built-in scrypt (no extra dependency).
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, 'hex'));
}

const app = express();
app.set('trust proxy', 1); // needed on Render for secure cookies
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Front end reads the GA measurement ID from here, so it lives in an env var, not in code.
app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.PITCHLINE_CONFIG = ${JSON.stringify({ gaMeasurementId: GA_MEASUREMENT_ID })};`);
});

// ---------- products ----------
app.get('/api/products', (req, res) => res.json(products));
app.get('/api/products/:id', (req, res) => {
  const p = products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

// ---------- auth ----------
function publicUser(u) {
  return u ? { id: u.id, name: u.name, email: u.email, favouriteSport: u.favouriteSport, createdAt: u.createdAt } : null;
}

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, favouriteSport } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  const normalised = String(email).trim().toLowerCase();
  if (db.users.some((u) => u.email === normalised)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }
  const user = {
    id: 'U' + crypto.randomBytes(6).toString('hex'),
    name: String(name).trim(),
    email: normalised,
    favouriteSport: favouriteSport || 'Football',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  saveDb();
  req.session.userId = user.id;
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.users.find((u) => u.email === String(email || '').trim().toLowerCase());
  if (!user || !verifyPassword(password || '', user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  req.session.userId = user.id;
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/auth/me', (req, res) => {
  const user = db.users.find((u) => u.id === req.session.userId);
  res.json({ user: publicUser(user) });
});

// ---------- checkout ----------
// Prices are always recalculated on the server from the catalog, never trusted from the browser.
function priceCart(items, couponCode, shippingMethod) {
  const lines = [];
  for (const item of items || []) {
    const p = products.find((x) => x.id === item.id);
    const qty = Math.max(1, Math.min(10, parseInt(item.quantity, 10) || 1));
    if (!p) continue;
    if (!p.sizes.includes(item.size)) continue;
    lines.push({
      id: p.id, name: p.name, size: item.size, quantity: qty, price: p.price,
      category: p.category, sport: p.sport, gender: p.gender, collection: p.collection, color: p.color,
      discount: p.compareAt ? +(p.compareAt - p.price).toFixed(2) : 0,
    });
  }
  const subtotal = +lines.reduce((s, l) => s + l.price * l.quantity, 0).toFixed(2);

  let couponDiscount = 0;
  let coupon = null;
  if (couponCode) {
    const c = COUPONS[String(couponCode).trim().toUpperCase()];
    if (c && (!c.minSubtotal || subtotal >= c.minSubtotal)) {
      coupon = String(couponCode).trim().toUpperCase();
      couponDiscount = +((subtotal * c.value) / 100).toFixed(2);
    }
  }

  const ship = SHIPPING[shippingMethod] || SHIPPING.standard;
  const shipping = ship.freeOver && subtotal - couponDiscount >= ship.freeOver ? 0 : ship.price;
  const tax = +((subtotal - couponDiscount) * 0.05).toFixed(2); // 5% VAT
  const total = +(subtotal - couponDiscount + shipping + tax).toFixed(2);
  return { lines, subtotal, coupon, couponDiscount, shipping, shippingTier: ship.label, tax, total };
}

app.post('/api/cart/quote', (req, res) => {
  const { items, coupon, shippingMethod } = req.body || {};
  res.json(priceCart(items, coupon, shippingMethod));
});

app.post('/api/coupons/validate', (req, res) => {
  const code = String((req.body || {}).code || '').trim().toUpperCase();
  const c = COUPONS[code];
  if (!c) return res.status(404).json({ error: 'That code is not valid.' });
  res.json({ code, ...c });
});

app.post('/api/orders', (req, res) => {
  const user = db.users.find((u) => u.id === req.session.userId);
  if (!user) return res.status(401).json({ error: 'Please sign in to place an order.' });
  const { items, coupon, shippingMethod, paymentType, address } = req.body || {};
  const quote = priceCart(items, coupon, shippingMethod);
  if (!quote.lines.length) return res.status(400).json({ error: 'Your bag is empty.' });
  if (!address || !address.city || !address.country) {
    return res.status(400).json({ error: 'Please complete your delivery address.' });
  }
  const order = {
    id: 'PL' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase(),
    userId: user.id,
    createdAt: new Date().toISOString(),
    paymentType: paymentType || 'Card',
    address,
    ...quote,
  };
  db.orders.push(order);
  saveDb();
  res.status(201).json({ order });
});

app.get('/api/orders', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Please sign in.' });
  res.json(db.orders.filter((o) => o.userId === req.session.userId).reverse());
});

// ---------- front end ----------
app.use(express.static(path.join(__dirname, 'public')));
// Single-page app: any other route serves index.html so deep links work.
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`PITCHLINE running on http://localhost:${PORT}`);
  if (!GA_MEASUREMENT_ID) console.log('GA_MEASUREMENT_ID is not set - analytics events will only be logged to the browser console.');
});
