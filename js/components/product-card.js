const ProductCard = {
  render(product) {
    const statusClass = `badge--${product.status}`;
    const img = (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80';

    return `
      <article class="product-card" data-aos="fade-up" data-product-id="${product.id}">
        <a href="product-detail.html?id=${product.id}">
          <div class="product-card__image-wrap">
            ${product.featured ? '<span class="product-card__featured">Featured</span>' : ''}
            <span class="product-card__badge badge ${statusClass}">${FirebaseService.getStatusBadge(product.status)}</span>
            <img class="product-card__image" src="${img}" alt="${product.name}" loading="lazy" width="400" height="300">
          </div>
          <div class="product-card__body">
            <span class="product-card__category">${product.category}</span>
            <h3 class="product-card__name">${product.name}</h3>
            <p class="product-card__price">${FirebaseService.formatPrice(product.price)}</p>
            <div class="product-card__footer">
              <span class="text-dim text-sm">${product.condition}</span>
              <span class="btn btn--ghost btn--sm">View Details →</span>
            </div>
          </div>
        </a>
      </article>
    `;
  },

  bindTilt() {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
};
