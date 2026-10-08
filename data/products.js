// PITCHLINE product catalog.
// Every attribute here (category, sport, gender, collection, color) is sent to
// Google Analytics with each ecommerce event, so it becomes a slicer in Power BI.

const SHOE_SIZES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];
const WOMEN_SHOE_SIZES = ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8'];
const KIDS_SHOE_SIZES = ['UK 1', 'UK 2', 'UK 3', 'UK 4', 'UK 5'];
const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const KIDS_APPAREL_SIZES = ['6-7Y', '8-9Y', '10-11Y', '12-13Y'];

const products = [
  // ---------- Football boots ----------
  {
    id: 'PL-BT-001', name: 'Strike Elite FG Boots', category: 'Boots', sport: 'Football', gender: 'Unisex',
    collection: 'Strike', color: 'Solar Red', colorHex: '#e63b2e', price: 229.99, art: 'boot',
    sizes: SHOE_SIZES, isNew: true, featured: true,
    description: 'Our lightest boot. A thin knit upper and aggressive stud layout for fast players on firm natural grass.',
    details: ['Firm ground (FG) soleplate', 'Knit upper with grip texture', 'Weight: 190 g (UK 8.5)'],
  },
  {
    id: 'PL-BT-002', name: 'Strike Pro FG Boots', category: 'Boots', sport: 'Football', gender: 'Unisex',
    collection: 'Strike', color: 'Core Black', colorHex: '#151515', price: 159.99, compareAt: 189.99, art: 'boot',
    sizes: SHOE_SIZES, featured: true,
    description: 'Pro-level control with a padded collar and a stable heel for players who live on the ball.',
    details: ['Firm ground (FG) soleplate', 'Synthetic upper', 'Padded collar'],
  },
  {
    id: 'PL-BT-003', name: 'Strike Club TF Boots', category: 'Boots', sport: 'Football', gender: 'Unisex',
    collection: 'Club', color: 'Cloud White', colorHex: '#f2f2f2', price: 79.99, art: 'boot',
    sizes: SHOE_SIZES,
    description: 'Durable turf boots with rubber nubs, made for weekly five-a-side on artificial pitches.',
    details: ['Turf (TF) rubber outsole', 'Synthetic upper', 'Cushioned insole'],
  },
  {
    id: 'PL-BT-004', name: 'Strike Junior FG Boots', category: 'Boots', sport: 'Football', gender: 'Kids',
    collection: 'Strike', color: 'Electric Blue', colorHex: '#1f6feb', price: 59.99, art: 'boot',
    sizes: KIDS_SHOE_SIZES, isNew: true,
    description: 'The Strike design scaled down for young players, with an easier lace-up fit.',
    details: ['Firm ground (FG) soleplate', 'Kids fit', 'Reinforced toe'],
  },
  {
    id: 'PL-BT-005', name: 'Velocity Indoor IN Shoes', category: 'Boots', sport: 'Football', gender: 'Unisex',
    collection: 'Velocity', color: 'Volt Yellow', colorHex: '#e3f21c', price: 89.99, art: 'shoe',
    sizes: SHOE_SIZES,
    description: 'Flat gum-rubber sole for indoor courts and futsal. Low profile for quick touches.',
    details: ['Indoor (IN) gum outsole', 'Suede toe overlay', 'Low-cut collar'],
  },

  // ---------- Jerseys ----------
  {
    id: 'PL-JR-001', name: 'Home Jersey 26/27', category: 'Jerseys', sport: 'Football', gender: 'Men',
    collection: 'Club', color: 'Royal Blue', colorHex: '#1d3fbf', price: 89.99, art: 'jersey',
    sizes: APPAREL_SIZES, isNew: true, featured: true,
    description: 'The new home shirt. Breathable recycled polyester and a ribbed crew collar.',
    details: ['100% recycled polyester', 'Regular fit', 'Moisture-wicking fabric'],
  },
  {
    id: 'PL-JR-002', name: 'Away Jersey 26/27', category: 'Jerseys', sport: 'Football', gender: 'Men',
    collection: 'Club', color: 'Core Black', colorHex: '#151515', price: 89.99, art: 'jersey',
    sizes: APPAREL_SIZES, isNew: true,
    description: 'A sharp all-black away shirt with a contrast chest band.',
    details: ['100% recycled polyester', 'Regular fit', 'Heat-applied badge'],
  },
  {
    id: 'PL-JR-003', name: "Women's Home Jersey 26/27", category: 'Jerseys', sport: 'Football', gender: 'Women',
    collection: 'Club', color: 'Royal Blue', colorHex: '#1d3fbf', price: 89.99, art: 'jersey',
    sizes: APPAREL_SIZES, featured: true,
    description: 'The home shirt cut for women, with a slimmer body and shorter sleeves.',
    details: ['100% recycled polyester', 'Slim fit', 'Moisture-wicking fabric'],
  },
  {
    id: 'PL-JR-004', name: "Kids' Home Jersey 26/27", category: 'Jerseys', sport: 'Football', gender: 'Kids',
    collection: 'Club', color: 'Royal Blue', colorHex: '#1d3fbf', price: 64.99, art: 'jersey',
    sizes: KIDS_APPAREL_SIZES,
    description: 'The same home shirt the first team wears, sized for young fans.',
    details: ['100% recycled polyester', 'Kids fit', 'Machine washable'],
  },
  {
    id: 'PL-JR-005', name: 'Retro 1996 Jersey', category: 'Jerseys', sport: 'Football', gender: 'Unisex',
    collection: 'Origins', color: 'Forest Green', colorHex: '#1e7a46', price: 74.99, compareAt: 94.99, art: 'jersey',
    sizes: APPAREL_SIZES,
    description: 'A throwback shirt inspired by 90s terrace style, with a relaxed boxy fit.',
    details: ['Cotton-feel polyester', 'Relaxed fit', 'Embroidered crest'],
  },

  // ---------- Balls ----------
  {
    id: 'PL-BL-001', name: 'Match Pro Ball', category: 'Balls', sport: 'Football', gender: 'Unisex',
    collection: 'Strike', color: 'Solar Red', colorHex: '#e63b2e', price: 149.99, art: 'ball',
    sizes: ['Size 5'], featured: true,
    description: 'Thermally bonded match ball with a textured skin for consistent flight.',
    details: ['Thermally bonded panels', 'Butyl bladder', 'Official size 5'],
  },
  {
    id: 'PL-BL-002', name: 'Club Training Ball', category: 'Balls', sport: 'Football', gender: 'Unisex',
    collection: 'Club', color: 'Electric Blue', colorHex: '#1f6feb', price: 29.99, art: 'ball',
    sizes: ['Size 3', 'Size 4', 'Size 5'],
    description: 'A tough machine-stitched ball for daily training on any surface.',
    details: ['Machine-stitched', 'Durable TPU cover', 'Sizes 3 to 5'],
  },
  {
    id: 'PL-BL-003', name: 'Futsal Pro Ball', category: 'Balls', sport: 'Football', gender: 'Unisex',
    collection: 'Club', color: 'Amber', colorHex: '#f5b700', price: 39.99, art: 'ball',
    sizes: ['Size 4'],
    description: 'Low-bounce ball designed for fast indoor games.',
    details: ['Low-bounce bladder', 'Hand-stitched', 'Size 4'],
  },

  // ---------- Footwear ----------
  {
    id: 'PL-FW-001', name: 'Velocity Run 3', category: 'Footwear', sport: 'Running', gender: 'Men',
    collection: 'Velocity', color: 'Lime', colorHex: '#9fd61e', price: 139.99, art: 'shoe',
    sizes: SHOE_SIZES, isNew: true, featured: true,
    description: 'Springy foam and a breathable mesh upper for daily miles.',
    details: ['Responsive foam midsole', 'Engineered mesh upper', '8 mm drop'],
  },
  {
    id: 'PL-FW-002', name: "Velocity Run 3 Women's", category: 'Footwear', sport: 'Running', gender: 'Women',
    collection: 'Velocity', color: 'Flash Pink', colorHex: '#ff6fa5', price: 139.99, art: 'shoe',
    sizes: WOMEN_SHOE_SIZES, isNew: true,
    description: "The Velocity Run 3 built on a women's last for a closer heel fit.",
    details: ['Responsive foam midsole', 'Engineered mesh upper', '8 mm drop'],
  },
  {
    id: 'PL-FW-003', name: 'Velocity Trail GTX', category: 'Footwear', sport: 'Running', gender: 'Unisex',
    collection: 'Velocity', color: 'Olive', colorHex: '#6b7a3a', price: 169.99, compareAt: 189.99, art: 'shoe',
    sizes: SHOE_SIZES,
    description: 'Waterproof trail shoe with deep lugs for mud, rock and gravel.',
    details: ['Waterproof membrane', 'Multi-directional lugs', 'Rock plate'],
  },
  {
    id: 'PL-FW-004', name: 'Origins Court Sneaker', category: 'Footwear', sport: 'Lifestyle', gender: 'Unisex',
    collection: 'Origins', color: 'Cloud White', colorHex: '#f5f5f5', price: 99.99, art: 'shoe',
    sizes: SHOE_SIZES, featured: true,
    description: 'A clean leather court shoe that goes with everything.',
    details: ['Leather upper', 'Rubber cupsole', 'Padded tongue'],
  },
  {
    id: 'PL-FW-005', name: 'Origins Suede Low', category: 'Footwear', sport: 'Lifestyle', gender: 'Unisex',
    collection: 'Origins', color: 'Burgundy', colorHex: '#7a1f2b', price: 109.99, art: 'shoe',
    sizes: SHOE_SIZES,
    description: 'Soft suede and a gum sole, inspired by classic indoor training shoes.',
    details: ['Suede upper', 'Gum rubber outsole', 'Textile lining'],
  },
  {
    id: 'PL-FW-006', name: 'Rise Basketball Shoe', category: 'Footwear', sport: 'Basketball', gender: 'Men',
    collection: 'Velocity', color: 'Blaze Orange', colorHex: '#ff7a00', price: 149.99, art: 'shoe',
    sizes: SHOE_SIZES,
    description: 'Mid-cut support and full-length cushioning for explosive moves on court.',
    details: ['Full-length cushioning', 'Herringbone traction', 'Mid-cut collar'],
  },

  // ---------- Apparel ----------
  {
    id: 'PL-AP-001', name: 'Club Training Jacket', category: 'Apparel', sport: 'Training', gender: 'Men',
    collection: 'Club', color: 'Core Black', colorHex: '#151515', price: 79.99, art: 'jacket',
    sizes: APPAREL_SIZES,
    description: 'Full-zip training jacket in a smooth, quick-dry knit.',
    details: ['Full zip', 'Zip pockets', 'Quick-dry fabric'],
  },
  {
    id: 'PL-AP-002', name: "Origins Track Jacket Women's", category: 'Apparel', sport: 'Lifestyle', gender: 'Women',
    collection: 'Origins', color: 'Forest Green', colorHex: '#1e7a46', price: 84.99, art: 'jacket',
    sizes: APPAREL_SIZES, isNew: true,
    description: 'Retro track top with contrast piping and a stand-up collar.',
    details: ['Tricot fabric', 'Stand-up collar', 'Ribbed cuffs'],
  },
  {
    id: 'PL-AP-003', name: 'Club Training Shorts', category: 'Apparel', sport: 'Training', gender: 'Men',
    collection: 'Club', color: 'Core Black', colorHex: '#151515', price: 34.99, compareAt: 39.99, art: 'shorts',
    sizes: APPAREL_SIZES,
    description: 'Lightweight shorts with an elastic waist for drills and gym sessions.',
    details: ['Elastic drawcord waist', 'Side pockets', 'Recycled polyester'],
  },
  {
    id: 'PL-AP-004', name: "Velocity Run Shorts Women's", category: 'Apparel', sport: 'Running', gender: 'Women',
    collection: 'Velocity', color: 'Indigo', colorHex: '#3b3b98', price: 32.99, art: 'shorts',
    sizes: APPAREL_SIZES,
    description: 'Split-hem running shorts with a built-in brief and back zip pocket.',
    details: ['Built-in brief', 'Back zip pocket', 'Reflective details'],
  },

  // ---------- Accessories ----------
  {
    id: 'PL-AC-001', name: 'Club Duffel Bag', category: 'Accessories', sport: 'Training', gender: 'Unisex',
    collection: 'Club', color: 'Core Black', colorHex: '#151515', price: 49.99, art: 'bag',
    sizes: ['One size'],
    description: 'A 40 L duffel with a separate boot compartment.',
    details: ['40 L capacity', 'Ventilated boot pocket', 'Padded shoulder strap'],
  },
  {
    id: 'PL-AC-002', name: 'Grip Football Socks (2 pairs)', category: 'Accessories', sport: 'Football', gender: 'Unisex',
    collection: 'Strike', color: 'Solar Red', colorHex: '#e63b2e', price: 16.99, art: 'socks',
    sizes: ['S', 'M', 'L'],
    description: 'Grip pads underfoot stop your foot sliding inside the boot.',
    details: ['Silicone grip pads', 'Cushioned sole', 'Two pairs'],
  },
];

module.exports = products;
