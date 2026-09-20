// Main Application Controller & Theme Manager - Catalyst Academy LMS

const Theme = {
  current: localStorage.getItem('lms_theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),

  init() {
    this.apply(this.current);
    // Listen to OS theme changes if user hasn't explicitly chosen
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('lms_theme')) {
        this.apply(e.matches ? 'dark' : 'light');
      }
    });
  },

  apply(theme) {
    this.current = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lms_theme', theme);

    // Update all theme toggle icons in status bar and headers
    const icons = document.querySelectorAll('.theme-icon-display, .status-theme-toggle i');
    icons.forEach(i => {
      if (theme === 'dark') {
        i.className = 'fa-solid fa-sun';
      } else {
        i.className = 'fa-solid fa-moon';
      }
    });
  },

  toggle() {
    const next = this.current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    showToast(`Switched to ${next.toUpperCase()} theme`, next === 'dark' ? 'fa-moon' : 'fa-sun');
  }
};

function showToast(msg, icon = 'fa-circle-check') {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  const msgEl = toast.querySelector('.toast-msg');
  const iconEl = toast.querySelector('.toast-icon');
  if (msgEl) msgEl.innerText = msg;
  if (iconEl) iconEl.className = `toast-icon fa-solid ${icon}`;
  
  toast.classList.remove('hidden');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2400);
}

