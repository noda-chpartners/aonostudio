import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type MotionOptions = {
  lenis: Lenis | null;
  duration: number;
};

let started = false;

export function initMotion() {
  if (started) return;
  started = true;

  const header = document.querySelector<HTMLElement>('.header');
  if (!header) return;

  const mm = gsap.matchMedia();
  let lenis: Lenis | null = null;
  const onTick = (time: number) => {
    lenis?.raf(time * 1000);
  };

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    lenis = new Lenis({
      lerp: 0.08,
      autoRaf: false,
      anchors: false,
      allowNestedScroll: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    let alive = true;
    const intro = buildIntro();
    buildReveals();
    const removeUi = bindUi({ lenis, duration: 1 });
    const heroTriggers: ScrollTrigger[] = [];

    intro.eventCallback('onComplete', () => {
      if (!alive) return;
      heroTriggers.push(...buildHeroScrub());
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      alive = false;
      intro.kill();
      heroTriggers.forEach((trigger) => trigger.kill());
      removeUi();
      window.removeEventListener('load', refresh);
      lenis?.destroy();
      lenis = null;
      gsap.ticker.remove(onTick);
    };
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(
      ['.header__nav a', '.hero__clip', '.hero__zoom', '.hero__vertical'],
      { clearProps: 'all' },
    );
    return bindUi({ lenis: null, duration: 0 });
  });

  mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
    let alive = true;
    let timeline: gsap.core.Timeline | null = null;

    const setup = () => {
      if (!alive) return;
      timeline?.scrollTrigger?.kill();
      timeline?.kill();

      const stage = document.querySelector<HTMLElement>('.works__stage');
      const reel = document.querySelector<HTMLElement>('.works__reel');
      const chapters = gsap.utils.toArray<HTMLElement>('.works__reel .chapter');
      if (!stage || !reel || chapters.length === 0) return;

      gsap.set(reel, { y: 0 });

      type Move =
        | { kind: 'x'; track: HTMLElement; dist: number }
        | { kind: 'y'; y: number; gap: number };
      const moves: Move[] = [];
      let total = 0;

      chapters.forEach((chapter, index) => {
        const track = chapter.querySelector<HTMLElement>('.chapter__track');
        const viewport = chapter.querySelector<HTMLElement>('.chapter__viewport');
        if (track) gsap.set(track, { x: 0 });
        const dist = track && viewport ? Math.max(0, track.scrollWidth - viewport.clientWidth) : 0;
        if (track && dist > 1) {
          moves.push({ kind: 'x', track, dist });
          total += dist;
        }
        if (index < chapters.length - 1) {
          const gap = Math.max(1, Math.round(chapter.offsetHeight * 1.8));
          moves.push({ kind: 'y', y: -(index + 1) * chapter.offsetHeight, gap });
          total += gap;
        }
      });

      const next = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          pin: true,
          start: 'top top',
          end: () => '+=' + total,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      moves.forEach((move) => {
        if (move.kind === 'x') {
          next.to(move.track, { x: -move.dist, ease: 'none', duration: move.dist });
          return;
        }
        next.to(reel, { y: move.y, ease: 'none', duration: move.gap });
      });

      timeline = next;
    };

    setup();
    window.addEventListener('load', setup);

    return () => {
      alive = false;
      window.removeEventListener('load', setup);
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
    };
  });

  const onHide = () => mm.revert();
  window.addEventListener('pagehide', onHide);
}

function headerOffset() {
  return document.querySelector<HTMLElement>('.header')?.offsetHeight ?? 72;
}

function buildIntro() {
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  timeline
    .to('.header__nav a', { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06 }, 0)
    .to('.hero__clip', { clipPath: 'inset(0% 0 0 0)', duration: 1.2 }, 0)
    .to('.hero__zoom', { scale: 1, duration: 1.2 }, 0)
    .to('.hero__vertical', { autoAlpha: 1, duration: 0.8 }, 0.3);

  return timeline;
}

function buildHeroScrub() {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero) return [];
  const triggers: ScrollTrigger[] = [];

  const scale = gsap.fromTo(
    '.hero__img',
    { scale: 1 },
    {
      scale: 1.06,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: {
        trigger: hero,
        start: () => 'top top+=' + headerOffset(),
        end: () => '+=' + hero.offsetHeight * 0.4,
        scrub: 0.6,
      },
    },
  );

  if (scale.scrollTrigger) triggers.push(scale.scrollTrigger);
  return triggers;
}

