const AdminApp = {
  state: {
    user: null,
    products: [],
    categories: [],
    testimonials: [],
    statistics: [],
    floatingButtons: [],
    socialLinks: [],
    contact: null,
    homepage: null,
    activePanel: 'products'
  },

  async init() {
    FirebaseService.init();
    this.renderAuthGate();

    if (FirebaseService.isInitialized()) {
      FirebaseService.onAuthChange(async user => {
        this.state.user = user;
        if (user) await this.renderDashboard();
        else this.renderLogin();
      });
    } else {
      // Demo mode when Firebase is not configured
      this.state.user = { email: 'demo@rajkitchen.local' };
      await this.renderDashboard();
      this.toast('Demo mode active. Configure Firebase for live CRUD.');
    }
  },

  renderAuthGate() {
    const app = document.getElementById('admin-app');
    app.innerHTML = '<div class="login-wrap"><div class="login-card"><h2>Loading admin panel...</h2></div></div>';
  },

  renderLogin() {
    const app = document.getElementById('admin-app');
    app.innerHTML = `
      <div class="login-wrap">
        <form class="login-card" id="login-form">
          <span class="eyebrow">Raj Kitchen Admin</span>
          <h2 style="margin:0.7rem 0 1rem">Secure Login</h2>
          <p class="text-muted" style="margin-bottom:1rem">Use your Firebase Authentication admin credentials.</p>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" required placeholder="admin@rajkitchen.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" required placeholder="••••••••" />
          </div>
          <button class="btn btn--primary" style="width:100%" type="submit">Sign In</button>
        </form>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await FirebaseService.signIn(fd.get('email'), fd.get('password'));
      } catch (err) {
        this.toast(err.message || 'Login failed');
      }
    });
  },

  async renderDashboard() {
    await this.loadData();

    const app = document.getElementById('admin-app');
    app.innerHTML = `
      <div class="admin-shell">
        <aside class="admin-sidebar">
          <div class="admin-logo logo"><span class="logo__icon">R</span><span>RAJ <span class="text-gold">KITCHEN</span></span></div>
          <nav class="admin-nav" id="admin-nav">
            ${this.navBtn('products', 'Products')}
            ${this.navBtn('categories', 'Categories')}
            ${this.navBtn('homepage', 'Homepage')}
            ${this.navBtn('contact', 'Contact')}
            ${this.navBtn('testimonials', 'Testimonials')}
            ${this.navBtn('statistics', 'Statistics')}
            ${this.navBtn('floating', 'Floating Buttons')}
          </nav>
        </aside>

        <main class="admin-main">
          <div class="admin-topbar">
            <div>
              <h1 style="font-size:var(--text-3xl)">Admin Dashboard</h1>
              <p class="text-muted">${this.state.user?.email || 'Admin'}</p>
            </div>
            <div class="admin-actions">
              <a href="../index.html" class="btn btn--secondary" target="_blank" rel="noopener">View Site</a>
              <button class="btn btn--secondary" id="refresh-btn">Refresh</button>
              <button class="btn btn--primary" id="logout-btn">Logout</button>
            </div>
          </div>

          <div class="admin-kpis">
            <div class="kpi"><h3>Total Products</h3><p>${this.state.products.length}</p></div>
            <div class="kpi"><h3>Categories</h3><p>${this.state.categories.length}</p></div>
            <div class="kpi"><h3>Testimonials</h3><p>${this.state.testimonials.length}</p></div>
            <div class="kpi"><h3>Floating Buttons</h3><p>${this.state.floatingButtons.length}</p></div>
          </div>

          ${this.panelProducts()}
          ${this.panelCategories()}
          ${this.panelHomepage()}
          ${this.panelContact()}
          ${this.panelTestimonials()}
          ${this.panelStatistics()}
          ${this.panelFloating()}
        </main>
      </div>
    `;

    this.bindGlobalEvents();
    this.bindProducts();
    this.bindCategories();
    this.bindHomepage();
    this.bindContact();
    this.bindTestimonials();
    this.bindStatistics();
    this.bindFloating();
    this.setPanel(this.state.activePanel);
  },

  navBtn(id, label) {
    return `<button class="admin-nav-btn ${this.state.activePanel === id ? 'active' : ''}" data-panel="${id}">${label}</button>`;
  },

  panelProducts() {
    const rows = this.state.products.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${FirebaseService.formatPrice(p.price || 0)}</td>
        <td>${p.status}</td>
        <td>
          <button class="btn btn--secondary btn--sm" data-edit-product="${p.id}">Edit</button>
          <button class="btn btn-danger btn--sm" data-del-product="${p.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    return `
      <section class="admin-panel" data-panel="products">
        <h2 style="margin-bottom:1rem">Manage Products</h2>
        <div class="admin-grid">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>${rows || '<tr><td colspan="5">No products yet.</td></tr>'}</tbody>
            </table>
          </div>
          <form class="form-card" id="product-form">
            <input type="hidden" name="id" />
            <div class="form-group"><label>Name</label><input name="name" required /></div>
            <div class="form-row">
              <div class="form-group"><label>Category</label><input name="category" required /></div>
              <div class="form-group"><label>Price</label><input name="price" type="number" min="0" required /></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Condition</label><input name="condition" placeholder="Excellent" /></div>
              <div class="form-group"><label>Status</label>
                <select name="status"><option>available</option><option>reserved</option><option>sold</option><option>incoming</option></select>
              </div>
            </div>
            <div class="form-group"><label>Description</label><textarea name="description"></textarea></div>
            <div class="form-group"><label>Image URL (comma separated)</label><input name="images" placeholder="https://..." /></div>
            <div class="form-row">
              <label><input type="checkbox" name="featured" /> Featured</label>
              <label><input type="checkbox" name="hotSelling" /> Hot Selling</label>
            </div>
            <div class="form-row" style="margin-top:.5rem">
              <label><input type="checkbox" name="upcoming" /> Upcoming</label>
            </div>
            <div class="admin-actions">
              <button class="btn btn--primary" type="submit">Save Product</button>
              <button class="btn btn--secondary" id="product-reset" type="button">Reset</button>
            </div>
          </form>
        </div>
      </section>
    `;
  },

  panelCategories() {
    const rows = this.state.categories.map(c => `
      <tr>
        <td>${c.name}</td><td>${c.icon || '•'}</td><td>${c.order ?? ''}</td>
        <td>
          <button class="btn btn--secondary btn--sm" data-edit-category="${c.id}">Edit</button>
          <button class="btn btn-danger btn--sm" data-del-category="${c.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    return `
      <section class="admin-panel" data-panel="categories">
        <h2 style="margin-bottom:1rem">Manage Categories</h2>
        <div class="admin-grid">
          <div class="table-wrap"><table><thead><tr><th>Name</th><th>Icon</th><th>Order</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>
          <form class="form-card" id="category-form">
            <input type="hidden" name="id" />
            <div class="form-group"><label>Name</label><input name="name" required /></div>
            <div class="form-row">
              <div class="form-group"><label>Icon</label><input name="icon" placeholder="🍽️" /></div>
              <div class="form-group"><label>Order</label><input name="order" type="number" min="0" /></div>
            </div>
            <div class="admin-actions">
              <button class="btn btn--primary" type="submit">Save Category</button>
              <button class="btn btn--secondary" id="category-reset" type="button">Reset</button>
            </div>
          </form>
        </div>
      </section>
    `;
  },

  panelHomepage() {
    const hp = this.state.homepage || {};
    return `
      <section class="admin-panel" data-panel="homepage">
        <h2 style="margin-bottom:1rem">Manage Homepage Content</h2>
        <form class="form-card" id="homepage-form">
          <div class="form-group"><label>Hero Title</label><input name="heroTitle" value="${this.escape(hp.heroTitle || '')}" /></div>
          <div class="form-group"><label>Hero Subtitle</label><textarea name="heroSubtitle">${this.escape(hp.heroSubtitle || '')}</textarea></div>
          <div class="form-group"><label>CTA Title</label><input name="ctaTitle" value="${this.escape(hp.ctaTitle || '')}" /></div>
          <div class="form-group"><label>CTA Text</label><textarea name="ctaText">${this.escape(hp.ctaText || '')}</textarea></div>
          <button class="btn btn--primary" type="submit">Save Homepage</button>
        </form>
      </section>
    `;
  },

  panelContact() {
    const c = this.state.contact || {};
    return `
      <section class="admin-panel" data-panel="contact">
        <h2 style="margin-bottom:1rem">Manage Contact Information</h2>
        <form class="form-card" id="contact-form">
          <div class="form-row">
            <div class="form-group"><label>Phone</label><input name="phone" value="${this.escape(c.phone || '')}" /></div>
            <div class="form-group"><label>WhatsApp</label><input name="whatsapp" value="${this.escape(c.whatsapp || '')}" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Email</label><input name="email" value="${this.escape(c.email || '')}" /></div>
            <div class="form-group"><label>Hours</label><input name="hours" value="${this.escape(c.hours || '')}" /></div>
          </div>
          <div class="form-group"><label>Address</label><textarea name="address">${this.escape(c.address || '')}</textarea></div>
          <button class="btn btn--primary" type="submit">Save Contact Info</button>
        </form>
      </section>
    `;
  },

  panelTestimonials() {
    const rows = this.state.testimonials.map(t => `
      <tr>
        <td>${t.name}</td><td>${t.role || ''}</td><td>${t.rating || 5}</td>
        <td>
          <button class="btn btn--secondary btn--sm" data-edit-testimonial="${t.id}">Edit</button>
          <button class="btn btn-danger btn--sm" data-del-testimonial="${t.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    return `
      <section class="admin-panel" data-panel="testimonials">
        <h2 style="margin-bottom:1rem">Manage Testimonials</h2>
        <div class="admin-grid">
          <div class="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Rating</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>
          <form class="form-card" id="testimonial-form">
            <input type="hidden" name="id" />
            <div class="form-group"><label>Name</label><input name="name" required /></div>
            <div class="form-group"><label>Role</label><input name="role" /></div>
            <div class="form-group"><label>Rating</label><input name="rating" type="number" min="1" max="5" value="5" /></div>
            <div class="form-group"><label>Text</label><textarea name="text" required></textarea></div>
            <div class="admin-actions">
              <button class="btn btn--primary" type="submit">Save Testimonial</button>
              <button class="btn btn--secondary" id="testimonial-reset" type="button">Reset</button>
            </div>
          </form>
        </div>
      </section>
    `;
  },

  panelStatistics() {
    const rows = this.state.statistics.map(s => `
      <tr>
        <td>${s.label}</td><td>${s.number}</td><td>${s.suffix || ''}</td>
        <td>
          <button class="btn btn--secondary btn--sm" data-edit-stat="${s.id}">Edit</button>
          <button class="btn btn-danger btn--sm" data-del-stat="${s.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    return `
      <section class="admin-panel" data-panel="statistics">
        <h2 style="margin-bottom:1rem">Manage Statistics</h2>
        <div class="admin-grid">
          <div class="table-wrap"><table><thead><tr><th>Label</th><th>Number</th><th>Suffix</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>
          <form class="form-card" id="stat-form">
            <input type="hidden" name="id" />
            <div class="form-group"><label>Label</label><input name="label" required /></div>
            <div class="form-row">
              <div class="form-group"><label>Number</label><input name="number" type="number" min="0" required /></div>
              <div class="form-group"><label>Suffix</label><input name="suffix" placeholder="+ or %" /></div>
            </div>
            <div class="admin-actions">
              <button class="btn btn--primary" type="submit">Save Statistic</button>
              <button class="btn btn--secondary" id="stat-reset" type="button">Reset</button>
            </div>
          </form>
        </div>
      </section>
    `;
  },

  panelFloating() {
    const rows = this.state.floatingButtons.map(b => `
      <tr>
        <td>${b.label}</td><td>${b.type}</td><td>${b.order ?? ''}</td><td>${b.enabled ? 'Yes' : 'No'}</td>
        <td>
          <button class="btn btn--secondary btn--sm" data-edit-floating="${b.id}">Edit</button>
          <button class="btn btn-danger btn--sm" data-del-floating="${b.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    return `
      <section class="admin-panel" data-panel="floating">
        <h2 style="margin-bottom:1rem">Manage Floating Buttons</h2>
        <div class="admin-grid">
          <div class="table-wrap"><table><thead><tr><th>Label</th><th>Type</th><th>Order</th><th>Enabled</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>
          <form class="form-card" id="floating-form">
            <input type="hidden" name="id" />
            <div class="form-group"><label>Label</label><input name="label" required /></div>
            <div class="form-row">
              <div class="form-group"><label>Type</label>
                <select name="type">
                  <option>whatsapp</option><option>call</option><option>email</option><option>instagram</option><option>facebook</option><option>telegram</option><option>youtube</option>
                </select>
              </div>
              <div class="form-group"><label>Order</label><input name="order" type="number" min="0" /></div>
            </div>
            <div class="form-group"><label>URL</label><input name="url" required placeholder="https:// or tel:" /></div>
            <div class="form-group"><label><input type="checkbox" name="enabled" checked /> Enabled</label></div>
            <div class="admin-actions">
              <button class="btn btn--primary" type="submit">Save Floating Button</button>
              <button class="btn btn--secondary" id="floating-reset" type="button">Reset</button>
            </div>
          </form>
        </div>
      </section>
    `;
  },

  async loadData() {
    const [products, categories, testimonials, statistics, floatingButtons, socialLinks, contact, homepage] = await Promise.all([
      FirebaseService.getProducts(),
      FirebaseService.getCategories(),
      FirebaseService.getTestimonials(),
      FirebaseService.getStatistics(),
      FirebaseService.getCollection ? FirebaseService.getCollection('floating_buttons') : FirebaseService.getFloatingButtons(),
      FirebaseService.getSocialLinks(),
      FirebaseService.getContact(),
      FirebaseService.getHomepage()
    ]);

    this.state.products = products || [];
    this.state.categories = categories || [];
    this.state.testimonials = testimonials || [];
    this.state.statistics = statistics || FirebaseService.getDemoData().statistics;
    this.state.floatingButtons = floatingButtons || FirebaseService.getDemoData().floating_buttons;
    this.state.socialLinks = socialLinks || [];
    this.state.contact = contact || {};
    this.state.homepage = homepage || {};
  },

  bindGlobalEvents() {
    document.querySelectorAll('[data-panel]').forEach(el => {
      if (el.classList.contains('admin-nav-btn')) {
        el.addEventListener('click', () => this.setPanel(el.dataset.panel));
      }
    });

    document.getElementById('refresh-btn')?.addEventListener('click', async () => {
      await this.renderDashboard();
      this.toast('Dashboard refreshed');
    });

    document.getElementById('logout-btn')?.addEventListener('click', async () => {
      if (!FirebaseService.isInitialized()) return this.toast('Demo mode: logout disabled');
      await FirebaseService.signOut();
    });
  },

  setPanel(panelId) {
    this.state.activePanel = panelId;
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === panelId));
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.panel === panelId));
  },

  bindProducts() {
    const form = document.getElementById('product-form');
    if (!form) return;

    document.querySelectorAll('[data-edit-product]').forEach(btn => btn.addEventListener('click', () => {
      const p = this.state.products.find(x => x.id === btn.dataset.editProduct);
      if (!p) return;
      form.id.value = p.id;
      form.name.value = p.name || '';
      form.category.value = p.category || '';
      form.price.value = p.price || 0;
      form.condition.value = p.condition || '';
      form.status.value = p.status || 'available';
      form.description.value = p.description || '';
      form.images.value = (p.images || []).join(', ');
      form.featured.checked = !!p.featured;
      form.hotSelling.checked = !!p.hotSelling;
      form.upcoming.checked = !!p.upcoming;
      this.setPanel('products');
    }));

    document.querySelectorAll('[data-del-product]').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('Delete this product?')) return;
      await this.safeDelete('products', btn.dataset.delProduct);
    }));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const id = fd.get('id') || `p-${Date.now()}`;
      const data = {
        name: fd.get('name'), category: fd.get('category'), price: Number(fd.get('price') || 0),
        condition: fd.get('condition') || '', status: fd.get('status') || 'available',
        description: fd.get('description') || '',
        images: String(fd.get('images') || '').split(',').map(s => s.trim()).filter(Boolean),
        featured: form.featured.checked, hotSelling: form.hotSelling.checked, upcoming: form.upcoming.checked,
        createdAt: Date.now()
      };
      await this.safeSave('products', id, data);
      form.reset();
    });

    document.getElementById('product-reset')?.addEventListener('click', () => form.reset());
  },

  bindCategories() { this.bindSimpleCrud('category-form', 'categories', this.state.categories, '[data-edit-category]', '[data-del-category]', ['name','icon','order']); },
  bindTestimonials() { this.bindSimpleCrud('testimonial-form', 'testimonials', this.state.testimonials, '[data-edit-testimonial]', '[data-del-testimonial]', ['name','role','rating','text']); },
  bindStatistics() { this.bindSimpleCrud('stat-form', 'statistics', this.state.statistics, '[data-edit-stat]', '[data-del-stat]', ['label','number','suffix']); },
  bindFloating() { this.bindSimpleCrud('floating-form', 'floating_buttons', this.state.floatingButtons, '[data-edit-floating]', '[data-del-floating]', ['label','type','order','url','enabled']); },

  bindHomepage() {
    const form = document.getElementById('homepage-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = {
        ...this.state.homepage,
        heroTitle: fd.get('heroTitle') || '',
        heroSubtitle: fd.get('heroSubtitle') || '',
        ctaTitle: fd.get('ctaTitle') || '',
        ctaText: fd.get('ctaText') || ''
      };
      await this.safeSave('homepage', 'content', data);
    });
  },

  bindContact() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = {
        phone: fd.get('phone') || '', whatsapp: fd.get('whatsapp') || '', email: fd.get('email') || '',
        hours: fd.get('hours') || '', address: fd.get('address') || ''
      };
      await this.safeSave('contact', 'info', data);
    });
  },

  bindSimpleCrud(formId, collection, source, editSelector, delSelector, fields) {
    const form = document.getElementById(formId);
    if (!form) return;

    document.querySelectorAll(editSelector).forEach(btn => btn.addEventListener('click', () => {
      const id = Object.values(btn.dataset)[0];
      const item = source.find(x => x.id === id);
      if (!item) return;
      form.id.value = item.id;
      fields.forEach(f => {
        if (!(f in form)) return;
        if (form[f].type === 'checkbox') form[f].checked = !!item[f];
        else form[f].value = item[f] ?? '';
      });
    }));

    document.querySelectorAll(delSelector).forEach(btn => btn.addEventListener('click', async () => {
      const id = Object.values(btn.dataset)[0];
      if (!confirm('Delete this item?')) return;
      await this.safeDelete(collection, id);
    }));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const id = fd.get('id') || `${collection.slice(0,3)}-${Date.now()}`;
      const data = { order: Number(fd.get('order') || 0) };
      fields.forEach(f => {
        if (!(f in form)) return;
        if (form[f].type === 'checkbox') data[f] = form[f].checked;
        else data[f] = fd.get(f);
      });
      if ('number' in data) data.number = Number(data.number || 0);
      if ('rating' in data) data.rating = Number(data.rating || 5);
      await this.safeSave(collection, id, data);
      form.reset();
    });

    const resetBtnId = formId.replace('-form', '-reset');
    document.getElementById(resetBtnId)?.addEventListener('click', () => form.reset());
  },

  async safeSave(collection, id, data) {
    try {
      if (!FirebaseService.isInitialized()) {
        this.toast(`Demo mode: ${collection}/${id} simulated save.`);
        return;
      }
      await FirebaseService.saveDoc(collection, id, data);
      this.toast('Saved successfully');
      await this.renderDashboard();
      this.setPanel(this.state.activePanel);
    } catch (e) {
      this.toast(e.message || 'Save failed');
    }
  },

  async safeDelete(collection, id) {
    try {
      if (!FirebaseService.isInitialized()) {
        this.toast(`Demo mode: ${collection}/${id} simulated delete.`);
        return;
      }
      await FirebaseService.deleteDoc(collection, id);
      this.toast('Deleted successfully');
      await this.renderDashboard();
      this.setPanel(this.state.activePanel);
    } catch (e) {
      this.toast(e.message || 'Delete failed');
    }
  },

  escape(v) {
    return String(v || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  },

  toast(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
};

document.addEventListener('DOMContentLoaded', () => AdminApp.init());
