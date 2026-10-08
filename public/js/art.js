// Original SVG product illustrations, drawn in each product's colour.
// No photos needed, so there are no image licensing issues for the project.
(function () {
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }
  function isLight(hex) {
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 170;
  }

  const draw = {
    boot(c, d, a) {
      return `
        <path d="M60 210 C60 170 90 150 130 140 L200 120 C220 100 240 95 255 110 L275 135 C300 150 340 160 345 190 L345 210 Z" fill="${c}"/>
        <path d="M200 120 L255 110 L275 135 L215 150 Z" fill="${d}" opacity=".55"/>
        <path d="M120 175 L320 175" stroke="${a}" stroke-width="5" stroke-linecap="round"/>
        <path d="M150 138 L170 160 M175 131 L193 154 M200 124 L216 147" stroke="${a}" stroke-width="3" stroke-linecap="round"/>
        <rect x="55" y="208" width="295" height="12" rx="6" fill="#1a1a1a"/>
        <g fill="#1a1a1a">${[85, 125, 165, 230, 270, 310].map((x) => `<path d="M${x} 220 l6 18 h8 l6 -18z"/>`).join('')}</g>`;
    },
    shoe(c, d, a) {
      return `
        <path d="M55 205 C55 170 85 155 120 150 C150 145 175 120 205 112 C225 108 245 118 255 135 C285 150 335 160 345 185 L345 205 Z" fill="${c}"/>
        <path d="M205 112 C225 108 245 118 255 135 L215 150 Z" fill="${d}" opacity=".5"/>
        <path d="M110 178 C170 168 250 168 330 182" stroke="${a}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M160 140 L178 158 M182 130 L198 150 M204 122 L218 143" stroke="${a}" stroke-width="3" stroke-linecap="round"/>
        <path d="M52 203 H348 V218 C348 226 340 232 330 232 H70 C60 232 52 226 52 218 Z" fill="#f4f4f4" stroke="#1a1a1a" stroke-width="2"/>
        <path d="M60 225 H340" stroke="#1a1a1a" stroke-width="2" opacity=".25"/>`;
    },
    jersey(c, d, a) {
      return `
        <path d="M150 60 L120 70 L70 105 L95 150 L125 135 L125 260 L275 260 L275 135 L305 150 L330 105 L280 70 L250 60 C240 80 160 80 150 60 Z" fill="${c}"/>
        <path d="M150 60 C160 80 240 80 250 60" stroke="${d}" stroke-width="7" fill="none"/>
        <path d="M70 105 L95 150 L105 145 L80 100 Z M330 105 L305 150 L295 145 L320 100 Z" fill="${d}"/>
        <rect x="125" y="150" width="150" height="14" fill="${a}" opacity=".85"/>
        <circle cx="235" cy="115" r="12" fill="none" stroke="${a}" stroke-width="3"/>
        <path d="M235 103 V127" stroke="${a}" stroke-width="3"/>
        <text x="200" y="225" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="54" fill="${a}">10</text>`;
    },
    ball(c, d, a) {
      return `
        <circle cx="200" cy="160" r="105" fill="#f6f6f6" stroke="#1a1a1a" stroke-width="3"/>
        <path d="M200 115 L240 143 L225 190 L175 190 L160 143 Z" fill="${c}"/>
        <path d="M200 115 V60 M240 143 L295 125 M225 190 L258 238 M175 190 L142 238 M160 143 L105 125" stroke="#1a1a1a" stroke-width="2.5"/>
        <path d="M175 62 C185 75 215 75 225 62 M285 105 C275 120 285 145 300 150 M268 240 C255 230 235 235 228 252 M132 240 C145 230 165 235 172 252 M115 105 C125 120 115 145 100 150" fill="${d}" stroke="#1a1a1a" stroke-width="2" opacity=".9"/>
        <ellipse cx="200" cy="278" rx="80" ry="8" fill="#000" opacity=".12"/>`;
    },
    jacket(c, d, a) {
      return `
        <path d="M155 55 L115 70 L75 110 L80 255 L120 255 L125 140 L130 265 L270 265 L275 140 L280 255 L320 255 L325 110 L285 70 L245 55 L200 80 Z" fill="${c}"/>
        <path d="M155 55 L200 80 L245 55 L235 45 L200 65 L165 45 Z" fill="${d}"/>
        <path d="M200 80 V265" stroke="${a}" stroke-width="4"/>
        <path d="M75 110 L80 255 M325 110 L320 255" stroke="${a}" stroke-width="5"/>
        <rect x="78" y="242" width="44" height="13" fill="${d}"/><rect x="278" y="242" width="44" height="13" fill="${d}"/>
        <rect x="130" y="252" width="140" height="13" fill="${d}"/>`;
    },
    shorts(c, d, a) {
      return `
        <path d="M110 80 H290 L310 240 L215 245 L200 160 L185 245 L90 240 Z" fill="${c}"/>
        <rect x="110" y="80" width="180" height="22" fill="${d}"/>
        <path d="M185 102 L190 125 M215 102 L210 125" stroke="${a}" stroke-width="3"/>
        <path d="M100 160 L95 240 M300 160 L305 240" stroke="${a}" stroke-width="5"/>`;
    },
    bag(c, d, a) {
      return `
        <path d="M140 120 C140 75 260 75 260 120" stroke="#1a1a1a" stroke-width="8" fill="none"/>
        <rect x="70" y="115" width="260" height="130" rx="40" fill="${c}"/>
        <rect x="70" y="160" width="260" height="10" fill="${d}"/>
        <rect x="290" y="135" width="30" height="90" rx="12" fill="${d}"/>
        <circle cx="200" cy="205" r="18" fill="none" stroke="${a}" stroke-width="4"/><path d="M200 187 V223" stroke="${a}" stroke-width="4"/>`;
    },
    socks(c, d, a) {
      return `
        <path d="M150 60 H215 V190 C215 215 230 225 250 230 C275 236 280 270 255 275 L175 275 C150 275 150 250 150 230 Z" fill="${c}"/>
        <rect x="150" y="60" width="65" height="25" fill="${d}"/>
        <path d="M150 110 H215 M150 125 H215" stroke="${a}" stroke-width="5"/>
        <g fill="${d}" opacity=".7"><circle cx="190" cy="250" r="5"/><circle cx="210" cy="258" r="5"/><circle cx="230" cy="250" r="5"/><circle cx="175" cy="262" r="5"/></g>`;
    },
  };

  window.productArt = function (p, opts) {
    opts = opts || {};
    const c = p.colorHex;
    const d = shade(c, isLight(c) ? -45 : -35);
    const a = isLight(c) ? '#151515' : '#ffffff';
    const bg = opts.bg || '#ececec';
    const fn = draw[p.art] || draw.shoe;
    return `<svg viewBox="0 0 400 320" class="product-svg" role="img" aria-label="${p.name.replace(/"/g, '&quot;')}">
      <rect width="400" height="320" fill="${bg}"/>${fn(c, d, a)}</svg>`;
  };
})();
