/* ==========================================================================
   Dr. Geetesh Baijal — Portfolio
   ========================================================================== */

const header = document.querySelector('#header');
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('#navbar');
const navLinks = [...document.querySelectorAll('#navbar a')];
const progressBar = document.querySelector('#scroll-progress');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----- Mobile menu ----- */
const closeMenu = () => {
    navbar.classList.remove('active');
    menuIcon.setAttribute('aria-expanded', 'false');
    menuIcon.firstElementChild.className = 'bx bx-menu';
};

menuIcon.addEventListener('click', () => {
    const open = navbar.classList.toggle('active');
    menuIcon.setAttribute('aria-expanded', String(open));
    menuIcon.firstElementChild.className = open ? 'bx bx-x' : 'bx bx-menu';
});

navLinks.forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) closeMenu();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
});

/* ----- Header state + scroll progress ----- */
const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(pct, 100)}%`;
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ----- Scroll spy -----
   Tracks which section occupies the middle of the viewport. */
const sections = [...document.querySelectorAll('section[id]')];

const spy = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navLinks.forEach(link =>
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
            );
        });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
);

sections.forEach(section => spy.observe(section));

/* ----- Reveal on scroll (staggered per group) ----- */
const revealItems = [...document.querySelectorAll('.reveal')];

if (reduceMotion) {
    revealItems.forEach(el => el.classList.add('in-view'));
} else {
    const revealer = new IntersectionObserver(
        (entries, observer) => {
            // Stagger everything that comes into view together.
            entries
                .filter(entry => entry.isIntersecting)
                .forEach((entry, i) => {
                    entry.target.style.transitionDelay = `${Math.min(i * 80, 400)}ms`;
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );

    revealItems.forEach(el => revealer.observe(el));
}

/* ----- Cursor spotlight on cards -----
   Feeds the pointer position to the --mx / --my custom properties that the
   card's ::after radial gradient is centred on. Writes are batched into one
   animation frame so a fast pointer can't force a style recalc per event. */
if (window.matchMedia('(hover: hover)').matches) {
    let pending = null;

    const track = e => {
        const card = e.currentTarget;
        pending = () => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
            card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        };
        requestAnimationFrame(() => {
            if (pending) {
                pending();
                pending = null;
            }
        });
    };

    document.querySelectorAll('.card, .stat').forEach(card => {
        card.addEventListener('pointermove', track);
    });
}

/* ----- Count-up for the stat tiles ----- */
const statCounter = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);

            const target = Number(entry.target.textContent);
            if (Number.isNaN(target) || reduceMotion) return;

            const duration = 900;
            const start = performance.now();

            const tick = now => {
                const p = Math.min((now - start) / duration, 1);
                // ease-out so it settles rather than stopping dead
                entry.target.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
                if (p < 1) requestAnimationFrame(tick);
            };

            entry.target.textContent = '0';
            requestAnimationFrame(tick);
        });
    },
    { threshold: 0.6 }
);

document.querySelectorAll('.stat strong').forEach(el => statCounter.observe(el));

/* ----- Footer year ----- */
const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
