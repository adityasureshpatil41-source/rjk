const Navigation = {
  pages: [
    { href: 'index.html', label: 'Home' },
    { href: 'products.html', label: 'Products' },
    { href: 'hot-selling.html', label: 'Hot Selling' },
    { href: 'upcoming.html', label: 'Upcoming' },
    { href: 'about.html', label: 'About' },
    { href: 'contact.html', label: 'Contact' }
  ],

  render(container) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    container.innerHTML = `
      <header class="header" id="header">
        <div class="container header__inner">
          <a href="index.html" class="logo" aria-label="Raj Kitchen Home">
            <span class="logo__icon">R</span>
            <span class="logo__brand">RAJ <span class="text-gold">KITCHEN</span></span>
          </a>
          <button class="nav__toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <nav class="nav" aria-label="Main navigation">
            <ul class="nav__list" id="nav-list">
              ${this.pages.map(p => `
                <li><a href="${p.href}" class="nav__link ${currentPage === p.href ? 'active' : ''}">${p.label}</a></li>
              `).join('')}
            </ul>
            <a href="products.html" class="btn btn--primary btn--sm nav__cta">Browse Inventory</a>
          </nav>
        </div>
      </header>
    `;
    this.bindEvents();
  },

  bindEvents() {
    const toggle = document.getElementById('nav-toggle');
    const list = document.getElementById('nav-list');
    const header = document.getElementById('header');

    if (toggle && list) {
      toggle.addEventListener('click', () => {
        const open = list.classList.toggle('open');
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });

      list.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
          list.classList.remove('open');
          toggle.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      if (header) header.classList.toggle('scrolled', scroll > 50);
      lastScroll = scroll;
    }, { passive: true });
  }
};
