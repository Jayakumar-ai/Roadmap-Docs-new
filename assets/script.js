// Routing & Base Configuration
const VERSION_CONFIG = {
  'roadmaperp_28_1_ai': {
    name: '28.1 AI',
    fullName: 'RoadmapERP 28.1 AI',
    prefix: '/roadmaperp_28_1_ai',
    docFolder: 'roadmaperp_28_1_ai',
    imgFolder: 'roadmaperp_28_1_ai'
  },
  'roadmaperp_27_0': {
    name: '27.0',
    fullName: 'RoadmapERP 27.0',
    prefix: '/roadmaperp_27_0',
    docFolder: 'roadmaperp_27_0',
    imgFolder: 'roadmaperp_27_0'
  }
};

function getActiveVersionKey() {
  const pathname = window.location.pathname || '';
  if (pathname.includes('/roadmaperp_27_0')) return 'roadmaperp_27_0';
  if (pathname.includes('/roadmaperp_28_1_ai')) return 'roadmaperp_28_1_ai';
  const hash = window.location.hash || '';
  if (hash.includes('roadmaperp_27_0')) return 'roadmaperp_27_0';
  return 'roadmaperp_28_1_ai';
}

function getBasePrefix() {
  const key = getActiveVersionKey();
  return (VERSION_CONFIG[key] && VERSION_CONFIG[key].prefix) || '/roadmaperp_28_1_ai';
}

let BASE_PREFIX = getBasePrefix();

function updateBasePrefix() {
  BASE_PREFIX = getBasePrefix();
  return BASE_PREFIX;
}

function stripAnyBasePrefix(path) {
  let str = String(path || '').trim();
  for (const key of Object.keys(VERSION_CONFIG)) {
    const p = VERSION_CONFIG[key].prefix;
    if (str.startsWith(p)) {
      return str.substring(p.length);
    }
  }
  return str;
}

// State & Registries
let navSections = [];
let navOrder = [];
const routesByPath = {};
const routesByPageId = {};
const routesByScreenSlug = {};
const routesByModule = {};

// Slugify helper
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\/\\]+/g, '-')
    .replace(/&/g, 'and')
    .replace(/%/g, 'percent')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const customModuleSlugs = {
  'Financials': 'financials',
  'CRM': 'crm',
  'Payroll': 'payroll',
  'PP/ShopFloor': 'pp-shopfloor',
  'Plant Maintenance': 'plant-maintenance',
  'Workflow Management': 'workflow-management',
  'Operating Instructions': 'operating-instructions',
  'Quality Management': 'quality-management',
  'Subcontracting Order': 'subcontracting-order',
  'Sales Order': 'sales-order',
  'Purchase Order': 'purchase-order',
  'Gate Entry': 'gate-entry',
  'Inventory Control': 'inventory-control'
};

const MODULE_METADATA = {
  'financials': {
    title: 'Financials',
    icon: 'bi bi-cash-stack',
    color: '#ff9103',
    bgLight: '#fff7ed',
    desc: 'Core financial management, general ledger, cash/bank, asset accounting, tax compliance, and financial reporting.',
    badge: 'Finance & Accounts'
  },
  'crm': {
    title: 'CRM',
    icon: 'bi bi-people-fill',
    color: '#0284c7',
    bgLight: '#f0f9ff',
    desc: 'Customer relationship workflows, lead nurturing, stage tracking, customer engagement, and opportunity management.',
    badge: 'Sales & Customer'
  },
  'payroll': {
    title: 'Payroll',
    icon: 'bi bi-person-badge-fill',
    color: '#16a34a',
    bgLight: '#f0fdf4',
    desc: 'Employee master data, salary structures, attendance integration, pay slip generation, and statutory deductions.',
    badge: 'Human Resources'
  },
  'pp-shopfloor': {
    title: 'PP/ShopFloor',
    icon: 'bi bi-cpu-fill',
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    desc: 'Production planning, work centers, routing, shop-floor dispatching, machine monitoring, and progress tracking.',
    badge: 'Manufacturing'
  },
  'plant-maintenance': {
    title: 'Plant Maintenance',
    icon: 'bi bi-tools',
    color: '#ea580c',
    bgLight: '#fff7ed',
    desc: 'Preventive and breakdown maintenance schedules, equipment health, spare parts consumption, and service orders.',
    badge: 'Equipment & Plants'
  },
  'workflow-management': {
    title: 'Workflow Management',
    icon: 'bi bi-diagram-3-fill',
    color: '#0891b2',
    bgLight: '#ecfeff',
    desc: 'Hierarchical authorization levels, approval matrices, change request cycles, and audit trails.',
    badge: 'Approvals & Governance'
  },
  'operating-instructions': {
    title: 'Operating Instructions',
    icon: 'bi bi-journal-bookmark-fill',
    color: '#475569',
    bgLight: '#f8fafc',
    desc: 'Standard operating procedures, system setup guidelines, navigation protocols, and end-user instructions.',
    badge: 'Standard Operations'
  },
  'quality-management': {
    title: 'Quality Management',
    icon: 'bi bi-patch-check-fill',
    color: '#059669',
    bgLight: '#ecfdf5',
    desc: 'Incoming material inspections, in-process quality gates, testing protocols, non-conformance, and certificates.',
    badge: 'Quality Control'
  },
  'subcontracting-order': {
    title: 'Subcontracting Order',
    icon: 'bi bi-person-gear',
    color: '#ca8a04',
    bgLight: '#fefce8',
    desc: 'Vendor job-work orders, material issuance vouchers, subcontract GRN tracking, and reconciliation.',
    badge: 'Job Work & Outsourcing'
  },
  'sales-order': {
    title: 'Sales Order',
    icon: 'bi bi-cart-check-fill',
    color: '#2563eb',
    bgLight: '#eff6ff',
    desc: 'Sales orders, amendments, pro-forma invoices, customer schedules, pricing lists, and customer fulfillment.',
    badge: 'Sales & Fulfillment'
  },
  'purchase-order': {
    title: 'Purchase Order',
    icon: 'bi bi-truck',
    color: '#0d9488',
    bgLight: '#f0fdfa',
    desc: 'Procurement workflows, supplier requisitions, purchase orders, approval chains, and vendor performance.',
    badge: 'Procurement & Supply'
  },
  'gate-entry': {
    title: 'Gate Entry',
    icon: 'bi bi-door-open-fill',
    color: '#9333ea',
    bgLight: '#faf5ff',
    desc: 'Inward and outward security checkpoints, vehicle passes, visitor logging, and physical inventory intake.',
    badge: 'Security & Logistics'
  },
  'inventory-control': {
    title: 'Inventory Control',
    icon: 'bi bi-boxes',
    color: '#e11d48',
    bgLight: '#fff1f2',
    desc: 'Warehouse stock movement, bin allocations, batch tracking, stock valuation, and stock audits.',
    badge: 'Inventory & Warehouse'
  }
};

// Resilient fetch helper
async function fetchWithFallback(url) {
  try {
    let res = await fetch(url);
    if (!res.ok && url.startsWith('/')) {
      res = await fetch('.' + url);
    }
    return res;
  } catch (err) {
    if (url.startsWith('/')) {
      return await fetch('.' + url);
    }
    throw err;
  }
}

// Always load header and mobile nav on all pages
$(document).ready(function () {
  $('#stickyHeader').load('/header.html', function (response, status) {
    if (status === 'error') {
      $('#stickyHeader').load('./header.html');
    }
  });
  $('#mnav-menu-item').load('/mobile-nav.html', function (response, status) {
    if (status === 'error') {
      $('#mnav-menu-item').load('./mobile-nav.html');
    }
  });
});

