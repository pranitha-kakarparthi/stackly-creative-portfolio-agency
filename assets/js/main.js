/**
 * STACKLY CREATIVE AGENCY - MAIN JAVASCRIPT
 * Handles Loader, Sticky Nav, Mobile Menu, Filter Tabs, Accordion, Back-to-Top,
 * Time-based Greetings, Intersection Animations, and Redirections.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. PAGE LOADER (Removes as soon as DOM is ready, max 2000ms safety timeout)
  const loader = document.getElementById('page-loader');
  if (loader) {
    const hideLoader = () => {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    };

    // Fast reveal or safety timeout
    setTimeout(hideLoader, 250);
    setTimeout(hideLoader, 2000);
  }

  // 2. STICKY NAVBAR BEHAVIOR
  const siteHeader = document.querySelector('.site-header');
  const handleScrollHeader = () => {
    if (!siteHeader) return;
    if (window.scrollY > 30) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScrollHeader, { passive: true });
  handleScrollHeader();

  // 3. HIGHLIGHT CURRENT ACTIVE NAV ITEM
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-link, .mobile-nav-link, .mobile-sub-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
      link.classList.add('active');
      // If inside desktop dropdown or mobile submenu, highlight parent too
      const parentDropdown = link.closest('.nav-item');
      if (parentDropdown) {
        const parentLink = parentDropdown.querySelector('.nav-link');
        if (parentLink) parentLink.classList.add('active');
      }
    }
  });

  // 4. MOBILE HAMBURGER MENU & DRAWER
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');

  if (hamburgerBtn && mobileDrawer) {
    const toggleMenu = () => {
      const isOpen = hamburgerBtn.classList.toggle('active');
      mobileDrawer.classList.toggle('active', isOpen);
      document.body.classList.toggle('scroll-locked', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };

    hamburgerBtn.addEventListener('click', toggleMenu);

    // Close mobile menu on clicking any navigation link (unless it's a dropdown toggle)
    mobileDrawer.querySelectorAll('a:not(.mobile-dropdown-toggle)').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        mobileDrawer.classList.remove('active');
        document.body.classList.remove('scroll-locked');
      });
    });

    // Mobile dropdown toggle
    const mobileDropdownToggles = mobileDrawer.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const submenu = toggle.nextElementSibling;
        if (submenu && submenu.classList.contains('mobile-submenu')) {
          submenu.classList.toggle('open');
          const icon = toggle.querySelector('.dropdown-icon');
          if (icon) {
            icon.style.transform = submenu.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
          }
        }
      });
    });
  }

  // 5. BACK TO TOP BUTTON WITH ANIMATION
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 6. PORTFOLIO FILTER TABS
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item-wrap');

  if (filterBtns.length > 0 && portfolioItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');
        portfolioItems.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 50);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(15px)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // 7. ACCORDION FUNCTIONALITY
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isActive = item.classList.contains('active');

      // Close all in this accordion container
      const parentAccordion = item.closest('.accordion');
      if (parentAccordion) {
        parentAccordion.querySelectorAll('.accordion-item').forEach(el => {
          el.classList.remove('active');
        });
      }

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 8. INTERSECTION OBSERVER ANIMATIONS ([data-animate])
  const animateElements = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window && animateElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    animateElements.forEach(el => observer.observe(el));
  } else {
    animateElements.forEach(el => el.classList.add('is-visible'));
  }

  // 9. ANIMATED NUMBER COUNTERS
  const counterElements = document.querySelectorAll('.counter-val');
  if (counterElements.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target') || '0', 10);
          const suffix = el.getAttribute('data-suffix') || '';
          let count = 0;
          const speed = Math.max(10, Math.floor(target / 45));
          const timer = setInterval(() => {
            count += speed;
            if (count >= target) {
              el.textContent = target + suffix;
              clearInterval(timer);
            } else {
              el.textContent = count + suffix;
            }
          }, 30);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counterElements.forEach(el => counterObserver.observe(el));
  }

  // 10. TIME-OF-DAY GREETING HELPER (EXPORTED GLOBALLY)
  window.getDynamicGreeting = function() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Welcome';
  };
});