const App = {
  activeRole: 'student',
  activeTab: 'home',
  loginMode: 'email',

  async init() {
    Theme.init();
    this.updateClock();
    setInterval(() => this.updateClock(), 60000);

    // Splash screen transition
    setTimeout(() => {
      const splash = document.getElementById('splashScreen');
      if (splash) {
        splash.classList.remove('active');
        splash.classList.add('hidden');
      }

      if (API.token && API.user) {
        this.showDashboard();
      } else {
        const login = document.getElementById('loginScreen');
        login.classList.remove('hidden');
        login.classList.add('active');
      }
    }, 900);
  },

  updateClock() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const el = document.getElementById('statusTime');
    if (el) el.innerText = `${hrs}:${mins}`;
  },

  setLoginMode(mode) {
    this.loginMode = mode;
    const tabEmail = document.getElementById('tabEmailMode');
    const tabPhone = document.getElementById('tabPhoneMode');
    const labelIcon = document.getElementById('loginLabelIcon');
    const labelText = document.getElementById('loginLabelText');
    const input = document.getElementById('loginIdentifier');
    const badge = document.getElementById('loginTypeBadge');
    const hint = document.getElementById('loginHint');

    if (mode === 'email') {
      if (tabEmail) tabEmail.classList.add('active');
      if (tabPhone) tabPhone.classList.remove('active');
      if (labelIcon) labelIcon.className = 'fa-solid fa-envelope';
      if (labelText) labelText.innerText = 'Email Address';
      if (input) {
        input.type = 'email';
        input.placeholder = 'alex@academy.edu';
      }
      if (badge) badge.innerText = 'Email';
      if (hint) hint.innerText = 'Enter your registered email address';
    } else {
      if (tabPhone) tabPhone.classList.add('active');
      if (tabEmail) tabEmail.classList.remove('active');
      if (labelIcon) labelIcon.className = 'fa-solid fa-phone';
      if (labelText) labelText.innerText = 'Phone Number';
      if (input) {
        input.type = 'tel';
        input.placeholder = '+1 800-555-0401 or 8005550401';
      }
      if (badge) badge.innerText = 'Phone';
      if (hint) hint.innerText = 'Enter your mobile phone number with or without country code';
    }
  },

  async showDashboard() {
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
      loginScreen.classList.remove('active');
      loginScreen.classList.add('hidden');
    }

    const dashScreen = document.getElementById('dashboardScreen');
    dashScreen.classList.remove('hidden');
    dashScreen.classList.add('active');

    // Update Header Info
    const user = API.user || { name: 'Alex Vance', role: 'student' };
    const hr = new Date().getHours();
    const greeting = hr < 12 ? 'Good morning,' : hr < 18 ? 'Good afternoon,' : 'Good evening,';
    const greetingEl = document.getElementById('userGreeting');
    if (greetingEl) greetingEl.innerText = greeting;

    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) avatarEl.innerText = user.name ? user.name[0].toUpperCase() : 'U';

    this.activeRole = (user.role || 'student').toLowerCase();
    this.switchRoleView(this.activeRole);
  },

  updateRoleSwitcherUI() {
    ['student', 'teacher', 'parent', 'admin'].forEach(r => {
      const btn = document.getElementById(`btnRole${r.charAt(0).toUpperCase() + r.slice(1)}`);
      if (btn) {
        if (r === this.activeRole) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
  },

  switchRoleView(role) {
    this.activeRole = role;
    const nameEl = document.getElementById('userName');
    const avatarEl = document.getElementById('userAvatar');

    if (role === 'student') {
      if (nameEl) nameEl.innerHTML = `Alex Vance <span class="role-tag-pill">STUDENT</span>`;
      if (avatarEl) avatarEl.innerText = 'A';
    } else if (role === 'teacher') {
      if (nameEl) nameEl.innerHTML = `Prof. Sarah <span class="role-tag-pill">TEACHER</span>`;
      if (avatarEl) avatarEl.innerText = 'S';
    } else if (role === 'parent') {
      if (nameEl) nameEl.innerHTML = `Robert Vance <span class="role-tag-pill">PARENT</span>`;
      if (avatarEl) avatarEl.innerText = 'R';
    } else if (role === 'admin') {
      if (nameEl) nameEl.innerHTML = `Chief Admin <span class="role-tag-pill">ADMIN</span>`;
      if (avatarEl) avatarEl.innerText = 'C';
    }

    this.updateRoleSwitcherUI();
    this.refresh();
  },

  switchNavTab(tab) {
    this.activeTab = tab;
    ['home', 'courses', 'attendance', 'quiz', 'profile'].forEach(t => {
      const el = document.getElementById(`nav${t.charAt(0).toUpperCase() + t.slice(1)}`);
      if (el) {
        if (t === tab) el.classList.add('active');
        else el.classList.remove('active');
      }
    });

    const searchBox = document.querySelector('.search-container');
    if (searchBox) {
      if (tab === 'profile') searchBox.style.display = 'none';
      else searchBox.style.display = 'block';
    }

    this.refresh();
  },

  async refresh() {
    const body = document.getElementById('dashboardBody');
    if (!body) return;

    if (this.activeTab === 'home') {
      if (this.activeRole === 'student') await Dashboards.renderStudent(body);
      else if (this.activeRole === 'teacher') await Dashboards.renderTeacher(body);
      else if (this.activeRole === 'parent') await Dashboards.renderParent(body);
      else if (this.activeRole === 'admin') await Dashboards.renderAdmin(body);
    } else if (this.activeTab === 'attendance') {
      await Dashboards.renderAttendanceTab(body);
    } else if (this.activeTab === 'courses') {
      try {
        const courses = await API.getCourses().catch(() => []);
        body.innerHTML = `
          <div class="section-title"><span>Syllabus Catalog (${courses.length})</span></div>
          ${courses.map(c => `
            <div class="job-card">
              <div class="job-top-row">
                <div>
                  <h4 class="job-title">${c.title}</h4>
                  <p class="job-sub">Code: ${c.code} &bull; Instructor: Faculty</p>
                </div>
                <span class="job-tag tag-blue">Active</span>
              </div>
              <p style="font-size: 11px; color: var(--text-muted);">${c.description}</p>
              <button class="job-btn" onclick="showToast('Opened course modules for ' + '${c.code}')">
                <span>View Course Curriculum</span> <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          `).join('')}
        `;
      } catch (err) {
        body.innerHTML = `<p style="font-size: 12px; color: var(--accent-rose);">Error: ${err.message}</p>`;
      }
    } else if (this.activeTab === 'quiz') {
      try {
        const quizzes = await API.getQuizzes().catch(() => []);
        const isStaff = this.activeRole === 'teacher' || this.activeRole === 'admin';

        body.innerHTML = `
          <div class="section-title">
            <span>Assessment & Quiz Center</span>
            ${isStaff ? `
              <button class="btn btn-primary btn-sm" onclick="Dashboards.openQuizEditor()">
                <i class="fa-solid fa-plus"></i> Add Quiz
              </button>
            ` : ''}
          </div>

          ${quizzes.map(q => `
            <div class="job-card">
              <div class="job-top-row">
                <div>
                  <h4 class="job-title">${q.title}</h4>
                  <p class="job-sub">${q.duration_minutes} Mins &bull; ${q.total_marks} Marks</p>
                </div>
                <span class="job-tag ${q.is_active ? 'tag-green' : 'tag-amber'}">${q.is_active ? 'PUBLISHED' : 'DRAFT'}</span>
              </div>
              <div class="job-meta-row">
                <span><i class="fa-solid fa-circle-question"></i> ${q.questions ? q.questions.length : 0} Questions</span>
                <span><i class="fa-solid fa-bolt"></i> Auto-Graded</span>
              </div>
              ${isStaff ? `
                <div class="job-btn-row">
                  <button class="btn btn-sm btn-outline" onclick="Dashboards.openQuizEditor(${q.id})">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="Dashboards.handleDeleteQuiz(${q.id}, '${q.title.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-trash"></i> Delete
                  </button>
                </div>
              ` : `
                <button class="job-btn" onclick="Dashboards.launchQuiz(${q.id})">
                  <span>Start Assessment</span> <i class="fa-solid fa-play"></i>
                </button>
              `}
            </div>
          `).join('')}
        `;
      } catch (err) {
        body.innerHTML = `<p style="font-size: 12px; color: var(--accent-rose);">Error: ${err.message}</p>`;
      }
    } else if (this.activeTab === 'profile') {
      const user = API.user || { name: 'Alex Vance', role: 'student' };
      body.innerHTML = `
        <div class="metric-summary-card" style="grid-template-columns: 1fr; text-align: center; padding: 20px;">
          <div class="user-avatar" style="width: 58px; height: 58px; font-size: 22px; margin: 0 auto 10px;">
            ${user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 800;">${user.name}</h3>
          <p style="font-size: 12px; color: var(--text-muted);">${user.identifier || user.email || 'alex@academy.edu'}</p>
          <span class="role-tag-pill" style="margin: 8px auto 0; width: fit-content;">${(user.role || 'student').toUpperCase()} ACCOUNT</span>
        </div>

        <div class="section-title" style="margin-top: 6px;">
          <span>Display & Theme</span>
        </div>
        <div class="alert-row-box">
          <div>
            <div class="alert-item-title">Color Theme</div>
            <div class="alert-item-sub" style="color: var(--text-muted); font-weight: normal;">Currently in ${Theme.current.toUpperCase()} Mode</div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="Theme.toggle()">
            <i class="fa-solid ${Theme.current === 'dark' ? 'fa-sun' : 'fa-moon'}"></i> Switch
          </button>
        </div>

        <button class="btn btn-danger btn-block" style="margin-top: 14px;" onclick="handleLogout()">
          <i class="fa-solid fa-right-from-bracket"></i> Sign Out
        </button>
      `;
    }
  }
};

// Global Handlers
async function quickLogin(identifier, password, role) {
  try {
    const data = await API.login(identifier, password);
    showToast(`Logged in as ${data.name} (${role})`);
    App.showDashboard();
  } catch (err) {
    console.warn('Backend offline, running in interactive client demo mode:', err);
    const names = {
      student: identifier.includes('shristhi') ? 'Shristhi Saraaf' : 'Alex Vance',
      teacher: 'Prof. Sarah',
      parent: 'Robert Vance',
      admin: 'Chief Admin'
    };
    API.setToken('demo-token-612', {
      id: 1,
      name: names[role] || 'Alex Vance',
      role: role,
      identifier: identifier
    });
    showToast(`Logged in as ${names[role] || 'User'} (${role.toUpperCase()})`);
    App.showDashboard();
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const identifier = document.getElementById('loginIdentifier').value;
  const pw = document.getElementById('loginPassword').value;
  const btn = document.getElementById('btnLoginSubmit');
  const originalText = btn.innerHTML;

  try {
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner-ring" style="width: 14px; height: 14px; border-width: 2px;"></div> Signing In...`;
    const data = await API.login(identifier, pw);
    showToast(`Welcome back, ${data.name}!`);
    App.showDashboard();
  } catch (err) {
    console.warn('Authentication API offline, using interactive demo session:', err);
    API.setToken('demo-token-612', {
      id: 1,
      name: identifier.split('@')[0] || 'Alex Vance',
      role: 'student',
      identifier: identifier
    });
    showToast(`Welcome! (Interactive Mode Active)`);
    App.showDashboard();
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

function handleLogout() {
  API.clearToken();
  showToast('Signed out successfully');
  window.location.reload();
}

function switchRoleView(role) {
  App.switchRoleView(role);
}

function switchNavTab(tab) {
  App.switchNavTab(tab);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

function toggleNotificationsModal() {
  const modal = document.getElementById('notifModal');
  const body = document.getElementById('notifModalBody');
  modal.classList.remove('hidden');

  body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="background: rgba(99,102,241,0.1); border-left: 3px solid var(--accent-primary); padding: 8px 10px; border-radius: 8px;">
        <h4 style="font-size: 12px; font-weight: 600;">Quiz Evaluation</h4>
        <p style="font-size: 11px; color: var(--text-muted);">Python & FastAPI Mid-Term scored 100/100 (Grade A+).</p>
      </div>
      <div style="background: rgba(245,158,11,0.1); border-left: 3px solid var(--accent-orange); padding: 8px 10px; border-radius: 8px;">
        <h4 style="font-size: 12px; font-weight: 600;">New Task Assigned</h4>
        <p style="font-size: 11px; color: var(--text-muted);">FastAPI Docker Containerization due next Monday.</p>
      </div>
    </div>
  `;
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
