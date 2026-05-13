# 🌾 GrainSync — Complete Project Documentation
GrainSync is a full-stack Plant/Factory Management System designed to streamline operations across multiple departments including HR, Production, Sales, Finance, and Admin. The system is divided into two main parts: Frontend (React + Vite) and Backend (Spring Boot + MySQL).
# 🖥️ Frontend (React + Vite)
Directory: /grainsync-frontend
⚙️ Tech Stack
React.js (Vite), Tailwind CSS, Axios, React Router DOM, shadcn/ui, Lucide Icons
## 🚀 Getting Started
1. Clone the Repository:
 git clone https://github.com/Hamza-Malik05/grainsync-frontend.git
2. Install Dependencies:
 npm install
3. Configure Environment Variables:
 Create a .env file:
 VITE_BACKEND_URL=https://grainsync.up.railway.app
4. Run the Frontend:
 npm run dev
5. Build for Production:
 npm run build
## 📡 API Integration
All API requests use: ${import.meta.env.VITE_BACKEND_URL}/api/...
## 🔐 Features
• Employee Registration & User Linking

• Role-based Dashboards (HR, Sales, Production, Finance, Admin)

• Authentication System

• Dynamic Components using Tailwind

• Integrated REST API communication with backend
# ⚙️ Backend (Spring Boot)
## 🧰 Tech Stack
Java Spring Boot, MySQL, Spring Data JPA, Spring Web, Lombok, Spring Security, Railway Deployment
## 🚀 Getting Started
1. Clone the Repository:
git clone https://github.com/Hamza-Malik05/grainsync-backend.git
2. Configure Database Connection in application.properties:
spring.datasource.url=jdbc:mysql://localhost:3306/grainsync_db
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8080
3. Run Locally:
 mvn spring-boot:run

# 🧑‍💻 Developer Notes
• Ensure both frontend and backend run simultaneously for local testing.

• CORS configured to allow frontend requests.

• Use Postman or browser DevTools (Network tab) to verify API connectivity.
# 🌍 Project Structure Overview
```text
GrainSync/
│
├── grainsync-frontend/     # React + Vite Frontend
│   ├── src/
│   ├── public/
│   └── .env
│
├── grainsync-backend/      # Spring Boot Backend
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
│
└── README.md               # This documentation
```
