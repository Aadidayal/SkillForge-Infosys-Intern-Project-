# SkillForge Frontend

React.js frontend for the SkillForge learning platform with JWT authentication and role-based dashboards.

## Features

- **Authentication System**: Login/Register with JWT tokens
- **Role-Based Access**: Different dashboards for Students, Instructors, and Admins
- **Responsive Design**: Built with Tailwind CSS for mobile-first approach
- **Modern UI**: Clean, professional interface with smooth animations
- **API Integration**: Axios-based HTTP client with interceptors
- **Protected Routes**: Route guards based on authentication and roles

## Tech Stack

- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite with Rolldown
- **Styling**: Tailwind CSS 4.1.16
- **Routing**: React Router DOM 7.9.4
- **HTTP Client**: Axios 1.12.2
- **Icons**: Heroicons & Lucide React
- **JWT Handling**: jwt-decode

## Demo Accounts

The application includes pre-configured demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skillforge.com | admin123 |
| Instructor | instructor@skillforge.com | instructor123 |
| Student | student@skillforge.com | student123 |

## Getting Started

### Prerequisites

- Node.js 20.17.0+ (Note: Some packages require 20.19.0+ but work with warnings)
- npm 10.8.2+
- SkillForge Backend running on http://localhost:8080

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

   The application will open at http://localhost:3000

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Flow

1. **Login Process:**
   - User enters credentials
   - Frontend sends POST to `/api/auth/login`
   - Backend validates and returns JWT token
   - Token stored in localStorage
   - User redirected to role-specific dashboard

2. **Token Management:**
   - JWT contains user role and info
   - Automatic token validation on app load
   - Token expiry handling with automatic logout
   - API request interceptors add Bearer token

## Backend Integration

Ensure the Spring Boot backend is running before starting the frontend:

1. Start backend: `./mvnw spring-boot:run`
2. Backend available at: http://localhost:8080
3. Start frontend: `npm run dev`
4. Frontend available at: http://localhost:3000
