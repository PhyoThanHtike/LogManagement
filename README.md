# 📊 Log Management SaaS Platform

> A powerful, full-stack log management and monitoring platform built with modern web technologies. Centralize, analyze, and alert on logs from multiple sources in real-time.

[![Deploy Status](https://img.shields.io/badge/deploy-passing-brightgreen)](https://log-management-steel.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🌐 Live Demo

**Frontend**: [https://log-management-steel.vercel.app](https://log-management-steel.vercel.app)  
**API**: [https://log-management-backend.onrender.com](https://logmanagement.onrender.com)

***Default admin credentials***
- Email: `admin@gmail.com`
- Password: `12345678`

---

## 📸 Screenshots

<table>
  <tr>
    <td width="33%">
      <img src="./docs/images/Login.png" alt="Login Page" />
      <p align="center"><strong>Login & Authentication</strong></p>
    </td>
    <td width="33%">
      <img src="./docs/images/Dashboard.png" alt="Dashboard" />
      <p align="center"><strong>Dashboard</strong></p>
    </td>
    <td width="33%">
      <img src="./docs/images/Management.png" alt="Management" />
      <p align="center"><strong>Management</strong></p>
    </td>
  </tr>
</table>

---

## ✨ Features

### 🔐 Authentication & Authorization
- ✅ Secure JWT-based authentication with HTTP-only cookies
- ✅ Email verification with OTP system
- ✅ Role-based access control (Admin/User)
- ✅ Password reset functionality
- ✅ Rate limiting & brute force protection

### 📡 Log Collection & Processing
- ✅ **UDP Syslog server** (RFC 3164/5424 compliant) - Development mode
- ✅ HTTP REST API for log ingestion
- ✅ Real-time log normalization and categorization
- ✅ Multi-tenant support
- ✅ Fallback file storage for resilience

### 🔍 Log Analysis & Search
- ✅ Advanced filtering (severity, source, tenant, time range)
- ✅ Full-text search capabilities
- ✅ Log aggregation and statistics
- ✅ Real-time log streaming

### 🚨 Alerting System
- ✅ Custom alert rule creation with multiple triggers
- ✅ Email notifications via Resend
- ✅ Alert history and audit trail
- ✅ Severity-based, keyword, and pattern detection

### 👥 User Management
- ✅ User registration and profile management
- ✅ Admin dashboard for user administration
- ✅ Role Base Access Control
- ✅ Account status management

### 🎨 Modern UI/UX
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Intuitive navigation with React Router
- ✅ Real-time updates
- ✅ Loading states and comprehensive error handling

### 🔒 Security & Performance
- ✅ Helmet.js security headers & CORS protection
- ✅ Input validation & SQL injection prevention
- ✅ Redis-based job queue (BullMQ)
- ✅ Efficient database queries with Prisma ORM

---

## 🛠️ Tech Stack

### Frontend
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![React Router](https://img.shields.io/badge/React_Router-6.x-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)

### Backend
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5.x-FF6B6B?style=for-the-badge&logo=bull&logoColor=white)](https://docs.bullmq.io/)

### Database & Cache
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Neon](https://img.shields.io/badge/Neon-Serverless-00E699?style=for-the-badge&logo=neon&logoColor=white)](https://neon.tech/)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Redis Cloud](https://img.shields.io/badge/Redis_Cloud-Managed-FF4438?style=for-the-badge&logo=redis&logoColor=white)](https://redis.com/cloud/)

### Deployment & DevOps
[![Vercel](https://img.shields.io/badge/Vercel-Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Jest](https://img.shields.io/badge/Jest-Testing-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

### Additional Services
[![Resend](https://img.shields.io/badge/Resend-Email-000000?style=for-the-badge&logo=mail.ru&logoColor=white)](https://resend.com/)
[![ESLint](https://img.shields.io/badge/ESLint-Linting-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git
- Accounts on: [Neon](https://neon.tech), [Redis Cloud](https://redis.com), [Resend](https://resend.com)

### Local Development

```bash
# Clone the repository
git clone https://github.com/PhyoThanHtike/LogManagement.git
cd LogManagement

# Install dependencies
cd server && npm install
cd ../frontend && npm install

# Set up environment variables
# Copy .env.example to .env in both server and frontend folders
# Update with your credentials

# Run database migrations
cd server
npx prisma generate
npx prisma migrate dev

# Start development servers
# Terminal 1: Backend (HTTP + Syslog + OTP Worker)
cd server && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Visit `http://localhost:5173` to see the application.

**📖 For detailed setup instructions, see:**
- **Local Development**: [setup_appliance.md](./docs/setup_appliance.md)
- **Production Deployment**: [setup_saas.md](./docs/setup_saas.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [setup_appliance.md](./docs/setup_appliance.md) | Complete local development setup guide |
| [setup_saas.md](./docs/setup_saas.md) | Production deployment guide (Vercel + Render) |

---

## 🏗️ Project Structure

```
LogManagement/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── Appcomponents/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── api/             # API client (Axios)
│   ├── public/              # Static assets
│   ├── .env                 # Frontend environment variables
│   └── package.json
│
├── server/                   # Express backend application
│   ├── src/
│   │   ├── server.js        # HTTP server entry point
│   │   ├── syslog.js        # UDP syslog server
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic layer
│   │   ├── middleware/      # Express middleware
│   │   ├── jobs/            # Background jobs (BullMQ)
│   │   └── utils/           # Utility functions
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── tests/               # Jest test files
│   ├── .env                 # Backend environment variables
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD pipeline
│
├── docs/                     # Documentation and images
├── README.md                 # This file
├── SETUP_APPLIANCE.md        # Local development guide
└── SETUP_SAAS.md             # Production deployment guide
```

---

## 🧪 Testing

### Run Backend Tests

```bash
cd server
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.js
```

### Run Frontend Tests (if available)

```bash
cd frontend
npm test
```

---

## 📡 Testing Syslog Functionality

The application includes a UDP syslog server for receiving logs from network devices, firewalls, and applications.

### Send Test Logs

```bash
# Using logger (Linux/macOS)
logger -n localhost -P 5514 "Test log message"

# Using netcat
echo "<134>$(date '+%b %d %H:%M:%S') $(hostname) MyApp: Test message" | nc -u 127.0.0.1 5514

# Simulate firewall logs
echo "<134>$(date '+%b %d %H:%M:%S') firewall kernel: DROP SRC=192.168.1.100 DST=10.0.0.5" | nc -u 127.0.0.1 5514

# Simulate authentication logs
echo "<38>$(date '+%b %d %H:%M:%S') $(hostname) sshd: Failed password for admin" | nc -u 127.0.0.1 5514
```

**For more syslog examples, see [setup_appliance.md](./docs/setup_appliance.md)**

---

## 🌍 Deployment

### Production Deployment

The application is deployed using:
- **Frontend**: Vercel (CDN, automatic HTTPS, preview deployments)
- **Backend**: Render (managed Node.js hosting)
- **Database**: Neon (serverless PostgreSQL)
- **Cache/Queue**: Redis Cloud (managed Redis)

**🚀 Full deployment guide**: [setup_saas.md](./docs/setup_saas.md)

### Deployment Status

- ✅ Frontend: Deployed on Vercel
- ✅ Backend: Deployed on Render
- ✅ Database: PostgreSQL on Neon
- ✅ Redis: Managed on Redis Cloud
- ✅ CI/CD: Automated via GitHub Actions

---

## 🔐 Environment Variables

### Backend (`.env`)

```properties
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key

REDIS_URL=redis://default:password@host.redis-cloud.com:15082
REDIS_HOST=your-redis-host.redis-cloud.com
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
REDIS_PORT=15082
EMAIL_FROM=onboarding@resend.dev
BCRYPT_SALT_ROUNDS=12
SYSLOG_PORT=5514
```

### Frontend (`.env`)

```properties
VITE_BASE_URL=http://localhost:3000
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code passes all tests (`npm test`)
- Code follows ESLint rules (`npm run lint`)
- Commit messages are descriptive

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**Phyo Than Htike** - *Initial work* - [@PhyoThanHtike](https://github.com/PhyoThanHtike)

---

## 🙏 Acknowledgments

- React community for excellent documentation
- Express.js team for a robust framework
- Prisma for amazing database tooling
- Vercel and Render for reliable hosting
- All open-source contributors

---

## 📧 Contact

For questions, issues, or suggestions:

- **Email**: phyothanhtike.ethan@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/PhyoThanHtike/LogManagement/issues)

---