/* ==========================================================
   Exclucive Barbie — Main script
   Depends on js/data.js (window.SITE, SERVICES, ADDONS, TESTIMONIALS)
   Sections:
   1. Helpers            6. Services catalogue (dynamic + search/filter/sort)
   2. Navigation & UI    7. Gallery lightbox
   3. Animations         8. Forms: validation, contact + enquiry
   4. Accordion & tabs   9. Interactive map (Leaflet)
   5. Testimonials      10. Init
   ========================================================== */
(function () {
  'use strict';

  var SITE = window.SITE || {};
  var SERVICES = window.SERVICES || [];
  var ADDONS = window.ADDONS || [];
  var TESTIMONIALS = window.TESTIMONIALS || [];
  var CATEGORIES = window.CATEGORIES || {};
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  // Small DOM builder: h('div', {class:'x', text:'hi'}, child1, child2)
  // Uses textContent / createTextNode only, so user-provided text can never inject HTML.
  function h(tag, props) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v === true ? '' : v);
    });
    Array.prototype.slice.call(arguments, 2).reduce(function (a, c) { return a.concat(c); }, []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(c && c.nodeType ? c : document.createTextNode(String(c)));
    });
    return node;
  }

  function money(n) { return 'R' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function formatDuration(mins) {
    if (mins < 60) return mins + ' min';
    var hrs = Math.round((mins / 60) * 10) / 10;
    return hrs + (hrs === 1 ? ' hr' : ' hrs');
  }
  function isoDate(d) {
    var z = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }
  function oneLine(s) { return String(s || '').replace(/[\r\n]+/g, ' ').trim(); }
  function serviceById(id) { return SERVICES.filter(function (s) { return s.id === id; })[0]; }

  var toastWrap;
  function toast(msg, type) {
    if (!toastWrap) {
      toastWrap = h('div', { class: 'toast-wrap', 'aria-live': 'polite' });
      document.body.appendChild(toastWrap);
    }
    var t = h('div', { class: 'toast ' + (type || 'info'), role: 'status', text: msg });
    toastWrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 400); }, 4000);
  }

  function openDialog(dlg) {
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }

  /* ---------- 2. Navigation & UI ---------- */
  function initNav() {
    var header = $('header.site-header'), btn = $('.menu-btn'), list = $('#nav-list');
    if (!header || !btn || !list) return;
    header.classList.add('nav-ready');
    function close() { list.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    list.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('click', function (e) { if (!header.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('scroll', function () { header.classList.toggle('scrolled', window.scrollY > 10); }, { passive: true });
  }

  function initBackToTop() {
    var b = h('button', { class: 'to-top', type: 'button', 'aria-label': 'Back to top', text: '↑' });
    document.body.appendChild(b);
    window.addEventListener('scroll', function () { b.classList.toggle('show', window.scrollY > 500); }, { passive: true });
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
  }

  function initYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- 3. Animations ---------- */
  var revealObserver;
  function reveal(nodes) {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { var t = en.target; t.classList.add('visible'); revealObserver.unobserve(t); setTimeout(function () { t.style.transitionDelay = ''; }, 1000); }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    }
    nodes.forEach(function (n, i) {
      if (n.classList.contains('reveal')) return;
      n.classList.add('reveal');
      n.style.transitionDelay = (i % 4) * 70 + 'ms';
      revealObserver.observe(n);
    });
  }
  function initReveal() {
    reveal($$('main .section-head, main .grid-2 > *, main .grid-3 > .card, main .accordion, main .tabs, main .contact-grid > *, main .map-wrap, main .gallery-item, main .table-wrap, main .t-slider, main .toolbar'));
  }

  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length || reduceMotion || !('IntersectionObserver' in window)) return; // static text stays as fallback
    function run(el) {
      var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10), suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
      (function step(t) {
        var p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (end * eased).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { run(en.target); o.unobserve(en.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (e) { o.observe(e); });
  }

  /* ---------- 4. Accordion & tabs ---------- */
  function setAccordion(item, open) {
    $('.accordion-btn', item).setAttribute('aria-expanded', String(open));
    item.classList.toggle('open', open);
  }
  function initAccordions() {
    $$('.accordion').forEach(function (acc) {
      var items = $$('.accordion-item', acc);
      items.forEach(function (item) {
        $('.accordion-btn', item).addEventListener('click', function () {
          var wasOpen = item.classList.contains('open');
          items.forEach(function (o) { if (o !== item) setAccordion(o, false); });
          setAccordion(item, !wasOpen);
        });
      });
    });
  }

  function initTabs() {
    $$('[data-tabs]').forEach(function (root) {
      var tabs = $$('[role="tab"]', root), panels = $$('[role="tabpanel"]', root);
      function select(i, focus) {
        tabs.forEach(function (t, j) {
          var on = i === j;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          panels[j].hidden = !on;
          if (on && focus) t.focus();
        });
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(i); });
        t.addEventListener('keydown', function (e) {
          var n = null;
          if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
          else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
          else if (e.key === 'Home') n = 0;
          else if (e.key === 'End') n = tabs.length - 1;
          if (n !== null) { e.preventDefault(); select(n, true); }
        });
      });
      select(0);
    });
  }

  /* ---------- 5. Testimonials slider (built dynamically) ---------- */
  function initTestimonials() {
    var root = $('#testimonial-slider');
    if (!root || !TESTIMONIALS.length) return;
    var idx = 0, timer = null;
    var track = h('div', { class: 't-track' });
    var dots = h('div', { class: 't-dots' });
    var cards = TESTIMONIALS.map(function (t, i) {
      var card = h('figure', { class: 't-card', 'aria-hidden': i === 0 ? 'false' : 'true' },
        h('div', { class: 'stars', role: 'img', 'aria-label': t.rating + ' out of 5 stars', text: new Array(t.rating + 1).join('★') }),
        h('blockquote', {}, h('p', { text: t.quote })),
        h('figcaption', {}, h('span', { class: 't-name', text: t.name }), h('span', { class: 't-role', text: t.role })));
      track.appendChild(card);
      var dot = h('button', { class: 't-dot' + (i === 0 ? ' active' : ''), type: 'button', 'aria-label': 'Show testimonial ' + (i + 1) });
      dot.addEventListener('click', function () { go(i); restart(); });
      dots.appendChild(dot);
      return card;
    });
    var prev = h('button', { class: 't-arrow', type: 'button', 'aria-label': 'Previous testimonial', text: '←' });
    var next = h('button', { class: 't-arrow', type: 'button', 'aria-label': 'Next testimonial', text: '→' });
    function go(i) {
      idx = (i + cards.length) % cards.length;
      track.style.transform = 'translateX(-' + idx * 100 + '%)';
      cards.forEach(function (c, j) { c.setAttribute('aria-hidden', String(j !== idx)); });
      $$('.t-dot', dots).forEach(function (d, j) { d.classList.toggle('active', j === idx); });
    }
    function restart() {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(function () { go(idx + 1); }, 6500);
    }
    prev.addEventListener('click', function () { go(idx - 1); restart(); });
    next.addEventListener('click', function () { go(idx + 1); restart(); });
    root.addEventListener('mouseenter', function () { clearInterval(timer); });
    root.addEventListener('mouseleave', restart);
    root.addEventListener('focusin', function () { clearInterval(timer); });
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', 'Client testimonials');
    root.replaceChildren(h('div', { class: 't-viewport' }, track), h('div', { class: 't-controls' }, prev, dots, next));
    restart();
  }

  /* ---------- 6. Services catalogue: dynamic content + search / filter / sort ---------- */
  function highlight(text, query) {
    var words = query.trim().split(/\s+/).filter(Boolean).map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    if (!words.length) return [text];
    var parts = text.split(new RegExp('(' + words.join('|') + ')', 'gi'));
    return parts.map(function (p, i) { return i % 2 ? h('mark', { text: p }) : p; }).filter(function (p) { return p !== ''; });
  }

  function openServiceModal(s, opener) {
    var dlg = h('dialog', { class: 'modal', 'aria-labelledby': 'modal-title' },
      h('div', { class: 'modal-box' },
        h('button', { class: 'modal-close', type: 'button', 'aria-label': 'Close details', text: '×' }),
        h('span', { class: 'eyebrow', text: CATEGORIES[s.category] }),
        h('h2', { id: 'modal-title', text: s.name }),
        h('p', { text: s.description }),
        h('ul', { class: 'check-list' }, s.includes.map(function (i) { return h('li', { text: i }); })),
        h('p', { class: 'modal-price' }, 'From ', h('strong', { text: money(s.price) }), ' · approx. ' + formatDuration(s.duration)),
        h('div', { class: 'card-actions' },
          h('a', { class: 'btn-solid', href: 'enquiry.html?service=' + encodeURIComponent(s.id), text: 'Request a quote' }),
          h('button', { class: 'btn-outline', type: 'button', 'data-close': '', text: 'Close' }))));
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('.modal-close') || e.target.closest('[data-close]')) dlg.close();
    });
    dlg.addEventListener('close', function () { dlg.remove(); if (opener) opener.focus(); });
    document.body.appendChild(dlg);
    if (typeof dlg.close !== 'function') dlg.close = function () { dlg.removeAttribute('open'); dlg.dispatchEvent(new Event('close')); };
    openDialog(dlg);
  }

  function initServices() {
    var grid = $('#service-grid');
    if (!grid) return;
    var search = $('#service-search'), cat = $('#service-category'), sort = $('#service-sort'),
        count = $('#service-count'), empty = $('#service-empty'), clearBtn = $('#service-clear');

    // Build the category filter dynamically from data
    Object.keys(CATEGORIES).forEach(function (k) { cat.appendChild(h('option', { value: k, text: CATEGORIES[k] })); });

    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) search.value = params.get('q').slice(0, 60);
    if (params.get('category') && CATEGORIES[params.get('category')]) cat.value = params.get('category');

    var sorters = {
      'default': function (a, b) { return SERVICES.indexOf(a) - SERVICES.indexOf(b); },
      'name-asc': function (a, b) { return a.name.localeCompare(b.name); },
      'name-desc': function (a, b) { return b.name.localeCompare(a.name); },
      'price-asc': function (a, b) { return a.price - b.price; },
      'price-desc': function (a, b) { return b.price - a.price; },
      'duration-asc': function (a, b) { return a.duration - b.duration; }
    };

    function matches(s, q) {
      if (!q) return true;
      var hay = (s.name + ' ' + s.description + ' ' + CATEGORIES[s.category] + ' ' + (s.keywords || '')).toLowerCase();
      return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) !== -1; });
    }

    function card(s, q) {
      return h('article', { class: 'card service-card' + (s.featured ? ' featured-card' : ''), 'data-id': s.id },
        h('div', { class: 'icon', 'aria-hidden': 'true', text: s.icon }),
        h('span', { class: 'tag', text: CATEGORIES[s.category] }),
        h('h3', {}, highlight(s.name, q)),
        h('p', {}, highlight(s.description, q)),
        h('div', { class: 'service-meta' },
          h('span', { class: 'price', text: 'From ' + money(s.price) }),
          h('span', { class: 'duration', text: '≈ ' + formatDuration(s.duration) })),
        h('div', { class: 'card-actions' },
          h('button', { class: 'btn-outline btn-sm', type: 'button', 'data-details': s.id, text: 'View details' }),
          h('a', { class: 'btn-solid btn-sm', href: 'enquiry.html?service=' + encodeURIComponent(s.id), text: 'Enquire' })));
    }

    function render() {
      var q = search.value.trim();
      var list = SERVICES.filter(function (s) { return (!cat.value || s.category === cat.value) && matches(s, q); })
                         .sort(sorters[sort.value] || sorters['default']);
      grid.replaceChildren.apply(grid, list.map(function (s) { return card(s, q); }));
      reveal($$('.service-card', grid));
      count.textContent = list.length === 0 ? 'No services found'
        : 'Showing ' + list.length + ' of ' + SERVICES.length + ' services';
      empty.hidden = list.length !== 0;
      grid.hidden = list.length === 0;
    }

    var t;
    search.addEventListener('input', function () { clearTimeout(t); t = setTimeout(render, 150); });
    cat.addEventListener('change', render);
    sort.addEventListener('change', render);
    clearBtn.addEventListener('click', function () { search.value = ''; cat.value = ''; sort.value = 'default'; render(); search.focus(); });
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-details]');
      if (b) { var s = serviceById(b.getAttribute('data-details')); if (s) openServiceModal(s, b); }
    });
    render();
  }

  /* ---------- 7. Gallery lightbox ---------- */
  function initLightbox() {
    var items = $$('.gallery-item');
    if (!items.length) return;
    var idx = 0, dlg, img, cap, counter, startX = null;

    function build() {
      if (dlg) return;
      img = h('img', { alt: '' });
      cap = h('p', { class: 'lb-caption' });
      counter = h('p', { class: 'lb-count' });
      var close = h('button', { class: 'lb-btn lb-close', type: 'button', 'aria-label': 'Close image', text: '×' });
      var prev = h('button', { class: 'lb-btn lb-prev', type: 'button', 'aria-label': 'Previous image', text: '‹' });
      var next = h('button', { class: 'lb-btn lb-next', type: 'button', 'aria-label': 'Next image', text: '›' });
      dlg = h('dialog', { class: 'lightbox', 'aria-label': 'Image viewer' }, h('div', { class: 'lb-box' }, close, prev, img, cap, counter, next));
      close.addEventListener('click', function () { dlg.close(); });
      prev.addEventListener('click', function () { show(idx - 1); });
      next.addEventListener('click', function () { show(idx + 1); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') show(idx - 1);
        if (e.key === 'ArrowRight') show(idx + 1);
      });
      dlg.addEventListener('touchstart', function (e) { startX = e.changedTouches[0].clientX; }, { passive: true });
      dlg.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
        startX = null;
      }, { passive: true });
      document.body.appendChild(dlg);
    }
    function show(i) {
      idx = (i + items.length) % items.length;
      var src = $('img', items[idx]);
      img.src = src.currentSrc || src.src;
      img.alt = src.alt;
      cap.textContent = items[idx].getAttribute('data-caption') || src.alt;
      counter.textContent = (idx + 1) + ' / ' + items.length;
    }
    items.forEach(function (it, i) {
      it.addEventListener('click', function () {
        build(); show(i); openDialog(dlg);
        dlg.addEventListener('close', function () { it.focus(); }, { once: true });
      });
    });
  }

  /* ---------- 8. Forms: shared validation ---------- */
  function labelOf(ctrl) {
    var field = ctrl.closest('.field');
    var l = field && (field.querySelector('label') || field.querySelector('legend'));
    return l ? l.textContent.replace('*', '').trim().toLowerCase().replace(/^your /, '').replace(/\?$/, '') : 'this field';
  }

  function messageFor(ctrl) {
    var v = ctrl.validity, d = ctrl.dataset;
    if (v.valid) return '';
    if (v.customError) return ctrl.validationMessage;
    if (v.valueMissing) {
      if (d.msgRequired) return d.msgRequired;
      if (ctrl.type === 'checkbox') return 'Please tick this box to continue.';
      if (ctrl.type === 'radio') return 'Please choose one option.';
      if (ctrl.tagName === 'SELECT') return 'Please choose ' + labelOf(ctrl) + '.';
      return 'Please enter your ' + labelOf(ctrl) + '.';
    }
    if (v.typeMismatch) return ctrl.type === 'email' ? 'Please enter a valid email address, e.g. name@example.com.' : 'Please enter a valid value.';
    if (v.patternMismatch) return d.msgPattern || 'Please match the requested format.';
    if (v.tooShort) return 'Please enter at least ' + ctrl.minLength + ' characters (you have ' + ctrl.value.length + ').';
    if (v.tooLong) return 'Please keep this to ' + ctrl.maxLength + ' characters or fewer.';
    if (v.rangeUnderflow) return d.msgMin || 'Value must be ' + ctrl.min + ' or more.';
    if (v.rangeOverflow) return d.msgMax || 'Value must be ' + ctrl.max + ' or less.';
    if (v.badInput) return 'Please enter a valid value.';
    return ctrl.validationMessage || 'Please check this field.';
  }

  function validateField(field) {
    var controls = $$('input, select, textarea', field);
    controls.forEach(function (c) {
      c.setCustomValidity('');
      // Treat whitespace-only text as empty; enforce min length even for autofilled values
      if (c.required && /^(text|email|tel|search)$/.test(c.type || 'text') && c.value && !c.value.trim()) {
        c.setCustomValidity(c.dataset.msgRequired || 'Please enter your ' + labelOf(c) + '.');
      } else if (c.minLength > 0 && c.value && c.value.trim().length < c.minLength && c.tagName !== 'SELECT') {
        c.setCustomValidity('Please enter at least ' + c.minLength + ' characters (you have ' + c.value.trim().length + ').');
      }
    });
    var bad = controls.filter(function (c) { return !c.validity.valid; })[0];
    var msg = bad ? messageFor(bad) : '';
    var err = $('.error-msg', field);
    if (err) err.textContent = msg;
    field.classList.toggle('invalid', !!msg);
    field.classList.toggle('valid', !msg && field.dataset.touched === '1' && controls.some(function (c) { return c.value; }));
    controls.forEach(function (c) { if (msg) c.setAttribute('aria-invalid', 'true'); else c.removeAttribute('aria-invalid'); });
    return bad || null;
  }

  function setupForm(form, onValid) {
    var fields = $$('.field', form);
    var status = $('.form-status', form);

    // Live character counters
    $$('textarea[maxlength]', form).forEach(function (ta) {
      var out = ta.closest('.field').querySelector('.char-count');
      if (!out) return;
      var upd = function () { out.textContent = ta.value.length + ' / ' + ta.maxLength; };
      ta.addEventListener('input', upd); upd();
    });

    fields.forEach(function (f) {
      f.addEventListener('focusout', function () { f.dataset.touched = '1'; validateField(f); });
      ['input', 'change'].forEach(function (ev) {
        f.addEventListener(ev, function () { if (f.dataset.touched === '1' || f.classList.contains('invalid')) validateField(f); });
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null, badCount = 0;
      fields.forEach(function (f) {
        f.dataset.touched = '1';
        var bad = validateField(f);
        if (bad) { badCount++; if (!firstBad) firstBad = bad; }
      });
      if (firstBad) {
        status.className = 'form-status error';
        status.textContent = 'Please fix ' + badCount + (badCount === 1 ? ' field' : ' fields') + ' highlighted below, then try again.';
        firstBad.focus();
        toast('Some details need your attention.', 'error');
        return;
      }
      status.className = 'form-status';
      status.textContent = '';
      var hp = $('.hp input', form);
      if (hp && hp.value) return; // honeypot filled → bot, silently ignore
      var data = {};
      new FormData(form).forEach(function (val, key) {
        val = typeof val === 'string' ? val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim() : val;
        if (data[key] === undefined) data[key] = val;
        else data[key] = [].concat(data[key], val);
      });
      onValid(data);
    });

    form.addEventListener('reset', function () {
      setTimeout(function () {
        fields.forEach(function (f) { f.dataset.touched = ''; f.classList.remove('invalid', 'valid'); var e = $('.error-msg', f); if (e) e.textContent = ''; });
        status.className = 'form-status'; status.textContent = '';
        $$('textarea[maxlength]', form).forEach(function (ta) { ta.dispatchEvent(new Event('input')); });
      }, 0);
    });
  }

  function mailtoLink(to, subject, body) {
    return 'mailto:' + to + '?subject=' + encodeURIComponent(oneLine(subject)) + '&body=' + encodeURIComponent(body);
  }

  /* ---- Contact form → compiled email ---- */
  function initContactForm() {
    var form = $('#contact-form');
    if (!form) return;
    var holder = $('#form-result');

    setupForm(form, function (d) {
      var subject = '[Website] ' + d.type + ' — ' + oneLine(d.name);
      var body = [
        'Name: ' + oneLine(d.name), 'Email: ' + d.email, 'Phone: ' + d.phone,
        'Preferred contact method: ' + d.method, 'Message type: ' + d.type, '', 'Message:', d.message, '',
        '— Sent via the Exclucive Barbie website contact form'
      ].join('\r\n');
      var preview = 'To: ' + SITE.email + '\nSubject: ' + oneLine(subject) + '\n\n' + body.replace(/\r\n/g, '\n');

      var copyBtn = h('button', { class: 'btn-outline btn-sm', type: 'button', text: 'Copy message' });
      var editBtn = h('button', { class: 'btn-outline btn-sm', type: 'button', text: 'Edit my message' });
      var panel = h('div', { class: 'result-panel', tabindex: '-1' },
        h('h2', { text: 'Your message is ready, ' + oneLine(d.name).split(' ')[0] + '!' }),
        h('p', {}, 'We have put your details into an email addressed to ', h('strong', { text: SITE.email }), '. Review it below, then press ', h('strong', { text: 'Send email' }), ' to open it in your email app.'),
        h('div', { class: 'email-preview', text: preview }),
        h('div', { class: 'card-actions' },
          h('a', { class: 'btn-solid btn-sm', href: mailtoLink(SITE.email, subject, body), text: 'Send email' }),
          copyBtn, editBtn),
        h('p', { class: 'fine-print', text: 'Nothing is sent until you press “Send” in your email app.' }));
      copyBtn.addEventListener('click', function () {
        if (navigator.clipboard) navigator.clipboard.writeText(preview).then(function () { toast('Message copied to clipboard.', 'success'); }, function () { toast('Could not copy automatically.', 'error'); });
      });
      editBtn.addEventListener('click', function () { holder.replaceChildren(); form.hidden = false; $('input', form).focus(); });
      holder.replaceChildren(panel);
      form.hidden = true;
      panel.focus();
      panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* ---- Enquiry form → processed quote & availability response ---- */
  var SLOTS = {
    morning: { label: 'Morning (09:00–12:00)', hours: 3 },
    afternoon: { label: 'Afternoon (12:00–16:00)', hours: 4 },
    late: { label: 'Late afternoon (16:00–18:00)', hours: 2 }
  };
  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function checkAvailability(date, slotKey, svc) {
    var day = date.getDay(), slot = SLOTS[slotKey], dayName = DAY_NAMES[day];
    if (day === 0) {
      return { status: 'appointment', label: 'By appointment', text: 'Sundays are by appointment only. Our team will contact you within 24 hours to confirm whether we can fit you in.' };
    }
    var slotHours = slot.hours;
    if (day === 6 && slotKey === 'late') slotHours = 1; // Saturday closes at 17:00
    var need = svc.duration / 60;
    if (need > slotHours) {
      var rec = ['morning', 'afternoon'].filter(function (k) { return SLOTS[k].hours >= need; })[0];
      var text = svc.name + ' takes about ' + formatDuration(svc.duration) + ', which is longer than the ' + slot.label.split(' (')[0].toLowerCase() + ' window on a ' + dayName + '. ' +
        (rec ? 'We recommend the ' + SLOTS[rec].label + ' slot instead.' : 'Please call us so we can arrange a longer booking.');
      return { status: 'limited', label: 'Limited', text: text };
    }
    return { status: 'available', label: 'Likely available', text: 'That ' + dayName + ' ' + slot.label.toLowerCase() + ' slot falls within our studio hours and we normally have space. ' + (day === 6 ? 'Saturdays fill up quickly, so we suggest confirming soon. ' : '') + 'Your booking is confirmed once our team replies within 24 hours.' };
  }

  function buildQuote(d, svc) {
    var people = parseInt(d.people, 10);
    var picked = [].concat(d.addons || []).map(function (id) { return ADDONS.filter(function (a) { return a.id === id; })[0]; }).filter(Boolean);
    var addonPer = picked.reduce(function (s, a) { return s + a.price; }, 0);
    var subtotal = (svc.price + addonPer) * people;
    var discount = people >= 3 ? subtotal * 0.1 : 0;
    var total = subtotal - discount;
    return { people: people, picked: picked, subtotal: subtotal, discount: discount, total: total, deposit: total * 0.3 };
  }

  function initEnquiryForm() {
    var form = $('#enquiry-form');
    if (!form) return;
    var holder = $('#form-result');
    var dateInput = $('#enq-date');

    // Date limits: at least 24 hours' notice, up to 1 year ahead
    var min = new Date(); min.setDate(min.getDate() + 1);
    var max = new Date(); max.setFullYear(max.getFullYear() + 1);
    dateInput.min = isoDate(min); dateInput.max = isoDate(max);

    // Pre-select a service from the URL (?service=hair-styling)
    var pre = new URLSearchParams(window.location.search).get('service');
    if (pre && serviceById(pre)) $('#enq-service').value = pre;

    setupForm(form, function (d) {
      var svc = serviceById(d.service);
      if (!svc) { toast('Please choose a valid service.', 'error'); return; }
      var date = new Date(d.date + 'T00:00:00');
      var q = buildQuote(d, svc);
      var av = checkAvailability(date, d.slot, svc);
      var niceDate = DAY_NAMES[date.getDay()] + ', ' + date.getDate() + ' ' + date.toLocaleString('en-ZA', { month: 'long' }) + ' ' + date.getFullYear();
      var first = oneLine(d.name).split(' ')[0];

      var rows = [
        ['Service', svc.name + ' (from ' + money(svc.price) + ' per person)'],
        ['Number of people', String(q.people)],
        ['Add-ons', q.picked.length ? q.picked.map(function (a) { return a.name + ' (+' + money(a.price) + ')'; }).join(', ') : 'None'],
        ['Preferred date', niceDate],
        ['Preferred time', SLOTS[d.slot].label],
        ['Subtotal', money(q.subtotal)]
      ];
      if (q.discount) rows.push(['Group discount (10%)', '−' + money(q.discount)]);
      var table = h('table', { class: 'result-table' }, h('tbody', {},
        rows.map(function (r) { return h('tr', {}, h('th', { scope: 'row', text: r[0] }), h('td', { text: r[1] })); }),
        h('tr', { class: 'total' }, h('th', { scope: 'row', text: 'Estimated total' }), h('td', { text: money(q.total) })),
        h('tr', {}, h('th', { scope: 'row', text: 'Suggested deposit (30%)' }), h('td', { text: money(q.deposit) })),
        h('tr', {}, h('th', { scope: 'row', text: 'Availability' }), h('td', {}, h('span', { class: 'status ' + av.status, text: av.label })))));

      var subject = 'Booking enquiry: ' + svc.name + ' on ' + d.date;
      var body = [
        'Hi Exclucive Barbie,', '', 'I would like to enquire about the following:', '',
        'Name: ' + oneLine(d.name), 'Email: ' + d.email, 'Phone: ' + d.phone,
        'Enquiry type: ' + d.type, 'Service: ' + svc.name, 'People: ' + q.people,
        'Add-ons: ' + (q.picked.length ? q.picked.map(function (a) { return a.name; }).join(', ') : 'None'),
        'Preferred date: ' + niceDate, 'Preferred time: ' + SLOTS[d.slot].label,
        'Estimated total: ' + money(q.total), '', 'Notes: ' + (d.notes || '—'), '', 'Thank you!'
      ].join('\r\n');

      var again = h('button', { class: 'btn-outline btn-sm', type: 'button', text: 'Make another enquiry' });
      var panel = h('div', { class: 'result-panel', tabindex: '-1' },
        h('h2', { text: 'Thank you, ' + first + '! Here is your estimate' }),
        h('p', { text: 'Based on what you told us for your ' + d.type.toLowerCase() + ':' }),
        table,
        h('div', { class: 'availability-note', text: av.text }),
        h('div', { class: 'card-actions' },
          h('a', { class: 'btn-solid btn-sm', href: mailtoLink(SITE.email, subject, body), text: 'Email this request to us' }),
          h('a', { class: 'btn-outline btn-sm', href: 'tel:' + SITE.phoneLink, text: 'Call the studio' }),
          again),
        h('p', { class: 'fine-print', text: 'This is an estimate based on starting prices. Your final price depends on hair length, design complexity and products used. Nothing is booked until our team confirms.' }));
      again.addEventListener('click', function () { holder.replaceChildren(); form.hidden = false; form.reset(); $('input', form).focus(); });
      holder.replaceChildren(panel);
      form.hidden = true;
      panel.focus();
      panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* ---------- 9. Interactive map (Leaflet + OpenStreetMap) ---------- */
  function haversine(a, b) {
    var R = 6371, rad = Math.PI / 180;
    var dLat = (b[0] - a[0]) * rad, dLng = (b[1] - a[1]) * rad;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function initMap() {
    var el = $('#map');
    if (!el) return;
    var pos = [SITE.location.lat, SITE.location.lng];
    var status = $('#map-status'), locateBtn = $('#locate-btn'), dirLink = $('#directions-link');
    dirLink.href = 'https://www.google.com/maps/dir/?api=1&destination=' + pos[0] + ',' + pos[1];

    if (!window.L) {
      el.replaceChildren(h('p', { class: 'map-fallback' }, 'The interactive map could not load. ',
        h('a', { class: 'text-link', href: 'https://www.openstreetmap.org/?mlat=' + pos[0] + '&mlon=' + pos[1] + '#map=15/' + pos[0] + '/' + pos[1], target: '_blank', rel: 'noopener noreferrer', text: 'Open our location on OpenStreetMap' })));
      locateBtn.disabled = true;
      return;
    }

    var map = L.map(el, { scrollWheelZoom: false }).setView(pos, 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);
    window.requestAnimationFrame(function () { map.invalidateSize({ pan: false }); });
    L.marker(pos).addTo(map).bindPopup(h('div', {}, h('strong', { text: SITE.name }), h('br'), SITE.address)).openPopup();
    map.on('click', function () { map.scrollWheelZoom.enable(); });
    map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

    var userLayer = null;
    locateBtn.addEventListener('click', function () {
      if (!navigator.geolocation) { status.textContent = 'Location is not supported by your browser.'; return; }
      status.textContent = 'Finding your location…';
      navigator.geolocation.getCurrentPosition(function (p) {
        var me = [p.coords.latitude, p.coords.longitude];
        if (userLayer) map.removeLayer(userLayer);
        userLayer = L.layerGroup([
          L.circleMarker(me, { radius: 9, color: '#A5115C', fillColor: '#FF3EA5', fillOpacity: 0.9 }).bindPopup('You are here'),
          L.polyline([me, pos], { color: '#A5115C', dashArray: '6 8' })
        ]).addTo(map);
        map.fitBounds([me, pos], { padding: [50, 50] });
        status.textContent = 'You are about ' + haversine(me, pos).toFixed(1) + ' km (in a straight line) from the studio.';
      }, function (err) {
        status.textContent = err.code === 1 ? 'Location permission was denied. You can still use the directions button.' : 'We could not work out your location.';
      }, { timeout: 10000 });
    });
  }


  /* ---------- Polish: floating hearts + floating "Book now" button ---------- */
  function initHearts() {
    if (reduceMotion) return;
    var symbols = ['♥', '✦', '♡', '✿', '✧'];
    $$('.page-hero').forEach(function (hero) {
      for (var i = 0; i < 14; i++) {
        var s = h('span', { class: 'float-heart', 'aria-hidden': 'true', text: symbols[i % symbols.length] });
        s.style.left = (Math.random() * 96) + '%';
        s.style.fontSize = (12 + Math.random() * 22) + 'px';
        s.style.animationDuration = (7 + Math.random() * 8) + 's';
        s.style.animationDelay = (-Math.random() * 12) + 's';
        hero.appendChild(s);
      }
    });
  }
  function initFloatBook() {
    if (/enquiry\.html$/.test(window.location.pathname)) return;
    var a = h('a', { class: 'float-book', href: 'enquiry.html', text: 'Book now ♡' });
    document.body.appendChild(a);
    window.addEventListener('scroll', function () {
      var nearBottom = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 320;
      a.classList.toggle('show', window.scrollY > 350 && !nearBottom);
    }, { passive: true });
  }

  /* ---------- 10. Init ---------- */
  function run(fn) { try { fn(); } catch (e) { if (window.console) console.error(fn.name + ' failed:', e); } }
  [initNav, initBackToTop, initYear, initAccordions, initTabs, initTestimonials, initServices,
   initLightbox, initContactForm, initEnquiryForm, initMap, initReveal, initCounters, initHearts, initFloatBook].forEach(run);
})();