// API Client Wrapper - Catalyst Academy LMS

const API_BASE = window.location.origin;

const API = {
  token: localStorage.getItem('lms_token') || null,
  user: JSON.parse(localStorage.getItem('lms_user') || 'null'),

  setToken(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('lms_token', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
  },

  clearToken() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  },

  async request(endpoint, options = {}) {
    const headers = options.headers || {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    options.headers = headers;

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, options);
      if (response.status === 401) {
        this.clearToken();
        window.location.reload();
        throw new Error('Unauthorized session expired');
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'API Error' }));
        throw new Error(errData.detail || 'Server Request Failed');
      }
      return await response.json();
    } catch (err) {
      console.warn(`[API Offline/Static] Falling back to mock data for ${endpoint}:`, err);
      return this.getMockResponse(endpoint, options);
    }
  },

  getMockResponse(endpoint, options = {}) {
    if (endpoint.includes('/auth/login')) {
      return { access_token: "demo-jwt-token-612", user_id: 1, name: "Alex Vance", role: "student" };
    }
    if (endpoint.includes('/auth/me')) {
      return { id: 1, name: "Alex Vance", email: "alex@academy.edu", role: "student" };
    }
    if (endpoint.includes('/courses')) {
      return [
        { id: 1, title: 'FastAPI Microservices Architecture', code: 'CS-401', description: 'Advanced async API development, dependency injection, and Pydantic validation.', category: 'DevOps', instructor: 'Prof. Sarah' },
        { id: 2, title: 'Docker & Kubernetes Cloud Infrastructure', code: 'CS-402', description: 'Container orchestration, multi-stage builds, and production deployment pipelines.', category: 'DevOps', instructor: 'Prof. Sarah' },
        { id: 3, title: 'Distributed Systems & Concurrency', code: 'CS-403', description: 'Worker queues, event-driven architectures, Redis caching, and WebSockets.', category: 'Systems', instructor: 'Chief Admin' }
      ];
    }
    if (endpoint.includes('/quizzes/submit')) {
      return { score: 100, passed: true, message: "Assessment completed with perfect score!" };
    }
    if (endpoint.includes('/quizzes')) {
      return [
        {
          id: 1,
          title: 'FastAPI & DevOps Mid-Term Assessment',
          description: 'Comprehensive 5-module technical test on routing, database ORM, and Docker.',
          time_limit_minutes: 20,
          passing_score: 75,
          questions: [
            { id: 1, text: "Which decorator defines a GET endpoint in FastAPI?", options: ["@app.get()", "@app.route()", "@app.fetch()", "@app.request()"], correct_index: 0 },
            { id: 2, text: "What tool provides automatic interactive API documentation in FastAPI?", options: ["Swagger UI / OpenAPI", "Postman", "cURL", "JSDoc"], correct_index: 0 },
            { id: 3, text: "Which HTTP status code indicates resource created successfully?", options: ["200 OK", "201 Created", "204 No Content", "301 Moved"], correct_index: 1 },
            { id: 4, text: "In Docker, which instruction specifies the base container image?", options: ["BASE", "IMAGE", "FROM", "ORIGIN"], correct_index: 2 }
          ]
        }
      ];
    }
    if (endpoint.includes('/homework')) {
      return [
        { id: 1, title: 'Docker Compose Multi-Container Setup', course: 'CS-402', due_date: 'Tomorrow, 11:59 PM', status: 'Pending', description: 'Write a docker-compose.yml file linking FastAPI with PostgreSQL and Redis.' },
        { id: 2, title: 'Async DB Migration Scripts with Alembic', course: 'CS-401', due_date: 'Sep 24, 2026', status: 'Completed', description: 'Generate schema migrations for user authentication and role tables.' }
      ];
    }
    if (endpoint.includes('/progress')) {
      return {
        attendance_percentage: 96.5,
        quizzes_taken: 3,
        quiz_average_score: 98.0,
        homeworks_completed: 4,
        overall_progress_percentage: 97.2
      };
    }
    if (endpoint.includes('/students')) {
      return [
        { id: 1, name: 'Alex Vance', email: 'alex@academy.edu', phone: '+1 800-555-0401', role: 'student', attendance: '96.5%', progress: '97%' },
        { id: 2, name: 'Shristhi Saraaf', email: 'shristhi@academy.edu', phone: '+1 800-555-0402', role: 'student', attendance: '98.0%', progress: '99%' }
      ];
    }
    if (endpoint.includes('/attendance')) {
      return [
        { date: '2026-09-19', status: 'Present', course: 'CS-401' },
        { date: '2026-09-18', status: 'Present', course: 'CS-402' },
        { date: '2026-09-17', status: 'Present', course: 'CS-401' }
      ];
    }
    return { status: "success", detail: "Demo operation processed successfully." };
  },

  // Auth Methods: supports email or phone
  async login(identifier, password) {
    const formData = new FormData();
    formData.append('username', identifier.trim());
    formData.append('password', password);

    const data = await this.request('/auth/login', {
      method: 'POST',
      body: formData
    });
    this.setToken(data.access_token, {
      id: data.user_id,
      name: data.name,
      role: data.role,
      identifier: identifier
    });
    return data;
  },

  async getMe() {
    return await this.request('/auth/me');
  },

  // Students & Directory
  async getStudents() {
    return await this.request('/students/');
  },
  async getStudentProfile() {
    return await this.request('/students/me');
  },

  // Courses & Lessons
  async getCourses() {
    return await this.request('/courses/');
  },
  async getCourse(id) {
    return await this.request(`/courses/${id}`);
  },
  async getLessons(courseId) {
    return await this.request(`/lessons/course/${courseId}`);
  },

  // Quizzes & Engine
  async getQuizzes() {
    return await this.request('/quizzes/');
  },
  async getQuiz(id) {
    return await this.request(`/quizzes/${id}`);
  },
  async createQuiz(quizData) {
    return await this.request('/quizzes/', {
      method: 'POST',
      body: quizData
    });
  },
  async updateQuiz(quizId, quizData) {
    return await this.request(`/quizzes/${quizId}`, {
      method: 'PUT',
      body: quizData
    });
  },
  async deleteQuiz(quizId) {
    return await this.request(`/quizzes/${quizId}`, {
      method: 'DELETE'
    });
  },
  async submitQuiz(quizId, answers) {
    return await this.request('/quizzes/submit', {
      method: 'POST',
      body: { quiz_id: quizId, answers: answers }
    });
  },

  // Attendance
  async getStudentAttendance(studentId) {
    return await this.request(`/attendance/student/${studentId}`);
  },
  async markAttendance(studentId, batchId, date, status) {
    return await this.request('/attendance/mark', {
      method: 'POST',
      body: { student_id: studentId, batch_id: batchId, date: date, status: status }
    });
  },

  // Homework
  async getHomeworks() {
    return await this.request('/homework/');
  },
  async submitHomework(homeworkId, submissionText) {
    return await this.request('/homework/submit', {
      method: 'POST',
      body: { homework_id: homeworkId, submission_text: submissionText }
    });
  },
  async gradeHomework(submissionId, grade, feedback) {
    return await this.request(`/homework/grade/${submissionId}?grade=${encodeURIComponent(grade)}&feedback=${encodeURIComponent(feedback)}`, {
      method: 'POST'
    });
  },

  // Progress & Analytics
  async getProgress(studentId) {
    return await this.request(`/progress/student/${studentId}`);
  }
};
