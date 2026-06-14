# Smart Institute Management System (Smart ERP)

A comprehensive, role-based coaching and institute ERP application built using **Spring Boot** and **React.js** with a **MySQL** database. This application provides a modern, responsive interface using **Tailwind CSS**, real-world **Jitsi Meet video classroom conferencing**, **Monaco Editor IDE workspace**, and robust administrative management panels.

---

## 🚀 Key Features & Role Portals

The system provides protected dashboards and workflows tailored for 4 distinct user roles:

### 1. Student Portal
* **Virtual Classroom**: Join scheduled interactive live video classes powered by real **Jitsi Meet External API** iframe panels (with mic, camera, screen-sharing, and raise-hand toggles). Automatically checks in for attendance logs on join.
* **Monaco IDE workspace**: Embedded code execution simulator for Java, Python, JavaScript, C++, C, and SQL topics with layout theme customization.
* **Academics Center**: View class timetables, download study sheets (PDFs, spreadsheets), watch video tutorials, and upload homework assignments.
* **Faculty Evaluations**: Submit weekly ratings for instructors. The portal enforces **weekend-only** locks (Saturday & Sunday) and filters targets to their batch instructor.
* **MCQ Quizzes & Review**: Complete online exams and review graded details showing correct/incorrect choices highlighted in green and red with text explanations.
* **Inboxes & Certificates**: Receive targeted notices/attachments on a bell drop-down, and view/download dynamically generated PDFs.

### 2. Faculty Portal
* **Lecture Planner**: Schedule classroom lectures, specify batch/subject, and start/end active classes.
* **Upload Desk**: Redesigned split-screen displays to upload notes or tutorials on the left and review previously shared resources on the right.
* **Assignments Desk**: Assign exercises to specific batches, review submissions, and enter grades with custom comments.
* **Grievance Inbox**: Approve or reject student lecture recording requests.
* **Student Directory**: Retrieve and search batch listings.

### 3. Admin Portal
* **Student & Faculty Enrollment**: Add, update, or de-activate student profiles, faculty credentials, and assign role privileges.
* **Batch Setup**: Group courses, map subjects, assign batch timings, configure size capacities, and associate instructors.
* **Mapping desk**: Map students into batches.
* **Certificates Center**: Dynamically generate single or batch-wide PDF certificates.

### 4. Super Admin Portal
* **Staff Registrations**: Provision and manage intermediate Admin accounts.
* **Broadcaster Desk**: Send announcements to select user targets, or dispatch global notifications (announcements to `ALL` users are restricted to the Super Admin role).
* **Analytics Center**: Review active batch distributions and super-admin attendance working hour reports.

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React.js (JavaScript, Single Page Application)
* **Design**: Tailwind CSS, CSS Grid, Glassmorphism elements
* **Rich Interactions**: Monaco Editor, Jitsi Meet External API, React Toastify, React Icons
* **Routing**: React Router DOM (v6, protecting links by role)
* **HTTP Client**: Axios (configured with interceptors to inject JWT headers)

### Backend
* **Core**: Spring Boot (v3), Java 17
* **Security**: Spring Security (JWT authentication state management, BCrypt password encoders)
* **ORM**: Spring Data JPA, Hibernate, Lombok
* **Database**: MySQL

---

## 📁 Project Structure

```bash
Institute Management System/
├── README.md                           # Documentation
├── project description.txt             # Initial ERP requirements
├── institute-backend/                  # Spring Boot Project
│   ├── src/main/java/com/institute/management/
│   │   ├── config/                     # Web Security & Cors setups
│   │   ├── controller/                 # REST Controller Endpoints
│   │   ├── entity/                     # Hibernate Database Models (User, Student, Batch etc.)
│   │   ├── repository/                 # Spring Data JPA interfaces
│   │   └── security/                   # JWT Filter & Token provider classes
│   └── src/main/resources/
│       └── application.properties      # Port configs & Database parameters
└── institute-frontend/                 # React Vite Project
    ├── index.html                      # Loads Jitsi External SDK script
    ├── src/
    │   ├── components/                 # Sidebar, Navbar, and Protected routes wrappers
    │   ├── context/                    # AuthContext api helper definitions
    │   ├── pages/                      # Role dashboards and Shared views
    │   └── App.jsx                     # Router paths & Role permissions configurations
```

---

## ⚙️ Database Configuration

1. Create a MySQL database locally:
   ```sql
   CREATE DATABASE institute_management;
   ```
2. Configure connection details in `institute-backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/institute_management?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=TIGER
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

   # Automatically creates / updates tables on startup
   spring.jpa.hibernate.ddl-auto=update
   ```

---

## 🏁 Installation & Startup

### Prerequisites
* Java JDK 17 or above
* Node.js v18 or above
* Maven
* MySQL running on port 3306

### Step 1: Run Backend
Navigate to the backend directory, compile the application, and start the Spring Boot server:
```powershell
cd "institute-backend"
mvn clean compile
mvn spring-boot:run
```
* The backend API server starts listening on **http://localhost:9998**.
* Seed data will automatically populate during startup if the tables are empty.

### Step 2: Run Frontend
Navigate to the frontend directory, install npm packages, and start the development server:
```powershell
cd "institute-frontend"
npm install
npm run dev
```
* The Vite dev server will boot and open the application at **http://localhost:5173**.

---

## 🔑 Default Seed Credentials

Use these preset accounts to log in and explore different role features:

| Role | Username | Password |
|---|---|---|
| **Super Admin** | `superadmin` | `superadmin` |
| **Admin Staff** | `admin` | `admin123` |
| **Faculty / Instructor** | `faculty` | `faculty123` |
| **Student** | `student` | `student123` |

---

## 🛡️ Validation & Implementation Checks

* **Security Hierarchy**: Rank metrics enforce that complaints, leave requests, and recording requests can only target higher-ranking users.
* **Feedback Constraints**: Evaluation availability checks restrict student feedbacks to Saturday and Sunday.
* **Auto-deserialization Fix**: Stale role entries (`ROLE_ADMISSION`) are dynamically converted to `ROLE_ADMIN` on backend boot using native queries.
