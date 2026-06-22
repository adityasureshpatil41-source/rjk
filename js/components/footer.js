const Footer = {
  async render(container) {
    const contact = await FirebaseService.getContact();
    const socials = await FirebaseService.getSocialLinks();

    const socialIcons = {
      instagram: 'IG', facebook: 'FB', youtube: 'YT', telegram: 'TG'
    };

    container.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer__grid">
            <div>
              <a href="index.html" class="logo">
                <span class="logo__icon">R</span>
                <span>RAJ <span class="text-gold">KITCHEN</span></span>
              </a>
              <p class="footer__brand-text">
                India's premier destination for pre-owned commercial kitchen equipment.
                Luxury quality, exceptional value.
              </p>
            </div>
            <div>
              <h4 class="footer__heading">Quick Links</h4>
              <div class="footer__links">
                <a href="products.html" class="footer__link">All Products</a>
                <a href="hot-selling.html" class="footer__link">Hot Selling</a>
                <a href="upcoming.html" class="footer__link">Upcoming Inventory</a>
                <a href="about.html" class="footer__link">About Us</a>
              </div>
            </div>
            <div>
              <h4 class="footer__heading">Categories</h4>
              <div class="footer__links">
                <a href="products.html?category=Refrigerators" class="footer__link">Refrigerators</a>
                <a href="products.html?category=Ovens" class="footer__link">Ovens</a>
                <a href="products.html?category=Bakery%20Counters" class="footer__link">Bakery Counters</a>
                <a href="products.html?category=Deep%20Freezers" class="footer__link">Deep Freezers</a>
              </div>
            </div>
            <div>
              <h4 class="footer__heading">Contact</h4>
              <div class="footer__links">
                <a href="tel:${contact.phone}" class="footer__link">${contact.phone}</a>
                <a href="mailto:${contact.email}" class="footer__link">${contact.email}</a>
                <span class="footer__link">${contact.address}</span>
                <span class="footer__link">${contact.hours}</span>
              </div>
            </div>
          </div>
          <div class="footer__bottom">
            <span>&copy; ${new Date().getFullYear()} Raj Kitchen. All rights reserved.</span>
            <div class="footer__socials">
              ${socials.map(s => `
                <a href="${s.url}" class="footer__social" target="_blank" rel="noopener" aria-label="${s.platform}">
                  ${socialIcons[s.platform] || s.platform.charAt(0).toUpperCase()}
                </a>
              `).join('')}
            </div>
          </div>
        </div>
      </footer>
    `;
  }
};
