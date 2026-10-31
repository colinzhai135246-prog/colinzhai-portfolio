(() => {
  'use strict';

  document.documentElement.classList.add('js');

  function initialize() {
    const body = document.body;
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const navigation = document.getElementById('site-navigation');
    const mobileQuery = window.matchMedia('(max-width: 760px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const siteHeader = document.querySelector('[data-site-header]');

    function setMenuOpen(open) {
      if (!menuToggle || !navigation) return;
      const isOpen = Boolean(open && mobileQuery.matches);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      if (body) body.classList.toggle('menu-open', isOpen);
    }

    if (menuToggle && navigation) {
      menuToggle.addEventListener('click', () => {
        setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
      });

      navigation.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('a')) {
          setMenuOpen(false);
        }
      });

      document.addEventListener('click', (event) => {
        if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
          setMenuOpen(false);
        }
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
          setMenuOpen(false);
          menuToggle.focus({ preventScroll: true });
        }
      });

      setMenuOpen(false);
    }

    // 导航状态与页眉外观共用同一轮滚动更新。
    const navigationItems = navigation
      ? Array.from(navigation.querySelectorAll('a[href]'))
        .filter((link) => ['#home', '#about', '#projects', '#help', '#email-copy'].includes(link.getAttribute('href')))
        .map((link) => ({
          link,
          section: document.getElementById(link.getAttribute('href') === '#email-copy'
            ? 'contact' : link.getAttribute('href').slice(1))
        }))
        .filter((item) => item.section)
      : [];
    let navigationFrame = 0;

    function updateNavigation() {
      navigationFrame = 0;
      const scrollTop = Math.max(0, window.scrollY);

      if (siteHeader) siteHeader.classList.toggle('is-scrolled', scrollTop > 32);

      if (!navigationItems.length) return;
      const readingLine = Math.min(window.innerHeight * 0.3, 200);
      let current = navigationItems[0];

      navigationItems.forEach((item) => {
        if (item.section.getBoundingClientRect().top <= readingLine) current = item;
      });

      // 短页脚无法滚到阅读线；到达页底时仍应正确选中联系入口。
      const lastItem = navigationItems[navigationItems.length - 1];
      const atPageEnd = scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (atPageEnd && lastItem.section.getBoundingClientRect().top < window.innerHeight) {
        current = lastItem;
      }

      navigationItems.forEach((item) => {
        const isCurrent = item === current;
        item.link.classList.toggle('is-current', isCurrent);
        if (isCurrent) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      });
    }

    function scheduleNavigationUpdate() {
      if (!navigationFrame) {
        navigationFrame = window.requestAnimationFrame(updateNavigation);
      }
    }

    window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
    window.addEventListener('resize', () => {
      if (!mobileQuery.matches) setMenuOpen(false);
      scheduleNavigationUpdate();
    }, { passive: true });
    window.addEventListener('hashchange', scheduleNavigationUpdate);
    window.addEventListener('load', scheduleNavigationUpdate, { once: true });
    scheduleNavigationUpdate();

    const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
    let revealObserver = null;

    function showAllReveals() {
      if (revealObserver) revealObserver.disconnect();
      document.documentElement.classList.remove('has-reveal');
      revealElements.forEach((element) => element.classList.add('is-visible'));
    }

    if (revealElements.length && !reducedMotionQuery.matches && 'IntersectionObserver' in window) {
      try {
        revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          });
        }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
        revealElements.forEach((element) => revealObserver.observe(element));
        document.documentElement.classList.add('has-reveal');
      } catch (error) {
        showAllReveals();
      }
    } else {
      showAllReveals();
    }

    const handleMotionPreference = (event) => {
      if (event.matches) {
        showAllReveals();
        clearGlassLight();
      }
    };
    if (typeof reducedMotionQuery.addEventListener === 'function') {
      reducedMotionQuery.addEventListener('change', handleMotionPreference);
    } else if (typeof reducedMotionQuery.addListener === 'function') {
      reducedMotionQuery.addListener(handleMotionPreference);
    }

    function copyWithSelection(text) {
      const field = document.createElement('textarea');
      const previouslyFocused = document.activeElement;
      field.value = text;
      field.setAttribute('readonly', '');
      field.setAttribute('aria-label', 'Email address to copy');
      field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;';
      document.body.appendChild(field);
      let copied = false;
      try {
        field.focus({ preventScroll: true });
        field.select();
        field.setSelectionRange(0, text.length);
        copied = typeof document.execCommand === 'function' && document.execCommand('copy');
      } catch (error) {
        copied = false;
      } finally {
        field.remove();
        if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
          previouslyFocused.focus({ preventScroll: true });
        }
      }
      return copied;
    }

    document.querySelectorAll('[data-copy-email]').forEach((button) => {
      const label = button.querySelector('[data-copy-label]');
      const status = document.querySelector('[data-copy-status]');
      const originalLabel = label ? label.textContent : '';
      const email = button.getAttribute('data-email');
      let pending = false;
      let resetTimer = 0;
      if (!email) return;

      button.addEventListener('click', async () => {
        if (pending) return;
        pending = true;
        window.clearTimeout(resetTimer);
        button.setAttribute('aria-busy', 'true');
        if (status) status.textContent = '';
        let copied = false;

        try {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(email);
            copied = true;
          }
        } catch (error) {
          // 本地文件或浏览器权限限制时，尝试真实的选区复制。
        }
        if (!copied) copied = copyWithSelection(email);

        if (label) label.textContent = copied ? 'Copied!' : originalLabel;
        if (status) {
          status.textContent = copied ? 'Email address copied.' : `Please copy this email address: ${email}`;
        }
        button.removeAttribute('aria-busy');
        pending = false;
        if (copied && label) {
          resetTimer = window.setTimeout(() => {
            label.textContent = originalLabel;
          }, 2400);
        }
      });
    });

    const cover = document.querySelector('.cover');
    const glassWords = Array.from(document.querySelectorAll('.cover-word'));
    let glassFrame = 0;
    let glassPointer = null;

    function clearGlassLight() {
      glassPointer = null;
      if (glassFrame) window.cancelAnimationFrame(glassFrame);
      glassFrame = 0;
      glassWords.forEach((word) => {
        word.style.removeProperty('--glass-light');
        word.style.removeProperty('--glass-x');
        word.style.removeProperty('--glass-y');
      });
    }

    function updateGlassLight() {
      glassFrame = 0;
      if (!glassPointer) return;
      const positions = glassWords.map((word) => ({ word, rect: word.getBoundingClientRect() }));
      positions.forEach(({ word, rect }) => {
        const x = glassPointer.x - rect.left;
        const y = glassPointer.y - rect.top;
        const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
        word.style.setProperty('--glass-light', inside ? '1' : '0');
        if (inside) {
          word.style.setProperty('--glass-x', `${x}px`);
          word.style.setProperty('--glass-y', `${y}px`);
        }
      });
    }

    if (cover && glassWords.length) {
      // 监听整个封面，让照片前景挡住文字时也能正确读取鼠标位置。
      cover.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') {
          clearGlassLight();
          return;
        }
        glassPointer = { x: event.clientX, y: event.clientY };
        if (!glassFrame) glassFrame = window.requestAnimationFrame(updateGlassLight);
      }, { passive: true });
      cover.addEventListener('pointerleave', clearGlassLight);
      cover.addEventListener('pointercancel', clearGlassLight);
      window.addEventListener('scroll', clearGlassLight, { passive: true });
      window.addEventListener('resize', clearGlassLight, { passive: true });
      window.addEventListener('blur', clearGlassLight);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearGlassLight();
      });
    }

    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const interestCards = Array.from(document.querySelectorAll('[data-interest-card]'));

    function setInterestOpen(card, open) {
      const toggle = card.querySelector('[data-interest-toggle]');
      const description = card.querySelector('.interest-description');
      if (!toggle || !description) return;
      card.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      description.setAttribute('aria-hidden', String(!open));
    }

    function openInterest(card) {
      interestCards.forEach((item) => setInterestOpen(item, item === card));
    }

    interestCards.forEach((card) => {
      const toggle = card.querySelector('[data-interest-toggle]');
      if (!toggle) return;
      setInterestOpen(card, false);

      card.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'mouse' && hoverQuery.matches) openInterest(card);
      });
      card.addEventListener('pointerleave', (event) => {
        if (event.pointerType === 'mouse' && !toggle.matches(':focus-visible')) {
          setInterestOpen(card, false);
        }
      });
      toggle.addEventListener('focus', () => {
        if (toggle.matches(':focus-visible')) openInterest(card);
      });
      toggle.addEventListener('blur', () => setInterestOpen(card, false));
      toggle.addEventListener('click', (event) => {
        // 鼠标悬停即展开；触屏和键盘也可通过按钮切换。
        if (hoverQuery.matches && event.detail > 0 && event.pointerType !== 'touch') {
          openInterest(card);
        } else if (toggle.getAttribute('aria-expanded') === 'true') {
          setInterestOpen(card, false);
        } else {
          openInterest(card);
        }
      });
      toggle.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setInterestOpen(card, false);
        }
      });
    });

    document.addEventListener('pointerdown', (event) => {
      interestCards.forEach((card) => {
        if (!card.contains(event.target)) setInterestOpen(card, false);
      });
    });

    const dialog = document.getElementById('gallery-dialog');
    const galleryImage = document.getElementById('gallery-image');
    const galleryCaption = document.getElementById('gallery-caption');
    const galleryCounter = document.getElementById('gallery-counter');

    // 图片地址与说明直接读取页面，避免重复维护资源清单。
    const photos = Array.from(document.querySelectorAll('a[data-photo]'))
      .map((link) => {
        const thumbnail = link.querySelector('img');
        if (!thumbnail || !link.getAttribute('href')) return null;
        const figure = link.closest('figure');
        const caption = figure && figure.querySelector('figcaption');
        return {
          link,
          source: link.href,
          alt: thumbnail.getAttribute('alt') || '',
          caption: link.getAttribute('data-caption')
            || (caption && caption.textContent.trim())
            || thumbnail.getAttribute('alt')
            || ''
        };
      })
      .filter(Boolean);
    let photoIndex = 0;
    let galleryTrigger = null;
    let galleryTouch = null;

    function showPhoto(index) {
      if (!galleryImage || !photos.length) return;
      photoIndex = (index + photos.length) % photos.length;
      const photo = photos[photoIndex];
      galleryImage.src = photo.source;
      galleryImage.alt = photo.alt;
      if (galleryCaption) galleryCaption.textContent = photo.caption;
      if (galleryCounter) galleryCounter.textContent = `${photoIndex + 1} / ${photos.length}`;
    }

    function finishClosingGallery() {
      galleryTouch = null;
      if (body) body.classList.remove('gallery-open');
      const trigger = galleryTrigger;
      galleryTrigger = null;
      if (trigger && trigger.isConnected && typeof trigger.focus === 'function') {
        trigger.focus({ preventScroll: true });
      }
    }

    function closeGallery() {
      if (!dialog) return;
      if (dialog.open && typeof dialog.close === 'function') dialog.close();
      else finishClosingGallery();
    }

    function openGallery(index, trigger) {
      // 不支持原生对话框时，让链接正常打开原图。
      if (!dialog || !galleryImage || !photos.length || typeof dialog.showModal !== 'function') {
        return false;
      }

      showPhoto(index);
      try {
        if (!dialog.open) dialog.showModal();
      } catch (error) {
        return false;
      }

      galleryTrigger = trigger;
      setMenuOpen(false);
      if (body) body.classList.add('gallery-open');
      return true;
    }

    function isPlainClick(event) {
      return !event.defaultPrevented && event.button === 0
        && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    }

    photos.forEach((photo, index) => {
      photo.link.addEventListener('click', (event) => {
        if (isPlainClick(event) && openGallery(index, photo.link)) event.preventDefault();
      });
    });

    document.querySelectorAll('a[data-open-gallery]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (isPlainClick(event) && openGallery(0, link)) event.preventDefault();
      });
    });

    if (dialog) {
      // 保留上下滚动和双指缩放，只将明确的单指横滑用于切换照片。
      if (galleryImage) {
        galleryImage.addEventListener('pointerdown', (event) => {
          galleryTouch = dialog.open && event.pointerType === 'touch' && event.isPrimary
            ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null;
        }, { passive: true });
        galleryImage.addEventListener('pointerup', (event) => {
          const start = galleryTouch;
          galleryTouch = null;
          if (!start || start.id !== event.pointerId || !dialog.open) return;
          const horizontal = event.clientX - start.x;
          const vertical = event.clientY - start.y;
          if (Math.abs(horizontal) >= 48 && Math.abs(horizontal) > Math.abs(vertical) * 1.5) {
            showPhoto(photoIndex + (horizontal < 0 ? 1 : -1));
          }
        }, { passive: true });
        galleryImage.addEventListener('pointercancel', () => { galleryTouch = null; }, { passive: true });
      }

      dialog.querySelectorAll('[data-gallery-close]').forEach((button) => {
        button.addEventListener('click', closeGallery);
      });
      dialog.querySelectorAll('[data-gallery-prev]').forEach((button) => {
        button.addEventListener('click', () => showPhoto(photoIndex - 1));
      });
      dialog.querySelectorAll('[data-gallery-next]').forEach((button) => {
        button.addEventListener('click', () => showPhoto(photoIndex + 1));
      });

      dialog.addEventListener('keydown', (event) => {
        if (!dialog.open) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          showPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
        }
      });
      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeGallery();
      });
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeGallery();
      });
      dialog.addEventListener('close', finishClosingGallery);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
