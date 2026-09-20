// Catalyst Academy LMS - Dashboard Renderers mirroring Reference Design

const Dashboards = {
  activeCategoryFilter: 'all',
  searchQuery: '',
  questionsCount: 0,

  handleSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    App.refresh();
  },

  filterByCategory(cat) {
    this.activeCategoryFilter = cat;
    App.refresh();
  },

  // 1. STUDENT DASHBOARD (Mirrors Reference Mockup)
  async renderStudent(container) {
    try {
      const [courses, quizzes, homeworks] = await Promise.all([
        API.getCourses().catch(() => []),
        API.getQuizzes().catch(() => []),
        API.getHomeworks().catch(() => [])
      ]);

      const progress = await API.getProgress(1).catch(() => ({
        attendance_percentage: 95.0,
        quizzes_taken: 1,
        quiz_average_score: 100.0,
        homeworks_completed: 1,
        overall_progress_percentage: 96.5
      }));

      // Filter quizzes/courses by search if present
      const displayQuizzes = quizzes.filter(q => !this.searchQuery || q.title.toLowerCase().includes(this.searchQuery));
      const displayHomeworks = homeworks.filter(h => !this.searchQuery || h.title.toLowerCase().includes(this.searchQuery));

      container.innerHTML = `
        <!-- 1. Hero Promotional Banner (Matching Right Phone in reference) -->
        <div class="hero-banner-card">
          <div class="hero-banner-content">
            <span class="hero-badge"><i class="fa-solid fa-sparkles"></i> DevOps Academy Live</span>
            <h3>FastAPI & DevOps Mid-Term</h3>
            <p>Interactive assessment ready. Test your skills across 5 core modules.</p>
            <button class="hero-btn" onclick="Dashboards.launchQuiz(1)">
              Take Assessment <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
          <div class="hero-banner-art">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
        </div>

        <!-- 2. 3-Column Metric Summary (Matching Middle Phone: Jobs, Earnings, Rating) -->
        <div class="metric-summary-card">
          <div class="metric-col">
            <span class="metric-lbl">Attendance</span>
            <div class="metric-val">${progress.attendance_percentage}%</div>
          </div>
          <div class="metric-col">
            <span class="metric-lbl">Progress</span>
            <div class="metric-val">${progress.overall_progress_percentage}%</div>
          </div>
          <div class="metric-col">
            <span class="metric-lbl">Score</span>
            <div class="metric-val">${progress.quiz_average_score}% <span>★</span></div>
          </div>
        </div>

        <!-- 3. Performance Wave Chart (Matching Middle Phone: Weekly Performance Wave) -->
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">Weekly Performance</span>
            <span class="chart-badge"><i class="fa-solid fa-arrow-trend-up"></i> +12.5%</span>
          </div>
          <div class="chart-score">${progress.overall_progress_percentage}% Overall</div>
          <div class="svg-wave-container">
            <svg viewBox="0 0 320 50" preserveAspectRatio="none" style="width: 100%; height: 100%;">
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="M0,38 C40,40 70,18 110,25 C150,32 180,8 220,16 C260,24 290,6 320,12 L320,50 L0,50 Z" fill="url(#waveGrad)"/>
              <path d="M0,38 C40,40 70,18 110,25 C150,32 180,8 220,16 C260,24 290,6 320,12" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="chart-days-row">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </div>

        <!-- 4. Service Categories (Matching 4-Icon Pastel Grid in reference) -->
        <div class="section-title">
          <span>Academy Categories</span>
          <span class="see-all-link" onclick="Dashboards.filterByCategory('all')">View all</span>
        </div>
        <div class="category-grid">
          <div class="category-tile" onclick="App.switchNavTab('courses')">
            <div class="cat-icon-box cat-teal"><i class="fa-solid fa-book-bookmark"></i></div>
            <span class="cat-label">Courses</span>
          </div>
          <div class="category-tile" onclick="App.switchNavTab('quiz')">
            <div class="cat-icon-box cat-purple"><i class="fa-solid fa-brain"></i></div>
            <span class="cat-label">Quizzes</span>
          </div>
          <div class="category-tile" onclick="Dashboards.filterByCategory('homework')">
            <div class="cat-icon-box cat-amber"><i class="fa-solid fa-clipboard-list"></i></div>
            <span class="cat-label">Tasks</span>
          </div>
          <div class="category-tile" onclick="App.switchNavTab('attendance')">
            <div class="cat-icon-box cat-blue"><i class="fa-solid fa-user-check"></i></div>
            <span class="cat-label">Attendance</span>
          </div>
        </div>

        <!-- 5. Upcoming Jobs / Active Quizzes (Matching List Cards in reference) -->
        <div class="section-title">
          <span>Available Assessments</span>
          <span class="see-all-link" onclick="App.switchNavTab('quiz')">See all (${quizzes.length})</span>
        </div>

        ${displayQuizzes.map((q, idx) => `
          <div class="job-card">
            <div class="job-top-row">
              <div>
                <h4 class="job-title">${q.title}</h4>
                <p class="job-sub">PY201: Architecture &bull; ${q.questions ? q.questions.length : 1} Questions</p>
              </div>
              <span class="job-tag ${idx === 0 ? 'tag-blue' : 'tag-green'}">${idx === 0 ? 'TODAY' : 'ACTIVE'}</span>
            </div>
            <div class="job-meta-row">
              <span><i class="fa-regular fa-clock"></i> ${q.duration_minutes} mins</span>
              <span><i class="fa-solid fa-star"></i> ${q.total_marks} Marks</span>
              <span><i class="fa-solid fa-circle-check"></i> Verified</span>
            </div>
            <button class="job-btn" onclick="Dashboards.launchQuiz(${q.id})">
              <span>Start Assessment</span> <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        `).join('')}

        <!-- 6. Alert Box (Matching Low Stock Alerts in reference) -->
        <div class="section-title">
          <span><i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-orange);"></i> Pending Tasks</span>
        </div>
        ${displayHomeworks.map(h => `
          <div class="alert-row-box">
            <div class="alert-item-info">
              <div class="alert-item-icon"><i class="fa-solid fa-file-code"></i></div>
              <div>
                <div class="alert-item-title">${h.title}</div>
                <div class="alert-item-sub">Due: ${h.due_date}</div>
              </div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="Dashboards.openHomeworkSubmit(${h.id}, '${h.title}')">
              Submit
            </button>
          </div>
        `).join('')}
      `;
    } catch (err) {
      container.innerHTML = `<div class="job-card" style="color: var(--accent-rose);">Error loading student data: ${err.message}</div>`;
    }
  },

  // 2. TEACHER DASHBOARD (Matches Reference Screen 1 & 2: BuildMart / Marcus Chen)
  async renderTeacher(container) {
    try {
      const [students, quizzes, homeworks, courses] = await Promise.all([
        API.getStudents().catch(() => []),
        API.getQuizzes().catch(() => []),
        API.getHomeworks().catch(() => []),
        API.getCourses().catch(() => [])
      ]);

      const displayQuizzes = quizzes.filter(q => !this.searchQuery || q.title.toLowerCase().includes(this.searchQuery));

      container.innerHTML = `
        <!-- Action Buttons (Matching "+ Add New Product" and "View All Orders" in reference) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 2px;">
          <button class="btn btn-primary" onclick="Dashboards.openQuizEditor()">
            <i class="fa-solid fa-plus"></i> Add New Quiz
          </button>
          <button class="btn btn-secondary" onclick="App.switchNavTab('attendance')">
            <i class="fa-solid fa-clipboard-user"></i> Mark Attendance
          </button>
        </div>

        <!-- Metric Summary: 3 Columns -->
        <div class="metric-summary-card">
          <div class="metric-col">
            <span class="metric-lbl">Students</span>
            <div class="metric-val">${students.length}</div>
          </div>
          <div class="metric-col">
            <span class="metric-lbl">Quizzes</span>
            <div class="metric-val">${quizzes.length}</div>
          </div>
          <div class="metric-col">
            <span class="metric-lbl">Rating</span>
            <div class="metric-val">4.9 <span>★</span></div>
          </div>
        </div>

        <!-- Weekly Performance Wave -->
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">Class Evaluation Rate</span>
            <span class="chart-badge"><i class="fa-solid fa-arrow-trend-up"></i> +14%</span>
          </div>
          <div class="chart-score">${homeworks.length + quizzes.length} Total Assessments</div>
          <div class="svg-wave-container">
            <svg viewBox="0 0 320 50" preserveAspectRatio="none" style="width: 100%; height: 100%;">
              <defs>
                <linearGradient id="waveGradTeacher" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#4338ca" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#4338ca" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="M0,35 C30,38 60,15 100,20 C140,26 170,5 210,12 C250,19 280,4 320,8 L320,50 L0,50 Z" fill="url(#waveGradTeacher)"/>
              <path d="M0,35 C30,38 60,15 100,20 C140,26 170,5 210,12 C250,19 280,4 320,8" fill="none" stroke="#4338ca" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="chart-days-row">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </div>

        <!-- Category Grid -->
        <div class="section-title">
          <span>Faculty Management</span>
        </div>
        <div class="category-grid">
          <div class="category-tile" onclick="Dashboards.openQuizEditor()">
            <div class="cat-icon-box cat-purple"><i class="fa-solid fa-plus-circle"></i></div>
            <span class="cat-label">New Quiz</span>
          </div>
          <div class="category-tile" onclick="App.switchNavTab('attendance')">
            <div class="cat-icon-box cat-teal"><i class="fa-solid fa-user-check"></i></div>
            <span class="cat-label">Roll Call</span>
          </div>
          <div class="category-tile" onclick="App.switchNavTab('courses')">
            <div class="cat-icon-box cat-blue"><i class="fa-solid fa-graduation-cap"></i></div>
            <span class="cat-label">Syllabus</span>
          </div>
          <div class="category-tile" onclick="App.switchNavTab('profile')">
            <div class="cat-icon-box cat-amber"><i class="fa-solid fa-sliders"></i></div>
            <span class="cat-label">Settings</span>
          </div>
        </div>

        <!-- Active Quizzes List with Full CRUD: Create, Edit, Delete -->
        <div class="section-title">
          <span>Manage Quizzes</span>
          <span class="see-all-link" onclick="Dashboards.openQuizEditor()">+ Create New</span>
        </div>

        ${displayQuizzes.map(q => `
          <div class="job-card">
            <div class="job-top-row">
              <div>
                <h4 class="job-title">${q.title}</h4>
                <p class="job-sub">Course ID: ${q.course_id} &bull; ${q.duration_minutes} Mins &bull; ${q.total_marks} Marks</p>
              </div>
              <span class="job-tag ${q.is_active ? 'tag-green' : 'tag-amber'}">${q.is_active ? 'ACTIVE' : 'DRAFT'}</span>
            </div>
            <div class="job-meta-row">
              <span><i class="fa-solid fa-circle-question"></i> ${q.questions ? q.questions.length : 0} Questions</span>
              <span><i class="fa-regular fa-clock"></i> ${q.duration_minutes}m</span>
              <span><i class="fa-solid fa-check"></i> Auto-Graded</span>
            </div>
            <div class="job-btn-row">
              <button class="btn btn-sm btn-outline" onclick="Dashboards.openQuizEditor(${q.id})">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button class="btn btn-sm btn-danger" onclick="Dashboards.handleDeleteQuiz(${q.id}, '${q.title.replace(/'/g, "\\'")}')">
                <i class="fa-solid fa-trash"></i> Delete
              </button>
            </div>
          </div>
        `).join('')}

        <!-- Student Roster List -->
        <div class="section-title">
          <span>Student Directory (${students.length})</span>
          <span class="see-all-link" onclick="App.switchNavTab('attendance')">Roll Call</span>
        </div>
        ${students.map(s => `
          <div class="alert-row-box">
            <div class="alert-item-info">
              <div class="user-avatar" style="width: 32px; height: 32px; font-size: 13px;">${s.user ? s.user.name[0] : 'S'}</div>
              <div>
                <div class="alert-item-title">${s.user ? s.user.name : 'Student'}</div>
                <div style="font-size: 10px; color: var(--text-subtle);">${s.roll_number} &bull; Phone: ${s.user && s.user.phone ? s.user.phone : 'N/A'}</div>
              </div>
            </div>
            <span class="job-tag tag-green">Enrolled</span>
          </div>
        `).join('')}
      `;
    } catch (err) {
      container.innerHTML = `<div class="job-card" style="color: var(--accent-rose);">Error loading teacher portal: ${err.message}</div>`;
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
        <div class="hero-banner-card" style="background: linear-gradient(135deg, #134e4a 0%, #0d9488 60%, #14b8a6 100%);">
          <div class="hero-banner-content">
            <span class="hero-badge"><i class="fa-solid fa-shield-heart"></i> Academic Monitor</span>
            <h3>Alex Vance (STU-0001)</h3>
            <p>100% On-Track across all core subjects and assessments.</p>
          </div>
          <div class="hero-banner-art"><i class="fa-solid fa-person-shelter"></i></div>
        </div>

        <div class="metric-summary-card">
          <div class="metric-col">
            <span class="metric-lbl">Attendance</span>
            <div class="metric-val">${progress.attendance_percentage}%</div>
          </div>
          <div class="metric-col">
            <span class="metric-lbl">Quiz Avg</span>
            <div class="metric-val">${progress.quiz_average_score}%</div>
          </div>
          <div class="metric-col">
            <span class="metric-lbl">Status</span>
            <div class="metric-val" style="color: var(--accent-green);">A+</div>
          </div>
        </div>

        <div class="section-title">
          <span>Verified Reports</span>
        </div>
        <div class="job-card">
          <div class="job-top-row">
            <div>
              <h4 class="job-title">Python & FastAPI Mid-Term</h4>
              <p class="job-sub">Evaluated by Prof. Sarah Jenkins</p>
            </div>
            <span class="job-tag tag-green">PASSED 100/100</span>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="job-card" style="color: var(--accent-rose);">Error: ${err.message}</div>`;
    }
  },

  // 4. ADMIN DASHBOARD
  async renderAdmin(container) {
    return await this.renderTeacher(container);
  },

  // -------------------------------------------------------------
  // QUIZ CRUD ENGINE (Creation, Updation, Deletion)
  // -------------------------------------------------------------

  async openQuizEditor(quizId = null) {
    const modal = document.getElementById('quizEditorModal');
    const form = document.getElementById('quizEditorForm');
    form.reset();

    document.getElementById('quizQuestionsContainer').innerHTML = '';
    this.questionsCount = 0;

    const courseSelect = document.getElementById('quizFormCourse');
    try {
      const courses = await API.getCourses();
      if (courses.length > 0) {
        courseSelect.innerHTML = courses.map(c => `<option value="${c.id}">${c.code}: ${c.title}</option>`).join('');
      }
    } catch(e) {
      console.warn('Error fetching courses', e);
    }

    if (quizId) {
      // EDIT MODE
      document.getElementById('quizEditorTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Quiz';
      document.getElementById('btnSaveQuizText').innerText = 'Update Quiz';
      document.getElementById('quizEditId').value = quizId;

      try {
        const quiz = await API.getQuiz(quizId);
        document.getElementById('quizFormTitle').value = quiz.title;
        document.getElementById('quizFormCourse').value = quiz.course_id;
        document.getElementById('quizFormDuration').value = quiz.duration_minutes;
        document.getElementById('quizFormMarks').value = quiz.total_marks;
        document.getElementById('quizFormActive').value = String(quiz.is_active);

        if (quiz.questions && quiz.questions.length > 0) {
          quiz.questions.forEach(q => {
            let options = [];
            try { options = JSON.parse(q.options_json || '[]'); } catch(e) { options = ["True", "False"]; }
            this.addQuestionField({
              text: q.text,
              question_type: q.question_type || 'mcq',
              options: options,
              correct_answer: q.correct_answer
            });
          });
        } else {
          this.addQuestionField();
        }
      } catch (err) {
        alert('Could not fetch quiz details: ' + err.message);
        return;
      }
    } else {
      // CREATE MODE
      document.getElementById('quizEditorTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Create New Quiz';
      document.getElementById('btnSaveQuizText').innerText = 'Save Quiz';
      document.getElementById('quizEditId').value = '';
      this.addQuestionField();
    }

    modal.classList.remove('hidden');
  },

  addQuestionField(existing = null) {
    this.questionsCount++;
    const idx = this.questionsCount;
    const container = document.getElementById('quizQuestionsContainer');

    const defaultOpts = existing && existing.options ? existing.options : ["Option 1", "Option 2", "Option 3", "Option 4"];
    const qText = existing ? existing.text : '';
    const qCorrect = existing ? existing.correct_answer : defaultOpts[0];

    const card = document.createElement('div');
    card.className = 'q-build-card';
    card.id = `qCard_${idx}`;
    card.innerHTML = `
      <div class="q-build-header">
        <span class="q-num">Question #${container.children.length + 1}</span>
        <button type="button" class="btn btn-sm btn-danger" style="padding: 2px 7px; font-size: 10px;" onclick="Dashboards.removeQuestionField('qCard_${idx}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
      <input type="text" class="q-text-input" placeholder="Enter question prompt..." value="${qText}" required>
      
      <div style="margin-top: 4px;">
        <span style="font-size: 10px; color: var(--text-subtle);">Answer Options:</span>
        <div class="q-options-grid">
          <input type="text" class="q-opt-input opt-val" placeholder="Option A" value="${defaultOpts[0] || ''}" required oninput="Dashboards.updateCorrectSelector(${idx})">
          <input type="text" class="q-opt-input opt-val" placeholder="Option B" value="${defaultOpts[1] || ''}" required oninput="Dashboards.updateCorrectSelector(${idx})">
          <input type="text" class="q-opt-input opt-val" placeholder="Option C" value="${defaultOpts[2] || ''}" oninput="Dashboards.updateCorrectSelector(${idx})">
          <input type="text" class="q-opt-input opt-val" placeholder="Option D" value="${defaultOpts[3] || ''}" oninput="Dashboards.updateCorrectSelector(${idx})">
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
        <label style="font-size: 10px; color: var(--accent-green); font-weight: 700; white-space: nowrap;">
          <i class="fa-solid fa-circle-check"></i> Correct Answer:
        </label>
        <select class="q-correct-select" style="font-size: 11px; padding: 4px 8px;">
          ${defaultOpts.map(opt => `<option value="${opt}" ${opt === qCorrect ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      </div>
    `;

    container.appendChild(card);
    this.updateQuestionBadge();
  },

  updateCorrectSelector(qIdx) {
    const card = document.getElementById(`qCard_${qIdx}`);
    if (!card) return;
    const opts = Array.from(card.querySelectorAll('.opt-val')).map(i => i.value.trim()).filter(v => v.length > 0);
    const select = card.querySelector('.q-correct-select');
    const curr = select.value;
    select.innerHTML = opts.map(o => `<option value="${o}" ${o === curr ? 'selected' : ''}>${o}</option>`).join('');
  },

  removeQuestionField(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
      card.remove();
      this.updateQuestionBadge();
      const container = document.getElementById('quizQuestionsContainer');
      Array.from(container.children).forEach((el, index) => {
        const lbl = el.querySelector('.q-num');
        if (lbl) lbl.innerText = `Question #${index + 1}`;
      });
    }
  },

  updateQuestionBadge() {
    const container = document.getElementById('quizQuestionsContainer');
    const badge = document.getElementById('questionCountBadge');
    if (badge && container) {
      badge.innerText = container.children.length;
    }
  },

  async handleSaveQuiz(e) {
    e.preventDefault();
    const editId = document.getElementById('quizEditId').value;
    const title = document.getElementById('quizFormTitle').value.trim();
    const courseId = parseInt(document.getElementById('quizFormCourse').value);
    const duration = parseInt(document.getElementById('quizFormDuration').value);
    const marks = parseInt(document.getElementById('quizFormMarks').value);
    const isActive = document.getElementById('quizFormActive').value === 'true';

    const questionCards = document.querySelectorAll('#quizQuestionsContainer .q-build-card');
    const questions = [];

    questionCards.forEach(card => {
      const text = card.querySelector('.q-text-input').value.trim();
      const options = Array.from(card.querySelectorAll('.opt-val')).map(o => o.value.trim()).filter(v => v.length > 0);
      const correctAnswer = card.querySelector('.q-correct-select').value;

      if (text) {
        questions.push({
          text: text,
          question_type: options.length === 2 ? 'tf' : 'mcq',
          options: options,
          correct_answer: correctAnswer || options[0]
        });
      }
    });

    if (questions.length === 0) {
      alert('Please add at least one question to the quiz!');
      return;
    }

    const payload = {
      course_id: courseId,
      title: title,
      total_marks: marks,
      duration_minutes: duration,
      is_active: isActive,
      questions: questions
    };

    try {
      if (editId) {
        await API.updateQuiz(editId, payload);
        showToast('Quiz updated successfully!');
      } else {
        await API.createQuiz(payload);
        showToast('Quiz created successfully!');
      }

      closeModal('quizEditorModal');
      App.refresh();
    } catch (err) {
      alert('Error saving quiz: ' + err.message);
    }
  },

  confirmAction(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    if (!modal) {
      if (confirm(message)) onConfirm();
      return;
    }
    document.getElementById('confirmTitle').innerText = title;
    document.getElementById('confirmMessage').innerText = message;
    modal.classList.remove('hidden');

    const btnAction = document.getElementById('btnConfirmAction');
    const btnCancel = document.getElementById('btnConfirmCancel');

    const cleanup = () => {
      modal.classList.add('hidden');
      btnAction.onclick = null;
      btnCancel.onclick = null;
    };

    btnCancel.onclick = cleanup;
    btnAction.onclick = () => {
      cleanup();
      onConfirm();
    };
  },

  handleDeleteQuiz(quizId, title) {
    this.confirmAction('Delete Quiz', `Permanently delete "${title}"? This cannot be undone.`, async () => {
      try {
        await API.deleteQuiz(quizId);
        showToast('Quiz deleted successfully!');
        App.refresh();
      } catch (err) {
        alert('Failed to delete quiz: ' + err.message);
      }
    });
  },

  // INTERACTIVE QUIZ RUNNER
  async launchQuiz(quizId) {
    const modal = document.getElementById('quizModal');
    const body = document.getElementById('quizModalBody');
    modal.classList.remove('hidden');

    body.innerHTML = `<div style="text-align: center; padding: 24px;"><div class="spinner-ring" style="margin: 0 auto;"></div><p style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">Loading quiz assessment...</p></div>`;

    try {
      const quiz = await API.getQuiz(quizId);
      document.getElementById('quizModalTitle').innerHTML = `<i class="fa-solid fa-brain"></i> ${quiz.title}`;

      let selectedAnswers = {};

      const renderQuestions = () => {
        body.innerHTML = `
          <div style="font-size: 11px; color: var(--accent-purple); margin-bottom: 14px; display: flex; justify-content: space-between; font-weight: 700;">
            <span><i class="fa-solid fa-circle-question"></i> ${quiz.questions.length} Questions</span>
            <span><i class="fa-regular fa-clock"></i> ${quiz.duration_minutes} Mins &bull; ${quiz.total_marks} Marks</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${quiz.questions.map((q, idx) => {
              let options = [];
              try { options = JSON.parse(q.options_json || '[]'); } catch(e) { options = ["True", "False"]; }

              return `
                <div style="background: var(--bg-card); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); box-shadow: var(--shadow-card);">
                  <p style="font-weight: 700; font-size: 12px; margin-bottom: 8px;">${idx + 1}. ${q.text}</p>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${options.map(opt => `
                      <div class="btn btn-secondary btn-sm" style="justify-content: flex-start; text-align: left; ${selectedAnswers[q.id] === opt ? 'background: rgba(109,40,217,0.12); border-color: var(--accent-purple); color: var(--accent-purple); font-weight: 800;' : ''}" onclick="Dashboards.selectQuizOption(${q.id}, '${opt.replace(/'/g, "\\'")}')">
                        <i class="fa-regular ${selectedAnswers[q.id] === opt ? 'fa-circle-check' : 'fa-circle'}" style="margin-right: 6px;"></i>
                        <span>${opt}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <button class="job-btn" style="margin-top: 16px;" onclick="Dashboards.submitQuizRun(${quiz.id})">
            <span>Submit Assessment</span> <i class="fa-solid fa-paper-plane"></i>
          </button>
        `;
      };

      window.activeQuizSelected = selectedAnswers;
      renderQuestions();

    } catch (err) {
      body.innerHTML = `<p style="color: var(--accent-rose); font-size: 12px;">Failed to load quiz: ${err.message}</p>`;
    }
  },

  selectQuizOption(qId, opt) {
    if (!window.activeQuizSelected) window.activeQuizSelected = {};
    window.activeQuizSelected[qId] = opt;
    this.launchQuiz(window.activeQuizId || 1);
  },

  async submitQuizRun(quizId) {
    const answers = window.activeQuizSelected || {};
    try {
      const res = await API.submitQuiz(quizId, answers);
      const modalBody = document.getElementById('quizModalBody');
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 20px 10px;">
          <div style="width: 64px; height: 64px; background: rgba(16,185,129,0.15); color: var(--accent-green); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 28px; margin: 0 auto 12px auto;">
            <i class="fa-solid fa-trophy"></i>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 800;">Quiz Completed!</h3>
          <p style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">Score Achieved:</p>
          <div style="font-size: 32px; font-weight: 800; color: var(--accent-green); margin: 6px 0;">
            ${res.score} / ${res.max_score}
          </div>
          <p style="font-size: 11px; color: var(--text-subtle);">Recorded in student academic transcript.</p>
          <button class="job-btn" style="margin-top: 16px;" onclick="closeModal('quizModal'); App.refresh();">
            Return to Dashboard
          </button>
        </div>
      `;
    } catch (err) {
      alert('Error submitting quiz: ' + err.message);
    }
  },

  // ATTENDANCE TAB (Full dedicated screen view)
  async renderAttendanceTab(container) {
    try {
      const students = await API.getStudents().catch(() => []);
      const isTeacher = App.activeRole === 'teacher' || App.activeRole === 'admin';
      const today = new Date().toISOString().split('T')[0];

      // If student role, find profile or show personal attendance
      let currentStudent = null;
      let myAttendance = [];
      if (!isTeacher && API.user) {
        currentStudent = students.find(s => s.user && s.user.id === API.user.id);
        if (currentStudent) {
          myAttendance = await API.getStudentAttendance(currentStudent.id).catch(() => []);
        }
      }

      container.innerHTML = `
        <div class="section-title">
          <span>Attendance & Roll Call</span>
          <span class="job-tag tag-blue"><i class="fa-regular fa-calendar"></i> ${today}</span>
        </div>

        <!-- Attendance Stats Overview -->
        <div class="metric-summary-card">
          <div class="metric-col">
            <span class="metric-lbl">Students</span>
            <div class="metric-val">${students.length}</div>
          </div>
          <div class="metric-col">
            <span class="metric-lbl">Cohort</span>
            <div class="metric-val" style="font-size: 13px;">Alpha '26</div>
          </div>
          <div class="metric-col">
            <span class="metric-lbl">Avg Rate</span>
            <div class="metric-val">98% <span style="color: var(--accent-green); font-size: 12px;">●</span></div>
          </div>
        </div>

        ${!isTeacher && currentStudent ? `
          <!-- Student Personal Attendance Card -->
          <div class="job-card" style="border-left: 3px solid var(--accent-purple);">
            <div class="job-top-row">
              <div>
                <h4 class="job-title">${currentStudent.user.name}</h4>
                <p class="job-sub">Roll: <strong>${currentStudent.roll_number}</strong> &bull; Batch: Catalyst Alpha</p>
              </div>
              <span class="job-tag tag-green">100% Present</span>
            </div>
            <div style="margin-top: 10px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">Verified Session Log (${myAttendance.length} Records):</span>
              <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
                ${myAttendance.map(a => `
                  <div class="alert-row-box">
                    <span style="font-size: 11px; font-weight: 600;"><i class="fa-regular fa-calendar-check" style="color: var(--accent-green); margin-right: 6px;"></i>${a.date}</span>
                    <span class="job-tag tag-green" style="text-transform: capitalize;">${a.status}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Class Roster List -->
        <div class="section-title" style="margin-top: 14px;">
          <span>Class Roster (${students.length} Students)</span>
          ${isTeacher ? `<button class="btn btn-sm btn-secondary" onclick="Dashboards.markAllPresent('${today}')"><i class="fa-solid fa-check-double"></i> Mark All Present</button>` : ''}
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${students.map(s => {
            const initials = s.user && s.user.name ? s.user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'ST';
            const isShristhi = s.user && s.user.name && s.user.name.toLowerCase().includes('shristhi');
            return `
              <div class="job-card" id="studentCard_${s.id}" style="${isShristhi ? 'border-left: 3px solid var(--accent-purple); background: var(--hover-card);' : ''}">
                <div class="job-top-row">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: ${isShristhi ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : 'linear-gradient(135deg, #4f46e5, #06b6d4)'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                      ${initials}
                    </div>
                    <div>
                      <h4 class="job-title" style="display: flex; align-items: center; gap: 6px;">
                        ${s.user ? s.user.name : 'Student'}
                        ${isShristhi ? '<span class="job-tag tag-purple" style="font-size: 9px; padding: 2px 6px;">ENROLLED</span>' : ''}
                      </h4>
                      <p class="job-sub">Roll No: <strong>${s.roll_number}</strong> &bull; Grade: ${s.grade || 'A+'} &bull; ${s.user ? s.user.email : ''}</p>
                    </div>
                  </div>
                  <span class="job-tag tag-green" id="statusBadge_${s.id}">PRESENT</span>
                </div>

                ${isTeacher ? `
                  <div style="display: flex; gap: 8px; margin-top: 10px; justify-content: flex-end;">
                    <button class="btn btn-sm btn-primary" style="background: var(--accent-green); border: none; font-size: 11px; padding: 4px 10px;" onclick="Dashboards.handleMarkAttendance(${s.id}, 1, '${today}', 'present', '${s.user ? s.user.name.replace(/'/g, "\\'") : 'Student'}')">
                      <i class="fa-solid fa-check"></i> Present
                    </button>
                    <button class="btn btn-sm btn-outline" style="font-size: 11px; padding: 4px 10px; color: var(--accent-amber); border-color: var(--accent-amber);" onclick="Dashboards.handleMarkAttendance(${s.id}, 1, '${today}', 'late', '${s.user ? s.user.name.replace(/'/g, "\\'") : 'Student'}')">
                      <i class="fa-regular fa-clock"></i> Late
                    </button>
                    <button class="btn btn-sm btn-danger" style="font-size: 11px; padding: 4px 10px;" onclick="Dashboards.handleMarkAttendance(${s.id}, 1, '${today}', 'absent', '${s.user ? s.user.name.replace(/'/g, "\\'") : 'Student'}')">
                      <i class="fa-solid fa-xmark"></i> Absent
                    </button>
                  </div>
                ` : `
                  <div class="job-meta-row" style="margin-top: 8px;">
                    <span><i class="fa-solid fa-id-badge"></i> ${s.roll_number}</span>
                    <span><i class="fa-solid fa-phone"></i> ${s.user ? s.user.phone || 'N/A' : ''}</span>
                    <span style="color: var(--accent-green);"><i class="fa-solid fa-circle-check"></i> Active Student</span>
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch(err) {
      container.innerHTML = `<div class="job-card"><p style="color: var(--accent-rose); font-size: 12px;">Error loading attendance: ${err.message}</p></div>`;
    }
  },

  async handleMarkAttendance(studentId, batchId, date, status, studentName) {
    try {
      await API.markAttendance(studentId, batchId, date, status);
      showToast(`Marked ${studentName} as ${status.toUpperCase()}`, status === 'present' ? 'fa-check' : 'fa-clipboard-user');
      const badge = document.getElementById(`statusBadge_${studentId}`);
      if (badge) {
        badge.innerText = status.toUpperCase();
        badge.className = `job-tag ${status === 'present' ? 'tag-green' : status === 'absent' ? 'tag-danger' : 'tag-amber'}`;
      }
    } catch(err) {
      alert('Error marking attendance: ' + err.message);
    }
  },

  async markAllPresent(today) {
    try {
      const students = await API.getStudents();
      for (const s of students) {
        await API.markAttendance(s.id, 1, today, 'present');
        const badge = document.getElementById(`statusBadge_${s.id}`);
        if (badge) {
          badge.innerText = 'PRESENT';
          badge.className = 'job-tag tag-green';
        }
      }
      showToast(`All ${students.length} students marked Present!`, 'fa-check-double');
    } catch (err) {
      alert('Error marking all present: ' + err.message);
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <p style="font-size: 11px; color: var(--text-muted); margin: 0;">Date: <strong>${today}</strong> &bull; Cohort: Catalyst Alpha</p>
          <span class="job-tag tag-blue" style="font-size: 10px;">${students.length} Students</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
          ${students.map(s => {
            const initials = s.user && s.user.name ? s.user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'ST';
            const isShristhi = s.user && s.user.name && s.user.name.toLowerCase().includes('shristhi');
            return `
              <div class="alert-row-box" style="${isShristhi ? 'border: 1px solid var(--accent-purple); background: var(--hover-card);' : ''}">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 30px; height: 30px; border-radius: 50%; background: ${isShristhi ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : 'linear-gradient(135deg, #4f46e5, #06b6d4)'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px;">
                    ${initials}
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 700;">
                      ${s.user ? s.user.name : 'Student'}
                      ${isShristhi ? '<span class="job-tag tag-purple" style="font-size: 8px; padding: 1px 4px; margin-left: 4px;">NEW</span>' : ''}
                    </div>
                    <div style="font-size: 10px; color: var(--text-subtle);">${s.roll_number} &bull; ${s.grade || 'A+'}</div>
                  </div>
                </div>
                <div style="display: flex; gap: 4px;">
                  <button class="btn btn-sm btn-primary" style="background: var(--accent-green); border: none; font-size: 11px; padding: 4px 8px;" onclick="Dashboards.handleMarkAttendance(${s.id}, 1, '${today}', 'present', '${s.user ? s.user.name.replace(/'/g, "\\'") : 'Student'}')">Present</button>
                  <button class="btn btn-sm btn-danger" style="font-size: 11px; padding: 4px 8px;" onclick="Dashboards.handleMarkAttendance(${s.id}, 1, '${today}', 'absent', '${s.user ? s.user.name.replace(/'/g, "\\'") : 'Student'}')">Absent</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch(e) {
      body.innerHTML = `<p style="font-size: 12px;">Error: ${e.message}</p>`;
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
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Submission Solution / GitHub Repo URL</label>
          <textarea id="hwText" rows="3" placeholder="Paste GitHub repository or implementation notes..." required></textarea>
        </div>
        <button type="submit" class="job-btn">Submit Assignment</button>
      </form>
    `;
  },

  async handleHwSubmit(e, hwId) {
    e.preventDefault();
    const text = document.getElementById('hwText').value;
    try {
      await API.submitHomework(hwId, text);
      showToast('Assignment submitted successfully!');
      closeModal('homeworkModal');
      App.refresh();
    } catch(err) {
      alert('Error submitting homework: ' + err.message);
    }
  }
};
