const FloatingButtons = {
  async render() {
    const buttons = await FirebaseService.getFloatingButtons();
    if (!buttons.length) return;

    const container = document.createElement('div');
    container.className = 'floating-actions';
    container.setAttribute('aria-label', 'Quick contact actions');

    container.innerHTML = buttons.map(btn => `
      <a href="${btn.url}" 
         class="floating-btn floating-btn--${btn.type}" 
         target="${btn.type === 'call' || btn.type === 'email' ? '_self' : '_blank'}"
         rel="noopener"
         aria-label="${btn.label}">
        <span class="floating-btn__tooltip">${btn.label}</span>
        ${FirebaseService.ICONS[btn.type] || '●'}
      </a>
    `).join('');

    document.body.appendChild(container);

    if (typeof gsap !== 'undefined') {
      gsap.from(container.children, {
        scale: 0, opacity: 0, duration: 0.5, stagger: 0.1, delay: 1.5, ease: 'back.out(1.7)'
      });
    }
  }
};
