/**
 * Firebase Service Layer
 * Handles all Firestore, Storage, and Auth operations with demo fallback data.
 */
const FirebaseService = (() => {
  let db = null;
  let auth = null;
  let storage = null;
  let initialized = false;

  const DEMO_DATA = {
    products: [
      {
        id: 'demo-1',
        name: 'Blizzard Pro 4-Door Commercial Refrigerator',
        description: 'Premium stainless steel 4-door reach-in refrigerator. Energy-efficient compressor, digital temperature control, and heavy-duty casters. Perfect for high-volume restaurant kitchens.',
        category: 'Refrigerators',
        price: 485000,
        condition: 'Excellent',
        specifications: { 'Capacity': '1200L', 'Power': '2.5kW', 'Dimensions': '180×80×200cm', 'Material': '304 Stainless Steel', 'Warranty': '6 Months' },
        images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80'],
        status: 'available',
        featured: true,
        hotSelling: true,
        upcoming: false,
        createdAt: Date.now()
      },
      {
        id: 'demo-2',
        name: 'Artisan Elite Double Deck Electric Oven',
        description: 'Professional-grade double deck electric convection oven with steam injection. Ideal for bakeries, hotels, and fine dining establishments.',
        category: 'Ovens',
        price: 320000,
        condition: 'Like New',
        specifications: { 'Capacity': '8 Trays', 'Power': '12kW', 'Temperature': '50-300°C', 'Voltage': '380V' },
        images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'],
        status: 'available',
        featured: true,
        hotSelling: false,
        upcoming: false,
        createdAt: Date.now() - 86400000
      },
      {
        id: 'demo-3',
        name: 'Crystal View Bakery Display Counter',
        description: 'Elegant curved glass bakery display counter with LED lighting and refrigerated base. Creates an irresistible showcase for pastries and desserts.',
        category: 'Bakery Counters',
        price: 275000,
        condition: 'Good',
        specifications: { 'Length': '180cm', 'Display Area': 'Curved Glass', 'Temperature': '2-8°C', 'Lighting': 'LED Warm White' },
        images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'],
        status: 'available',
        featured: true,
        hotSelling: true,
        upcoming: false,
        createdAt: Date.now() - 172800000
      },
      {
        id: 'demo-4',
        name: 'FrostGuard Industrial Deep Freezer',
        description: 'Heavy-duty chest deep freezer with rapid freeze technology. Maintains -22°C consistently even in demanding commercial environments.',
        category: 'Deep Freezers',
        price: 195000,
        condition: 'Excellent',
        specifications: { 'Capacity': '800L', 'Temperature': '-18 to -25°C', 'Power': '1.8kW', 'Insulation': 'PU Foam 100mm' },
        images: ['https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80'],
        status: 'reserved',
        featured: false,
        hotSelling: true,
        upcoming: false,
        createdAt: Date.now() - 259200000
      },
      {
        id: 'demo-5',
        name: 'Grand Hotel Kitchen Prep Station',
        description: 'Complete stainless steel prep station with undershelf storage, backsplash, and integrated sink. Built for 5-star hotel kitchens.',
        category: 'Hotel Kitchen Equipment',
        price: 145000,
        condition: 'Good',
        specifications: { 'Length': '240cm', 'Material': '304 SS', 'Sink': 'Double Bowl', 'Shelf': 'Adjustable' },
        images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'],
        status: 'available',
        featured: false,
        hotSelling: false,
        upcoming: false,
        createdAt: Date.now() - 345600000
      },
      {
        id: 'demo-6',
        name: 'TurboMix Industrial Food Processor',
        description: 'High-capacity industrial food processor with variable speed control. Processes up to 50kg per batch with precision cutting blades.',
        category: 'Industrial Food Machinery',
        price: 420000,
        condition: 'Like New',
        specifications: { 'Capacity': '50L', 'Power': '5.5kW', 'Speed': 'Variable 200-1500 RPM', 'Blades': '6 Interchangeable' },
        images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80'],
        status: 'incoming',
        featured: false,
        hotSelling: false,
        upcoming: true,
        createdAt: Date.now() - 432000000
      }
    ],
    categories: [
      { id: 'cat-1', name: 'Refrigerators', icon: '❄️', order: 1 },
      { id: 'cat-2', name: 'Deep Freezers', icon: '🧊', order: 2 },
      { id: 'cat-3', name: 'Bakery Counters', icon: '🥐', order: 3 },
      { id: 'cat-4', name: 'Display Counters', icon: '🪟', order: 4 },
      { id: 'cat-5', name: 'Ovens', icon: '🔥', order: 5 },
      { id: 'cat-6', name: 'Hotel Kitchen Equipment', icon: '🏨', order: 6 },
      { id: 'cat-7', name: 'Restaurant Equipment', icon: '🍽️', order: 7 },
      { id: 'cat-8', name: 'Stainless Steel Equipment', icon: '⚙️', order: 8 },
      { id: 'cat-9', name: 'Industrial Food Machinery', icon: '🏭', order: 9 }
    ],
    homepage: {
      heroTitle: 'Premium Commercial Kitchen Equipment. Exceptional Value.',
      heroSubtitle: 'Curated pre-owned industrial kitchen solutions for restaurants, hotels, and bakeries. Inspected, certified, and ready to perform.',
      ctaTitle: 'Ready to Upgrade Your Kitchen?',
      ctaText: 'Connect with our specialists for personalized equipment recommendations and exclusive deals.',
      whyChooseUs: [
        { icon: '✓', title: 'Certified Quality', text: 'Every piece inspected by certified technicians before listing.' },
        { icon: '💎', title: 'Premium Selection', text: 'Hand-picked equipment from top commercial brands worldwide.' },
        { icon: '🔧', title: 'Expert Support', text: 'Full installation guidance and after-sales technical support.' },
        { icon: '💰', title: 'Best Value', text: 'Save up to 60% compared to new equipment without compromising quality.' }
      ]
    },
    testimonials: [
      { id: 't1', name: 'Rajesh Mehta', role: 'Owner, Spice Route Restaurant', text: 'Raj Kitchen transformed our back-of-house setup. The refrigerator we purchased runs like new, and their team handled delivery flawlessly.', rating: 5 },
      { id: 't2', name: 'Priya Sharma', role: 'Head Chef, The Grand Palace Hotel', text: 'Exceptional quality and transparent pricing. We equipped our entire pastry kitchen through Raj Kitchen and couldn\'t be happier.', rating: 5 },
      { id: 't3', name: 'Arun Patel', role: 'Director, FreshBake Chain', text: 'The display counters are stunning — our customers notice the difference immediately. Professional service from start to finish.', rating: 5 }
    ],
    contact: {
      phone: '+91 98765 43210',
      whatsapp: '+919876543210',
      email: 'hello@rajkitchen.com',
      address: 'Plot 42, Industrial Estate, Andheri East, Mumbai 400069',
      hours: 'Mon – Sat: 9:00 AM – 7:00 PM'
    },
    statistics: [
      { id: 's1', number: 2500, suffix: '+', label: 'Equipment Sold' },
      { id: 's2', number: 850, suffix: '+', label: 'Happy Clients' },
      { id: 's3', number: 15, suffix: '+', label: 'Years Experience' },
      { id: 's4', number: 98, suffix: '%', label: 'Satisfaction Rate' }
    ],
    floating_buttons: [
      { id: 'fb1', type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/919876543210', enabled: true, order: 1 },
      { id: 'fb2', type: 'call', label: 'Call Us', url: 'tel:+919876543210', enabled: true, order: 2 }
    ],
    social_links: [
      { id: 'sl1', platform: 'instagram', url: 'https://instagram.com' },
      { id: 'sl2', platform: 'facebook', url: 'https://facebook.com' },
      { id: 'sl3', platform: 'youtube', url: 'https://youtube.com' }
    ]
  };

  function init() {
    if (typeof FIREBASE_ENABLED !== 'undefined' && FIREBASE_ENABLED && typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        storage = firebase.storage();
        initialized = true;
      } catch (e) {
        console.warn('Firebase init failed, using demo data:', e);
      }
    }
    return initialized;
  }

  async function getCollection(name, orderField = 'order') {
    if (initialized && db) {
      try {
        const snap = await db.collection(name).orderBy(orderField).get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        console.warn(`Firestore ${name} fetch failed:`, e);
      }
    }
    return DEMO_DATA[name] || [];
  }

  async function getDoc(collection, id) {
    if (initialized && db) {
      try {
        const doc = await db.collection(collection).doc(id).get();
        if (doc.exists) return { id: doc.id, ...doc.data() };
      } catch (e) {
        console.warn(`Firestore doc fetch failed:`, e);
      }
    }
    const items = DEMO_DATA[collection] || [];
    return items.find(i => i.id === id) || null;
  }

  async function getProducts(filters = {}) {
    let products = await getCollection('products', 'createdAt');
    if (!initialized) products = [...DEMO_DATA.products];

    if (filters.featured) products = products.filter(p => p.featured);
    if (filters.hotSelling) products = products.filter(p => p.hotSelling);
    if (filters.upcoming) products = products.filter(p => p.upcoming);
    if (filters.category) products = products.filter(p => p.category === filters.category);
    if (filters.status) products = products.filter(p => p.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return products;
  }

  async function getHomepage() {
    if (initialized && db) {
      try {
        const doc = await db.collection('homepage').doc('content').get();
        if (doc.exists) return doc.data();
      } catch (e) { /* fallback */ }
    }
    return DEMO_DATA.homepage;
  }

  async function getContact() {
    if (initialized && db) {
      try {
        const doc = await db.collection('contact').doc('info').get();
        if (doc.exists) return doc.data();
      } catch (e) { /* fallback */ }
    }
    return DEMO_DATA.contact;
  }

  async function getFloatingButtons() {
    let buttons = await getCollection('floating_buttons', 'order');
    if (!initialized) buttons = [...DEMO_DATA.floating_buttons];
    return buttons.filter(b => b.enabled).sort((a, b) => a.order - b.order);
  }

  async function getStatistics() {
    return getCollection('statistics', 'order');
  }

  async function getTestimonials() {
    return getCollection('testimonials', 'order');
  }

  async function getCategories() {
    return getCollection('categories', 'order');
  }

  async function getSocialLinks() {
    return getCollection('social_links', 'order');
  }

  // Admin CRUD operations
  async function saveDoc(collection, id, data) {
    if (!initialized || !db) throw new Error('Firebase not configured');
    await db.collection(collection).doc(id).set(data, { merge: true });
    return { id, ...data };
  }

  async function deleteDoc(collection, id) {
    if (!initialized || !db) throw new Error('Firebase not configured');
    await db.collection(collection).doc(id).delete();
  }

  async function uploadImage(path, file) {
    if (!initialized || !storage) throw new Error('Firebase not configured');
    const ref = storage.ref().child(path);
    const snapshot = await ref.put(file);
    return await snapshot.ref.getDownloadURL();
  }

  function signIn(email, password) {
    if (!auth) throw new Error('Firebase not configured');
    return auth.signInWithEmailAndPassword(email, password);
  }

  function signOut() {
    if (auth) return auth.signOut();
  }

  function onAuthChange(callback) {
    if (auth) return auth.onAuthStateChanged(callback);
    callback(null);
  }

  function isAdmin(user) {
    return user && user.email;
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  }

  function getStatusBadge(status) {
    const map = { available: 'Available', reserved: 'Reserved', sold: 'Sold', incoming: 'Incoming' };
    return map[status] || status;
  }

  const ICONS = {
    whatsapp: '💬', call: '📞', email: '✉️', instagram: '📷',
    facebook: '👤', telegram: '✈️', youtube: '▶️'
  };

  return {
    init, getProducts, getProduct: (id) => getDoc('products', id),
    getHomepage, getContact, getFloatingButtons, getStatistics,
    getTestimonials, getCategories, getSocialLinks,
    getCollection,
    saveDoc, deleteDoc, uploadImage, signIn, signOut, onAuthChange, isAdmin,
    formatPrice, getStatusBadge, ICONS, isInitialized: () => initialized,
    getDemoData: () => DEMO_DATA
  };
})();
