## QUICK START GUIDE

### 🚀 Getting Started in 5 Minutes

#### Step 1: Start a Local Server
```bash
cd "c:\Users\USER\Desktop\my final project\Patient Management System"

# Using Python 3
python -m http.server 8000

# OR using Node.js
npx http-server
```

#### Step 2: Open in Browser
```
http://localhost:8000/web_app/src/features/auth/pages/login.html
```

#### Step 3: Configure Backend
Edit `src/config/api.config.js`:
```javascript
BASE_URL: 'http://your-backend-url:port/api'
```

#### Step 4: Test Login
- Enter test credentials
- Should redirect to dashboard

---

### 📁 File Directory Tree

```
Patient Management System/
│
├── docs/                          (Documentation - DO NOT MODIFY)
│
└── web_app/                       (FRONTEND - NEW)
    ├── public/
    │
    ├── src/
    │   ├── config/
    │   │   └── api.config.js      (API endpoints)
    │   │
    │   ├── core/
    │   │   ├── constants/
    │   │   │   └── app.constants.js
    │   │   ├── theme/
    │   │   │   └── theme.config.js
    │   │   ├── errors/
    │   │   │   └── error-handler.js
    │   │   └── api/
    │   │
    │   ├── features/
    │   │   ├── auth/
    │   │   │   ├── pages/
    │   │   │   │   ├── login.html
    │   │   │   │   └── login.js
    │   │   │   ├── components/
    │   │   │   └── services/
    │   │   │       └── auth.service.js
    │   │   │
    │   │   ├── dashboard/
    │   │   │   ├── pages/
    │   │   │   │   ├── dashboard.html
    │   │   │   │   └── dashboard.js
    │   │   │   ├── components/
    │   │   │   └── services/
    │   │   │       └── dashboard.service.js
    │   │   │
    │   │   ├── patients/          (TEMPLATE - Create similar structure)
    │   │   ├── appointments/      (TEMPLATE - Create similar structure)
    │   │   ├── medical_records/   (TEMPLATE - Create similar structure)
    │   │   ├── users/             (Template)
    │   │   └── reports/           (Template)
    │   │
    │   ├── shared/
    │   │   └── components/
    │   │       ├── sidebar.html
    │   │       └── header.html
    │   │
    │   ├── services/
    │   │   └── api.service.js
    │   │
    │   ├── routes/
    │   │   └── auth-guard.js
    │   │
    │   ├── utils/
    │   │   ├── helpers.js
    │   │   └── component-loader.js
    │   │
    │   └── config/
    │       └── api.config.js
    │
    ├── assets/
    │   ├── styles/
    │   │   ├── app.css            (Global styles)
    │   │   ├── login.css          (Login page)
    │   │   └── dashboard.css      (Dashboard page)
    │   ├── images/
    │   ├── icons/
    │   └── fonts/
    │
    ├── FRONTEND_IMPLEMENTATION_GUIDE.md
    ├── package.json
    └── index.html
```

---

### 🔧 Configuration

#### api.config.js
```javascript
// Change this to your backend URL
BASE_URL: process.env.API_URL || 'http://localhost:8000/api'

// Add new endpoints here
ENDPOINTS: {
    // Example
    PATIENTS: {
        LIST: '/patients',
        CREATE: '/patients',
        GET: '/patients/:id'
    }
}
```

#### app.constants.js
Update with your data:
- User roles
- Appointment statuses
- Validation rules
- Feature toggles

#### theme.config.js
Customize:
- Colors
- Typography
- Spacing
- Shadows
- Breakpoints

---

### 📝 Creating New Pages

#### Template: Patient List Page

**File:** `src/features/patients/pages/patients-list.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Patients - PMS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../../assets/styles/app.css">
    <link rel="stylesheet" href="../../assets/styles/patients.css">
</head>
<body>
    <!-- Sidebar -->
    <aside class="app-sidebar" id="appSidebar"></aside>

    <!-- Main Content -->
    <main class="app-main">
        <!-- Header -->
        <header class="app-header" id="appHeader"></header>

        <!-- Page Content -->
        <div class="page-content">
            <div id="loadingContainer">Loading...</div>
            <div id="pageContent" class="d-none">
                <!-- Your content here -->
            </div>
        </div>
    </main>

    <!-- Scripts -->
    <script src="../../config/api.config.js"></script>
    <script src="../../core/constants/app.constants.js"></script>
    <script src="../../services/api.service.js"></script>
    <script src="../../utils/helpers.js"></script>
    <script src="../patients/services/patient.service.js"></script>
    <script src="../../routes/auth-guard.js"></script>
    <script src="patients-list.js"></script>
</body>
</html>
```

