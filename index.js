// Portfolio site script: contact storage, admin auth, theme toggle

document.addEventListener('DOMContentLoaded', () => {
  const CONTACT_KEY = 'contactResponses';
  const THEME_KEY = 'theme';
  const ADMIN_USERNAME = 'bhanu';
  const ADMIN_PASSWORD = 'bhanu123';

  const contactForm = document.getElementById('contact-form');
  const adminForm = document.getElementById('admin-form');
  const responsesList = document.getElementById('responses-list');
  const contactFeedback = document.getElementById('contact-feedback');
  const toggleThemeBtn = document.getElementById('toggle-theme');
  const adminSection = document.getElementById('admin-login');
  const userSection = document.getElementById('user-responses');
  const navAdminLink = document.querySelector('nav ul li a[href*="admin-login"]');
  const mainContainer = document.querySelector('main') || document.body;
0
  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    toggleThemeBtn.textContent = 'Light Theme';
  } else {
    toggleThemeBtn.textContent = 'Dark Theme';
  }

  // Toggle theme handler
  toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    toggleThemeBtn.textContent = isDark ? 'Light Theme' : 'Dark Theme';
  });

  // Utility: read and write responses
  function readResponses() {
    return JSON.parse(localStorage.getItem(CONTACT_KEY) || '[]');
  }

  function saveResponse(obj) {
    const arr = readResponses();
    arr.push(obj);
    localStorage.setItem(CONTACT_KEY, JSON.stringify(arr));
  }

  // Render responses into #responses-list
  function renderResponses() {
    const arr = readResponses();
    responsesList.innerHTML = '';

    if (!arr.length) {
      responsesList.innerHTML = '<p>No responses yet.</p>';
      return;
    }

    // show newest first
    arr.slice().reverse().forEach(r => {
      const el = document.createElement('div');
      el.className = 'response';
      const time = new Date(r.timestamp).toLocaleString();
      el.innerHTML = `
        <div class="meta">${escapeHTML(r.name)} — <em>${time}</em></div>
        <div><strong>Email:</strong> ${escapeHTML(r.email)}</div>
        <div><strong>Gender:</strong> ${escapeHTML(r.gender)}</div>
        <div style="margin-top:6px">${escapeHTML(r.message)}</div>
      `;
      responsesList.appendChild(el);
    });
  }

  // Simple text-escape helper to prevent HTML injection
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Contact form submission
  contactForm && contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: contactForm.name.value.trim(),
      email: contactForm.email.value.trim(),
      gender: contactForm.gender.value || '',
      message: contactForm.message.value.trim(),
      timestamp: new Date().toISOString()
    };

    saveResponse(data);
    contactFeedback.textContent = 'Thank you — your message has been saved.';
    contactForm.reset();
    setTimeout(() => contactFeedback.textContent = '', 3000);

    // If responses are visible, re-render
    if (document.getElementById('responses-list')) renderResponses();
  });

  // Show admin login (global function referenced in HTML)
  window.show_adminlogin = function(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const admin = document.getElementById('admin-login');
    const user = document.getElementById('user-responses');
    if (admin) {
      admin.style.display = 'block';
      admin.setAttribute('aria-hidden', 'false');
      const usernameInput = admin.querySelector('#username');
      usernameInput && usernameInput.focus();
      // hide responses (if previously visible)
      if (user) user.style.display = 'none';
      admin.scrollIntoView({behavior:'smooth'});
    } else {
      // if admin login was replaced or not present, scroll to responses instead
      user && user.scrollIntoView({behavior:'smooth'});
    }
  }

  // Admin form login
  // Save reference to parent so we can replace/restore
  const adminParent = adminSection && adminSection.parentNode;

  adminForm && adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = adminForm.username.value.trim();
    const password = adminForm.password.value;

    if (username === 'Bhanu' && password === 'bhanu123') {
      // Replace admin section with user-responses (per requirement)
      if (adminSection && userSection && adminParent) {
        // ensure responses are populated
        renderResponses();

        // place a logout button at top of user section
        let logoutBtn = userSection.querySelector('#admin-logout-btn');
        if (!logoutBtn) {
          logoutBtn = document.createElement('button');
          logoutBtn.id = 'admin-logout-btn';
          logoutBtn.textContent = 'Logout Admin';
          logoutBtn.style.marginBottom = '10px';
          logoutBtn.addEventListener('click', () => {
            // restore admin section in the same position
            if (adminParent && adminSection) {
              adminParent.replaceChild(adminSection, userSection);
              adminSection.style.display = 'block';
            }
            // hide user responses after logout
            userSection.style.display = 'none';
          });
        }

        // If userSection is not in DOM at adminParent position, replace
        try {
          adminParent.replaceChild(userSection, adminSection);
        } catch (err) {
          // already replaced; ignore
        }
        userSection.style.display = 'block';
        // ensure logout button is first child
        if (!userSection.querySelector('#admin-logout-btn')) userSection.insertBefore(logoutBtn, userSection.firstChild);

        // bring responses into view for the admin
        userSection.scrollIntoView({ behavior: 'smooth' });

      }
    } else {
      alert('Invalid credentials. Please try again.');
    }
  });

  // Initial render if admin is already replaced or user wants to view responses
  renderResponses();
});