// Resolve route from current window.location
function getRouteFromCurrentUrl() {
  try {
    const redirectUrl = sessionStorage.getItem('spa_redirect');
    if (redirectUrl) {
      sessionStorage.removeItem('spa_redirect');
      history.replaceState(null, '', redirectUrl);
    }
  } catch (e) {}

  updateBasePrefix();
  let pathname = window.location.pathname || '';
  const hash = (window.location.hash || '').replace(/^#+/, '').trim();

  // If hash is present and represents a route or pageId
  if (hash) {
    let cleanHash = hash;
    if (cleanHash.startsWith('/')) {
      cleanHash = stripAnyBasePrefix(cleanHash);
    } else {
      const withSlash = '/' + cleanHash;
      cleanHash = stripAnyBasePrefix(withSlash);
    }
    cleanHash = cleanHash.replace(/^\/+|\/+$/g, '');
    if (!cleanHash || cleanHash === 'home') {
      return { type: 'home', path: '', title: 'Home' };
    }
    if (routesByPath[cleanHash]) return { ...routesByPath[cleanHash], type: 'screen' };
    if (routesByModule[cleanHash]) {
      const sec = navSections.find((s) => (s.slug || slugify(s.title)) === cleanHash);
      return {
        type: 'module',
        moduleSlug: cleanHash,
        sectionTitle: sec ? sec.title : cleanHash,
        path: cleanHash
      };
    }
    if (routesByPageId[cleanHash]) return { ...routesByPageId[cleanHash], type: 'screen' };
    if (routesByScreenSlug[cleanHash]) return { ...routesByScreenSlug[cleanHash], type: 'screen' };
  }

  // Strip base prefix
  pathname = stripAnyBasePrefix(pathname);

  // Normalize path
  pathname = pathname.replace(/\/index\.html$/i, '').replace(/^\/+|\/+$/g, '');

  if (!pathname || pathname === 'home') {
    return { type: 'home', path: '', title: 'Home' };
  }

  if (routesByPath[pathname]) {
    return { ...routesByPath[pathname], type: 'screen' };
  }

  if (routesByModule[pathname]) {
    const sec = navSections.find((s) => (s.slug || slugify(s.title)) === pathname);
    return {
      type: 'module',
      moduleSlug: pathname,
      sectionTitle: sec ? sec.title : pathname,
      path: pathname
    };
  }

  if (routesByPageId[pathname]) {
    return { ...routesByPageId[pathname], type: 'screen' };
  }

  if (routesByScreenSlug[pathname]) {
    return { ...routesByScreenSlug[pathname], type: 'screen' };
  }

  return { type: 'home', path: '', title: 'Home' };
}

// Resolve any target string/object to a Route object
function resolveRoute(target) {
  if (target && typeof target === 'object' && target.type) return target;
  if (typeof target === 'object' && target.path) {
    if (target.moduleSlug && !target.screenSlug && routesByModule[target.path]) {
      return { type: 'module', ...target };
    }
    return { type: 'screen', ...target };
  }

  updateBasePrefix();
  let cleaned = String(target || '').trim().replace(/^#+/, '').trim();
  if (cleaned.startsWith('/')) {
    cleaned = stripAnyBasePrefix(cleaned);
  } else {
    const withSlash = '/' + cleaned;
    cleaned = stripAnyBasePrefix(withSlash);
  }
  cleaned = cleaned.replace(/\/index\.html$/i, '').replace(/^\/+|\/+$/g, '');

  if (!cleaned || cleaned === 'home') {
    return { type: 'home', path: '', title: 'Home' };
  }

  if (routesByPath[cleaned]) {
    return { ...routesByPath[cleaned], type: 'screen' };
  }

  if (routesByModule[cleaned]) {
    const sec = navSections.find((s) => (s.slug || slugify(s.title)) === cleaned);
    return {
      type: 'module',
      moduleSlug: cleaned,
      sectionTitle: sec ? sec.title : cleaned,
      path: cleaned
    };
  }

  if (routesByPageId[cleaned]) {
    return { ...routesByPageId[cleaned], type: 'screen' };
  }

  if (routesByScreenSlug[cleaned]) {
    return { ...routesByScreenSlug[cleaned], type: 'screen' };
  }

  return { type: 'home', path: '', title: 'Home' };
}

// Navigate to a route
function navigateTo(target, pushState = true) {
  const route = resolveRoute(target);
  if (!route) return;
  loadContent(route, pushState);
}

// Load Content and update View & Breadcrumbs
async function loadContent(target, pushState = true) {
  const route = resolveRoute(target);
  if (!route) {
    document.querySelector('.wp-article-content').innerHTML = '<p>❌ Page not found.</p>';
    return;
  }

  if (route.type === 'home') {
    renderHomePage(route, pushState);
    return;
  }

  if (route.type === 'module') {
    renderModulePage(route, pushState);
    return;
  }

  await renderScreenPage(route, pushState);
}

// Render Home Page (Overall 13 Modules as Trending Professional Cards)
function renderHomePage(route, pushState = true) {
  const targetUrl = BASE_PREFIX;
  if (pushState) {
    if (window.location.pathname !== targetUrl && window.location.pathname !== `${targetUrl}/`) {
      history.pushState({ type: 'home', path: '' }, '', targetUrl);
    }
  } else {
    history.replaceState({ type: 'home', path: '' }, '', targetUrl);
  }

  document.title = 'Roadmap ERP Documentation | Modules Overview';

  // Update canonical and og:url in meta tags
  const siteOrigin = (window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://docs.roadmapit.com';
  const canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) canonicalEl.setAttribute('href', `${siteOrigin}${targetUrl}`);
  const ogUrlEl = document.querySelector('meta[property="og:url"]');
  if (ogUrlEl) ogUrlEl.setAttribute('content', `${siteOrigin}${targetUrl}`);
  const twitterUrlEl = document.querySelector('meta[name="twitter:url"]');
  if (twitterUrlEl) twitterUrlEl.setAttribute('content', `${siteOrigin}${targetUrl}`);

  // Header
  const headerEl = document.querySelector('.wp-article-header');
  if (headerEl) {
    let headerTop = headerEl.querySelector('.wp-article-header-top');
    if (!headerTop) {
      headerTop = document.createElement('div');
      headerTop.className = 'wp-article-header-top';
      headerEl.insertBefore(headerTop, headerEl.firstChild);
    }

    let badgeEl = headerTop.querySelector('.wp-category-badge');
    if (!badgeEl) {
      badgeEl = document.createElement('span');
      badgeEl.className = 'wp-category-badge';
      headerTop.appendChild(badgeEl);
    }
    badgeEl.textContent = 'ERP Ecosystem';

    let modBtn = headerTop.querySelector('.btn-module-download');
    if (!modBtn) {
      modBtn = document.createElement('button');
      modBtn.type = 'button';
      modBtn.className = 'btn-module-download';
      headerTop.appendChild(modBtn);
    }
    modBtn.style.display = 'inline-flex';
    modBtn.setAttribute('data-module', '');
    modBtn.setAttribute('title', 'Download ERP Document');
    modBtn.setAttribute('aria-label', 'Download ERP Document');
    modBtn.innerHTML = `<i class="bi bi-cloud-arrow-down-fill"></i>`;

    const titleEl = document.querySelector('.wp-article-title');
    if (titleEl) titleEl.textContent = 'Roadmap ERP Modules';

    const metaEl = document.querySelector('.wp-article-meta');
    if (metaEl) {
      const totalScreens = navOrder.length;
      metaEl.innerHTML = `
        <span><i class="bi bi-collection-fill"></i> ${navSections.length} Enterprise Modules</span>
        <span>•</span>
        <span><i class="bi bi-file-earmark-text-fill"></i> ${totalScreens} Functional Guides</span>
        <span>•</span>
        <span><i class="bi bi-shield-check"></i> Version ${VERSION_CONFIG[getActiveVersionKey()].fullName}</span>
      `;
    }
  }

  // Breadcrumbs: Home
  const breadcrumbNav = document.querySelector('.wp-breadcrumb');
  if (breadcrumbNav) {
    breadcrumbNav.innerHTML = `
      <span class="wp-breadcrumb-current"><i class="bi bi-house-door-fill me-1"></i> Home</span>
    `;
  }

  // Content: Modules Grid
  const contentContainer = document.querySelector('.wp-article-content');
  if (contentContainer) {
    let cardsHtml = '';
    navSections.forEach((section) => {
      const slug = section.slug || customModuleSlugs[section.title] || slugify(section.title);
      const meta = MODULE_METADATA[slug] || {
        title: section.title,
        icon: section.icon || 'bi bi-folder-fill',
        color: '#ff9103',
        bgLight: '#fff7ed',
        desc: `Comprehensive documentation and user guides for ${section.title}.`,
        badge: 'Enterprise Module'
      };
      const items = section.items || [];
      const iconClass = section.icon || meta.icon || 'bi bi-folder-fill';

      cardsHtml += `
        <div class="module-card-item" data-module-title="${escapeHtml(section.title)}">
          <div class="module-card" data-path="${slug}">
            <div>
              <div class="module-card-header">
                <div class="module-card-icon-wrap" style="color: ${meta.color}; background: ${meta.bgLight};">
                  <i class="${iconClass}"></i>
                </div>
                <span class="module-screen-count-pill">${items.length} Screens</span>
              </div>
              <div class="module-card-body">
                <h3 class="module-card-title">${escapeHtml(section.title)}</h3>
              </div>
            </div>
            <div class="module-card-footer">
              <a href="${BASE_PREFIX}/${slug}" class="module-explore-btn" data-path="${slug}">
                Explore Screens <i class="bi bi-arrow-right"></i>
              </a>
              <button type="button" class="module-quick-dl-btn btn-module-download" data-module="${slug}" title="Download ${escapeHtml(section.title)} Manual" aria-label="Download ${escapeHtml(section.title)} Manual">
                <i class="bi bi-cloud-arrow-down"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    contentContainer.innerHTML = `
      <div class="overview-welcome-card">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h2 class="overview-welcome-title">Explore Enterprise Modules</h2>
            <p class="overview-welcome-sub mb-0">Select any module below to browse all functional screen guides, workflows, and downloadable manuals.</p>
          </div>
          <div class="col-lg-4 mt-3 mt-lg-0">
            <div class="overview-search-box">
              <i class="bi bi-search"></i>
              <input type="text" id="moduleSearchInput" class="form-control" placeholder="Search modules..." autocomplete="off">
            </div>
          </div>
        </div>
      </div>
      <div class="modules-grid" id="modulesGrid">
        ${cardsHtml}
      </div>
    `;
  }

  // Sidebar: remove active links
  document.querySelectorAll('.wp-nav-item').forEach((item) => {
    item.classList.remove('active');
  });

  // Scroll to top
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const main = document.querySelector('.wp-main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);

  if (window.innerWidth <= 1024) {
    document.getElementById('sidebar')?.classList.remove('open');
  }
}

// Render Module Page (Orderly Minimum Size Screen Cards with Common Icon)
function renderModulePage(route, pushState = true) {
  const modSlug = route.moduleSlug;
  const section = navSections.find((s) => (s.slug || slugify(s.title)) === modSlug) || {
    title: route.sectionTitle || modSlug,
    slug: modSlug,
    items: routesByModule[modSlug] || []
  };

  const meta = MODULE_METADATA[modSlug] || {
    title: section.title,
    icon: section.icon || 'bi bi-folder-fill',
    color: '#ff9103',
    bgLight: '#fff7ed',
    desc: `Comprehensive documentation and user guides for ${section.title}.`,
    badge: 'Enterprise Module'
  };

  const items = section.items || [];
  const targetUrl = `${BASE_PREFIX}/${modSlug}`;

  if (pushState) {
    if (window.location.pathname !== targetUrl && window.location.pathname !== `${targetUrl}/`) {
      history.pushState({ type: 'module', moduleSlug: modSlug, path: modSlug }, '', targetUrl);
    }
  } else {
    history.replaceState({ type: 'module', moduleSlug: modSlug, path: modSlug }, '', targetUrl);
  }

  document.title = `${section.title} Module | Roadmap ERP Documentation`;

  // Update canonical and og:url in meta tags
  const siteOrigin = (window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://docs.roadmapit.com';
  const canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) canonicalEl.setAttribute('href', `${siteOrigin}${targetUrl}`);
  const ogUrlEl = document.querySelector('meta[property="og:url"]');
  if (ogUrlEl) ogUrlEl.setAttribute('content', `${siteOrigin}${targetUrl}`);
  const twitterUrlEl = document.querySelector('meta[name="twitter:url"]');
  if (twitterUrlEl) twitterUrlEl.setAttribute('content', `${siteOrigin}${targetUrl}`);

  // Header
  const headerEl = document.querySelector('.wp-article-header');
  if (headerEl) {
    let headerTop = headerEl.querySelector('.wp-article-header-top');
    if (!headerTop) {
      headerTop = document.createElement('div');
      headerTop.className = 'wp-article-header-top';
      headerEl.insertBefore(headerTop, headerEl.firstChild);
    }

    let badgeEl = headerTop.querySelector('.wp-category-badge');
    if (!badgeEl) {
      badgeEl = document.createElement('span');
      badgeEl.className = 'wp-category-badge';
      headerTop.appendChild(badgeEl);
    }
    badgeEl.textContent = `${section.title} Module`;

    let modBtn = headerTop.querySelector('.btn-module-download');
    if (!modBtn) {
      modBtn = document.createElement('button');
      modBtn.type = 'button';
      modBtn.className = 'btn-module-download';
      headerTop.appendChild(modBtn);
    }
    modBtn.style.display = 'inline-flex';
    modBtn.setAttribute('data-module', modSlug);
    modBtn.setAttribute('title', `Download ${section.title} Document`);
    modBtn.setAttribute('aria-label', `Download ${section.title} Document`);
    modBtn.innerHTML = `<i class="bi bi-cloud-arrow-down-fill"></i>`;

    const titleEl = document.querySelector('.wp-article-title');
    if (titleEl) titleEl.textContent = section.title;

    const metaEl = document.querySelector('.wp-article-meta');
    if (metaEl) {
      metaEl.innerHTML = `
        <span><i class="bi bi-grid-3x3-gap-fill"></i> ${items.length} Functional Screens</span>
        <span>•</span>
        <span><i class="bi bi-journal-check"></i> Standard Sequence</span>
        <span>•</span>
        <span><i class="bi bi-file-earmark-arrow-down"></i> User Manual Available</span>
        <span>•</span>
        <span><i class="bi bi-shield-check"></i> Version: ${VERSION_CONFIG[getActiveVersionKey()].fullName}</span>
      `;
    }
  }

  // Breadcrumbs: Home › [Module]
  const breadcrumbNav = document.querySelector('.wp-breadcrumb');
  if (breadcrumbNav) {
    breadcrumbNav.innerHTML = `
      <a href="${BASE_PREFIX}" class="wp-breadcrumb-link" data-path=""><i class="bi bi-house-door-fill me-1"></i> Home</a>
      <span class="wp-breadcrumb-separator">›</span>
      <span class="wp-breadcrumb-current">${escapeHtml(section.title)}</span>
    `;
  }

  // Content: Screen Cards Grid
  const contentContainer = document.querySelector('.wp-article-content');
  if (contentContainer) {
    let screenCardsHtml = '';
    items.forEach((item, index) => {
      let screenSlug = item.slug || slugify(item.name);
      if (section.title === 'CRM' && item.name === 'Stage') {
        if (item.id === 'crmLeadStage') screenSlug = 'lead-stage';
        else if (item.id === 'crmEnquiryStage') screenSlug = 'enquiry-stage';
      }
      const itemPath = `${modSlug}/${screenSlug}`;
      const itemUrl = `${BASE_PREFIX}/${itemPath}`;
      const seqStr = String(index + 1).padStart(2, '0');

      screenCardsHtml += `
        <a href="${itemUrl}" class="screen-card-link" data-path="${itemPath}" data-screen-name="${escapeHtml(item.name)}">
          <div class="screen-card">
            <div class="screen-card-left">
              <span class="screen-card-icon"><i class="bi bi-file-earmark-text"></i></span>
              <span class="screen-card-index">${seqStr}</span>
            </div>
            <div class="screen-card-content">
              <span class="screen-card-title" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
            </div>
            <div class="screen-card-right">
              <i class="bi bi-chevron-right screen-card-arrow"></i>
            </div>
          </div>
        </a>
      `;
    });

    contentContainer.innerHTML = `
      <div class="module-overview-bar">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div class="module-overview-info">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="module-overview-icon-badge" style="color: ${meta.color}; background: ${meta.bgLight};">
                <i class="${section.icon || meta.icon}"></i>
              </span>
              <span class="fs-5 fw-bold text-dark">${escapeHtml(section.title)} Screens</span>
            </div>
            <p class="text-muted small mb-0">Browse all ${items.length} screens in orderly sequence. Click any screen card to open its documentation.</p>
          </div>
          <div class="module-screen-search-wrap">
            <i class="bi bi-search"></i>
            <input type="text" id="screenSearchInput" class="form-control" placeholder="Search ${items.length} screens..." autocomplete="off">
          </div>
        </div>
      </div>
      <div class="screens-grid" id="screensGrid">
        ${screenCardsHtml}
      </div>
    `;
  }

  // Sidebar sync: expand this module and scroll into view
  document.querySelectorAll('.wp-nav-item').forEach((item) => {
    item.classList.remove('active');
  });

  const sectionDiv = document.querySelector(`.wp-nav-section[data-module="${modSlug}"]`);
  if (sectionDiv) {
    const sectionItems = sectionDiv.querySelector('.wp-nav-section-items');
    if (sectionItems && sectionItems.classList.contains('collapsed')) {
      sectionItems.classList.remove('collapsed');
      const arrow = sectionDiv.querySelector('.arrow');
      if (arrow) {
        arrow.classList.remove('bi-chevron-right');
        arrow.classList.add('bi-chevron-down');
      }
    }
    sectionDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Scroll to top
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const main = document.querySelector('.wp-main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);

  if (window.innerWidth <= 1024) {
    document.getElementById('sidebar')?.classList.remove('open');
  }
}

// Render Individual Screen Documentation Page
async function renderScreenPage(route, pushState = true) {
  const pageId = route.pageId;
  const targetUrl = `${BASE_PREFIX}/${route.path}`;

  if (pushState) {
    if (window.location.pathname !== targetUrl) {
      history.pushState({ type: 'screen', path: route.path, pageId: route.pageId }, '', targetUrl);
    }
  } else {
    history.replaceState({ type: 'screen', path: route.path, pageId: route.pageId }, '', targetUrl);
  }

  document.title = `${route.itemName} | RoadmapIT Documentation`;

  // Update canonical and og:url in meta tags
  const siteOrigin = (window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://docs.roadmapit.com';
  const canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) canonicalEl.setAttribute('href', `${siteOrigin}${targetUrl}`);
  const ogUrlEl = document.querySelector('meta[property="og:url"]');
  if (ogUrlEl) ogUrlEl.setAttribute('content', `${siteOrigin}${targetUrl}`);
  const twitterUrlEl = document.querySelector('meta[name="twitter:url"]');
  if (twitterUrlEl) twitterUrlEl.setAttribute('content', `${siteOrigin}${targetUrl}`);

  try {
    const activeKey = getActiveVersionKey();
    const versionDocFolder = (VERSION_CONFIG[activeKey] && VERSION_CONFIG[activeKey].docFolder) || activeKey;

    // First try versioned doc folder, then fall back to root /docs/${pageId}.html
    let response = await fetchWithFallback(`/docs/${versionDocFolder}/${pageId}.html`);
    if (!response || !response.ok) {
      response = await fetchWithFallback(`/docs/${pageId}.html`);
    }

    if (!response || !response.ok) {
      document.querySelector('.wp-article-content').innerHTML = `<p>❌ Content not found for "${route.itemName}".</p>`;
      return;
    }

    const htmlText = await response.text();
    const temp = document.createElement('div');
    temp.innerHTML = htmlText;
    const wrapper = temp.querySelector('[data-category]');

    const category = route.sectionTitle || (wrapper ? wrapper.dataset.category : '') || 'Financials';
    const title = route.itemName || (wrapper ? wrapper.dataset.title : '') || 'Documentation';
    const lastUpdated = (wrapper && wrapper.dataset.updated) || 'December 01, 2025';
    const contributors = (wrapper && wrapper.dataset.contributors) || 'RoadmapIT';

    // Normalize image paths to versioned folder and mark for zoom overlay
    const versionImgFolder = (VERSION_CONFIG[activeKey] && VERSION_CONFIG[activeKey].imgFolder) || activeKey;
    temp.querySelectorAll('img').forEach((img) => {
      let src = img.getAttribute('src');
      if (src) {
        if (src.startsWith('../assets/')) {
          src = src.replace(/^\.\.\/assets\//, '/assets/');
        }

        // Point image to version-specific image folder
        if (src.startsWith('/assets/img/') && !src.startsWith('/assets/img/roadmaperp_')) {
          const imgFilename = src.substring('/assets/img/'.length);
          src = `/assets/img/${versionImgFolder}/${imgFilename}`;
        }
        img.setAttribute('src', src);
      }
      if (img.classList.contains('cusBorImg') || !img.hasAttribute('width')) {
        img.setAttribute('data-zoomable', 'true');
      }
    });

    const contentArea = temp.querySelector('.page-content');
    const contentHTML = contentArea ? contentArea.innerHTML : temp.innerHTML;

    // Header badge, module download button & title
    const headerEl = document.querySelector('.wp-article-header');
    if (headerEl) {
      let headerTop = headerEl.querySelector('.wp-article-header-top');
      if (!headerTop) {
        const existingBadge = headerEl.querySelector('.wp-category-badge');
        headerTop = document.createElement('div');
        headerTop.className = 'wp-article-header-top';
        if (existingBadge) {
          existingBadge.parentNode.insertBefore(headerTop, existingBadge);
          headerTop.appendChild(existingBadge);
        } else {
          headerEl.insertBefore(headerTop, headerEl.firstChild);
          const newBadge = document.createElement('span');
          newBadge.className = 'wp-category-badge';
          headerTop.appendChild(newBadge);
        }
      }

      const badgeEl = headerTop.querySelector('.wp-category-badge');
      if (badgeEl) badgeEl.textContent = category;

      let modBtn = headerTop.querySelector('.btn-module-download');
      if (!modBtn) {
        modBtn = document.createElement('button');
        modBtn.type = 'button';
        modBtn.className = 'btn-module-download';
        headerTop.appendChild(modBtn);
      }
      modBtn.style.display = 'inline-flex';
      modBtn.setAttribute('data-module', route.moduleSlug);
      modBtn.setAttribute('title', `Download ${category} Document`);
      modBtn.setAttribute('aria-label', `Download ${category} Document`);
      modBtn.innerHTML = `<i class="bi bi-cloud-arrow-down-fill"></i>`;
    }

    const titleEl = document.querySelector('.wp-article-title');
    if (titleEl) titleEl.textContent = title;

    const metaEl = document.querySelector('.wp-article-meta');
    if (metaEl) {
      metaEl.innerHTML = `
        <span><i class="bi bi-calendar-event"></i> Last updated: ${lastUpdated}</span>
        <span>•</span>
        <span><i class="bi bi-pencil-square"></i> Contributor: ${contributors}</span>
        <span>•</span>
        <span><i class="bi bi-shield-check"></i> Version: ${VERSION_CONFIG[activeKey].fullName}</span>
      `;
    }

    // PROPER BREADCRUMBS: Home › Module › Screen
    const breadcrumbNav = document.querySelector('.wp-breadcrumb');
    if (breadcrumbNav) {
      breadcrumbNav.innerHTML = `
        <a href="${BASE_PREFIX}" class="wp-breadcrumb-link" data-path=""><i class="bi bi-house-door-fill me-1"></i> Home</a>
        <span class="wp-breadcrumb-separator">›</span>
        <a href="${BASE_PREFIX}/${route.moduleSlug}" class="wp-breadcrumb-link" data-path="${route.moduleSlug}">${escapeHtml(route.sectionTitle)}</a>
        <span class="wp-breadcrumb-separator">›</span>
        <span class="wp-breadcrumb-current">${escapeHtml(route.itemName)}</span>
      `;
    }

    // Page content
    const contentContainer = document.querySelector('.wp-article-content');
    contentContainer.innerHTML = contentHTML;

    // NEXT & PREVIOUS BUTTONS
    if (navOrder.length > 0) {
      const currentIndex = navOrder.findIndex((item) => item.path === route.path || item.pageId === route.pageId);
      if (currentIndex !== -1) {
        const prevPage = navOrder[currentIndex - 1];
        const nextPage = navOrder[currentIndex + 1];
        if (prevPage || nextPage) {
          const navButtons = document.createElement('div');
          navButtons.className = 'd-flex justify-content-between mt-5 pt-4 border-top';
          navButtons.innerHTML = `
            <div>
              ${prevPage ? `<a href="${BASE_PREFIX}/${prevPage.path}" data-path="${prevPage.path}" class="btn btn-previous text-decoration-none"><i class="bi bi-arrow-left"></i> ${prevPage.itemName}</a>` : ''}
            </div>
            <div>
              ${nextPage ? `<a href="${BASE_PREFIX}/${nextPage.path}" data-path="${nextPage.path}" class="btn btn-next text-decoration-none">${nextPage.itemName} <i class="bi bi-arrow-right"></i></a>` : ''}
            </div>`;
          contentContainer.appendChild(navButtons);
        }
      }
    }

    // ACTIVATE SIDEBAR LINK
    document.querySelectorAll('.wp-nav-item').forEach((item) => {
      item.classList.remove('active');
    });

    const activeLink = document.querySelector(`.wp-nav-item[data-path="${route.path}"]`) ||
                       document.querySelector(`.wp-nav-item[data-page-id="${route.pageId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      const sectionItems = activeLink.closest('.wp-nav-section-items');
      if (sectionItems && sectionItems.classList.contains('collapsed')) {
        sectionItems.classList.remove('collapsed');
        const arrow = sectionItems.previousElementSibling?.querySelector('.arrow');
        if (arrow) {
          arrow.classList.remove('bi-chevron-right');
          arrow.classList.add('bi-chevron-down');
        }
      }
    }

    // Scroll to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const main = document.querySelector('.wp-main');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
      document.getElementById('sidebar')?.classList.remove('open');
    }
  } catch (err) {
    console.error('Load error:', err);
    document.querySelector('.wp-article-content').innerHTML = `<p>❌ Error loading content: ${err.message}</p>`;
  }
}

// Load sidebar and navigation
async function loadSidebar() {
  try {
    const response = await fetchWithFallback('/docs/sidebar.html');
    if (!response.ok) {
      document.getElementById('sidebar').innerHTML = '<p>Sidebar failed to load.</p>';
      return;
    }
    const sidebarHTML = await response.text();
    document.getElementById('sidebar').innerHTML = sidebarHTML;
    setupVersionSwitcher();
    enableSidebarSearch();
    attachSidebarEvents();
    setupDownloadModal();
    await loadNavList();

    const initialRoute = getRouteFromCurrentUrl();
    loadContent(initialRoute, false);
  } catch (err) {
    console.error('Sidebar load error:', err);
  }
}

// Load Nav List from JSON
async function loadNavList() {
  try {
    updateBasePrefix();
    const activeKey = getActiveVersionKey();
    // A missing versioned nav file can come back as the SPA index.html (200 OK)
    // because of the dev/prod rewrite fallback, so only accept a real JSON response.
    const isJsonRes = (r) => r && r.ok && /json/i.test(r.headers.get('content-type') || '');
    let res = await fetchWithFallback(`/${activeKey}/sidebarNav.json`);
    if (!isJsonRes(res)) {
      res = await fetchWithFallback('/sidebarNav.json');
    }
    const data = await res.json();
    navSections = data;
    navOrder = [];

    // Clear maps
    for (const k in routesByPath) delete routesByPath[k];
    for (const k in routesByPageId) delete routesByPageId[k];
    for (const k in routesByScreenSlug) delete routesByScreenSlug[k];
    for (const k in routesByModule) delete routesByModule[k];

    const container = document.getElementById('sidebarNav');
    if (container) container.innerHTML = '';

    data.forEach((section) => {
      const modSlug = section.slug || customModuleSlugs[section.title] || slugify(section.title);
      routesByModule[modSlug] = [];

      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'wp-nav-section';
      sectionDiv.setAttribute('data-module', modSlug);

      const headerBtn = document.createElement('button');
      headerBtn.className = 'wp-nav-section-header';
      headerBtn.setAttribute('onclick', 'toggleSection(this)');
      headerBtn.innerHTML = `
        <span class="wp-nav-section-title">
          <span class="wp-nav-section-icon"><i class="${section.icon || 'bi bi-folder-fill'}"></i></span>
          ${section.title}
        </span>
        <i class="bi bi-chevron-down arrow"></i>
      `;

      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'wp-nav-section-items';

      section.items.forEach((item) => {
        let screenSlug = item.slug || slugify(item.name);
        let pageId = item.id || (item.href ? item.href.replace(/^#/, '').replace(/^\/roadmaperp_[^\/]+\/[^\/]+\//, '') : '');
        if (!pageId && section.title === 'PP/ShopFloor') pageId = 'rComingSoon';
        if (section.title === 'CRM' && item.name === 'Stage') {
          if (pageId === 'crmLeadStage') screenSlug = 'lead-stage';
          else if (pageId === 'crmEnquiryStage') screenSlug = 'enquiry-stage';
        }

        const routePath = `${modSlug}/${screenSlug}`;
        const fullHref = `${BASE_PREFIX}/${routePath}`;

        const routeObj = {
          type: 'screen',
          sectionTitle: section.title,
          moduleSlug: modSlug,
          itemName: item.name,
          screenSlug: screenSlug,
          path: routePath,
          pageId: pageId,
          href: fullHref
        };

        routesByPath[routePath] = routeObj;
        if (pageId) routesByPageId[pageId] = routeObj;
        if (!routesByScreenSlug[screenSlug]) routesByScreenSlug[screenSlug] = routeObj;
        routesByModule[modSlug].push(routeObj);
        navOrder.push(routeObj);

        const a = document.createElement('a');
        a.className = 'wp-nav-item';
        a.href = fullHref;
        a.setAttribute('data-path', routePath);
        a.setAttribute('data-page-id', pageId);
        a.innerHTML = `
          <span><i class="bi bi-file-earmark"></i></span>
          ${item.name}
        `;
        itemsDiv.appendChild(a);
      });

      sectionDiv.appendChild(headerBtn);
      sectionDiv.appendChild(itemsDiv);
      if (container) container.appendChild(sectionDiv);
    });
  } catch (err) {
    console.error('Nav load failed:', err);
  }
}

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  // Global click interception for routing
  document.addEventListener('click', function (e) {
    const pathLink = e.target.closest('[data-path]');
    if (pathLink) {
      if (e.target.closest('.btn-module-download') || e.target.closest('#downloadBtn')) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2 || e.button === 1) {
        return;
      }
      e.preventDefault();
      const path = pathLink.getAttribute('data-path');
      navigateTo(path);
      return;
    }

    const anchor = e.target.closest('a');
    if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
      const href = anchor.getAttribute('href');
      if (!document.querySelector(href) && href !== '#') {
        e.preventDefault();
        navigateTo(href.substring(1));
      }
    }
  });

  // Handle browser Back / Forward buttons
  window.addEventListener('popstate', () => {
    const route = getRouteFromCurrentUrl();
    loadContent(route, false);
  });

  loadSidebar();

  const backToTop = document.querySelector('.backtoTop');
  const wpMain = document.querySelector('.wp-main');
  if (backToTop && wpMain) {
    backToTop.style.display = 'flex';
    backToTop.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    backToTop.style.transform = 'translateY(55px)';
    backToTop.style.opacity = '0';
    backToTop.style.pointerEvents = 'none';
    wpMain.addEventListener('scroll', function () {
      const isVisible = this.scrollTop > 200;
      backToTop.style.transform = isVisible ? 'translateY(-10px)' : 'translateY(55px)';
      backToTop.style.opacity = isVisible ? '1' : '0';
      backToTop.style.pointerEvents = isVisible ? 'auto' : 'none';
    });
    backToTop.addEventListener('click', function () {
      wpMain.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// Live filtering for Home module cards and Module screen cards
document.addEventListener('input', function (e) {
  if (e.target && e.target.id === 'moduleSearchInput') {
    const query = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.module-card-item');
    let visibleCount = 0;
    cards.forEach((card) => {
      const title = (card.getAttribute('data-module-title') || '').toLowerCase();
      const match = !query || title.includes(query);
      card.style.display = match ? 'flex' : 'none';
      if (match) visibleCount++;
    });

    let noRes = document.getElementById('noModulesNotice');
    if (visibleCount === 0) {
      if (!noRes) {
        const grid = document.getElementById('modulesGrid');
        if (grid) {
          const div = document.createElement('div');
          div.id = 'noModulesNotice';
          div.className = 'no-results-notice';
          div.innerHTML = `<i class="bi bi-search"></i><p class="mb-0 fw-semibold">No modules found matching "${escapeHtml(query)}"</p>`;
          grid.appendChild(div);
        }
      } else {
        noRes.style.display = 'block';
        noRes.querySelector('p').textContent = `No modules found matching "${query}"`;
      }
    } else if (noRes) {
      noRes.style.display = 'none';
    }
  }

  if (e.target && e.target.id === 'screenSearchInput') {
    const query = e.target.value.toLowerCase().trim();
    const links = document.querySelectorAll('.screen-card-link');
    let visibleCount = 0;
    links.forEach((link) => {
      const name = (link.getAttribute('data-screen-name') || '').toLowerCase();
      const match = !query || name.includes(query);
      link.style.display = match ? 'block' : 'none';
      if (match) visibleCount++;
    });

    let noRes = document.getElementById('noScreensNotice');
    if (visibleCount === 0) {
      if (!noRes) {
        const grid = document.getElementById('screensGrid');
        if (grid) {
          const div = document.createElement('div');
          div.id = 'noScreensNotice';
          div.className = 'no-results-notice';
          div.innerHTML = `<i class="bi bi-search"></i><p class="mb-0 fw-semibold">No screens found matching "${escapeHtml(query)}"</p>`;
          grid.appendChild(div);
        }
      } else {
        noRes.style.display = 'block';
        noRes.querySelector('p').textContent = `No screens found matching "${query}"`;
      }
    } else if (noRes) {
      noRes.style.display = 'none';
    }
  }
});

function enableSidebarSearch() {
  const input = document.getElementById('sideBarDocs');
  if (!input) return;
  input.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    const sections = document.querySelectorAll('.wp-nav-section');
    sections.forEach((section) => {
      let hasVisibleItem = false;
      const items = section.querySelectorAll('.wp-nav-item');
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
          item.style.display = 'flex';
          hasVisibleItem = true;
        } else {
          item.style.display = 'none';
        }
      });
      if (hasVisibleItem || query === '') {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
  });
}

function sidebarToggleButton() {
  var sidebar = document.getElementById('sidebar');
  var main = document.querySelector('.wp-main');
  var toggleIcon = document.querySelector('.wp-desk-toggle');
  sidebar.classList.toggle('closed');
  toggleIcon.classList.toggle('closed');
  main.classList.toggle('shifted');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
}

function toggleSection(button) {
  const items = button.nextElementSibling;
  const arrow = button.querySelector('.arrow');
  if (items.classList.contains('collapsed')) {
    items.classList.remove('collapsed');
    arrow.classList.remove('bi-chevron-right');
    arrow.classList.add('bi-chevron-down');
  } else {
    items.classList.add('collapsed');
    arrow.classList.remove('bi-chevron-down');
    arrow.classList.add('bi-chevron-right');
  }
}

document.addEventListener('click', function (event) {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.querySelector('.wp-mobile-toggle');
  if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains('open') && !sidebar.contains(event.target) && !toggle.contains(event.target)) {
    sidebar.classList.remove('open');
  }
});

function attachSidebarEvents() {
  const toggleBtn = document.getElementById('toggleAllBtn');
  if (!toggleBtn) return;
  toggleBtn.addEventListener('click', function () {
    const sections = document.querySelectorAll('.wp-nav-section-items');
    const arrows = document.querySelectorAll('.wp-nav-section-header .arrow');
    const anyCollapsed = Array.from(sections).some((sec) => sec.classList.contains('collapsed'));
    if (anyCollapsed) {
      sections.forEach((sec) => sec.classList.remove('collapsed'));
      arrows.forEach((arrow) => {
        arrow.classList.remove('bi-chevron-right');
        arrow.classList.add('bi-chevron-down');
      });
      toggleBtn.classList.remove('bi-chevron-expand');
      toggleBtn.classList.add('bi-chevron-contract');
    } else {
      sections.forEach((sec) => sec.classList.add('collapsed'));
      arrows.forEach((arrow) => {
        arrow.classList.remove('bi-chevron-down');
        arrow.classList.add('bi-chevron-right');
      });
      toggleBtn.classList.remove('bi-chevron-contract');
      toggleBtn.classList.add('bi-chevron-expand');
    }
  });
}

// Module document mapping (slug -> document metadata)
const MODULE_DOCS = {
  'financials': {
    title: 'Financials',
    file: 'ROADMAP ERP Ver 27.0_FINANCIALS_User Manual.docx'
  },
  'crm': {
    title: 'CRM',
    file: 'ROADMAP ERP Ver 27.0_CRM_User Manual.docx'
  },
  'payroll': {
    title: 'Payroll',
    file: 'ROADMAP ERP Ver 27.0_PAYROLL MANAGEMENT _User Manual.docx'
  },
  'pp-shopfloor': {
    title: 'PP/ShopFloor',
    file: 'ROADMAP ERP Ver 27.0_PRODUCTION PLANNING  SHOP FLOOR CONTROL_User Manual.docx'
  },
  'plant-maintenance': {
    title: 'Plant Maintenance',
    file: 'ROADMAP ERP Ver 27.0_PLANT MAINTENANCE_User Manual (Transaction).docx'
  },
  'workflow-management': {
    title: 'Workflow Management',
    file: 'ROADMAP ERP Ver 27.0_WORKFLOW MANAGEMENT_User Manual.docx'
  },
  'operating-instructions': {
    title: 'Operating Instructions',
    file: 'ROADMAP ERP Ver 27.0_OPERATING INSTRUCTIONS_User Manual.docx'
  },
  'quality-management': {
    title: 'Quality Management',
    file: 'ROADMAP ERP Ver 27.0_QUALITY CONTROL MANAGEMENT_User Manual.docx'
  },
  'subcontracting-order': {
    title: 'Subcontracting Order',
    file: 'ROADMAP ERP Ver 27.0_SUBCONTRACTING ORDER MANAGEMENT_User Manual.docx'
  },
  'sales-order': {
    title: 'Sales Order',
    file: 'ROADMAP ERP Ver 27.0_SALES ORDER MANAGEMENT_User Manual.docx'
  },
  'purchase-order': {
    title: 'Purchase Order',
    file: 'ROADMAP ERP Ver 27.0_PURCHASE ORDER MANAGEMENT_User Manual.docx'
  },
  'gate-entry': {
    title: 'Gate Entry',
    file: 'ROADMAP ERP Ver 27.0_GATE ENTRY MANAGEMENT_User Manual.docx'
  },
  'inventory-control': {
    title: 'Inventory Control',
    file: 'ROADMAP ERP Ver 27.0_INVENTORY CONTROL MANAGEMENT_User Manual.docx'
  }
};

let serverOtp = '';
let otpTimerInterval;
let resendTimerInterval;

function openDownloadModal(preselectedModuleSlug = '') {
  const modalEl = document.getElementById('downloadModal');
  if (!modalEl) return;

  const selectEl = document.getElementById('moduleSelect');
  if (selectEl) {
    if (preselectedModuleSlug && MODULE_DOCS[preselectedModuleSlug]) {
      selectEl.value = preselectedModuleSlug;
    } else {
      selectEl.value = '';
    }
  }

  resetOtpUI();
  unlockFields();
  $('#signOtp').hide();
  $('#otpVerified').val('no');
  $('.signOtpBtn').html('Get OTP').prop('disabled', false);

  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  modalInstance.show();
}

function setupDownloadModal() {
  const btn = document.getElementById('downloadBtn');

  if (!document.getElementById('downloadModal')) {
    const modalHTML = `
      <div class="modal fade" id="downloadModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 380px !important; margin: 1.5rem auto !important;">
          <div class="modal-content" style="border-radius: 12px !important; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18) !important; border: 1px solid rgba(0,0,0,0.08) !important; overflow: hidden !important;">
            <div class="modal-header border-0 pb-0 pt-3 px-3">
              <h5 class="modal-title fs-5 fw-bold mx-auto ps-3 text-center" style="font-size: 1.2rem !important;">Download <span class="fw-bold" style="color: #ff9103;">Document</span></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body px-3 pt-2 pb-3">
              <div id="otpAlertPlaceholder"></div>
              <form id="downloadForm">
                <div class="mb-2">
                  <label for="moduleSelect" class="form-label" style="font-size: 0.82rem !important; font-weight: 600 !important; margin-bottom: 0.25rem !important;">Select Module <span class="text-danger">*</span></label>
                  <select class="form-select form-select-sm" id="moduleSelect" required style="font-size: 0.85rem !important; min-height: 36px !important; padding: 0.35rem 0.65rem !important;">
                    <option value="">-- Select Module --</option>
                    <option value="financials">Financials</option>
                    <option value="crm">CRM</option>
                    <option value="payroll">Payroll</option>
                    <option value="pp-shopfloor">PP/ShopFloor</option>
                    <option value="plant-maintenance">Plant Maintenance</option>
                    <option value="workflow-management">Workflow Management</option>
                    <option value="operating-instructions">Operating Instructions</option>
                    <option value="quality-management">Quality Management</option>
                    <option value="subcontracting-order">Subcontracting Order</option>
                    <option value="sales-order">Sales Order</option>
                    <option value="purchase-order">Purchase Order</option>
                    <option value="gate-entry">Gate Entry</option>
                    <option value="inventory-control">Inventory Control</option>
                  </select>
                </div>
                <div class="mb-2">
                  <label for="userName" class="form-label" style="font-size: 0.82rem !important; font-weight: 600 !important; margin-bottom: 0.25rem !important;">Name</label>
                  <input type="text" class="form-control form-control-sm" id="userName" required style="font-size: 0.85rem !important; min-height: 36px !important; padding: 0.35rem 0.65rem !important;">
                </div>
                <div class="mb-2">
                  <label for="mailId" class="form-label" style="font-size: 0.82rem !important; font-weight: 600 !important; margin-bottom: 0.25rem !important;">Email</label>
                  <input type="email" class="form-control form-control-sm" id="mailId" required style="font-size: 0.85rem !important; min-height: 36px !important; padding: 0.35rem 0.65rem !important;">
                </div>
                <div class="mb-2">
                  <label for="mobileNum" class="form-label" style="font-size: 0.82rem !important; font-weight: 600 !important; margin-bottom: 0.25rem !important;">Mobile Number</label>
                  <div class="input-group input-group-sm">
                    <input type="tel" class="form-control form-control-sm" id="mobileNum" required pattern="[0-9]{10}" style="font-size: 0.85rem !important; min-height: 36px !important; padding: 0.35rem 0.65rem !important;">
                    <button class="btn btn-warning signOtpBtn" type="button" style="font-size: 0.8rem !important; font-weight: 600 !important; padding: 0.35rem 0.75rem !important;">Get OTP</button>
                  </div>
                </div>
                <div id="signOtp" style="display:none;">
                  <div class="mb-2">
                    <label for="otpCode" class="form-label">Enter OTP</label>
                    <input type="text" class="form-control" id="otpCode">
                    <div class="d-flex justify-content-between"><small id="otpTimer" class="text-danger"></small><small id="resendTimer" class="text-muted"></small></div>
                  </div>
                  <button type="button" style="background-color: #ff9103; color: white; font-size: 0.88rem !important; font-weight: 600 !important; padding: 0.45rem 1rem !important;" class="btn w-100" id="verifyDownloadBtn">Verify & Download</button>
                </div>
                <input type="hidden" id="otpVerified" value="no">
              </form>
            </div>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    $('#downloadModal').on('hidden.bs.modal', function () {
      resetOtpUI();
      unlockFields();
      $('#signOtp').hide();
      $('.signOtpBtn').html('Get OTP').prop('disabled', false);
      $('#otpVerified').val('no');
    });
  }

  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openDownloadModal(''); // Left panel click shows empty value
    });
  }

  // Delegated click handler for page module download buttons
  $(document)
    .off('click', '.btn-module-download')
    .on('click', '.btn-module-download', function (e) {
      e.preventDefault();
      const modSlug = $(this).attr('data-module') || '';
      openDownloadModal(modSlug);
    });

  $(document)
    .off('click', '.signOtpBtn')
    .on('click', '.signOtpBtn', async function () {
      const selectedMod = $('#moduleSelect').val();
      const mobile = $('#mobileNum').val().trim();
      const userName = $('#userName').val().trim();
      const mailId = $('#mailId').val().trim();

      if (!selectedMod) {
        showOtpAlert('Please select a module to download.', 'warning');
        $('#moduleSelect').focus();
        return;
      }
      if (!mobile || !userName || !mailId) {
        showOtpAlert('Please fill all fields', 'warning');
        return;
      }
      try {
        $('.signOtpBtn').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...').prop('disabled', true);
        const response = await fetch('https://webappqc.roadmaperp.com:8765/ords/roadstd/phone_validation/send_otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone_no: mobile }),
        });
        const data = await response.json();
        if ((response.ok || data.OTP) && data.status !== 'failure') {
          serverOtp = String(data.OTP);
          const emailVal = $('#mailId').val().trim();
          if (emailVal) {
            fetch('https://webappqc.roadmaperp.com:8765/ords/rmqc27/otp_mail/otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ p_otp: serverOtp, p_to_mail: emailVal }),
            }).catch((err) => showOtpAlert(err, 'danger'));
          }
          resetOtpUI();
          startOtpExpiryTimer();
          startResendCountdown();
          $('#signOtp').slideDown(() => $('#otpCode').focus());
          $('#otpVerified').val('no');
          showOtpAlert('OTP sent successfully to your mobile number & Mail.', 'success');
          $('.signOtpBtn').html('Resend OTP');
          $('.changeMobBtn, .changeMailBtn').show();
          lockFields();
        } else {
          throw new Error(data.message || 'Failed to send OTP');
        }
      } catch (err) {
        let msg = err.message || 'Failed to send OTP. Try again.';
        msg = msg.replace(/ORA-d+:s?/g, '');
        showOtpAlert(msg, 'danger');
        $('.signOtpBtn').html('Get OTP');
        unlockFields();
      } finally {
        $('.signOtpBtn').prop('disabled', false);
      }
    });

  $(document)
    .off('click', '#verifyDownloadBtn')
    .on('click', '#verifyDownloadBtn', function () {
      if ($('#otpCode').val().trim() === serverOtp) {
        const selectedModSlug = $('#moduleSelect').val();
        const modConfig = MODULE_DOCS[selectedModSlug] || { title: selectedModSlug, file: '' };
        const moduleTitle = modConfig.title || selectedModSlug;
        const downloadFileName = modConfig.file;

        const name = $('#userName').val().trim();
        const email = $('#mailId').val().trim();
        const phone = $('#mobileNum').val().trim();
        const company = '-';
        const product = `Roadmap ERP - ${moduleTitle} Module Manual`;
        const message = `Download Request for ${moduleTitle} Document`;
        const emailRef = 'Documentation Portal';
        const emailBody = `
    <div style="font-family: Arial; color: #333; line-height: 1.6; margin: 40px auto; max-width: 500px;">
    <div style="text-align:center;">
    <img src="https://roadmapit.com/assets/img/icon/roadmap-logo_web-New.png" style="max-width: 180px;" alt="RoadmapIT Solutions ERP">
    </div>
    <h2 style="text-align:center; font-size:20px;">Product Enquiry from Roadmap Website</h2>
    <h3 style="background:#ff9103; color:#fff; padding:8px; font-size:18px; text-align:center;">Register Details</h3>
    <table style="width:100%; border-collapse:collapse; border:1px solid #ddd;">
    <tr style="background:#ffebd1;"><td style="padding:8px; border:1px solid #ddd;"><strong>Name</strong></td><td style="padding:8px; border:1px solid #ddd;">${name}</td></tr>
    <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Email</strong></td><td style="padding:8px; border:1px solid #ddd;"><a href="mailto:${email}" style="color:#007BFF;">${email}</a></td></tr>
    <tr style="background:#ffebd1;"><td style="padding:8px; border:1px solid #ddd;"><strong>Phone</strong></td><td style="padding:8px; border:1px solid #ddd;">${phone}</td></tr>
    <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Company</strong></td><td style="padding:8px; border:1px solid #ddd;">${company}</td></tr>
    <tr style="background:#ffebd1;"><td style="padding:8px; border:1px solid #ddd;"><strong>Module Requested</strong></td><td style="padding:8px; border:1px solid #ddd;">${moduleTitle}</td></tr>
    <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Product</strong></td><td style="padding:8px; border:1px solid #ddd;">${product}</td></tr>
    <tr style="background:#ffebd1;"><td style="padding:8px; border:1px solid #ddd;"><strong>Message</strong></td><td style="padding:8px; border:1px solid #ddd;">${message}</td></tr>
    <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Referral</strong></td><td style="padding:8px; border:1px solid #ddd;"><span style="color:#007BFF;">${emailRef}</span></td></tr>
    </table>
    </div>
  `;
        fetch('https://webappqc.roadmaperp.com:8765/ords/rmqc27/web_email/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mail_sub: `Roadmap Documentation Download Request - ${moduleTitle}`,
            mail_body: emailBody,
          }),
        }).catch((err) => console.error(err));

        $('#downloadModal').modal('hide');

        if (downloadFileName) {
          const downloadUrl = `/download/${encodeURIComponent(downloadFileName)}`;
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = downloadFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('Document file not found for the selected module.');
        }
      } else {
        showOtpAlert('Invalid OTP', 'danger');
      }
    });
}

function showOtpAlert(msg, type) {
  $('#otpAlertPlaceholder').html(`<div class="alert alert-${type} alert-dismissible fade show">${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`);
}
function resetOtpUI() {
  $('#otpCode').val('');
  $('#otpAlertPlaceholder').empty();
  clearInterval(otpTimerInterval);
  clearInterval(resendTimerInterval);
  $('#otpTimer, #resendTimer').text('');
}
function startOtpExpiryTimer() {
  let t = 300;
  otpTimerInterval = setInterval(() => {
    t--;
    $('#otpTimer').text(`Expires in ${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`);
    if (t <= 0) {
      clearInterval(otpTimerInterval);
      serverOtp = '';
      $('#otpTimer').text('Expired');
    }
  }, 1000);
}
function startResendCountdown() {
  let t = 30;
  resendTimerInterval = setInterval(() => {
    t--;
    $('.signOtpBtn').text(`Resend in ${t}s`).prop('disabled', true);
    if (t <= 0) {
      clearInterval(resendTimerInterval);
      $('.signOtpBtn').text('Resend OTP').prop('disabled', false);
    }
  }, 1000);
}
function lockFields() {
  $('#userName, #mailId, #mobileNum').prop('readonly', true);
  $('#moduleSelect').prop('disabled', true);
}
function unlockFields() {
  $('#userName, #mailId, #mobileNum').prop('readonly', false);
  $('#moduleSelect').prop('disabled', false);
}
$(document).ready(function () {
  let selectedPdfUrl = '';
  let selectedFileName = '';
  let selectedFileImg = '';
  let modalContent = '';
  let serverOtp = null;
  let otpTimerInterval = null;
  $(document).on('click', '.brochure-link', function (e) {
    e.preventDefault();
    e.stopPropagation();
    selectedPdfUrl = $(this).data('pdf');
    selectedFileName = $(this).data('filename');
    modalContent = $(this).data('content');
    let modalImg = $(this).data('image');
    if ($('#erpModal').length === 0) {
      $('body').append(`
      <div class="modal fade" id="erpModal" tabindex="-1" aria-labelledby="erpModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="erpModal-header">
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body pt-0 px-0">
              <img class="modalDynamicImg" src="" alt="erp file download" style="max-width: 100%; height: auto;" />
              <div class="px-2">
                <p class="fs-6 fw-semibold mb-1 px-3 modalDynamicText text-center"></p>
                <p class="text-sm mb-0 text-center">Subscribe and Download the PDF File.</p>
                <form id="emailForm">
                  <div id="step1">
                    <div class="mb-2 w-75 mx-auto">
                      <input type="text" id="namePopup" class="form-control" placeholder="Your Name">
                      <div class="error-container-name text-danger small"></div>
                    </div>
                    <div class="mb-2 w-75 mx-auto">
                      <input type="text" id="emailPopup" class="form-control" placeholder="Email Address">
                      <div class="error-container-email text-danger small"></div>
                    </div>
                    <div class="mb-2 w-75 mx-auto">
                      <input type="text" id="mobilePopup" class="form-control" placeholder="Mobile Number" maxlength="10">
                      <div class="error-container-mobile text-danger small"></div>
                    </div>
                    <div class="bg-btn-wrapper text-center mt-3">
                      <button type="button" id="getOtpBtn" class="bg-btn mx-auto px-4 py-2">
                        Get OTP <span class="spinner-border spinner-border-sm d-none"></span>
                      </button>
                    </div>
                  </div>
                  <div id="step2" class="d-none text-center">
                    <div class="mb-2">
                        <span class="small">OTP sent to </span><strong><span id="maskedMobile"></span></strong>
                        <a href="#" id="goBackBtn" class="small text-decoration-none text-primary fw-bold">Wrong Number? Edit</a>
                    </div>
                    <input type="text" id="otpInput" class="form-control mx-auto w-50" placeholder="Enter 6 Digit OTP" maxlength="6">
                    <div class="error-container-otp text-danger mt-1 small"></div>
                    <button type="button" id="verifyOtpBtn" class="btn btn-success mt-3 px-4 py-2">
                      Verify OTP & Download
                    </button>
                    <p class="mt-2 small">
                      <span id="otpTimer"></span>
                      <a href="#" id="resendOtp" class="d-none text-warning" style="text-decoration:none;">Resend OTP</a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
    }
    $('.modalDynamicImg').attr('src', modalImg);
    $('.modalDynamicText').html(modalContent);
    const modal = new bootstrap.Modal(document.getElementById('erpModal'));
    modal.show();
  });
  $(document).on('input', '#namePopup', function () {
    let cleaned = this.value.replace(/[^a-zA-Z\s\-']/g, '');
    if (this.value !== cleaned) this.value = cleaned;
  });
  $(document).on('input', '#mobilePopup', function () {
    let cleaned = this.value.replace(/[^0-9]/g, '');
    if (this.value !== cleaned) this.value = cleaned;
  });
  $(document).on('click', '#goBackBtn', function (e) {
    e.preventDefault();
    clearInterval(otpTimerInterval);
    $('#otpTimer').text('');
    $('#step2').addClass('d-none');
    $('#step1').removeClass('d-none');
    $('#otpInput').val('');
    $('.error-container-otp').text('');
  });
  function validateStep1() {
    let hasError = false;
    $('.error-container-name, .error-container-email, .error-container-mobile').text('');
    if ($('#namePopup').val().trim().length < 2) {
      $('.error-container-name').text('Enter valid name');
      hasError = true;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#emailPopup').val())) {
      $('.error-container-email').text('Enter valid email');
      hasError = true;
    }
    if (!/^\d{10}$/.test($('#mobilePopup').val())) {
      $('.error-container-mobile').text('Enter valid mobile number');
      hasError = true;
    }
    return !hasError;
  }
  $(document).on('click', '#getOtpBtn', function () {
    if (!validateStep1()) return;
    const phone = $('#mobilePopup').val();
    const $btn = $(this);
    $btn.prop('disabled', true).find('span').removeClass('d-none');
    $('#maskedMobile').text(phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'));
    $.ajax({
      url: 'https://webappqc.roadmaperp.com:8765/ords/roadstd/phone_validation/send_otp',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ phone_no: phone }),
      success: function (res) {
        serverOtp = res.OTP;
        $('#step1').addClass('d-none');
        $('#step2').removeClass('d-none');
        startOtpTimer();
      },
      error: function () {
        Swal.fire('Error', 'Failed to send OTP', 'error');
      },
      complete: function () {
        $btn.prop('disabled', false).find('span').addClass('d-none');
      },
    });
  });
  $(document).on('click', '#verifyOtpBtn', function () {
    const enteredOtp = $('#otpInput').val().trim();
    const $btn = $(this);
    $('.error-container-otp').text('');
    if (enteredOtp.length !== 6) {
      $('.error-container-otp').text('Enter valid 6-digit OTP');
      return;
    }
    if (parseInt(enteredOtp) !== parseInt(serverOtp)) {
      $('.error-container-otp').text('Invalid OTP');
      return;
    }
    clearInterval(otpTimerInterval);
    $btn.prop('disabled', true).text('Verifying...');
    Swal.fire({
      icon: 'success',
      title: 'Verified!',
      text: 'Your download will start shortly...',
      timer: 1500,
      showConfirmButton: false,
      didOpen: () => {
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          swalContainer.style.zIndex = '99999';
        }
      },
    }).then(() => {
      submitFinalForm();
      $('#verifyOtpBtn').prop('disabled', false).text('Verify OTP & Download');
      $('#step1').removeClass('d-none');
      $('#step2').addClass('d-none');
      $('#emailForm')[0].reset();
    });
  });
  function startOtpTimer() {
    let sec = 30;
    $('#resendOtp').addClass('d-none');
    $('#otpTimer').text(`Resend OTP in ${sec}s`);
    if (otpTimerInterval) clearInterval(otpTimerInterval);
    otpTimerInterval = setInterval(() => {
      sec--;
      $('#otpTimer').text(`Resend OTP in ${sec}s`);
      if (sec <= 0) {
        clearInterval(otpTimerInterval);
        $('#otpTimer').text('');
        $('#resendOtp').removeClass('d-none');
      }
    }, 1000);
  }
  $(document).on('click', '#resendOtp', function (e) {
    e.preventDefault();
    $('#getOtpBtn').trigger('click');
  });
  function submitFinalForm() {
    const name = $('#namePopup').val();
    const phone = $('#mobilePopup').val();
    const email = $('#emailPopup').val();
    $.ajax({
      url: 'https://webappqc.roadmaperp.com:8765/ords/rmqc27/web_email/contact',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        mail_sub: `Brochure Download – ${name}`,
        mail_body: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 100px auto; max-width: 500px"><div style="text-align: center"><img src="https://5.imimg.com/data5/SELLER/Default/2023/8/336830897/KS/AX/RB/18506272/roadmap-erp-on-cloud-system-500x500.png" alt="Roadmap IT solution ERP" style="max-width: 180px" /></div><h2 style="text-align: center; font-size: 20px">Product Enquiry from Roadmap Website</h2><h3 style="background-color: #ff9103; color: #fff; padding: 8px; font-size: 18px; text-align: center">Register Details</h3><table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; background-color: white"><tr><td style="padding: 8px; border: 1px solid #ddd"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd">${name}</td></tr><tr style="background-color: #ffebd1"><td style="padding: 8px; border: 1px solid #ddd"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd">${phone}</td></tr><tr><td style="padding: 8px; border: 1px solid #ddd"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd"><a href="mailto:${email}" style="color: #007bff">${email}</a></td></tr><tr style="background-color: #ffebd1"><td style="padding: 8px; border: 1px solid #ddd"><strong>File Name</strong></td><td style="padding: 8px; border: 1px solid #ddd">${selectedFileName}</td></tr><tr><td style="padding: 8px; border: 1px solid #ddd"><strong>Consent</strong></td><td style="padding: 8px; border: 1px solid #ddd">Yes</td></tr></table></div>`,
      }),
      success: function () {
        const link = document.createElement('a');
        link.href = selectedPdfUrl;
        link.download = selectedFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        $('#erpModal').modal('hide');
      },
      error: function () {
        $('#verifyOtpBtn').prop('disabled', false).text('Verify OTP & Download');
        Swal.fire('Error', 'Submission failed', 'error');
      },
    });
  }
  $(document).on('hidden.bs.modal', '#erpModal', function () {
    $('#emailForm')[0].reset();
    $('.error-container-name, .error-container-otp, .error-container-email, .error-container-mobile').text('');
    $('#step1').removeClass('d-none');
    $('#step2').addClass('d-none');
    clearInterval(otpTimerInterval);
    $('#otpTimer').text('');
    $('#resendOtp').addClass('d-none');
    $('#getOtpBtn').prop('disabled', false).find('span').addClass('d-none');
    $('#verifyOtpBtn').prop('disabled', false).text('Verify OTP & Download');
  });
});
let running = [];
let observer;
function scrollAnimate() {
  const allData = document.querySelectorAll("[data-scroll-fm='scroll']");
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const item = entry.target;
          if (entry.isIntersecting) {
            if (!running.includes(item)) {
              const animType = item.getAttribute('data-anim-type');
              switch (animType) {
                case 'count-width':
                  if (item.classList.contains('width-increase')) {
                    item.classList.remove('width-increase');
                    setTimeout(() => item.classList.add('width-increase'), 10);
                  } else {
                    item.classList.add('width-increase');
                  }
                  break;
                default:
                  break;
              }
              if (item.hasAttribute('data-count-fm')) {
                counter(item);
              }
              running.push(item);
            }
          } else {
            running = running.filter((el) => el !== item);
          }
        });
      },
      { threshold: 0.1 }
    );
  }
  allData.forEach((item) => observer.observe(item));
}
window.addEventListener('load', (event) => {
  scrollAnimate(event);
});
function handleScroll() {
  scrollAnimate();
  const header = document.getElementById('stickyHeader');
  if (header) {
    if (!header.classList.contains('bg-white') && $('.wp-main').scrollTop() > 0) {
      header.classList.add('bg-white', 'shadow-card-shadow');
    } else if (header.classList.contains('bg-white') && $('.wp-main').scrollTop() === 0) {
      header.classList.remove('bg-white', 'shadow-card-shadow');
    }
  }
}
$('.wp-main').on('load', handleScroll);
$('.wp-main').on('scroll', handleScroll);


