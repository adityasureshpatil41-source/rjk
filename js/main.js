const App = {
  async init() {
    FirebaseService.init();

    const navEl = document.getElementById('site-nav');
    if (navEl) Navigation.render(navEl);

    const footerEl = document.getElementById('site-footer');
    if (footerEl) await Footer.render(footerEl);

    await FloatingButtons.render();

    const page = document.body.dataset.page;
    if (page === 'home') await HomePage.init();
    if (page === 'products') await ProductsPage.init();
    if (page === 'product-detail') await ProductDetailPage.init();
    if (page === 'hot-selling') await HotSellingPage.init();
    if (page === 'upcoming') await UpcomingPage.init();
    if (page === 'about') await AboutPage.init();
    if (page === 'contact') await ContactPage.init();

    Animations.init();
    this.hideLoader();
  },

  hideLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 300);
    }
  }
};

const HomePage = {
  async init() {
    const [homepage, products, categories, stats, testimonials, contact] = await Promise.all([
      FirebaseService.getHomepage(),
      FirebaseService.getProducts(),
      FirebaseService.getCategories(),
      FirebaseService.getStatistics(),
      FirebaseService.getTestimonials(),
      FirebaseService.getContact()
    ]);

    this.renderHero(homepage, contact);
    this.renderFeatured(products);
    this.renderCategories(categories, products);
    this.renderWhyChooseUs(homepage);
    this.renderStats(stats);
    this.renderTestimonials(testimonials);
    this.renderCTA(homepage, contact);

    requestAnimationFrame(() => {
      if (typeof Hero3D !== 'undefined') Hero3D.init('hero-canvas');
    });
    this.initFeatureTabs(products);
    this.initTestimonialSlider();
  },

  renderHero(data, contact) {
    const title = document.getElementById('hero-title');
    const subtitle = document.getElementById('hero-subtitle');
    const waBtn = document.getElementById('hero-whatsapp');

    if (title) title.textContent = data.heroTitle;
    if (subtitle) subtitle.textContent = data.heroSubtitle;
    if (waBtn) waBtn.href = `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=Hello, I'm interested in your commercial kitchen equipment.`;
  },

  renderFeatured(products) {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;

    const featured = products.filter(p => p.featured).slice(0, 6);
    const newArrivals = [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
    const bestDeals = [...products].sort((a, b) => a.price - b.price).slice(0, 6);

    grid.dataset.featured = JSON.stringify(featured.map(p => p.id));
    grid.dataset.newArrivals = JSON.stringify(newArrivals.map(p => p.id));
    grid.dataset.bestDeals = JSON.stringify(bestDeals.map(p => p.id));

    const productMap = Object.fromEntries(products.map(p => [p.id, p]));
    const showFeatured = featured;

    grid.innerHTML = showFeatured.map(p => ProductCard.render(p)).join('');
    ProductCard.bindTilt();
  },

  initFeatureTabs(allProducts) {
    const tabs = document.querySelectorAll('.feature-tab');
    const grid = document.getElementById('featured-grid');
    if (!tabs.length || !grid) return;

    const productMap = Object.fromEntries(allProducts.map(p => [p.id, p]));

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const key = tab.dataset.tab;
        const ids = JSON.parse(grid.dataset[key] || '[]');
        const items = ids.map(id => productMap[id]).filter(Boolean);

        if (typeof gsap !== 'undefined') {
          gsap.to(grid, { opacity: 0, y: 20, duration: 0.3, onComplete: () => {
            grid.innerHTML = items.map(p => ProductCard.render(p)).join('');
            ProductCard.bindTilt();
            if (typeof AOS !== 'undefined') AOS.refresh();
            gsap.to(grid, { opacity: 1, y: 0, duration: 0.4 });
          }});
        } else {
          grid.innerHTML = items.map(p => ProductCard.render(p)).join('');
          ProductCard.bindTilt();
        }
      });
    });
  },

  renderCategories(categories, products) {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    grid.innerHTML = categories.map(cat => {
      const count = products.filter(p => p.category === cat.name).length;
      return `
        <a href="products.html?category=${encodeURIComponent(cat.name)}" class="category-card" data-aos="fade-up">
          <div class="category-card__icon">${cat.icon}</div>
          <h3 class="category-card__name">${cat.name}</h3>
          <span class="category-card__count">${count} items</span>
        </a>
      `;
    }).join('');
  },

  renderWhyChooseUs(data) {
    const grid = document.getElementById('why-grid');
    if (!grid || !data.whyChooseUs) return;

    grid.innerHTML = data.whyChooseUs.map((item, i) => `
      <div class="feature-card" data-aos="fade-up" data-aos-delay="${i * 100}">
        <div class="feature-card__icon">${item.icon}</div>
        <h3 class="feature-card__title">${item.title}</h3>
        <p class="feature-card__text">${item.text}</p>
      </div>
    `).join('');
  },

  renderStats(stats) {
    const grid = document.getElementById('stats-grid');
    if (!grid) return;

    grid.innerHTML = stats.map(s => `
      <div class="stat-card" data-aos="zoom-in">
        <div class="stat-card__number" data-count="${s.number}" data-suffix="${s.suffix || ''}">0</div>
        <div class="stat-card__label">${s.label}</div>
      </div>
    `).join('');
  },

  renderTestimonials(testimonials) {
    const wrapper = document.getElementById('testimonials-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = testimonials.map(t => `
      <div class="swiper-slide">
        <div class="testimonial-card">
          <div class="testimonial-card__stars">${'★'.repeat(t.rating || 5)}</div>
          <p class="testimonial-card__text">"${t.text}"</p>
          <div class="testimonial-card__author">
            <div class="testimonial-card__avatar">${t.name.charAt(0)}</div>
            <div>
              <div class="testimonial-card__name">${t.name}</div>
              <div class="testimonial-card__role">${t.role}</div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  initTestimonialSlider() {
    if (typeof Swiper === 'undefined') return;
    new Swiper('.testimonials-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: {
        768: { slidesPerView: 2 },
        1100: { slidesPerView: 3 }
      }
    });
  },

  renderCTA(data, contact) {
    const title = document.getElementById('cta-title');
    const text = document.getElementById('cta-text');
    const waBtn = document.getElementById('cta-whatsapp');

    if (title) title.textContent = data.ctaTitle;
    if (text) text.textContent = data.ctaText;
    if (waBtn) waBtn.href = `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`;
  }
};