function buildReveals() {
  gsap.from('.chapter__head', {
    clipPath: 'inset(0 0 100% 0)',
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.works',
      start: 'top 80%',
      once: true,
    },
  });

  gsap.from('.profile__photo', {
    y: 48,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.profile',
      start: 'top 80%',
      once: true,
    },
  });

  gsap.from('.profile__copy', {
    y: 24,
    autoAlpha: 0,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.profile__copy',
      start: 'top 85%',
      once: true,
    },
  });

  gsap.from('.timeline li', {
    y: 16,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.timeline',
      start: 'top 90%',
      once: true,
    },
  });

  gsap.from('.contact__line', {
    y: 20,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.contact',
      start: 'top 80%',
      once: true,
    },
  });

  gsap.from('.access__line', {
    y: 20,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.access',
      start: 'top 80%',
      once: true,
    },
  });
}

function bindUi({ lenis, duration }: MotionOptions) {
  const button = document.querySelector<HTMLButtonElement>('.header__menu');
  const panel = document.querySelector<HTMLElement>('.menu');
  const lines = panel ? document.querySelectorAll<HTMLElement>('.header__lines span') : [];
  const links = document.querySelectorAll<HTMLElement>('.menu__list a, .menu__phone');
  const viewer = document.querySelector<HTMLElement>('.viewer');
  const viewerImg = document.querySelector<HTMLImageElement>('.viewer__img');
  const viewerCaption = document.querySelector<HTMLElement>('.viewer__caption');
  const viewerFigure = document.querySelector<HTMLElement>('.viewer__figure');
  const motion = duration === 0 ? 0 : 1;
  let menuOpen = false;
  let viewerOpen = false;
  let viewerItems: HTMLButtonElement[] = [];
  let viewerIndex = 0;
  let lastFocus: HTMLElement | null = null;

  const menuTl =
    button && panel
      ? gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } })
      : null;

  if (menuTl && panel) {
    menuTl
      .fromTo(
        panel,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.6 * motion },
      )
      .fromTo(
        links,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5 * motion, stagger: 0.08 * motion },
        0.15 * motion,
      );
    if (lines.length === 2) {
      menuTl
        .to(lines[0], { rotate: 45, y: 4.5, duration: 0.3 * motion }, 0)
        .to(lines[1], { rotate: -45, y: -4.5, duration: 0.3 * motion }, 0);
    }
  }

  const lock = (locked: boolean) => {
    if (lenis) {
      locked ? lenis.stop() : lenis.start();
      return;
    }
    document.documentElement.style.overflow = locked ? 'hidden' : '';
  };

  const finishClose = () => {
    panel?.classList.remove('is-open');
    panel?.setAttribute('aria-hidden', 'true');
    panel?.setAttribute('inert', '');
    if (!viewerOpen) lock(false);
  };

  const openMenu = () => {
    if (!panel || !button || !menuTl || menuOpen) return;
    menuOpen = true;
    button.setAttribute('aria-expanded', 'true');
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    panel.removeAttribute('inert');
    lock(true);
    menuTl.timeScale(1).play();
  };

  const closeMenu = (after?: () => void) => {
    if (!button || !menuTl || !menuOpen) {
      after?.();
      return;
    }
    menuOpen = false;
    button.setAttribute('aria-expanded', 'false');
    menuTl.timeScale(motion === 0 ? 1 : 1.4).reverse();
    menuTl.eventCallback('onReverseComplete', () => {
      finishClose();
      menuTl.eventCallback('onReverseComplete', null);
      after?.();
    });
  };

  const showViewerImage = (index: number) => {
    const item = viewerItems[index];
    if (!item || !viewerImg || !viewerCaption || !viewerFigure) return;
    viewerIndex = index;
    viewerImg.src = item.dataset.full ?? '';
    viewerImg.alt = item.dataset.caption ?? '';
    viewerCaption.textContent = item.dataset.caption ?? '';
    gsap.fromTo(
      viewerFigure,
      { autoAlpha: 0, scale: 0.98 },
      { autoAlpha: 1, scale: 1, duration: 0.45 * motion, ease: 'power3.out' },
    );
  };

  const openViewer = (item: HTMLButtonElement) => {
    if (!viewer) return;
    const chapter = item.closest('.chapter');
    viewerItems = chapter
      ? [...chapter.querySelectorAll<HTMLButtonElement>('.chapter__open')]
      : [item];
    viewerIndex = Math.max(0, viewerItems.indexOf(item));
    lastFocus = item;
    viewerOpen = true;
    viewer.classList.add('is-open');
    viewer.setAttribute('aria-hidden', 'false');
    lock(true);
    showViewerImage(viewerIndex);
    document.querySelector<HTMLButtonElement>('.viewer__close')?.focus();
  };

  const closeViewer = () => {
    if (!viewer || !viewerOpen) return;
    viewerOpen = false;
    const hide = () => {
      viewer.classList.remove('is-open');
      viewer.setAttribute('aria-hidden', 'true');
      if (!menuOpen) lock(false);
      lastFocus?.focus();
    };
    if (motion === 0) {
      hide();
      return;
    }
    gsap.to(viewer, {
      autoAlpha: 0,
      duration: 0.3,
      onComplete: () => {
        gsap.set(viewer, { clearProps: 'visibility,opacity' });
        hide();
      },
    });
  };

  const stepViewer = (delta: number) => {
    if (!viewerOpen || viewerItems.length === 0) return;
    const next = (viewerIndex + delta + viewerItems.length) % viewerItems.length;
    showViewerImage(next);
  };

  const onMenuButton = () => {
    menuOpen ? closeMenu() : openMenu();
  };

  const onAnchor = (event: Event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector<HTMLElement>(id);
    if (!target) return;
    event.preventDefault();
    const go = () => {
      if (id === '#top') {
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const offset = id === '#works' ? 0 : -headerOffset();
      if (lenis) {
        lenis.scrollTo(target, { offset });
        return;
      }
      const top = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    };
    if (menuOpen) closeMenu(go);
    else go();
  };

  const onWorksClick = (event: Event) => {
    const item = (event.target as Element | null)?.closest<HTMLButtonElement>('.chapter__open');
    if (!item) return;
    openViewer(item);
  };

  const onViewerClick = (event: Event) => {
    const target = event.target as Element | null;
    if (!target) return;
    if (target.closest('.viewer__close') || target.closest('.viewer__backdrop')) closeViewer();
    if (target.closest('.viewer__prev')) stepViewer(-1);
    if (target.closest('.viewer__next')) stepViewer(1);
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (viewerOpen) closeViewer();
      else if (menuOpen) closeMenu();
    }
    if (!viewerOpen) return;
    if (event.key === 'ArrowRight') stepViewer(1);
    if (event.key === 'ArrowLeft') stepViewer(-1);
  };

  const onTrackScroll = (event: Event) => {
    const track = event.currentTarget as HTMLElement;
    if (track.scrollLeft < 8) return;
    track.closest('.chapter')?.querySelector('.chapter__hint')?.classList.add('is-hidden');
    track.removeEventListener('scroll', onTrackScroll);
  };

  button?.addEventListener('click', onMenuButton);
  document.addEventListener('click', onAnchor);
  document.querySelector('#works')?.addEventListener('click', onWorksClick);
  viewer?.addEventListener('click', onViewerClick);
  document.addEventListener('keydown', onKey);
  document.querySelectorAll<HTMLElement>('.chapter__track').forEach((track) => {
    track.addEventListener('scroll', onTrackScroll);
  });

  return () => {
    button?.removeEventListener('click', onMenuButton);
    document.removeEventListener('click', onAnchor);
    document.querySelector('#works')?.removeEventListener('click', onWorksClick);
    viewer?.removeEventListener('click', onViewerClick);
    document.removeEventListener('keydown', onKey);
    document.querySelectorAll<HTMLElement>('.chapter__track').forEach((track) => {
      track.removeEventListener('scroll', onTrackScroll);
    });
    menuTl?.kill();
    if (menuOpen) finishClose();
    if (viewerOpen) closeViewer();
  };
}
