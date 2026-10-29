/**
 * STACKLY CREATIVE AGENCY - DASHBOARD CONTROLLER
 * Handles:
 * - Session verification (redirects to sign-in.html if unauthenticated)
 * - User display name derived from email (e.g., alex.smith@agency.com -> Alex Smith)
 * - Timezone-aware greeting (Good Morning / Afternoon / Evening)
 * - Displaying Current User Name, Current User Role, Login Status, Last login timestamp, Logged in timestamp
 * - Desktop sidebar collapse/expand toggle with tooltips
 * - Mobile full-screen sidebar toggle with background scroll lock
 * - Role-tailored views and statistics (Admin, Manager, Creative Director, Client)
 * - Sidebar tab view switching (Overview, Analytics, Projects, Team, Services, Settings)
 * - Sign Out button clearing session and redirecting to sign-in.html
 * - Redirection of all action buttons to 404.html
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. SESSION VERIFICATION
  const sessionUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!sessionUser || !sessionUser.email) {
    window.location.href = 'sign-in.html';
    return;
  }

  // 2. USER GREETING & TIMESTAMP GENERATION
  const formatNameFromEmail = (email) => {
    if (!email || !email.includes('@')) return 'Creative Explorer';
    const userPart = email.split('@')[0];
    const cleaned = userPart.replace(/[._\-+]/g, ' ').trim();
    if (!cleaned) return 'Creative Explorer';
    return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const displayName = sessionUser.name || formatNameFromEmail(sessionUser.email);
  const userRole = sessionUser.role || localStorage.getItem('role') || 'Creative Director';
  const loginStatus = sessionUser.loginStatus || 'Active Session';
  const loggedInTimestamp = sessionUser.loggedInAt || new Date().toLocaleString();
  const lastLoginTimestamp = sessionUser.lastLogin || loggedInTimestamp;

  // Time-of-day greeting
  const hour = new Date().getHours();
  let timeGreeting = 'Welcome';
  if (hour >= 5 && hour < 12) timeGreeting = 'Good Morning';
  else if (hour >= 12 && hour < 17) timeGreeting = 'Good Afternoon';
  else if (hour >= 17 && hour < 22) timeGreeting = 'Good Evening';

  // Inject user details in topbar & cards
  const userGreetingEl = document.getElementById('dash-user-greeting');
  if (userGreetingEl) {
    userGreetingEl.innerHTML = `${timeGreeting}, <span class="text-canyon">${displayName}</span>`;
  }

  const userMetaEl = document.getElementById('dash-time-meta');
  if (userMetaEl) {
    const timeZoneStr = Intl.DateTimeFormat().resolvedOptions().timeZone;
    userMetaEl.textContent = `${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} • ${timeZoneStr}`;
  }

  // Update Sidebar user card
  const sidebarUserName = document.getElementById('sidebar-user-name');
  const sidebarUserRole = document.getElementById('sidebar-user-role');
  const sidebarAvatar = document.getElementById('sidebar-user-avatar');
  const topbarRoleBadge = document.getElementById('topbar-role-badge');

  if (sidebarUserName) sidebarUserName.textContent = displayName;
  if (sidebarUserRole) sidebarUserRole.textContent = userRole;
  if (topbarRoleBadge) topbarRoleBadge.textContent = userRole;

  if (sidebarAvatar) {
    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
    sidebarAvatar.textContent = initials;
  }

  // Update Session Info Banner / Section
  const metaNameEl = document.getElementById('meta-user-name');
  const metaRoleEl = document.getElementById('meta-user-role');
  const metaStatusEl = document.getElementById('meta-login-status');
  const metaLoggedInEl = document.getElementById('meta-logged-in-at');
  const metaLastLoginEl = document.getElementById('meta-last-login-at');

  if (metaNameEl) metaNameEl.textContent = displayName;
  if (metaRoleEl) metaRoleEl.textContent = userRole;
  if (metaStatusEl) metaStatusEl.textContent = loginStatus;
  if (metaLoggedInEl) metaLoggedInEl.textContent = loggedInTimestamp;
  if (metaLastLoginEl) metaLastLoginEl.textContent = lastLoginTimestamp;

  // 3. SIDEBAR TOGGLE (DESKTOP & MOBILE)
  const sidebar = document.querySelector('.dashboard-sidebar');
  const desktopToggleBtn = document.getElementById('sidebar-collapse-btn');
  const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');

  if (desktopToggleBtn && sidebar) {
    desktopToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
    });

    if (localStorage.getItem('sidebar_collapsed') === 'true' && window.innerWidth > 1024) {
      sidebar.classList.add('collapsed');
    }
  }

  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('mobile-open');
      document.body.classList.toggle('scroll-locked', isOpen);
    });

    // Close on clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && !mobileToggleBtn.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
          document.body.classList.remove('scroll-locked');
        }
      }
    });
  }

  // 4. SIGN OUT
  const signOutBtn = document.getElementById('dash-signout-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      localStorage.removeItem('role');
      window.location.href = 'sign-in.html';
    });
  }

  // 5. SIDEBAR TAB VIEW SWITCHING
  const navTabs = document.querySelectorAll('.dash-nav-tab');
  const tabViews = document.querySelectorAll('.dash-tab-view');

  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetViewId = tab.getAttribute('data-view');
      if (!targetViewId) return;

      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      tabViews.forEach(view => {
        if (view.id === targetViewId) {
          view.style.display = 'block';
          view.style.opacity = '0';
          setTimeout(() => {
            view.style.opacity = '1';
            view.style.transition = 'opacity 0.3s ease';
          }, 30);
        } else {
          view.style.display = 'none';
        }
      });

      // Close mobile sidebar if open
      if (window.innerWidth <= 1024 && sidebar) {
        sidebar.classList.remove('mobile-open');
        document.body.classList.remove('scroll-locked');
      }
    });
  });

  // 6. ADAPT DASHBOARD METRICS BY USER ROLE (NO ROLE SWITCHER UI - DETERMINED BY SESSION)
  const roleTitleEl = document.getElementById('dash-role-headline');
  const roleSubtitleEl = document.getElementById('dash-role-subline');
  const kpiVal1 = document.getElementById('kpi-val-1');
  const kpiLabel1 = document.getElementById('kpi-label-1');
  const kpiVal2 = document.getElementById('kpi-val-2');
  const kpiLabel2 = document.getElementById('kpi-label-2');
  const kpiVal3 = document.getElementById('kpi-val-3');
  const kpiLabel3 = document.getElementById('kpi-label-3');
  const kpiVal4 = document.getElementById('kpi-val-4');
  const kpiLabel4 = document.getElementById('kpi-label-4');

  if (userRole.toLowerCase().includes('client') || userRole.toLowerCase().includes('customer')) {
    if (roleTitleEl) roleTitleEl.textContent = 'Client Project Portal & Milestones';
    if (roleSubtitleEl) roleSubtitleEl.textContent = 'Track your active creative deliverables, sprints, and design approvals.';
    if (kpiLabel1) kpiLabel1.textContent = 'Active Milestones';
    if (kpiVal1) kpiVal1.textContent = '6 / 8';
    if (kpiLabel2) kpiLabel2.textContent = 'Assets Approved';
    if (kpiVal2) kpiVal2.textContent = '94%';
    if (kpiLabel3) kpiLabel3.textContent = 'Sprint Progress';
    if (kpiVal3) kpiVal3.textContent = '82%';
    if (kpiLabel4) kpiLabel4.textContent = 'Next Review';
    if (kpiVal4) kpiVal4.textContent = 'Tomorrow';
  } else if (userRole.toLowerCase().includes('admin')) {
    if (roleTitleEl) roleTitleEl.textContent = 'Executive Agency Operations Hub';
    if (roleSubtitleEl) roleSubtitleEl.textContent = 'Global studio revenue, client contracts, team capacity, and infrastructure.';
    if (kpiLabel1) kpiLabel1.textContent = 'Monthly Revenue';
    if (kpiVal1) kpiVal1.textContent = '$248.5K';
    if (kpiLabel2) kpiLabel2.textContent = 'Active Accounts';
    if (kpiVal2) kpiVal2.textContent = '42';
    if (kpiLabel3) kpiLabel3.textContent = 'Team Utilization';
    if (kpiVal3) kpiVal3.textContent = '91.4%';
    if (kpiLabel4) kpiLabel4.textContent = 'Client Retention';
    if (kpiVal4) kpiVal4.textContent = '98.2%';
  } else if (userRole.toLowerCase().includes('manager')) {
    if (roleTitleEl) roleTitleEl.textContent = 'Creative Operations & Delivery Command';
    if (roleSubtitleEl) roleSubtitleEl.textContent = 'Supervising design sprints, resource allocation, and project timelines.';
    if (kpiLabel1) kpiLabel1.textContent = 'Sprint Velocity';
    if (kpiVal1) kpiVal1.textContent = '96 pts';
    if (kpiLabel2) kpiLabel2.textContent = 'Pending QA Tasks';
    if (kpiVal2) kpiVal2.textContent = '14';
    if (kpiLabel3) kpiLabel3.textContent = 'Deliverables on Time';
    if (kpiVal3) kpiVal3.textContent = '97%';
    if (kpiLabel4) kpiLabel4.textContent = 'Client Satisfaction';
    if (kpiVal4) kpiVal4.textContent = '4.95 / 5';
  } else {
    // Creative Director / Designer / Default
    if (roleTitleEl) roleTitleEl.textContent = 'Creative Studio & Art Direction Suite';
    if (roleSubtitleEl) roleSubtitleEl.textContent = 'Design systems, interactive prototypes, brand assets, and creative deliverables.';
    if (kpiLabel1) kpiLabel1.textContent = 'Active Brand Sprints';
    if (kpiVal1) kpiVal1.textContent = '18';
    if (kpiLabel2) kpiLabel2.textContent = 'Figma Prototypes';
    if (kpiVal2) kpiVal2.textContent = '64';
    if (kpiLabel3) kpiLabel3.textContent = 'Design System Health';
    if (kpiVal3) kpiVal3.textContent = '99.8%';
    if (kpiLabel4) kpiLabel4.textContent = 'Design Awards Won';
    if (kpiVal4) kpiVal4.textContent = '28';
  }

  // 7. ALL ACTION BUTTONS IN DASHBOARD REDIRECT TO 404 (EXCEPT SIGN OUT & BRAND LOGO)
  const dashActionButtons = document.querySelectorAll('.dash-action-btn');
  dashActionButtons.forEach(btn => {
    btn.setAttribute('href', '404.html');
  });
});