/**
 * ============================================================================
 * Isolated Image & Content Lightbox Overlay (Zero Conflicts)
 * ============================================================================
 */
(function () {
  'use strict';

  if (window.__isoOverlayInitialized) return;
  window.__isoOverlayInitialized = true;

  let overlayEl = null;
  let backdropEl = null;
  let contentEl = null;
  let imgEl = null;
  let captionEl = null;
  let closeBtnEl = null;
  let spinnerEl = null;
  let isOpen = false;
  let prevActiveElement = null;
  let originalOverflow = '';
  let originalPaddingRight = '';

  function buildDOM() {
    if (overlayEl || !document.body) return;

    overlayEl = document.createElement('div');
    overlayEl.className = 'iso-overlay';
    overlayEl.id = 'iso-image-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-label', 'Enlarged Image Preview');

    backdropEl = document.createElement('div');
    backdropEl.className = 'iso-overlay-backdrop';

    contentEl = document.createElement('div');
    contentEl.className = 'iso-overlay-content';

    closeBtnEl = document.createElement('button');
    closeBtnEl.className = 'iso-overlay-close-btn';
    closeBtnEl.type = 'button';
    closeBtnEl.setAttribute('aria-label', 'Close preview');
    closeBtnEl.innerHTML = '&times;';

    spinnerEl = document.createElement('div');
    spinnerEl.className = 'iso-overlay-spinner';

    imgEl = document.createElement('img');
    imgEl.className = 'iso-overlay-image';
    imgEl.alt = 'Enlarged View';

    captionEl = document.createElement('div');
    captionEl.className = 'iso-overlay-caption';

    contentEl.appendChild(closeBtnEl);
    contentEl.appendChild(spinnerEl);
    contentEl.appendChild(imgEl);
    contentEl.appendChild(captionEl);

    overlayEl.appendChild(backdropEl);
    overlayEl.appendChild(contentEl);

    document.body.appendChild(overlayEl);

    backdropEl.addEventListener('click', closeOverlay);
    closeBtnEl.addEventListener('click', closeOverlay);

    contentEl.addEventListener('click', function (e) {
      if (e.target === closeBtnEl) return;
      e.stopPropagation();
    });
  }

  function lockScroll() {
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const currentPadding = parseFloat(window.getComputedStyle(document.body).paddingRight || '0');
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  }

  function openOverlay(options) {
    if (!options || !options.src) return;

    buildDOM();
    if (!overlayEl) return;

    prevActiveElement = document.activeElement;
    isOpen = true;

    overlayEl.classList.add('iso-overlay--loading');
    overlayEl.classList.add('iso-overlay--active');

    captionEl.textContent = options.caption || '';
    imgEl.alt = options.alt || options.caption || 'Enlarged image';

    const tempImg = new Image();
    tempImg.onload = function () {
      if (!isOpen) return;
      imgEl.src = options.src;
      overlayEl.classList.remove('iso-overlay--loading');
    };
    tempImg.onerror = function () {
      if (!isOpen) return;
      imgEl.src = options.src;
      overlayEl.classList.remove('iso-overlay--loading');
    };
    tempImg.src = options.src;

    lockScroll();

    setTimeout(() => {
      if (closeBtnEl) closeBtnEl.focus();
    }, 100);
  }

  function closeOverlay() {
    if (!isOpen || !overlayEl) return;

    isOpen = false;
    overlayEl.classList.remove('iso-overlay--active');
    overlayEl.classList.remove('iso-overlay--loading');

    unlockScroll();

    setTimeout(() => {
      if (!isOpen && imgEl) {
        imgEl.src = '';
        captionEl.textContent = '';
      }
    }, 250);

    if (prevActiveElement && typeof prevActiveElement.focus === 'function') {
      prevActiveElement.focus();
    }
  }

  function isZoomableImage(target) {
    if (!target || target.tagName !== 'IMG') return false;

    if (target.classList.contains('no-zoom')) return false;
    if (target.closest('button, nav, .btn, .iso-overlay, #downloadModal, #erpModal, .modal')) return false;

    if (target.hasAttribute('data-zoomable') || target.hasAttribute('data-overlay-image')) {
      return true;
    }

    if (
      target.closest('.wp-article-content, article, .page-content, .markdown-content, .entry-content') ||
      target.classList.contains('cusBorImg')
    ) {
      const rect = target.getBoundingClientRect();
      const naturalW = target.naturalWidth || rect.width;
      const naturalH = target.naturalHeight || rect.height;
      if (naturalW > 0 && naturalW <= 40 && naturalH > 0 && naturalH <= 40) return false;
      return true;
    }

    return false;
  }

  document.addEventListener('click', function (e) {
    const target = e.target;

    let zoomTarget = null;
    if (isZoomableImage(target)) {
      zoomTarget = target;
    } else {
      const parentLink = target.closest && target.closest('[data-overlay-image], [data-zoomable]');
      if (parentLink && parentLink.tagName === 'IMG') {
        zoomTarget = parentLink;
      }
    }

    if (!zoomTarget) return;

    let src = '';
    let caption = '';
    let alt = '';

    if (zoomTarget.tagName === 'IMG') {
      src = zoomTarget.getAttribute('data-full-src') || zoomTarget.currentSrc || zoomTarget.src;
      caption = zoomTarget.getAttribute('data-caption') || zoomTarget.getAttribute('alt') || zoomTarget.getAttribute('title') || '';
      alt = zoomTarget.getAttribute('alt') || caption;
    } else {
      src = zoomTarget.getAttribute('data-overlay-image') || zoomTarget.getAttribute('href');
      caption = zoomTarget.getAttribute('data-caption') || zoomTarget.getAttribute('title') || '';
      alt = caption;
    }

    if (src) {
      e.preventDefault();
      openOverlay({ src, caption, alt });
    }
  }, false);

  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;

    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
      e.preventDefault();
      closeOverlay();
    }
  }, false);

  if (typeof window !== 'undefined') {
    window.ImageOverlay = Object.freeze({
      open: openOverlay,
      close: closeOverlay,
      isOpen: function () { return isOpen; }
    });
  }
})();


