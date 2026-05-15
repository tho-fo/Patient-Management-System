# **Folder Structure Documentation**

## **Project: Patient Management System**

---

# **1. Document Overview**

This document defines the recommended folder structure for the Patient Management System when using Firebase for authentication, backend services, and database management.

The structure is intended to support:

* the web application
* Firebase configuration and rules
* optional Cloud Functions
* long-term maintainability

---

# **2. Architecture Approach**

We are using a **feature-first + service-layer hybrid structure**.

## **Why this approach?**

Because:

* Pure layered structure becomes difficult to manage as the system grows
* Pure feature-based structure can lead to duplication
* A hybrid structure balances modularity and reuse

## **Structure Philosophy**

Each feature contains:

* UI (pages/forms/components)
* logic (services and validators)
* models (data representation)

Firebase-specific integration code remains centralized.

---

# **3. Root Project Structure**

```text
patient-management-system/
|
|-- docs/
|-- web_app/
|-- firebase.json              (planned when Firebase is configured)
|-- .firebaserc                (planned environment aliases)
|-- firestore.rules            (planned Firestore access rules)
|-- firestore.indexes.json     (planned Firestore indexes)
`-- functions/                 (optional Cloud Functions backend)
```

### **Notes**

* `docs/` stores all analysis, planning, and architecture documents
* `web_app/` stores the frontend application
* Root Firebase files are added once the Firebase project is initialized
* `functions/` is optional and is used when backend logic is implemented with Cloud Functions

---

# **4. Web Application Structure**

```text
web_app/
|
|-- assets/
|   |-- icons/
|   |-- images/
|   `-- styles/
|-- public/
|-- src/
|   |-- config/
|   |-- core/
|   |-- features/
|   |-- routes/
|   |-- services/
|   |-- shared/
|   |-- utils/
|   `-- main.js
`-- index.html
```

---

## **4.1 src/config/**

Stores project configuration files.

Recommended contents:

* `appConfig.js`
* `firebaseConfig.js`
* environment-specific settings

---

## **4.2 src/core/**

Stores global application logic.

```text
core/
|-- api/
|-- base/
|-- constants/
|-- errors/
`-- theme/
```

Contains:

* system constants
* UI themes
* shared abstractions for API/data access
* base classes and reusable utilities

---

## **4.3 src/services/**

Stores reusable service integrations and data access helpers.

Recommended Firebase-oriented structure:

```text
services/
|-- auth/
|-- firestore/
|-- functions/
`-- firebase/
```

Contains:

* Firebase Authentication wrappers
* Firestore queries and document helpers
* Cloud Function callers
* shared Firebase initialization logic

---

## **4.4 src/features/**

Stores the main application modules.

```text
features/
|-- auth/
|-- dashboard/
|-- patients/
|-- appointments/
|-- medicalRecords/
|-- users/
|-- reports/
`-- settings/
```

Each feature should own its UI, validation, and feature-specific services.

---

## **4.5 Example: patients feature**

```text
patients/
|-- pages/
|-- components/
|-- services/
|-- models/
`-- patient_routes.js
```

Suggested responsibilities:

* `pages/` -> route-level screens
* `components/` -> reusable patient UI pieces
* `services/` -> patient-specific Firestore actions
* `models/` -> patient data shapes and mapping helpers

---

## **4.6 src/shared/**

Stores code shared across features.

```text
shared/
|-- components/
|-- layouts/
`-- state/
```

Use this area for:

* common UI components
* shared page layouts
* global state and session helpers

---

## **4.7 src/routes/** and **src/utils/**

* `routes/` stores routing definitions and guards
* `utils/` stores formatters, validators, and small reusable helpers

---

# **5. Firebase-Specific Files**

When Firebase is fully configured, the project may include:

* `firebase.json` -> deployment configuration
* `.firebaserc` -> Firebase project aliases
* `firestore.rules` -> access control rules
* `firestore.indexes.json` -> Firestore index definitions
* `functions/` -> Cloud Functions source code

---

# **6. Design Notes**

* Authentication should be handled through Firebase Authentication
* Backend workflows should be handled through Cloud Functions when server-side logic is required
* Persistent application data should be stored in Cloud Firestore
* Security rules should be versioned alongside the project
* Firebase integration code should stay centralized to avoid duplication