const ProductsPage = {
  async init() {
    Animations.initPageHero();
    const params = new URLSearchParams(window.location.search);
    const categoryFilter = params.get('category');

    const [products, categories] = await Promise.all([
      FirebaseService.getProducts(),
      FirebaseService.getCategories()
    ]);

    this.renderFilters(categories, categoryFilter);
    this.renderProducts(products, categoryFilter);
  },

  renderFilters(categories, activeCategory) {
    const bar = document.getElementById('filters-bar');
    if (!bar) return;

    bar.innerHTML = `
      <input type="text" class="filter-input" id="search-input" placeholder="Search equipment..." aria-label="Search">
      <select class="filter-select" id="category-filter" aria-label="Category">
        <option value="">All Categories</option>
        ${categories.map(c => `<option value="${c.name}" ${c.name === activeCategory ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
      <select class="filter-select" id="status-filter" aria-label="Status">
        <option value="">All Status</option>
        <option value="available">Available</option>
        <option value="reserved">Reserved</option>
        <option value="incoming">Incoming</option>
      </select>
      <select class="filter-select" id="sort-filter" aria-label="Sort">
        <option value="newest">Newest First</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    `;

    const apply = () => this.filterProducts();
    bar.querySelector('#search-input').addEventListener('input', debounce(apply, 300));
    bar.querySelector('#category-filter').addEventListener('change', apply);
    bar.querySelector('#status-filter').addEventListener('change', apply);
    bar.querySelector('#sort-filter').addEventListener('change', apply);

    this.allProducts = null;
    FirebaseService.getProducts().then(p => { this.allProducts = p; });
  },

  async filterProducts() {
    if (!this.allProducts) this.allProducts = await FirebaseService.getProducts();

    const search = document.getElementById('search-input')?.value || '';
    const category = document.getElementById('category-filter')?.value || '';
    const status = document.getElementById('status-filter')?.value || '';
    const sort = document.getElementById('sort-filter')?.value || 'newest';

    let filtered = [...this.allProducts];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    if (category) filtered = filtered.filter(p => p.category === category);
    if (status) filtered = filtered.filter(p => p.status === status);

    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => b.createdAt - a.createdAt);

    this.renderProducts(filtered);
  },

  renderProducts(products, categoryFilter) {
    const grid = document.getElementById('products-grid');
    const count = document.getElementById('products-count');
    if (!grid) return;

    let items = products;
    if (categoryFilter) items = products.filter(p => p.category === categoryFilter);

    if (count) count.textContent = `${items.length} product${items.length !== 1 ? 's' : ''} found`;

    if (!items.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">🔍</div><p>No products match your criteria.</p></div>`;
      return;
    }

    grid.innerHTML = items.map(p => ProductCard.render(p)).join('');
    ProductCard.bindTilt();
    if (typeof AOS !== 'undefined') AOS.refresh();
  }
};

