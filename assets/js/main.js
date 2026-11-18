(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const hasObserver = 'IntersectionObserver' in window;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    // Run `callback` once for each element the first time it scrolls into view
    const onceVisible = (elements, callback, options = {}) => {
        if (!hasObserver) {
            elements.forEach(callback);
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        elements.forEach((el) => observer.observe(el));
    };

    // Theme: the inline script in <head> already applied the saved or system theme.
    // The toggle saves an explicit choice; with no saved choice the page follows the system.
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const lightQuery = window.matchMedia('(prefers-color-scheme: light)');
    const themeToggles = document.querySelectorAll('[data-theme-toggle]');
    const savedTheme = () => {
        try {
            const value = localStorage.getItem('theme');
            return value === 'light' || value === 'dark' ? value : null;
        } catch {
            return null;
        }
    };
    const syncThemeUI = () => {
        const next = root.dataset.theme === 'light' ? 'dark' : 'light';
        themeToggles.forEach((button) => {
            const label = button.querySelector('.sr-only');
            if (label) label.textContent = `Switch to ${next} theme`;
            button.dataset.cursor = next === 'light' ? 'Light mode' : 'Dark mode';
        });
    };
    const applyTheme = (theme) => {
        root.dataset.theme = theme;
        if (themeMeta) themeMeta.content = theme === 'light' ? '#F3F3EF' : '#0B0B0F';
        syncThemeUI();
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    };
    // the new theme grows out of the button in a circle (where View Transitions are supported)
    const switchTheme = (theme, from) => {
        if (!document.startViewTransition || reduceMotion || !from) {
            applyTheme(theme);
            return;
        }
        const rect = from.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const radius = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));
        document.startViewTransition(() => applyTheme(theme)).ready.then(() => {
            root.animate(
                { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`] },
                { duration: 650, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
            );
        }).catch(() => {});
    };
    syncThemeUI();
    themeToggles.forEach((button) => button.addEventListener('click', () => {
        const theme = root.dataset.theme === 'light' ? 'dark' : 'light';
        try { localStorage.setItem('theme', theme); } catch { /* private mode: still switch for this page */ }
        switchTheme(theme, button);
    }));
    lightQuery.addEventListener('change', (event) => {
        if (!savedTheme()) applyTheme(event.matches ? 'light' : 'dark');
    });

    // Keep "years of experience" and the footer year current
    const careerStart = new Date(2020, 9, 1); // Oct 2020
    const years = Math.floor((Date.now() - careerStart) / (365.25 * 24 * 60 * 60 * 1000));
    document.querySelectorAll('[data-years]').forEach((el) => {
        el.textContent = String(years);
        el.dataset.count = String(years);
    });
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

    // Reveal sections as they scroll into view
    const revealEls = document.querySelectorAll('[data-reveal]');
    if (reduceMotion) {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
        onceVisible(revealEls, (el) => el.classList.add('is-visible'), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }

    // Headings: wrap every word in a mask so the words can slide up one after another
    const splitWords = (heading) => {
        let index = 0;
        const walk = (node) => {
            [...node.childNodes].forEach((child) => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    walk(child);
                    return;
                }
                if (child.nodeType !== Node.TEXT_NODE) return;
                const fragment = document.createDocumentFragment();
                child.textContent.split(/(\s+)/).forEach((part) => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) {
                        fragment.append(' ');
                        return;
                    }
                    const mask = document.createElement('span');
                    const word = document.createElement('span');
                    mask.className = 'w';
                    mask.setAttribute('aria-hidden', 'true');
                    word.textContent = part;
                    word.style.setProperty('--wi', String(index++));
                    mask.append(word);
                    fragment.append(mask);
                });
                child.replaceWith(fragment);
            });
        };
        heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());
        walk(heading);
        heading.classList.add('split');
    };

    // Hero intro: start once fonts are in (or after 1.2s), so nothing jumps mid-animation
    const startIntro = () => {
        root.classList.add('is-loaded');
        document.querySelectorAll('[data-split="intro"]').forEach((el) => el.classList.add('is-in'));
    };
    if (reduceMotion) {
        root.classList.add('is-loaded');
    } else {
        document.querySelectorAll('[data-split]').forEach(splitWords);
        const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
        Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 1200))])
            .then(() => requestAnimationFrame(() => requestAnimationFrame(startIntro)));
        onceVisible(document.querySelectorAll('[data-split]:not([data-split="intro"])'),
            (el) => el.classList.add('is-in'), { rootMargin: '0px 0px -10% 0px' });
    }

    // Stat numbers count up when they come into view
    const counters = document.querySelectorAll('[data-count]');
    const formatCount = (el, value) => String(value).padStart(Number(el.dataset.pad || 0), '0');
    if (!reduceMotion) {
        counters.forEach((el) => { el.textContent = formatCount(el, 0); });
        onceVisible(counters, (el) => {
            const target = Number(el.dataset.count);
            const duration = 1400;
            let start;
            const tick = (now) => {
                start ??= now;
                const t = clamp((now - start) / duration, 0, 1);
                el.textContent = formatCount(el, Math.round(target * (1 - (1 - t) ** 4)));
                if (t < 1) requestAnimationFrame(tick);
            };
            setTimeout(() => requestAnimationFrame(tick), 300);
        }, { threshold: 0.6 });
    }

    // Project stack: a card shrinks and dims as the next one slides over it
    const stackCards = [...document.querySelectorAll('.stack-card')];
    if (!reduceMotion && stackCards.length > 1) {
        let queued = false;
        const update = () => {
            queued = false;
            const sticky = getComputedStyle(stackCards[0]).position === 'sticky';
            // read every position first, then write, to avoid forcing extra layouts
            const progress = stackCards.map((card, i) => {
                const next = stackCards[i + 1];
                if (!sticky || !next) return 0;
                const bottom = card.getBoundingClientRect().top + card.offsetHeight;
                return clamp((bottom - next.getBoundingClientRect().top) / card.offsetHeight, 0, 1);
            });
            stackCards.forEach((card, i) => card.style.setProperty('--p', progress[i].toFixed(3)));
        };
        const queue = () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(update);
        };
        window.addEventListener('scroll', queue, { passive: true });
        window.addEventListener('resize', queue);
        update();
    }

    // Mouse-only extras: spotlight glow on tiles, custom cursor, magnetic buttons
    if (!reduceMotion && finePointer) {
        document.querySelectorAll('.spotlight').forEach((el) => {
            el.addEventListener('pointermove', (event) => {
                const rect = el.getBoundingClientRect();
                el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
                el.style.setProperty('--my', `${event.clientY - rect.top}px`);
            });
        });

        // Hover label: the normal pointer stays, and over a link a lime pill pops in beside it
        // saying what a click will do ("Visit ↗", "Book a call", "Jump ↓"...)
        const cursor = document.createElement('div');
        const blob = document.createElement('div');
        const label = document.createElement('span');
        cursor.className = 'cursor';
        blob.className = 'cursor-blob';
        label.className = 'cursor-label';
        cursor.setAttribute('aria-hidden', 'true');
        blob.append(label);
        cursor.append(blob);
        document.body.append(cursor);

        const labelFor = (el) => {
            if (el.dataset.cursor) return el.dataset.cursor;
            if (el.matches('button')) return el.matches('[data-menu-toggle]') ? 'Menu' : 'Click';
            const href = el.getAttribute('href') || '';
            if (el.hasAttribute('data-cal-link')) return 'Book a call';
            if (href.startsWith('mailto:')) return 'Email';
            if (el.closest('.stack-card')) return 'Visit ↗';
            if (el.target === '_blank') return 'Open ↗';
            if (href === './' || href === './index.html') return 'Home';
            const url = new URL(el.href, location.href);
            if (url.hash === '#top') return 'Top ↑';
            const section = url.pathname === location.pathname && url.hash ? document.getElementById(url.hash.slice(1)) : null;
            if (section) return section.getBoundingClientRect().top > 1 ? 'Jump ↓' : 'Jump ↑';
            return 'View';
        };

        let x = 0;
        let y = 0;
        let blobX = 0;
        let blobY = 0;
        let moving = false;
        let shown = false;
        let current = '';
        const move = () => {
            blobX += (x - blobX) * 0.35;
            blobY += (y - blobY) * 0.35;
            cursor.style.translate = `${blobX}px ${blobY}px`;
            moving = Math.abs(x - blobX) > 0.1 || Math.abs(y - blobY) > 0.1;
            if (moving) requestAnimationFrame(move);
        };
        const setLabel = (text) => {
            if (text === current) return;
            current = text;
            cursor.classList.toggle('has-label', Boolean(text));
            if (!text) return;
            label.textContent = text;
            // size the pill to the label's width, flipping it near the window edges,
            // and pop it in from the corner closest to the pointer
            const width = label.offsetWidth;
            const left = x + 14 + width > window.innerWidth - 8 ? -(width + 14) : 14;
            const top = y + 14 + 34 > window.innerHeight - 8 ? -48 : 14;
            blob.style.setProperty('--w', `${width}px`);
            blob.style.setProperty('--lx', `${left}px`);
            blob.style.setProperty('--ly', `${top}px`);
            blob.style.transformOrigin = `${left < 0 ? 'right' : 'left'} ${top < 0 ? 'bottom' : 'top'}`;
        };

        window.addEventListener('pointermove', (event) => {
            if (event.pointerType !== 'mouse') return;
            x = event.clientX;
            y = event.clientY;
            if (!shown) {
                shown = true;
                blobX = x;
                blobY = y;
                root.classList.add('cursor-visible');
            }
            if (!moving) {
                moving = true;
                requestAnimationFrame(move);
            }
        }, { passive: true });
        let hovered = null;
        document.addEventListener('pointerover', (event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            hovered = target;
            // the label can't follow the pointer into an iframe, so step aside
            root.classList.toggle('cursor-visible', shown && target.tagName !== 'IFRAME');
            const link = target.closest('a[href], button, [data-cursor]');
            setLabel(link ? labelFor(link) : '');
            // dark pill on light or lime surfaces so it stays visible
            cursor.classList.toggle('is-dark', Boolean(target.closest('.bg-accent, .btn-primary, .stack-card')));
        });
        // the toggle's label ("Light mode" / "Dark mode") changes once clicked
        document.addEventListener('themechange', () => {
            const link = hovered?.closest('a[href], button, [data-cursor]');
            setLabel(link ? labelFor(link) : '');
        });
        root.addEventListener('mouseleave', () => {
            shown = false;
            root.classList.remove('cursor-visible');
        });
        window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
        window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

        document.querySelectorAll('.btn-primary, .btn-ghost').forEach((button) => {
            button.classList.add('magnetic');
            button.addEventListener('pointermove', (event) => {
                if (event.pointerType !== 'mouse') return;
                const rect = button.getBoundingClientRect();
                const dx = event.clientX - (rect.left + rect.width / 2);
                const dy = event.clientY - (rect.top + rect.height / 2);
                button.style.translate = `${dx * 0.25}px ${dy * 0.35}px`;
            });
            button.addEventListener('pointerleave', () => { button.style.translate = ''; });
        });
    }

    // Cal.com booking popup: links with [data-cal-link] open the scheduler in a modal.
    // The href stays as a fallback, so the link still works if the embed fails to load.
    if (document.querySelector('[data-cal-link]')) {
        /* eslint-disable */
        (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, 'https://app.cal.com/embed/embed.js', 'init');
        /* eslint-enable */
        Cal('init', 'booking', { origin: 'https://app.cal.com' });
        Cal.ns.booking('ui', {
            theme: root.dataset.theme === 'light' ? 'light' : 'dark',
            cssVarsPerTheme: { dark: { 'cal-brand': '#C8F560' }, light: { 'cal-brand': '#0B0B0F' } },
            hideEventTypeDetails: false,
            layout: 'month_view',
        });
        document.addEventListener('themechange', (event) => Cal.ns.booking('ui', { theme: event.detail.theme }));

        // Build the popup hidden in the background the first time someone hovers, focuses or touches
        // a booking link, so the click opens it instantly instead of loading the scheduler from scratch
        const intentEvents = ['pointerover', 'focusin', 'touchstart'];
        const prerender = (event) => {
            const link = event.target.closest?.('[data-cal-link]');
            if (!link) return;
            intentEvents.forEach((type) => document.removeEventListener(type, prerender));
            Cal.ns.booking('prerender', { calLink: link.dataset.calLink, type: 'modal' });
        };
        intentEvents.forEach((type) => document.addEventListener(type, prerender, { passive: true }));

        // Once the embed is ready it opens the popup itself, so stop the link opening a new tab too
        document.addEventListener('click', (event) => {
            if (event.target.closest?.('a[data-cal-link]') && window.Cal.ns?.booking?.instance) event.preventDefault();
        });

        // Flag the page while the popup is open (the custom cursor can't follow the pointer into its iframe)
        const syncCalOpen = () => root.classList.toggle('cal-open',
            [...document.querySelectorAll('cal-modal-box')].some((box) => box.style.visibility !== 'hidden'));
        const boxObserver = new MutationObserver(syncCalOpen);
        new MutationObserver((mutations) => {
            mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
                if (node.nodeName === 'CAL-MODAL-BOX') boxObserver.observe(node, { attributes: true, attributeFilter: ['style'] });
            }));
            syncCalOpen();
        }).observe(document.body, { childList: true });
    }

    // Mobile menu
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.getElementById('mobile-menu');
    if (toggle && menu) {
        const label = toggle.querySelector('.sr-only');
        const setOpen = (open) => {
            menu.hidden = !open;
            toggle.setAttribute('aria-expanded', String(open));
            if (label) label.textContent = open ? 'Close menu' : 'Open menu';
        };
        toggle.addEventListener('click', () => setOpen(menu.hidden));
        menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !menu.hidden) {
                setOpen(false);
                toggle.focus();
            }
        });
        document.addEventListener('click', (event) => {
            if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
        });
    }
})();
