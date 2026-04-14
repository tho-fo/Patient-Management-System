# **Folder Structure Documentation**

## **Project: Patient Management System**

---

# **1\. Document Overview**

This document defines the folder structure for the Patient Management System across all platforms:

* Web/Desktop Application  
* Backend API  
* Shared resources

The goal is to ensure:

* clean separation of concerns  
* scalability as system modules grow (billing, lab integration, etc.)  
* consistency across development  
* maintainability for long-term hospital use

---

# **2\. Architecture Approach**

We are using a **feature-first \+ layered hybrid structure**.

## **Why this approach?**

Because:

* Pure layered → becomes difficult to manage as system grows  
* Pure feature-based → leads to duplication  
* Hybrid → balances modularity and reuse

## **Structure Philosophy**

Each feature contains:

* UI (pages/forms)  
* logic (controllers/services)  
* models (database representation)

Global/shared code remains centralized.

---

# **3\. Root Project Structure**

patient-management-system/  
│  
├── web\_app/  
├── backend/  
├── docs/  
├── shared/  
├── scripts/  
├── .env  
├── README.md  
---

# **4\. Web/Desktop Application (Frontend)**

(Using HTML, Bootstrap, JavaScript or React)

web\_app/  
│  
├── public/  
├── src/  
│   ├── core/  
│   ├── features/  
│   ├── shared/  
│   ├── services/  
│   ├── routes/  
│   ├── utils/  
│   ├── config/  
│   └── main.js  
│  
├── assets/  
│   ├── images/  
│   ├── icons/  
│   └── styles/  
│  
├── package.json  
└── index.html  
---

## **4.1 src/core/**

Global application logic.

core/  
├── constants/  
├── theme/  
├── errors/  
├── api/  
└── base/

Contains:

* system constants  
* UI themes  
* API configuration  
* base classes

---

## **4.2 src/features/**

Main system modules (VERY IMPORTANT)

features/  
├── auth/  
├── dashboard/  
├── patients/  
├── appointments/  
├── medical\_records/  
├── users/  
├── reports/  
├── billing/        (future)  
├── laboratory/     (future)  
---

### **Example: patients feature**

patients/  
├── pages/  
├── components/  
├── services/  
├── models/  
├── controllers/  
└── patient\_routes.js  