const ProductDetailPage = {
  async init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { window.location.href = 'products.html'; return; }

    const [product, contact] = await Promise.all([
      FirebaseService.getProduct(id),
      FirebaseService.getContact()
    ]);

    if (!product) {
      document.getElementById('product-detail').innerHTML = '<div class="empty-state"><p>Product not found.</p></div>';
      return;
    }

    this.render(product, contact);
  },

  render(product, contact) {
    const container = document.getElementById('product-detail');
    const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'];
    const specs = product.specifications || {};

    document.title = `${product.name} | Raj Kitchen`;
    const breadcrumb = document.getElementById('breadcrumb-product');
    if (breadcrumb) breadcrumb.textContent = product.name;

    container.innerHTML = `
      <div class="product-gallery">
        <div class="product-gallery__main" id="gallery-main">
          <img src="${images[0]}" alt="${product.name}" id="main-image">
        </div>
        ${images.length > 1 ? `
          <div class="product-gallery__thumbs">
            ${images.map((img, i) => `
              <button class="product-gallery__thumb ${i === 0 ? 'active' : ''}" data-img="${img}" aria-label="View image ${i + 1}">
                <img src="${img}" alt="" loading="lazy">
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="product-info">
        <span class="eyebrow">${product.category}</span>
        <h1 class="section-title" style="margin-top:0.5rem">${product.name}</h1>
        <span class="badge badge--${product.status}">${FirebaseService.getStatusBadge(product.status)}</span>
        <p class="product-info__price">${FirebaseService.formatPrice(product.price)}</p>
        <p class="text-muted" style="margin-bottom:1.5rem">${product.description}</p>
        <p><strong>Condition:</strong> ${product.condition}</p>

        <div class="product-info__specs">
          <h3>Specifications</h3>
          <div class="spec-list">
            ${Object.entries(specs).map(([k, v]) => `
              <div class="spec-item">
                <span class="spec-item__label">${k}</span>
                <span class="spec-item__value">${v}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="contact-actions">
          <a href="https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=Hi, I'm interested in: ${encodeURIComponent(product.name)}" class="btn btn--primary" target="_blank">WhatsApp Inquiry</a>
          <a href="tel:${contact.phone}" class="btn btn--secondary">Call Now</a>
          <a href="mailto:${contact.email}?subject=Inquiry: ${encodeURIComponent(product.name)}" class="btn btn--secondary">Email Us</a>
        </div>
      </div>
    `;

    container.querySelectorAll('.product-gallery__thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.getElementById('main-image').src = thumb.dataset.img;
        container.querySelectorAll('.product-gallery__thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    Animations.initPageHero();
  }
};

const HotSellingPage = {
  async init() {
    Animations.initPageHero();
    const products = await FirebaseService.getProducts({ hotSelling: true });
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (!products.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><p>No hot selling items right now. Check back soon!</p></div>';
      return;
    }

    grid.innerHTML = products.map(p => ProductCard.render(p)).join('');
    ProductCard.bindTilt();
  }
};

const UpcomingPage = {
  async init() {
    Animations.initPageHero();
    const products = await FirebaseService.getProducts({ upcoming: true });
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (!products.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><p>No upcoming inventory at the moment.</p></div>';
      return;
    }

    grid.innerHTML = products.map(p => ProductCard.render(p)).join('');
    ProductCard.bindTilt();
  }
};

const AboutPage = {
  async init() {
    Animations.initPageHero();
  }
};

const ContactPage = {
  async init() {
    Animations.initPageHero();
    const contact = await FirebaseService.getContact();
    this.renderContactInfo(contact);
    this.bindForm(contact);
  },

  renderContactInfo(contact) {
    const el = document.getElementById('contact-info');
    if (!el) return;

    el.innerHTML = `
      <div class="contact-info-card" data-aos="fade-right">
        <div class="contact-info-card__icon">📞</div>
        <h3>Phone</h3>
        <p class="text-muted"><a href="tel:${contact.phone}">${contact.phone}</a></p>
      </div>
      <div class="contact-info-card" data-aos="fade-right" data-aos-delay="100">
        <div class="contact-info-card__icon">✉️</div>
        <h3>Email</h3>
        <p class="text-muted"><a href="mailto:${contact.email}">${contact.email}</a></p>
      </div>
      <div class="contact-info-card" data-aos="fade-right" data-aos-delay="200">
        <div class="contact-info-card__icon">📍</div>
        <h3>Visit Us</h3>
        <p class="text-muted">${contact.address}</p>
        <p class="text-dim text-sm" style="margin-top:0.5rem">${contact.hours}</p>
      </div>
    `;
  },

  bindForm(contact) {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name');
      const phone = data.get('phone');
      const message = data.get('message');
      const waUrl = `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm ${name} (${phone}). ${message}`)}`;
      window.open(waUrl, '_blank');
      form.reset();
    });
  }
};

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

document.addEventListener('DOMContentLoaded', () => App.init());