**File:** `src/features/patients/pages/patients-list.js`

```javascript
// Load components and initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await loadComponents();
    await loadPatients();
});

async function loadComponents() {
    // Load sidebar
    document.getElementById('appSidebar').innerHTML = 
        await fetch('/web_app/src/shared/components/sidebar.html').then(r => r.text());
    
    // Load header
    document.getElementById('appHeader').innerHTML =
        await fetch('/web_app/src/shared/components/header.html').then(r => r.text());
}

async function loadPatients() {
    const response = await apiService.GET('/patients');
    // Display patients...
}
```

**File:** `src/features/patients/services/patient.service.js`

```javascript
class PatientService {
    async getPatients() {
        return await apiService.GET('/patients');
    }
    
    async createPatient(data) {
        return await apiService.POST('/patients', data);
    }
    
    async updatePatient(id, data) {
        return await apiService.PUT(`/patients/${id}`, data);
    }
    
    async deletePatient(id) {
        return await apiService.DELETE(`/patients/${id}`);
    }
}

const patientService = new PatientService();
```

---

### 🎨 Styling Guide

#### Using CSS Variables
```css
/* All colors */
color: var(--primary-color);
background: var(--bg-light);

/* All spacing */
padding: var(--spacing-md);
margin-top: var(--spacing-lg);

/* All transitions */
transition: var(--transition);
```

#### Bootstrap Utility Classes
```html
<!-- Spacing -->
<div class="m-3 p-4">

<!-- Display -->
<div class="d-none d-md-block">

<!-- Justify content -->
<div class="d-flex justify-content-between">

<!-- Colors -->
<span class="text-primary">
<div class="bg-light">
```

---

### 🔐 Authentication Flow

```
1. User enters credentials on LOGIN page
   ↓
2. Login form validates input
   ↓
3. POST to /api/auth/login
   ↓
4. Backend validates and returns token
   ↓
5. Store token in localStorage
   ↓
6. Parse user data and store
   ↓
7. Redirect to DASHBOARD
   ↓
8. Auth Guard checks token on protected pages
   ↓
9. Include token in all API requests
```

---

### 📋 Checklist: Before Going Live

- [ ] Backend API implemented
- [ ] All endpoints tested with Postman
- [ ] CORS configured on backend
- [ ] Environment variables set
- [ ] API_CONFIG.BASE_URL updated
- [ ] SSL certificates installed
- [ ] Database created and seeded
- [ ] Error logging configured
- [ ] Rate limiting implemented
- [ ] Security headers added
- [ ] Mobile testing completed
- [ ] Browser compatibility tested

---

### 🆘 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Blank after login | Check console errors, verify API endpoint |
| Components not loading | Check file paths, ensure server running |
| CORS errors | Add CORS headers to backend |
| 401 Unauthorized | Check token, try logging out and in |
| Sidebar not showing | Refresh page, check mobile width |
| Styles not applying | Clear browser cache, hard refresh (Ctrl+Shift+R) |

---

### 📞 Need Help?

1. Check `FRONTEND_IMPLEMENTATION_GUIDE.md` for detailed docs
2. Review example pages (Login, Dashboard)
3. Check browser console for errors
4. Review network tab for API calls
5. Check localStorage for stored data

---

### 🚀 Next: Create Patient Module

Use the template above to create:
1. `src/features/patients/pages/patients-list.html`
2. `src/features/patients/pages/add-patient.html`
3. `src/features/patients/pages/edit-patient.html`
4. `src/features/patients/services/patient.service.js`
5. `src/assets/styles/patients.css`

Follow the same pattern for:
- Appointments
- Medical Records
- User Management
- Reports

---

**Status:** ✅ Foundation Complete | Ready for API Integration

**Estimated Time to Add New Module:** 1-2 hours per module

**Total Modules Remaining:** 5 (Patients, Appointments, Medical Records, Users, Reports)