// Version Switcher (replaces the sidebar "Documentation" title)
function setupVersionSwitcher() {
  const title = document.querySelector('#sidebar .wp-sidebar-title');
  if (!title) return;
  const activeKey = getActiveVersionKey();
  const current = VERSION_CONFIG[activeKey] || {};
  const items = Object.keys(VERSION_CONFIG)
    .map((key) => {
      const v = VERSION_CONFIG[key];
      const active = key === activeKey;
      return `<li><button type="button" class="wp-version-option${active ? ' active' : ''}" data-version="${key}" role="option" aria-selected="${active}">${escapeHtml(v.name)}${active ? '<i class="bi bi-check2"></i>' : ''}</button></li>`;
    })
    .join('');

  const wrap = document.createElement('div');
  wrap.className = 'wp-version-switcher';
  wrap.innerHTML = `
    <button type="button" class="wp-version-toggle" aria-haspopup="listbox" aria-expanded="false">
      Docs Ver ${escapeHtml(current.name || '')}<i class="bi bi-chevron-down"></i>
    </button>
    <ul class="wp-version-menu" role="listbox">${items}</ul>
  `;
  title.replaceWith(wrap);

  // Group the version label, collapse button and search into a header that stays fixed while the menu scrolls
  const content = wrap.parentElement;
  if (content && !content.querySelector('.wp-sidebar-top')) {
    const top = document.createElement('div');
    top.className = 'wp-sidebar-top';
    content.insertBefore(top, wrap);
    [wrap, content.querySelector('.wp-sidebar-actions'), content.querySelector('.wp-search')].forEach((el) => {
      if (el) top.appendChild(el);
    });
  }

  const toggle = wrap.querySelector('.wp-version-toggle');
  const setOpen = (open) => {
    wrap.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!wrap.classList.contains('open'));
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
  wrap.querySelectorAll('.wp-version-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      setOpen(false);
      switchDocsVersion(btn.dataset.version);
    });
  });
}

// Go to the same page in the chosen version if it exists there, else that version's home
async function switchDocsVersion(targetKey) {
  const target = VERSION_CONFIG[targetKey];
  if (!target || targetKey === getActiveVersionKey()) return;
  let dest = target.prefix + '/';
  try {
    const route = getRouteFromCurrentUrl();
    if (route.type === 'module' && route.path) {
      dest = `${target.prefix}/${route.path}/`;
    } else if (route.type === 'screen' && route.path && route.pageId) {
      // A missing file can come back as the SPA index.html (200 OK), so only accept a real page fragment.
      const res = await fetchWithFallback(`/docs/${target.docFolder}/${route.pageId}.html`);
      const text = res && res.ok ? await res.text() : '';
      if (text.trim() && !/<html[\s>]/i.test(text)) {
        dest = `${target.prefix}/${route.path}/`;
      }
    }
  } catch (err) {
    console.error('Version switch check failed:', err);
  }
  window.location.href = dest;
}
