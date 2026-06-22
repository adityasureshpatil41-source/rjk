const Navigation = {
  pages: [
    { href: 'index.html', label: 'Home' },
    { href: 'products.html', label: 'Products' },
    { href: 'hot-selling.html', label: 'Hot Selling' },
    { href: 'upcoming.html', label: 'Upcoming' },
    { href: 'about.html', label: 'About' },
    { href: 'contact.html', label: 'Contact' }
  ],

  scrollLockY: 0,

  render(container) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const linksHtml = this.pages.map(p => `
      <li><a href="${p.href}" class="nav__link ${currentPage === p.href ? 'active' : ''}">${p.label}</a></li>
    `).join('');

    container.innerHTML = `
      <header class="header" id="header">
        <div class="container header__inner">
          <a href="index.html" class="logo" aria-label="Raj Kitchen Home">
            <span class="logo__icon">R</span>
            <span class="logo__brand">RAJ <span class="text-gold">KITCHEN</span></span>
          </a>
          <button class="nav__toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-drawer">
            <span></span><span></span><span></span>
          </button>
          <nav class="nav nav--desktop" aria-label="Main navigation">
            <ul class="nav__list">
              ${linksHtml}
            </ul>
            <a href="products.html" class="btn btn--primary btn--sm nav__cta">Browse Inventory</a>
          </nav>
        </div>
      </header>
    `;

    let drawer = document.getElementById('nav-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'nav-drawer';
      drawer.className = 'nav-drawer';
      drawer.setAttribute('aria-hidden', 'true');
      drawer.innerHTML = `
        <div class="nav-drawer__backdrop" id="nav-drawer-backdrop" aria-hidden="true"></div>
        <nav class="nav-drawer__panel" aria-label="Mobile navigation">
          <ul class="nav-drawer__list">
            ${linksHtml}
          </ul>
          <a href="products.html" class="btn btn--primary nav-drawer__cta">Browse Inventory</a>
        </nav>
      `;
      document.body.appendChild(drawer);
    }

    this.bindEvents();
  },

  bindEvents() {
    const toggle = document.getElementById('nav-toggle');
    const drawer = document.getElementById('nav-drawer');
    const backdrop = document.getElementById('nav-drawer-backdrop');
    const header = document.getElementById('header');

    const setMenuOpen = (open) => {
      if (!toggle || !drawer || !header) return;

      drawer.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      header.classList.toggle('menu-open', open);
      document.documentElement.classList.toggle('nav-locked', open);
      toggle.setAttribute('aria-expanded', open);
      drawer.setAttribute('aria-hidden', !open);

      if (open) {
        this.scrollLockY = window.scrollY;
        document.body.style.top = `-${this.scrollLockY}px`;
      } else {
        document.body.style.top = '';
        window.scrollTo(0, this.scrollLockY);
      }
    };

    if (toggle && drawer) {
      toggle.addEventListener('click', () => {
        setMenuOpen(!drawer.classList.contains('open'));
      });

      if (backdrop) {
        backdrop.addEventListener('click', () => setMenuOpen(false));
      }

      drawer.querySelectorAll('.nav__link, .nav-drawer__cta').forEach(link => {
        link.addEventListener('click', () => setMenuOpen(false));
      });
    }

    window.addEventListener('scroll', () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }
};
