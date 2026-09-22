# 🎓 Catalyst Academy - Learning Management System (LMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Android](https://img.shields.io/badge/Android-Universal_APK-3DDC84.svg?logo=android&logoColor=white)](https://www.android.com/)
[![Web Standards](https://img.shields.io/badge/Frontend-HTML5_%2F_CSS3_%2F_Vanilla_JS-E34F26.svg?logo=html5&logoColor=white)](https://developer.mozilla.org/)

**Catalyst Academy** is a multi-role educational management platform engineered with an asynchronous Python/FastAPI backend, an interactive client-side web interface, and a standalone native Android APK.

---

## ✨ Features & Capabilities

- 🎭 **Role-Based Contexts**: Instant switching between **Student**, **Teacher**, **Parent**, and **Admin** workspaces with dedicated metrics, actions, and permissions.
- 📚 **Syllabus & Course Catalog**: Interactive course browser with real-time syllabus tracking, progress indicators, and course curriculum details.
- 🧠 **Interactive Quizzes & Assessments**: Real-time quiz launcher, answer evaluation, and scoring dashboard.
- 📊 **Attendance & Gradebook**: Comprehensive attendance monitoring and student performance analytics.
- 📱 **Full-Screen Mobile & Native APK**: Tailored responsive mobile experience with zero mock borders and complete Android edge-to-edge rendering.
- 🌙 **Persistent Dark / Light Mode**: Real-time theme toggle with persistent storage and system color-scheme sync.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLite, Pydantic
- **Frontend**: Semantic HTML5, Vanilla CSS3 (Glassmorphism & CSS Custom Properties), Modern JavaScript ES6+
- **Android APK**: Pure Native WebView container, API 21+ (Android 5.0 through Android 15), compiled with AAPT2, D8, Zipalign, and full v1/v2/v3 signing schemes.

---

## 🚀 Quick Start (Local Web Server)

### 1. Clone the repository
```bash
git clone https://github.com/0612divyansh/Catalyst-Academy.git
cd Catalyst-Academy
```

### 2. Set up virtual environment & install dependencies
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt   # or: pip install fastapi uvicorn pydantic
```

### 3. Run the application
```bash
python3 -m uvicorn app.main:app --port 8000 --reload
```
Open your browser at **`http://localhost:8000`**.

---

## 📱 Android APK Installation & Build

### Pre-Built APK
The pre-compiled, fully signed universal APK is included directly in this repository:
- `CatalystAcademy-v1.0.apk`

### Direct Device Download
When running the FastAPI server, download directly to any phone on the same Wi-Fi network:
```text
http://<YOUR_LOCAL_IP>:8000/static/CatalystAcademy.apk
```

### Build APK from Source
To compile and package the APK using the local Android SDK:
```bash
chmod +x build-apk.sh
./build-apk.sh
```

---

## 📂 Project Structure

```text
academy-lms/
├── CatalystAcademy-v1.0.apk  # Pre-compiled, signed Android APK (v1.0.2)
├── build-apk.sh              # Standalone Android APK build pipeline
├── .gitignore                # Git ignore configuration
├── README.md                 # Documentation
├── backend/
│   └── app/                  # FastAPI backend routes & models
├── frontend/
│   └── static/               # HTML5, CSS3, and JavaScript assets
└── keystore/                 # Persistent Android release keystore
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
