/* Lovewater · applica al sito i contenuti salvati dal pannello di gestione */
(function () {
  var KEY = 'lw-cms', API = '/api/content';
  var applied = '', ORIG = new WeakMap();

  function digits(s) { return String(s || '').replace(/[^\d+]/g, ''); }
  function intl(s) { var d = digits(s); if (!d) return ''; if (d[0] !== '+') d = '+39' + d.replace(/^0039/, ''); return d; }
  function setLastText(a, txt) {
    var n = a.lastChild;
    while (n && n.nodeType !== 3) n = n.previousSibling;
    if (n) n.nodeValue = txt; else a.appendChild(document.createTextNode(txt));
  }
  function setImg(img, url) {
    if (!img || !url) return;
    var pic = img.parentNode;
    if (pic && pic.tagName === 'PICTURE') pic.querySelectorAll('source').forEach(function (s) { s.remove(); });
    img.removeAttribute('srcset'); img.src = url;
  }
  function prodLinks(id) {
    return document.querySelectorAll('a[href="prodotti-' + id + '.html"], a[href="prodotto.html?id=' + id + '"]');
  }
  function prodName(a, name) {
    var b = a.querySelector('b'); if (b) b.textContent = name; else setLastText(a, name);
  }

  function apply(c) {
    if (!c) return;
    var sig = JSON.stringify(c); if (sig === applied) return; applied = sig;

    // testi e foto
    var t = c.texts || {}, im = c.imgs || {};
    document.querySelectorAll('[data-k]').forEach(function (el) {
      if (!ORIG.has(el)) ORIG.set(el, el.innerHTML);
      var v = t[el.getAttribute('data-k')]; el.innerHTML = v != null ? v : ORIG.get(el);
    });
    document.querySelectorAll('[data-kl]').forEach(function (el) {
      if (!ORIG.has(el)) ORIG.set(el, el.innerHTML);
      var v = t[el.getAttribute('data-kl')];
      if (v == null) { el.innerHTML = ORIG.get(el); return; }
      var ls = String(v).split('\n').filter(function (x) { return x.trim(); });
      el.innerHTML = '';
      ls.forEach(function (l, i) {
        var a = document.createElement('span'), b = document.createElement('span'); a.className = 'ln';
        if (i === ls.length - 1 && ls.length > 1) { var e = document.createElement('em'); e.textContent = l; b.appendChild(e); } else b.textContent = l;
        a.appendChild(b); el.appendChild(a);
      });
    });
    document.querySelectorAll('[data-ki]').forEach(function (el) {
      if (!ORIG.has(el)) ORIG.set(el, el.getAttribute('src'));
      var v = im[el.getAttribute('data-ki')]; if (v) setImg(el, v); else if (el.getAttribute('src') !== ORIG.get(el)) setImg(el, ORIG.get(el));
    });

    // prodotti
    var P = c.products || {}, items = P.items || {}, extra = P.extra || [];
    var here = (location.pathname.split('/').pop() || 'index.html');
    Object.keys(items).forEach(function (id) {
      var it = items[id];
      prodLinks(id).forEach(function (a) {
        if (it.name) prodName(a, it.name);
        var sm = a.querySelector('small'); if (sm && it.card) sm.textContent = it.card;
        if (it.img) setImg(a.querySelector('img'), it.img);
        var box = a.closest('li') || a; box.style.display = it.hidden ? 'none' : '';
      });
      if (here === 'prodotti-' + id + '.html') {
        if (it.hidden) { location.replace('prodotti.html'); return; }
        if (it.img) setImg(document.querySelector('header.ph img.ph-bg'), it.img);
      }
    });
    // nuove schede: aggiunte negli elenchi completi (menu, elenchi prodotti)
    if (extra.length) {
      var conts = new Set();
      document.querySelectorAll('a[href^="prodotti-"]').forEach(function (a) { if (/^prodotti-.+\.html$/.test(a.getAttribute('href'))) conts.add(a.parentNode); });
      conts.forEach(function (box) {
        var links = Array.prototype.filter.call(box.children, function (a) { return a.tagName === 'A' && /^prodott/.test(a.getAttribute('href') || ''); });
        if (links.length < 6) return;
        box.querySelectorAll('[data-new]').forEach(function (n) { n.remove(); });
        extra.forEach(function (p) {
          var a = links[0].cloneNode(true);
          a.setAttribute('href', 'prodotto.html?id=' + p.id); a.setAttribute('data-new', '1');
          a.removeAttribute('data-img'); prodName(a, p.name || 'Nuovo prodotto');
          var sm = a.querySelector('small'); if (sm) sm.textContent = p.card || '';
          if (p.img) setImg(a.querySelector('img'), p.img);
          a.style.display = p.hidden ? 'none' : '';
          box.appendChild(a);
        });
      });
    }
    // ordine
    if (P.order && P.order.length) {
      var rank = {}; P.order.forEach(function (id, i) { rank[id] = i; });
      var seen = new Set();
      document.querySelectorAll('a[href^="prodott"]').forEach(function (a) {
        var box = a.parentNode; if (seen.has(box)) return; seen.add(box);
        var ls = Array.prototype.filter.call(box.children, function (x) { return x.tagName === 'A' && pid(x) != null; });
        if (ls.length < 2) return;
        ls.sort(function (x, y) { return (rank[pid(x)] ?? 99) - (rank[pid(y)] ?? 99); }).forEach(function (x) { box.appendChild(x); });
      });
    }
    // pagina generica di un nuovo prodotto
    if (document.body.getAttribute('data-generic')) {
      var id = new URLSearchParams(location.search).get('id');
      var p = extra.filter(function (x) { return x.id === id; })[0];
      if (!p || p.hidden) { location.replace('prodotti.html'); return; }
      var map = { name: p.name, title: p.title || p.name, intro: p.intro || p.card, s0e: p.s0e, s0t: p.s0t, s0p: p.s0p, s1e: p.s1e, s1t: p.s1t, s1p: p.s1p, ctaTitle: p.ctaTitle };
      document.querySelectorAll('[data-p]').forEach(function (el) {
        var k = el.getAttribute('data-p');
        if (k === 'img') { if (p.img) setImg(el, p.img); return; }
        if (k === 'cta') { el.setAttribute('href', 'contatti.html?tema=' + encodeURIComponent(p.name || '')); if (el.closest('.ph, .cta')) setLastText(el, 'Richiedi informazioni '); return; }
        if (map[k] != null && map[k] !== '') el.textContent = map[k];
        else if (/^s\d/.test(k)) el.style.display = 'none';
      });
      document.title = (p.name || 'Prodotto') + ' — We Love Water';
    }

    // FAQ
    if (c.faq && c.faq.length) {
      var mk = function (f) {
        var d = document.createElement('details');
        d.innerHTML = '<summary></summary><p></p>';
        d.querySelector('summary').textContent = f.q;
        d.querySelector('summary').insertAdjacentHTML('beforeend', '<svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg>');
        d.querySelector('p').innerHTML = f.a; return d;
      };
      document.querySelectorAll('.faq-group').forEach(function (g) {
        var box = g.querySelector('.faq'), list = c.faq.filter(function (f) { return f.g === g.id; });
        box.innerHTML = ''; list.forEach(function (f) { box.appendChild(mk(f)); });
        g.style.display = list.length ? '' : 'none';
        var nav = document.querySelector('.faq-nav a[href="#' + g.id + '"]'); if (nav) nav.style.display = list.length ? '' : 'none';
      });
      document.querySelectorAll('.faq-sec .faq').forEach(function (box) {
        box.innerHTML = ''; c.faq.filter(function (f) { return f.home !== false; }).slice(0, 6).forEach(function (f) { box.appendChild(mk(f)); });
      });
    }

    // contatti
    var k = c.contatti || {};
    if (k.tel) document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.href = 'tel:' + intl(k.tel); if (/\d{3}/.test(a.textContent)) setLastText(a, k.tel);
    });
    if (k.wa) document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
      var q = a.href.split('?')[1]; a.href = 'https://wa.me/' + intl(k.wa).replace('+', '') + (q ? '?' + q : '');
      if (/\d{3}/.test(a.textContent)) setLastText(a, k.wa);
    });
    if (k.email) document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      a.href = 'mailto:' + k.email; if (a.textContent.indexOf('@') > -1) setLastText(a, k.email);
    });
    if (k.indirizzo) document.querySelectorAll('a[href*="google.com/maps"]').forEach(function (a) {
      a.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(k.indirizzo);
      if (/\d/.test(a.textContent)) setLastText(a, k.indirizzo);
    });
    if (k.orari) document.querySelectorAll('.hours p').forEach(function (p) {
      p.textContent = ''; k.orari.split('\n').forEach(function (r, i) { if (i) p.appendChild(document.createElement('br')); p.appendChild(document.createTextNode(r)); });
    });
    var bar = document.getElementById('cms-alert');
    if (k.avvisoOn && k.avviso) {
      if (!bar) {
        bar = document.createElement('div'); bar.id = 'cms-alert';
        bar.setAttribute('role', 'status');
        bar.style.cssText = 'position:relative;z-index:60;background:linear-gradient(90deg,#007cff,#3fc1ff);color:#fff;text-align:center;font:600 14px/1.4 "DM Sans",sans-serif;padding:10px 16px';
        document.body.insertBefore(bar, document.body.firstChild);
      }
      bar.textContent = k.avviso;
    } else if (bar) bar.remove();

    // social
    var s = c.social || {}, brand = document.querySelector('.foot-brand');
    if (brand) {
      var old = brand.querySelector('.social'); if (old) old.remove();
      var names = { fb: 'Facebook', ig: 'Instagram', li: 'LinkedIn' }, html = '';
      ['fb', 'ig', 'li'].forEach(function (n) {
        if (s[n]) html += '<a href="' + encodeURI(s[n]) + '" target="_blank" rel="noopener" aria-label="' + names[n] + '"><svg class="ico" aria-hidden="true"><use href="#i-' + n + '"/></svg></a>';
      });
      if (html) brand.insertAdjacentHTML('beforeend', '<div class="social">' + html + '</div>');
    }
  }
  function pid(a) {
    var h = a.getAttribute('href') || '', m = h.match(/^prodotti-(.+)\.html$/) || h.match(/^prodotto\.html\?id=(.+)$/);
    return m ? m[1] : null;
  }

  // 1) subito dalla copia locale, 2) poi la versione aggiornata dal server
  try { var cached = sessionStorage.getItem(KEY); if (cached) apply(JSON.parse(cached)); } catch (e) {}
  if (location.protocol.indexOf('http') === 0) {
    fetch(API, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
      if (!c) return;
      try { sessionStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
      apply(c);
    }).catch(function () {});
  }
  window.LWCMS = { apply: apply };
})();
