// Main Application Controller - Catalyst Academy LMS

const App = {
  activeRole: 'student',
  activeTab: 'home',

  async init() {
    this.updateClock();
    setInterval(() => this.updateClock(), 60000);

    // Simulate Splash Screen delay (1.2s)
    setTimeout(() => {
      document.getElementById('splashScreen').classList.remove('active');
      document.getElementById('splashScreen').classList.add('hidden');

      if (API.token && API.user) {
        this.showDashboard();
      } else {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('loginScreen').classList.add('active');
      }
    }, 1200);
  },

  updateClock() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const el = document.getElementById('statusTime');
    if (el) el.innerText = `${hrs}:${mins}`;
  },

  async showDashboard() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('hidden');

    const dashScreen = document.getElementById('dashboardScreen');
    dashScreen.classList.remove('hidden');
    dashScreen.classList.add('active');

    // Update Header Info
    const user = API.user || { name: 'Alex Vance', role: 'student' };
    document.getElementById('userName').innerText = user.name;
    document.getElementById('userAvatar').innerText = user.name[0].toUpperCase();
    document.getElementById('userRoleBadge').innerText = user.role.toUpperCase();

    this.activeRole = user.role.toLowerCase();
    this.updateRoleSwitcherUI();
    this.refresh();
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
    document.getElementById('userRoleBadge').innerText = role.toUpperCase();
    this.updateRoleSwitcherUI();
    this.refresh();
  },

  switchNavTab(tab) {
    this.activeTab = tab;
    ['home', 'courses', 'quiz', 'profile'].forEach(t => {
      const el = document.getElementById(`nav${t.charAt(0).toUpperCase() + t.slice(1)}`);
      if (el) {
        if (t === tab) el.classList.add('active');
        else el.classList.remove('active');
      }
    });
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
    } else if (this.activeTab === 'courses') {
      body.innerHTML = `
        <div class="section-title"><span><i class="fa-solid fa-book-open"></i> Course Syllabus Catalog</span></div>
        <div class="course-card">
          <span class="course-code">PY201</span>
          <h4 class="course-title">FastAPI & Python Backend Architecture</h4>
          <p style="font-size: 12px; color: var(--text-muted);">Instructor: Prof. Sarah Jenkins | 5 Modules</p>
        </div>
        <div class="course-card">
          <span class="course-code">DOV301</span>
          <h4 class="course-title">DevOps & Cloud Automation</h4>
          <p style="font-size: 12px; color: var(--text-muted);">Instructor: Dr. Mark Taylor | 4 Modules</p>
        </div>
      `;
    } else if (this.activeTab === 'quiz') {
      body.innerHTML = `
        <div class="section-title"><span><i class="fa-solid fa-brain"></i> Quiz & Assessment Engine</span></div>
        <div class="course-card" style="border-left: 4px solid var(--accent-purple);">
          <h4 class="course-title">Python & FastAPI Mid-Term Assessment</h4>
          <p style="font-size: 12px; color: var(--text-muted);">Duration: 20 Mins | Total: 100 Marks</p>
          <button class="btn btn-primary" style="margin-top: 10px; font-size: 12px;" onclick="Dashboards.launchQuiz(1)">
            Launch Quiz Engine <i class="fa-solid fa-play"></i>
          </button>
        </div>
      `;
    } else if (this.activeTab === 'profile') {
      const user = API.user || { name: 'Alex Vance', email: 'alex@academy.edu', role: 'student' };
      body.innerHTML = `
        <div class="stat-card" style="text-align: center; align-items: center; padding: 24px;">
          <div class="user-avatar" style="width: 64px; height: 64px; font-size: 24px; margin-bottom: 12px;">${user.name[0]}</div>
          <h3 style="font-family: var(--font-heading); font-size: 20px;">${user.name}</h3>
          <p style="font-size: 13px; color: var(--text-muted);">${user.email}</p>
          <span class="user-role-badge" style="margin-top: 8px;">${user.role.toUpperCase()} ACCOUNT</span>
        </div>
        <button class="btn btn-block" style="background: rgba(236,72,153,0.15); color: var(--accent-pink); border: 1px solid var(--accent-pink);" onclick="handleLogout()">
          <i class="fa-solid fa-right-from-bracket"></i> Sign Out
        </button>
      `;
    }
  }
};

// Global Handlers
async function quickLogin(email, password) {
  try {
    await API.login(email, password);
    App.showDashboard();
  } catch (err) {
    alert('Login error: ' + err.message);
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pw = document.getElementById('loginPassword').value;
  try {
    await API.login(email, pw);
    App.showDashboard();
  } catch (err) {
    alert('Authentication Failed: ' + err.message);
  }
}

function handleLogout() {
  API.clearToken();
  window.location.reload();
}

function switchRoleView(role) {
  App.switchRoleView(role);
}

function switchNavTab(tab) {
  App.switchNavTab(tab);
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function toggleNotificationsModal() {
  const modal = document.getElementById('notifModal');
  const body = document.getElementById('notifModalBody');
  modal.classList.remove('hidden');

  body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div style="background: rgba(59,130,246,0.1); border-left: 3px solid var(--accent-blue); padding: 10px; border-radius: 8px;">
        <h4 style="font-size: 13px; font-weight: 600;">Quiz Graded</h4>
        <p style="font-size: 11px; color: var(--text-muted);">Python & FastAPI Mid-Term scored 100/100 (A+).</p>
      </div>
      <div style="background: rgba(245,158,11,0.1); border-left: 3px solid var(--accent-orange); padding: 10px; border-radius: 8px;">
        <h4 style="font-size: 13px; font-weight: 600;">New Homework Assigned</h4>
        <p style="font-size: 11px; color: var(--text-muted);">Homework 'Build a JWT Authenticated User API' is due on 2026-08-18.</p>
      </div>
    </div>
  `;
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
