# Raj Kitchen — Premium Commercial Equipment Showroom

A complete luxury-grade, fully responsive website for buying and selling second-hand commercial kitchen equipment, built with lightweight static technologies:

- HTML5
- CSS3
- Vanilla JavaScript
- GSAP, AOS, Swiper.js
- Firebase Auth, Firestore, and Storage integration

## Pages

1. Home (`/index.html`)
2. Products (`/products.html`)
3. Product Details (`/product-detail.html?id=...`)
4. Hot Selling (`/hot-selling.html`)
5. Upcoming Inventory (`/upcoming.html`)
6. About Us (`/about.html`)
7. Contact Us (`/contact.html`)
8. Admin Panel (`/admin/index.html`)

## Core Features

- Cinematic premium hero with interactive 3D refrigerator + bakery counter
- Glassmorphism and metallic luxury UI language
- Featured, new arrivals, and best-deals product tabs
- Category tilt and depth interactions
- Animated stats counters and testimonial slider
- Product filters (category, status, search, sort)
- Product detail gallery with direct call/WhatsApp/email actions
- Dynamic floating action buttons system
- Admin dashboard for full content management

## Firebase Collections

- `products`
- `categories`
- `homepage`
- `testimonials`
- `contact`
- `social_links`
- `floating_buttons`
- `upcoming_inventory` (supported by data model via upcoming flag)
- `statistics`

## Firebase Storage Buckets/Folders

- `product_images/`
- `hero_images/`
- `about_images/`

## Setup

### 1) Configure Firebase

Edit the following files with your Firebase project credentials:

- `/js/firebase-config.js`
- `/admin/js/firebase-config.js`

Set:

```js
const FIREBASE_ENABLED = true;
```

### 2) Enable Firebase services

- Authentication (Email/Password for admins)
- Firestore database
- Storage

### 3) Run locally

Use any static server (recommended):

```bash
python3 -m http.server 8080
```

Open:

- Website: `http://localhost:8080`
- Admin: `http://localhost:8080/admin/`

## Admin Panel Capabilities

- Firebase Authentication login
- Dashboard overview KPI cards
- Manage Products (create/edit/delete)
- Manage Categories
- Manage Homepage content
- Manage Contact information
- Manage Testimonials
- Manage Statistics
- Manage Floating Buttons (add/remove/reorder/enable/disable)

## Performance Notes

- Lightweight static architecture
- Deferred script loading
- Lazy-loaded images
- Mobile optimized 3D complexity and pixel ratio
- Smooth animations with reduced-motion support

## Important

When Firebase is not configured, the site runs in demo mode using fallback data to ensure design and interactions are fully previewable.
