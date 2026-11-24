/**
 * ============================================================================
 * Isolated Image & Content Lightbox Overlay
 * ============================================================================
 * Guaranteed Isolation:
 * - Wrapped in an IIFE to prevent polluting global scope.
 * - Namespaced classes & IDs (prefixed with "iso-overlay-").
 * - Non-destructive event handling: does NOT stopPropagation on external events.
 * - Non-destructive scroll lock: restores previous body inline styles precisely.
 * - Completely independent of Bootstrap, jQuery, Tailwind, or SweetAlert.
 * ============================================================================
 */

(function () {
  'use strict';

  if (window.__isoOverlayInitialized) return;
  window.__isoOverlayInitialized = true;

  // State variables (scoped strictly within this closure)
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

  /**
   * Builds and injects the overlay DOM structure if not already present.
   */
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

    // Event listeners on overlay-internal elements
    backdropEl.addEventListener('click', closeOverlay);
    closeBtnEl.addEventListener('click', closeOverlay);

    // Clicking image content itself does not close overlay
    contentEl.addEventListener('click', function (e) {
      if (e.target === closeBtnEl) return;
      e.stopPropagation();
    });
  }

  /**
   * Locks the body scroll non-destructively, accounting for scrollbar jitter.
   */
  function lockScroll() {
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    // Check if scrollbar is present
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const currentPadding = parseFloat(window.getComputedStyle(document.body).paddingRight || '0');
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';
  }

  /**
   * Restores the body scroll to its exact previous state.
   */
  function unlockScroll() {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  }

  /**
   * Opens the overlay with a given image source and optional caption.
   * @param {Object} options - { src: string, caption?: string, alt?: string }
   */
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

    // Preload image
    const tempImg = new Image();
    tempImg.onload = function () {
      if (!isOpen) return; // closed while loading
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

    // Focus close button for accessibility
    setTimeout(() => {
      if (closeBtnEl) closeBtnEl.focus();
    }, 100);
  }

  /**
   * Closes the overlay and restores background page state.
   */
  function closeOverlay() {
    if (!isOpen || !overlayEl) return;

    isOpen = false;
    overlayEl.classList.remove('iso-overlay--active');
    overlayEl.classList.remove('iso-overlay--loading');

    unlockScroll();

    // Reset image source after transition to release memory
    setTimeout(() => {
      if (!isOpen && imgEl) {
        imgEl.src = '';
        captionEl.textContent = '';
      }
    }, 250);

    // Return focus to triggering element
    if (prevActiveElement && typeof prevActiveElement.focus === 'function') {
      prevActiveElement.focus();
    }
  }

  /**
   * Determines if a clicked image is eligible for the zoom overlay.
   * Excludes tiny icons, buttons, navigation items, or images with .no-zoom.
   */
  function isZoomableImage(target) {
    if (!target || target.tagName !== 'IMG') return false;

    // Explicitly opt-out
    if (target.classList.contains('no-zoom')) return false;

    // Inside navigation, buttons, or modals that aren't articles
    if (target.closest('button, nav, .btn, .iso-overlay, #downloadModal, #erpModal, .modal')) return false;

    // Explicit opt-in
    if (target.hasAttribute('data-zoomable') || target.hasAttribute('data-overlay-image')) {
      return true;
    }

    // Auto-enable for article content and documentation images
    if (
      target.closest('.wp-article-content, article, .page-content, .markdown-content, .entry-content') ||
      target.classList.contains('cusBorImg')
    ) {
      // Exclude small icon images (width/height <= 40px)
      const rect = target.getBoundingClientRect();
      const naturalW = target.naturalWidth || rect.width;
      const naturalH = target.naturalHeight || rect.height;
      if (naturalW > 0 && naturalW <= 40 && naturalH > 0 && naturalH <= 40) return false;
      return true;
    }

    return false;
  }

  /**
   * Global click delegation.
   * Only intercepts clicks on valid zoomable targets; all other clicks pass through untouched.
   */
  document.addEventListener('click', function (e) {
    const target = e.target;

    // Check if clicked element or its parent is zoomable
    let zoomTarget = null;
    if (isZoomableImage(target)) {
      zoomTarget = target;
    } else {
      const parentLink = target.closest && target.closest('[data-overlay-image], [data-zoomable]');
      if (parentLink && parentLink.tagName === 'IMG') {
        zoomTarget = parentLink;
      }
    }

    if (!zoomTarget) return; // Allow normal event flow for other scripts

    // Extract source and caption
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
      e.preventDefault(); // Only prevent default on the clicked image/link
      openOverlay({ src, caption, alt });
    }
  }, false);

  /**
   * Escape key listener.
   * Only intercepts Escape when this overlay is actively open.
   */
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return; // Do nothing if overlay is closed - other scripts get the key

    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
      e.preventDefault();
      closeOverlay();
    }
  }, false);

  // Expose a clean, safe public API under a distinct namespace
  if (typeof window !== 'undefined') {
    window.ImageOverlay = Object.freeze({
      open: openOverlay,
      close: closeOverlay,
      isOpen: function () { return isOpen; }
    });
  }
})();
