const Animations = {
  init() {
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 80 });
    }
    this.initHeroAnimations();
    this.initCounterAnimations();
    this.initParallax();
    this.initCategoryTilt();
    this.initMarquee();
  },

  initHeroAnimations() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero .eyebrow', { y: 30, opacity: 0, duration: 0.8 })
      .from('.hero__title', { y: 60, opacity: 0, duration: 1 }, '-=0.4')
      .from('.hero__subtitle', { y: 40, opacity: 0, duration: 0.8 }, '-=0.5')
      .from('.hero__actions .btn', { y: 30, opacity: 0, duration: 0.6, stagger: 0.15 }, '-=0.3')
      .from('.hero__trust-item', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.2')
      .from('.hero__visual', { x: 40, opacity: 0, duration: 1 }, '-=0.8');
  },

  initCounterAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.round(this.targets()[0].val) + suffix;
            }
          });
        }
      });
    });
  },

  initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.utils.toArray('.parallax-layer').forEach(layer => {
      const speed = parseFloat(layer.dataset.speed) || 0.3;
      gsap.to(layer, {
        y: () => window.innerHeight * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: layer.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  },

  initCategoryTilt() {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  },

  initMarquee() {
    const track = document.querySelector('.marquee__track');
    if (!track) return;
    const items = track.innerHTML;
    track.innerHTML = items + items;
  },

  initPageHero() {
    if (typeof gsap === 'undefined') return;
    gsap.from('.page-hero .eyebrow', { y: 20, opacity: 0, duration: 0.6 });
    gsap.from('.page-hero__title', { y: 40, opacity: 0, duration: 0.8, delay: 0.1 });
    gsap.from('.page-hero__subtitle', { y: 30, opacity: 0, duration: 0.6, delay: 0.2 });
  },

  fadeInStagger(selector) {
    if (typeof gsap === 'undefined') return;
    gsap.from(selector, {
      y: 40, opacity: 0, duration: 0.6, stagger: 0.1,
      scrollTrigger: { trigger: selector, start: 'top 85%' }
    });
  }
};
