/**
 * Premium 3D Hero — Cinematic showroom with env reflections, parallax camera,
 * animated lighting, and responsive mouse/touch interaction.
 */
const Hero3D = (() => {
  let scene, camera, renderer, showcase, envMap;
  let fridgeGroup, displayGroup, platform, particles;
  let lights = {};
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let autoAngle = 0;
  let animationId = null;
  let isMobile = false;
  let isVisible = true;
  let clock = null;

  function init(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof THREE === 'undefined') return;

    isMobile = window.innerWidth < 768;
    clock = new THREE.Clock();

    const wrap = canvas.parentElement;
    const w = wrap.clientWidth || window.innerWidth;
    const h = wrap.clientHeight || 500;
    const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080809, 0.04);

    camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 80);
    camera.position.set(0, 2.2, isMobile ? 7.5 : 6.2);
    camera.lookAt(0, 1.4, 0);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;

    envMap = buildEnvironmentMap(renderer);
    scene.environment = envMap;

    showcase = new THREE.Group();
    scene.add(showcase);

    platform = createPlatform();
    showcase.add(platform);

    fridgeGroup = createRefrigerator();
    displayGroup = createDisplayCounter();
    showcase.add(fridgeGroup);
    showcase.add(displayGroup);

    fridgeGroup.position.set(isMobile ? -0.6 : -1.8, 0, 0);
    displayGroup.position.set(isMobile ? 0.8 : 2.4, 0, isMobile ? -0.5 : 0.2);
    displayGroup.scale.setScalar(isMobile ? 0.75 : 0.9);

    particles = createParticles();
    scene.add(particles);

    setupLighting();
    bindEvents(canvas);
    observeVisibility(canvas);

    requestAnimationFrame(() => onResize());
    window.addEventListener('resize', onResize);
    animate();
  }

  function buildEnvironmentMap(renderer) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, 0, size);
    bg.addColorStop(0, '#2a2540');
    bg.addColorStop(0.45, '#12121a');
    bg.addColorStop(1, '#050508');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const goldGlow = ctx.createRadialGradient(size * 0.7, size * 0.35, 0, size * 0.7, size * 0.35, size * 0.9);
    goldGlow.addColorStop(0, 'rgba(201, 169, 98, 0.55)');
    goldGlow.addColorStop(0.4, 'rgba(201, 169, 98, 0.12)');
    goldGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = goldGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const coolGlow = ctx.createRadialGradient(size * 0.2, size * 0.6, 0, size * 0.2, size * 0.6, size * 0.7);
    coolGlow.addColorStop(0, 'rgba(120, 160, 255, 0.25)');
    coolGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = coolGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;

    if (typeof THREE.PMREMGenerator !== 'undefined') {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const map = pmrem.fromEquirectangular(tex).texture;
      pmrem.dispose();
      tex.dispose();
      return map;
    }
    return tex;
  }

  function mat(color, opts = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: opts.metalness ?? 0.85,
      roughness: opts.roughness ?? 0.18,
      envMap,
      envMapIntensity: opts.envIntensity ?? 1.8,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 0,
    });
  }

  function glassMat(tint = 0x88ccff) {
    return new THREE.MeshPhysicalMaterial({
      color: tint,
      metalness: 0.05,
      roughness: 0.05,
      transparent: true,
      opacity: 0.35,
      reflectivity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMap,
      envMapIntensity: 2.2,
      side: THREE.DoubleSide
    });
  }

  function createPlatform() {
    const group = new THREE.Group();

    const podium = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 4.2, 0.18, isMobile ? 32 : 64),
      mat(0x1a1a22, { metalness: 0.95, roughness: 0.12, envIntensity: 2.5 })
    );
    podium.position.y = -0.09;
    podium.receiveShadow = true;
    group.add(podium);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.9, 0.04, 8, 64),
      mat(0xc9a962, { metalness: 1, roughness: 0.08, envIntensity: 3 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(12, 64),
      new THREE.MeshStandardMaterial({
        color: 0x0a0a0e,
        metalness: 0.9,
        roughness: 0.35,
        envMap,
        envMapIntensity: 1.2,
        transparent: true,
        opacity: 0.85
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.15;
    floor.receiveShadow = true;
    group.add(floor);

    return group;
  }

  function createRefrigerator() {
    const group = new THREE.Group();
    const steel = mat(0xc8ced8, { metalness: 0.92, roughness: 0.14 });
    const dark = mat(0x2e333c, { metalness: 0.88, roughness: 0.22 });
    const gold = mat(0xc9a962, { metalness: 1, roughness: 0.06, envIntensity: 3 });
    const glass = glassMat(0xaad4ff);
    const interiorGlow = mat(0x4488ff, { emissive: 0x2266cc, emissiveIntensity: 0.8, metalness: 0.2, roughness: 0.4 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 3.1, 0.95), steel);
    body.position.y = 1.55;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const interior = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.8, 0.7), interiorGlow);
    interior.position.set(0, 1.6, 0);
    group.add(interior);

    const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.03, 0.65), dark);
    shelf1.position.set(0, 2.2, 0);
    const shelf2 = shelf1.clone();
    shelf2.position.y = 1.5;
    group.add(shelf1, shelf2);

    [-0.42, 0.42].forEach((x, i) => {
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.05), dark);
      door.position.set(x, 2.35, 0.5);
      door.castShadow = true;
      group.add(door);

      const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.95, 0.02), glass);
      doorGlass.position.set(x, 2.45, 0.54);
      group.add(doorGlass);

      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 12), gold);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(x + (i === 0 ? -0.34 : 0.34), 2.35, 0.58);
      group.add(handle);
    });

    const lowerDoor = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.85, 0.05), dark);
    lowerDoor.position.set(0, 0.55, 0.5);
    group.add(lowerDoor);

    const compressor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.4), dark);
    compressor.position.set(0.55, 0.2, -0.35);
    group.add(compressor);

    const ventGeo = new THREE.BoxGeometry(0.35, 0.02, 0.25);
    for (let v = 0; v < 4; v++) {
      const vent = new THREE.Mesh(ventGeo, mat(0x111318, { roughness: 0.5 }));
      vent.position.set(0.55, 0.38 + v * 0.05, -0.48);
      group.add(vent);
    }

    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.04, 0.97), gold);
    trim.position.y = 3.12;
    group.add(trim);

    const led = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.015, 0.02),
      mat(0xfff0cc, { emissive: 0xffd080, emissiveIntensity: 1.2, metalness: 0 })
    );
    led.position.set(0, 3.05, 0.49);
    group.add(led);

    const wheelGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16);
    [[-0.65, 0.07, 0.38], [0.65, 0.07, 0.38], [-0.65, 0.07, -0.38], [0.65, 0.07, -0.38]].forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, dark);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(...pos);
      group.add(wheel);
    });

    group.userData.spinSpeed = 1;
    return group;
  }

  function createDisplayCounter() {
    const group = new THREE.Group();
    const steel = mat(0xd0d6de, { metalness: 0.9, roughness: 0.12 });
    const dark = mat(0x252830, { metalness: 0.85, roughness: 0.28 });
    const gold = mat(0xc9a962, { metalness: 1, roughness: 0.05, envIntensity: 3 });
    const glass = glassMat(0xffeedd);
    const warmGlow = mat(0xffaa66, { emissive: 0xff8833, emissiveIntensity: 0.6 });

    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 0.85), dark);
    cabinet.position.y = 0.42;
    cabinet.castShadow = true;
    group.add(cabinet);

    const top = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.06, 0.88), steel);
    top.position.y = 0.88;
    group.add(top);

    const curvedGlass = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.15, 0.04), glass);
    curvedGlass.position.set(0, 1.55, 0.4);
    curvedGlass.rotation.x = -0.12;
    group.add(curvedGlass);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.05, 0.95), gold);
    canopy.position.y = 2.25;
    group.add(canopy);

    const stripLight = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.02, 0.03),
      mat(0xfff5e0, { emissive: 0xffe8b0, emissiveIntensity: 1.5, metalness: 0 })
    );
    stripLight.position.set(0, 2.12, 0.44);
    group.add(stripLight);

    const innerShelf = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.02, 0.6), steel);
    innerShelf.position.set(0, 1.15, 0.08);
    group.add(innerShelf);

    const pastryColors = [0xe8c49a, 0xd4a574, 0xf5deb3, 0xc9956b];
    pastryColors.forEach((c, i) => {
      const pastry = new THREE.Mesh(
        new THREE.SphereGeometry(0.12 + (i % 2) * 0.04, 12, 12),
        mat(c, { metalness: 0.1, roughness: 0.6, envIntensity: 0.5 })
      );
      pastry.position.set(-0.6 + i * 0.4, 1.25, 0.15);
      pastry.scale.y = 0.7;
      group.add(pastry);
    });

    const glowPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.6), warmGlow);
    glowPanel.position.set(0, 1.4, 0.05);
    group.add(glowPanel);

    group.userData.spinSpeed = -0.6;
    return group;
  }

  function createParticles() {
    const count = isMobile ? 40 : 80;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const baseY = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      baseY.push(positions[i * 3 + 1]);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const matP = new THREE.PointsMaterial({
      color: 0xc9a962,
      size: isMobile ? 0.04 : 0.06,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const points = new THREE.Points(geo, matP);
    points.userData.baseY = baseY;
    return points;
  }

  function setupLighting() {
    lights.ambient = new THREE.AmbientLight(0x404060, 0.35);
    scene.add(lights.ambient);

    lights.key = new THREE.DirectionalLight(0xfff8ee, 2.2);
    lights.key.position.set(4, 10, 6);
    lights.key.castShadow = !isMobile;
    if (lights.key.castShadow) {
      lights.key.shadow.mapSize.set(1024, 1024);
      lights.key.shadow.camera.near = 1;
      lights.key.shadow.camera.far = 20;
      lights.key.shadow.camera.left = -6;
      lights.key.shadow.camera.right = 6;
      lights.key.shadow.camera.top = 6;
      lights.key.shadow.camera.bottom = -6;
    }
    scene.add(lights.key);

    lights.fill = new THREE.DirectionalLight(0x8899cc, 0.6);
    lights.fill.position.set(-6, 4, -2);
    scene.add(lights.fill);

    lights.gold = new THREE.SpotLight(0xc9a962, 1.8, 18, Math.PI / 5, 0.4, 1);
    lights.gold.position.set(3, 6, 4);
    lights.gold.target.position.set(0, 1.5, 0);
    scene.add(lights.gold);
    scene.add(lights.gold.target);

    lights.rim = new THREE.SpotLight(0x6688ff, 1.2, 15, Math.PI / 4, 0.5, 1);
    lights.rim.position.set(-4, 5, -3);
    lights.rim.target.position.set(0, 1.2, 0);
    scene.add(lights.rim);
    scene.add(lights.rim.target);

    lights.under = new THREE.PointLight(0xc9a962, 0.8, 8);
    lights.under.position.set(0, 0.3, 2);
    scene.add(lights.under);
  }

  function bindEvents(canvas) {
    const updateMouse = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = ((clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.targetY = ((clientY - rect.top) / rect.height - 0.5) * 2;
    };

    canvas.addEventListener('mousemove', (e) => updateMouse(e.clientX, e.clientY));
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches[0]) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    canvas.addEventListener('mouseleave', () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    });
  }

  function observeVisibility(canvas) {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    obs.observe(canvas);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    if (!isVisible || !renderer) return;

    const t = clock.getElapsedTime();
    const dt = clock.getDelta();

    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;

    autoAngle += isMobile ? 0.004 : 0.006;

    if (showcase) {
      showcase.rotation.y = autoAngle + mouse.x * 0.45;
      showcase.rotation.x = mouse.y * 0.08;
      showcase.position.y = Math.sin(t * 1.2) * 0.06;
    }

    if (fridgeGroup) {
      fridgeGroup.rotation.y = Math.sin(t * 0.8) * 0.08 + mouse.x * 0.12;
      fridgeGroup.position.y = Math.sin(t * 1.5) * 0.04;
    }

    if (displayGroup) {
      displayGroup.rotation.y = Math.cos(t * 0.7) * 0.1 - mouse.x * 0.1;
      displayGroup.position.y = Math.sin(t * 1.3 + 1) * 0.05;
    }

    if (camera) {
      const camX = mouse.x * 0.8;
      const camY = 2.2 + mouse.y * 0.35;
      const camZ = (isMobile ? 7.5 : 6.2) - mouse.y * 0.3;
      camera.position.x += (camX - camera.position.x) * 0.05;
      camera.position.y += (camY - camera.position.y) * 0.05;
      camera.position.z += (camZ - camera.position.z) * 0.05;
      camera.lookAt(mouse.x * 0.3, 1.4 + mouse.y * 0.15, 0);
    }

    if (lights.gold) {
      lights.gold.position.x = 3 + Math.sin(t * 0.5) * 1.2;
      lights.gold.intensity = 1.6 + Math.sin(t * 2) * 0.3;
    }
    if (lights.rim) {
      lights.rim.position.x = -4 + Math.cos(t * 0.4) * 0.8;
    }
    if (lights.under) {
      lights.under.intensity = 0.6 + Math.sin(t * 1.8) * 0.25;
    }

    if (particles) {
      particles.rotation.y = t * 0.04;
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        const base = particles.userData.baseY?.[i / 3];
        if (base !== undefined) pos[i + 1] = base + Math.sin(t * 1.5 + i) * 0.12;
      }
      particles.geometry.attributes.position.needsUpdate = true;
    }

    if (platform) {
      const ring = platform.children[1];
      if (ring) ring.rotation.z = t * 0.15;
    }

    renderer.render(scene, camera);
  }

  function onResize() {
    if (!renderer || !camera) return;
    const canvas = renderer.domElement;
    const wrap = canvas.parentElement;
    if (!wrap) return;

    isMobile = window.innerWidth < 768;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w === 0 || h === 0) return;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onResize);
    if (envMap) envMap.dispose();
    if (renderer) renderer.dispose();
  }

  return { init, destroy };
})();
