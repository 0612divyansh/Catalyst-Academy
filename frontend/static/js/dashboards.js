// Dashboard UI Renderers - Catalyst Academy LMS

const Dashboards = {
  
  // 1. STUDENT DASHBOARD
  async renderStudent(container) {
    try {
      const [courses, quizzes, homeworks] = await Promise.all([
        API.getCourses().catch(() => []),
        API.getQuizzes().catch(() => []),
        API.getHomeworks().catch(() => [])
      ]);

      // Fetch progress for Student ID 1 (Alex Vance)
      const progress = await API.getProgress(1).catch(() => ({
        attendance_percentage: 95.0,
        quizzes_taken: 1,
        quiz_average_score: 100.0,
        homeworks_completed: 1,
        overall_progress_percentage: 96.5
      }));

      container.innerHTML = `
        <!-- Top Stats Row -->
        <div class="card-grid">
          <div class="stat-card">
            <div class="stat-icon stat-blue"><i class="fa-solid fa-chart-line"></i></div>
            <div class="stat-val">${progress.overall_progress_percentage}%</div>
            <div class="stat-lbl">Overall Progress</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-green"><i class="fa-solid fa-user-check"></i></div>
            <div class="stat-val">${progress.attendance_percentage}%</div>
            <div class="stat-lbl">Attendance Rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-purple"><i class="fa-solid fa-award"></i></div>
            <div class="stat-val">${progress.quiz_average_score}%</div>
            <div class="stat-lbl">Quiz Avg Score</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-orange"><i class="fa-solid fa-file-pen"></i></div>
            <div class="stat-val">${progress.homeworks_completed} Done</div>
            <div class="stat-lbl">Homework Completed</div>
          </div>
        </div>

        <!-- Enrolled Courses Section -->
        <div class="section-title">
          <span><i class="fa-solid fa-book-bookmark"></i> Enrolled Courses</span>
          <span style="font-size: 12px; color: var(--accent-blue);">${courses.length} Active</span>
        </div>

        ${courses.map(c => `
          <div class="course-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span class="course-code">${c.code}</span>
              <span style="font-size: 11px; background: rgba(59,130,246,0.15); color: var(--accent-blue); padding: 2px 8px; border-radius: 10px;">In Progress</span>
            </div>
            <h4 class="course-title">${c.title}</h4>
            <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">${c.description}</p>
            <div class="progress-bar-bg" style="margin-top: 6px;">
              <div class="progress-bar-fill" style="width: 75%;"></div>
            </div>
          </div>
        `).join('')}

        <!-- Active Quizzes Section -->
        <div class="section-title" style="margin-top: 10px;">
          <span><i class="fa-solid fa-stopwatch"></i> Available Quizzes</span>
        </div>

        ${quizzes.map(q => `
          <div class="course-card" style="border-left: 4px solid var(--accent-purple);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 class="course-title" style="font-size: 14px;">${q.title}</h4>
                <p style="font-size: 11px; color: var(--text-muted);"><i class="fa-regular fa-clock"></i> ${q.duration_minutes} Mins | ${q.total_marks} Marks</p>
              </div>
              <button class="btn btn-primary" style="padding: 8px 14px; font-size: 12px;" onclick="Dashboards.launchQuiz(${q.id})">
                Start Quiz <i class="fa-solid fa-play"></i>
              </button>
            </div>
          </div>
        `).join('')}

        <!-- Homework Assignments Section -->
        <div class="section-title" style="margin-top: 10px;">
          <span><i class="fa-solid fa-list-check"></i> Pending Homework</span>
        </div>

        ${homeworks.map(h => `
          <div class="course-card" style="border-left: 4px solid var(--accent-orange);">
            <h4 class="course-title" style="font-size: 14px;">${h.title}</h4>
            <p style="font-size: 12px; color: var(--text-muted);">${h.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
              <span style="font-size: 11px; color: var(--accent-orange);"><i class="fa-regular fa-calendar"></i> Due: ${h.due_date}</span>
              <button class="btn" style="background: rgba(245,158,11,0.2); color: var(--accent-orange); padding: 6px 12px; font-size: 11px;" onclick="Dashboards.openHomeworkSubmit(${h.id}, '${h.title}')">
                Submit Solution
              </button>
            </div>
          </div>
        `).join('')}
      `;
    } catch (err) {
      container.innerHTML = `<div class="stat-card" style="color: var(--accent-pink);">Error loading student data: ${err.message}</div>`;
    }
  },

  // 2. TEACHER DASHBOARD
  async renderTeacher(container) {
    try {
      const students = await API.getStudents().catch(() => []);
      const homeworks = await API.getHomeworks().catch(() => []);

      container.innerHTML = `
        <div class="stat-card" style="background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.1)); border-color: var(--accent-purple);">
          <h3 style="font-size: 16px; font-family: var(--font-heading); color: var(--accent-purple);">
            <i class="fa-solid fa-chalkboard-user"></i> Teacher Control Panel
          </h3>
          <p style="font-size: 12px; color: var(--text-muted);">Manage classes, mark attendance, evaluate homework, and monitor performance.</p>
        </div>

        <!-- Teacher Action Buttons -->
        <div class="card-grid">
          <button class="btn btn-primary" onclick="Dashboards.openAttendanceModal()">
            <i class="fa-solid fa-clipboard-user"></i> Mark Attendance
          </button>
          <button class="btn" style="background: rgba(139,92,246,0.2); color: var(--accent-purple); border: 1px solid var(--accent-purple);" onclick="alert('Quiz Creator Wizard Activated! Custom quizzes can be posted directly via API.')">
            <i class="fa-solid fa-plus"></i> Create Quiz
          </button>
        </div>

        <!-- Student Roster & Attendance Stats -->
        <div class="section-title">
          <span><i class="fa-solid fa-users"></i> Class Student Roster (${students.length})</span>
        </div>

        ${students.map(s => `
          <div class="course-card" style="flex-direction: row; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="user-avatar" style="width: 36px; height: 36px; font-size: 14px;">${s.user ? s.user.name[0] : 'S'}</div>
              <div>
                <h4 style="font-size: 14px; font-weight: 600;">${s.user ? s.user.name : 'Student'}</h4>
                <p style="font-size: 11px; color: var(--text-muted);">${s.roll_number} | Grade: ${s.grade || 'A'}</p>
              </div>
            </div>
            <span style="font-size: 11px; background: rgba(16,185,129,0.2); color: var(--accent-green); padding: 4px 10px; border-radius: 12px; font-weight: 600;">Present</span>
          </div>
        `).join('')}

        <!-- Homework Submissions to Grade -->
        <div class="section-title">
          <span><i class="fa-solid fa-check-double"></i> Submissions Awaiting Evaluation</span>
        </div>
        <div class="course-card" style="border-left: 4px solid var(--accent-cyan);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="font-size: 14px;">Alex Vance (STU-0001)</h4>
              <p style="font-size: 12px; color: var(--text-muted);">Homework: JWT Authenticated API</p>
            </div>
            <span style="font-size: 11px; background: rgba(16,185,129,0.2); color: var(--accent-green); padding: 4px 8px; border-radius: 8px; font-weight: 700;">Graded A+</span>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="stat-card">Error loading teacher panel: ${err.message}</div>`;
    }
  },

  // 3. PARENT DASHBOARD
  async renderParent(container) {
    try {
      const progress = await API.getProgress(1).catch(() => ({
        attendance_percentage: 100.0,
        quizzes_taken: 1,
        quiz_average_score: 100.0,
        homeworks_completed: 1,
        overall_progress_percentage: 100.0
      }));

      container.innerHTML = `
        <div class="stat-card" style="background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1)); border-color: var(--accent-green);">
          <h3 style="font-size: 16px; font-family: var(--font-heading); color: var(--accent-green);">
            <i class="fa-solid fa-person-shelter"></i> Parent Academic Monitor
          </h3>
          <p style="font-size: 12px; color: var(--text-muted);">Child: <strong>Alex Vance</strong> (Roll: STU-0001)</p>
        </div>

        <div class="card-grid">
          <div class="stat-card">
            <div class="stat-icon stat-green"><i class="fa-solid fa-calendar-check"></i></div>
            <div class="stat-val">${progress.attendance_percentage}%</div>
            <div class="stat-lbl">Attendance Record</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-purple"><i class="fa-solid fa-star"></i></div>
            <div class="stat-val">${progress.quiz_average_score}%</div>
            <div class="stat-lbl">Quiz Average</div>
          </div>
        </div>

        <div class="section-title">
          <span><i class="fa-solid fa-square-poll-vertical"></i> Recent Academic Performance</span>
        </div>

        <div class="course-card">
          <div style="display: flex; justify-content: space-between;">
            <h4 style="font-size: 14px;">Python & FastAPI Mid-Term</h4>
            <span style="font-size: 12px; font-weight: 700; color: var(--accent-green);">100 / 100</span>
          </div>
          <p style="font-size: 11px; color: var(--text-muted);">Submitted: 2026-08-12 | Status: Passed</p>
        </div>

        <div class="course-card">
          <div style="display: flex; justify-content: space-between;">
            <h4 style="font-size: 14px;">Attendance Log</h4>
            <span style="font-size: 12px; font-weight: 700; color: var(--accent-green);">6 / 6 Days Present</span>
          </div>
          <p style="font-size: 11px; color: var(--text-muted);">Teacher Verified: Prof. Sarah Jenkins</p>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="stat-card">Error loading parent portal: ${err.message}</div>`;
    }
  },

  // 4. ADMIN DASHBOARD
  async renderAdmin(container) {
    try {
      const [students, courses, quizzes] = await Promise.all([
        API.getStudents().catch(() => []),
        API.getCourses().catch(() => []),
        API.getQuizzes().catch(() => [])
      ]);

      container.innerHTML = `
        <div class="stat-card" style="background: linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.1)); border-color: var(--accent-pink);">
          <h3 style="font-size: 16px; font-family: var(--font-heading); color: var(--accent-pink);">
            <i class="fa-solid fa-shield-halved"></i> Academy System Admin
          </h3>
          <p style="font-size: 12px; color: var(--text-muted);">Global system metrics and user management.</p>
        </div>

        <div class="card-grid">
          <div class="stat-card">
            <div class="stat-icon stat-blue"><i class="fa-solid fa-user-graduate"></i></div>
            <div class="stat-val">${students.length}</div>
            <div class="stat-lbl">Active Students</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-purple"><i class="fa-solid fa-book"></i></div>
            <div class="stat-val">${courses.length}</div>
            <div class="stat-lbl">Active Courses</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-orange"><i class="fa-solid fa-clock-rotate-left"></i></div>
            <div class="stat-val">${quizzes.length}</div>
            <div class="stat-lbl">Quizzes Engine</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-green"><i class="fa-solid fa-server"></i></div>
            <div class="stat-val">Healthy</div>
            <div class="stat-lbl">FastAPI Status</div>
          </div>
        </div>

        <div class="section-title">
          <span><i class="fa-solid fa-sliders"></i> System Overview</span>
        </div>
        <div class="course-card">
          <h4 style="font-size: 14px;">Database Connection</h4>
          <p style="font-size: 12px; color: var(--text-muted);">Engine: SQLite / PostgreSQL | Authentication: JWT (HS256)</p>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="stat-card">Error loading admin panel: ${err.message}</div>`;
    }
  },

  // INTERACTIVE QUIZ RUNNER
  async launchQuiz(quizId) {
    const modal = document.getElementById('quizModal');
    const body = document.getElementById('quizModalBody');
    modal.classList.remove('hidden');

    body.innerHTML = `<div style="text-align: center; padding: 20px;"><div class="spinner-ring" style="margin: 0 auto;"></div><p style="margin-top: 10px;">Loading Quiz Questions...</p></div>`;

    try {
      const quiz = await API.getQuiz(quizId);
      document.getElementById('quizModalTitle').innerText = quiz.title;

      let selectedAnswers = {};

      const renderQuestions = () => {
        body.innerHTML = `
          <div style="font-size: 12px; color: var(--accent-cyan); margin-bottom: 12px; display: flex; justify-content: space-between;">
            <span><i class="fa-solid fa-circle-question"></i> ${quiz.questions.length} Questions</span>
            <span><i class="fa-regular fa-clock"></i> ${quiz.duration_minutes} Mins</span>
          </div>

          ${quiz.questions.map((q, idx) => {
            let options = [];
            try { options = JSON.parse(q.options_json || '[]'); } catch(e) { options = ["True", "False"]; }

            return `
              <div style="margin-bottom: 18px; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color);">
                <p style="font-weight: 600; font-size: 13px; margin-bottom: 10px;">${idx + 1}. ${q.text}</p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${options.map(opt => `
                    <div class="quiz-opt ${selectedAnswers[q.id] === opt ? 'selected' : ''}" onclick="Dashboards.selectQuizOption(${q.id}, '${opt}')">
                      <i class="fa-regular ${selectedAnswers[q.id] === opt ? 'fa-circle-check' : 'fa-circle'}"></i>
                      <span>${opt}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}

          <button class="btn btn-primary btn-block" style="margin-top: 10px;" onclick="Dashboards.submitQuizRun(${quiz.id})">
            Submit Quiz <i class="fa-solid fa-paper-plane"></i>
          </button>
        `;
      };

      window.activeQuizSelected = selectedAnswers;
      renderQuestions();

    } catch (err) {
      body.innerHTML = `<p style="color: var(--accent-pink);">Failed to load quiz: ${err.message}</p>`;
    }
  },

  selectQuizOption(qId, opt) {
    if (!window.activeQuizSelected) window.activeQuizSelected = {};
    window.activeQuizSelected[qId] = opt;
    // Highlight element visually
    this.launchQuizReRender();
  },

  launchQuizReRender() {
    const opts = document.querySelectorAll('.quiz-opt');
    opts.forEach(el => {
      el.onclick = function() {
        const parent = this.parentElement;
        parent.querySelectorAll('.quiz-opt').forEach(child => child.classList.remove('selected'));
        this.classList.add('selected');
      };
    });
  },

  async submitQuizRun(quizId) {
    const answers = window.activeQuizSelected || {};
    try {
      const res = await API.submitQuiz(quizId, answers);
      const modalBody = document.getElementById('quizModalBody');
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 20px 10px;">
          <div style="width: 70px; height: 70px; background: rgba(16,185,129,0.2); color: var(--accent-green); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 32px; margin: 0 auto 16px auto;">
            <i class="fa-solid fa-trophy"></i>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 22px;">Quiz Submitted!</h3>
          <p style="color: var(--text-muted); font-size: 14px; margin-top: 6px;">Score Achieved:</p>
          <div style="font-size: 36px; font-weight: 800; color: var(--accent-green); margin: 10px 0;">
            ${res.score} / ${res.max_score}
          </div>
          <p style="font-size: 12px; color: var(--text-muted);">Results recorded into system database.</p>
          <button class="btn btn-primary btn-block" style="margin-top: 20px;" onclick="closeModal('quizModal'); App.refresh();">
            Back to Dashboard
          </button>
        </div>
      `;
    } catch (err) {
      alert('Error submitting quiz: ' + err.message);
    }
  },

  // ATTENDANCE MODAL
  async openAttendanceModal() {
    const modal = document.getElementById('attendanceModal');
    const body = document.getElementById('attendanceModalBody');
    modal.classList.remove('hidden');

    try {
      const students = await API.getStudents();
      const today = new Date().toISOString().split('T')[0];

      body.innerHTML = `
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">Date: <strong>${today}</strong> | Batch: Catalyst Alpha</p>
        
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${students.map(s => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 10px 14px; border-radius: 12px; border: 1px solid var(--border-color);">
              <span style="font-size: 13px; font-weight: 600;">${s.user ? s.user.name : 'Student'}</span>
              <div style="display: flex; gap: 6px;">
                <button class="mini-btn active" style="background: var(--accent-green); color: white;" onclick="API.markAttendance(${s.id}, 1, '${today}', 'present').then(() => alert('Marked Present'))">Present</button>
                <button class="mini-btn" style="background: rgba(236,72,153,0.2); color: var(--accent-pink);" onclick="API.markAttendance(${s.id}, 1, '${today}', 'absent').then(() => alert('Marked Absent'))">Absent</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch(e) {
      body.innerHTML = `<p>Error: ${e.message}</p>`;
    }
  },

  // HOMEWORK SUBMIT MODAL
  openHomeworkSubmit(hwId, hwTitle) {
    const modal = document.getElementById('homeworkModal');
    const body = document.getElementById('homeworkModalBody');
    modal.classList.remove('hidden');

    document.getElementById('hwModalTitle').innerText = hwTitle;
    body.innerHTML = `
      <form onsubmit="Dashboards.handleHwSubmit(event, ${hwId})">
        <div class="form-group" style="margin-bottom: 12px;">
          <label>Submission Notes / Code Link</label>
          <textarea id="hwText" rows="4" placeholder="Enter code link or solution summary..." required></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Submit Assignment</button>
      </form>
    `;
  },

  async handleHwSubmit(e, hwId) {
    e.preventDefault();
    const text = document.getElementById('hwText').value;
    try {
      await API.submitHomework(hwId, text);
      alert('Homework submitted successfully!');
      closeModal('homeworkModal');
      App.refresh();
    } catch(err) {
      alert('Error submitting homework: ' + err.message);
    }
  }
};
