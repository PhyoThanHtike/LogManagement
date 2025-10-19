# 🖥️ Local Development Setup Guide

Complete guide for setting up and running the Log Management application on your local machine.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing Syslog Functionality](#testing-syslog-functionality)
- [Development Workflow](#development-workflow)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Software

- **Node.js**: Version 18.x or higher
  ```bash
  node --version  # Should be v18.x.x or higher
  ```
  Download: [https://nodejs.org](https://nodejs.org)

- **npm**: Version 9.x or higher (comes with Node.js)
  ```bash
  npm --version  # Should be v9.x.x or higher
  ```

- **Git**: Latest version
  ```bash
  git --version
  ```
  Download: [https://git-scm.com](https://git-scm.com)

### Optional (But Recommended)

- **VS Code**: [https://code.visualstudio.com](https://code.visualstudio.com)
- **Postman**: For API testing [https://postman.com](https://postman.com)
- **TablePlus** or **pgAdmin**: For database visualization
- **Redis Insight**: For Redis visualization (optional)

---

## 💻 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4 GB | 8 GB or more |
| Disk Space | 2 GB free | 5 GB free |
| OS | Windows 10, macOS 10.15, Ubuntu 20.04 | Latest version |
| Internet | Required for initial setup | - |

---

## 📦 Installation

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/PhyoThanHtike/LogManagement.git

# OR clone via SSH (if you have SSH keys set up)
git clone git@github.com:PhyoThanHtike/LogManagement.git

# Navigate to project directory
cd LogManagement
```

### Step 2: Verify Project Structure

```bash
# List project structure
ls -la

# You should see:
# - frontend/    (React application)
# - server/      (Express backend)
# - .github/     (CI/CD workflows)
# - README.md
# - docs/
```

### Step 3: Install Backend Dependencies

```bash
# Navigate to server directory
cd server

# Install all dependencies
npm install

# This will install:
# - Express, Prisma, JWT, bcrypt
# - Redis, BullMQ
# - And all other backend dependencies
```

**Expected output:**
```
added 245 packages, and audited 246 packages in 15s
```

### Step 4: Install Frontend Dependencies

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install all dependencies
npm install

# This will install:
# - React, React Router
# - Vite, Tailwind CSS
# - Axios and other frontend libraries
```

**Expected output:**
```
added 312 packages, and audited 313 packages in 18s
```

---

## ⚙️ Configuration

### Step 1: Set Up External Services

You'll need accounts for these services (all have free tiers):

#### A. PostgreSQL Database (Neon)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create new project: `log-management-local`
4. Copy the connection string

#### B. Redis (Redis Cloud)

1. Go to [redis.com](https://redis.com/try-free/)
2. Sign up for free account
3. Create new database
4. Copy connection details (host, port, password)

#### C. Email Service (Resend)

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Create API key
4. Verify your email domain (or use `onboarding@resend.dev` for testing)

### Step 2: Configure Backend Environment

Create `server/.env` file:

```bash
cd server
touch .env
```

Add the following configuration:

```properties
# ==========================================
# DATABASE CONFIGURATION
# ==========================================
DATABASE_URL="postgresql://username:password@host.neon.tech/database?sslmode=require"

# ==========================================
# SERVER CONFIGURATION
# ==========================================
PORT=3000
NODE_ENV=development

# ==========================================
# JWT AUTHENTICATION
# ==========================================
# Generate a strong secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# ==========================================
# REDIS CONFIGURATION
# ==========================================
REDIS_URL=redis://default:password@host.redis-cloud.com:15082
REDIS_HOST=your-redis-host.redis-cloud.com
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
REDIS_PORT=15082

# ==========================================
# EMAIL CONFIGURATION (Resend)
# ==========================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev

# ==========================================
# SECURITY
# ==========================================
BCRYPT_SALT_ROUNDS=12

# ==========================================
# SYSLOG SERVER (Local Development)
# ==========================================
SYSLOG_PORT=5514
# Note: Use ports >= 1024 for non-root users
# Port 514 is the standard syslog port but requires root
```

### Step 3: Configure Frontend Environment

Create `frontend/.env` file:

```bash
cd ../frontend
touch .env
```

Add the following configuration:

```properties
# ==========================================
# API CONFIGURATION
# ==========================================
VITE_BASE_URL=http://localhost:3000

# ==========================================
# DEVELOPMENT SETTINGS (Optional)
# ==========================================
# VITE_API_TIMEOUT=30000
# VITE_ENABLE_MOCK_API=false
```

### Step 4: Initialize Database

```bash
cd ../server

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npm run seed
```

**Expected output:**
```
✓ Generated Prisma Client
✓ Applied 5 migrations
✓ Database seeded successfully
```

---

## 🚀 Running the Application

### Method 1: Run All Services Together (Recommended)

This starts the HTTP server, Syslog server, and OTP worker simultaneously.

```bash
# From the server directory
cd server
npm run dev
```

**You should see:**
```
[HTTP] ✅ Server running on port 3000 in development mode
[SYSLOG] ✅ Syslog server listening on 0.0.0.0:5514
[OTP] ✅ OTP Worker started and listening for jobs
```

**In a new terminal**, start the frontend:

```bash
# From the frontend directory
cd frontend
npm run dev
```

**You should see:**
```
  VITE v5.0.0  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Method 2: Run Services Individually

If you want more control, run each service in a separate terminal:

**Terminal 1 - HTTP Server:**
```bash
cd server
npm run start:http
```

**Terminal 2 - Syslog Server:**
```bash
cd server
npm run start:syslog
```

**Terminal 3 - OTP Worker:**
```bash
cd server
npm run otp
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
```

### Accessing the Application

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- **Syslog Server**: `localhost:5514` (UDP)

---

## 📡 Testing Syslog Functionality

The application includes a UDP syslog server that listens on port 5514 (configurable via `SYSLOG_PORT`).

### Understanding Syslog Format

Syslog messages follow RFC 3164 or RFC 5424 format:

```
<PRI>TIMESTAMP HOSTNAME TAG: MESSAGE
```

- **PRI**: Priority = (Facility × 8) + Severity
- **TIMESTAMP**: When the event occurred
- **HOSTNAME**: Source machine
- **TAG**: Application/process name
- **MESSAGE**: Actual log content

### Method 1: Using `logger` Command (Linux/macOS)

The `logger` utility is built into most Unix systems:

```bash
# Basic syslog message
logger -n localhost -P 5514 "Test log message from terminal"

# With priority (info level)
logger -n localhost -P 5514 -p user.info "User login successful"

# With priority (warning level)
logger -n localhost -P 5514 -p user.warning "Disk space running low"

# With priority (error level)
logger -n localhost -P 5514 -p user.error "Failed to connect to database"

# With custom tag
logger -n localhost -P 5514 -t MyApp "Application started successfully"
```

### Method 2: Using `netcat` (nc)

```bash

# Send firewall log
echo "<134>fw01 vendor=demo product=ngfw src=10.0.1.10 dst=8.8.8.8 spt=5353 dpt=53 severity=8 proto=udp msg='DNS blocked action=DENY" | nc -u localhost 5514

# Send network log
echo "<190>Aug 20 13:01:02 r1 if=ge-0/0/1 event=link-down src=10.0.1.10 mac=aa:bb:cc:dd:ee:ff reason=carrier-loss action=BLOCK" | nc -u localhost 5514
```

### Verify Logs in the Application

After sending syslog messages:

1. **Check Server Console**: You should see output like:
   ```
   📥 Syslog from 127.0.0.1:54321 — <134>Oct 19 01:23:45 hostname MyApp: Test message
   ```

2. **Check Database**: Logs are stored in the database
   ```bash
   cd server
   npx prisma studio
   ```
   Navigate to the `Log` table to see received messages.

3. **Check Fallback Logs**: If database write fails, logs are written to:
   ```bash
   cat server/logs/syslog_fallback.log
   ```

4. **Check via API**: Query logs through the API
   ```bash
   curl http://localhost:3000/api/admin/logs
   ```

---

## 🛠️ Development Workflow

### Daily Development Routine

1. **Start the application**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

2. **Make changes to code**
   - Both frontend and backend support hot-reload
   - Changes are reflected immediately

3. **Test your changes**
   ```bash
   # Run backend tests
   cd server && npm test
   
   # Run specific test file
   npm test -- auth.test.js
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin main
   ```

### Code Structure

```
server/src/
├── server.js              # HTTP server entry point
├── syslog.js             # UDP syslog server
├── routes/               # API route handlers
│   ├── auth.route.js
│   ├── admin.route.js
│   └── user.route.js
├── services/             # Business logic
│   ├── logService.js
│   ├── alertService.js
│   └── emailService.js
├── middleware/           # Express middleware
│   ├── auth.js
│   └── rate-limiter.js
├── jobs/                 # Background jobs
│   └── worker/
│       └── otpWorker.js
└── utils/               # Helper functions
    ├── database.js
    └── normalizeService.js

frontend/src/
├── main.tsx             # Entry point
├── App.tsx              # Root component
├── Appcomponents/          # React components
│   ├── auth/
│   ├── dashboard/
│   └── common/
├── pages/               # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── Logs.tsx
├── hooks/               # Custom React hooks
├── utils/               # Helper functions
└── api/                 # API client
    └── axiosInstance.ts
```

---

## 🗄️ Database Management

### Using Prisma Studio

Prisma Studio provides a visual interface for your database:

```bash
cd server
npx prisma studio
```

Opens at: [http://localhost:5555](http://localhost:5555)

### Common Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name add_user_role

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Format schema file
npx prisma format

# View migration status
npx prisma migrate status
```

### Seed Database

```bash
# Run seed script
npm run seed

# This creates:
# - Sample admin user
# - Sample regular users
# - Sample log entries
# - Sample alert rules
```

Default admin credentials (if using seed):
- Email: `admin@gmail.com`
- Password: `12345678`

---

## 📝 Useful Commands

### npm Scripts

#### Backend (`server/package.json`)
```bash
npm run dev          # Start all services (HTTP + Syslog + OTP)
npm run start:http   # Start HTTP server only
npm run start:syslog # Start syslog server only
npm run otp          # Start OTP worker only
npm test             # Run tests
npm run seed         # Seed database
```

#### Frontend (`frontend/package.json`)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Git Commands

```bash
# Check status
git status

# Create new branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

## 🎯 Next Steps

Now that your local environment is set up:

1. **Explore the codebase**: Understand the project structure
2. **Create a test account**: Sign up through the UI
3. **Test syslog functionality**: Send test logs using the examples above
4. **Make your first change**: Try modifying a component
5. **Run tests**: Ensure everything works
6. **Read the production deployment guide**: [setup_saas.md](./setup_saas.md)

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vite Documentation](https://vitejs.dev/)
- [RFC 3164 - Syslog Protocol](https://tools.ietf.org/html/rfc3164)
- [RFC 5424 - Syslog Protocol](https://tools.ietf.org/html/rfc5424)

---

## 🤝 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review server logs for errors
3. Check browser console for frontend errors
4. Open an issue on GitHub
5. Ask in the project discussions

---

**Happy Coding! 🚀**