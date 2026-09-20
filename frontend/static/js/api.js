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
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
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
