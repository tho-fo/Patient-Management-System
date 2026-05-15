# **Development Roadmap Checklist**

## **Patient Management System**

---

## **Purpose**

This document provides a systematic development checklist for building the Patient Management System from the beginning to completion. It is organized by phases so each module can be planned, implemented, tested, and integrated in a controlled order.

Use this document as a working todo list during development.

---

# **Phase 1: Project Preparation**

## **1.1 Confirm Project Requirements**

- [ ] Review the project proposal and system objectives
- [ ] Review the Software Requirements Specification
- [ ] Identify all user roles:
  - [ ] Admin
  - [ ] Doctor
  - [ ] Receptionist
  - [ ] Patient
- [ ] Confirm the main system modules:
  - [ ] Authentication
  - [ ] User / Staff Management
  - [ ] Patient Management
  - [ ] Appointment Management
  - [ ] Medical Records
  - [ ] Dashboard and Reports
  - [ ] Settings
  - [ ] Audit and Logging
- [ ] Separate current features from future features:
  - [ ] Billing
  - [ ] Laboratory integration
  - [ ] Notifications

## **1.2 Set Up Development Environment**

- [ ] Create or confirm the project folder structure
- [ ] Set up the web application folder
- [ ] Set up Firebase project
- [ ] Enable Firebase Authentication
- [ ] Enable Cloud Firestore
- [ ] Configure Firebase SDK in the frontend
- [ ] Confirm the app can load successfully in the browser
- [ ] Confirm routing works between pages
- [ ] Confirm shared styles and layout components are available

## **1.3 Define Coding Standards**

- [ ] Use camelCase for Firestore document fields
- [ ] Use consistent collection names
- [ ] Use consistent role names
- [ ] Keep each module inside its own feature folder
- [ ] Keep service logic separate from page rendering logic
- [ ] Use validation before saving data
- [ ] Use shared utilities for repeated formatting and form behavior
- [ ] Avoid duplicate field names such as `dateOfBirth` and `dateOfBirth`

---

# **Phase 2: Database and Data Model Design**

## **2.1 Define Firestore Collections**

- [ ] Define `admins` collection
- [ ] Define `doctors` collection
- [ ] Define `receptionists` collection
- [ ] Define `patients` collection
- [ ] Define `appointments` collection
- [ ] Define `medicalRecords` collection
- [ ] Define future collections if needed:
  - [ ] `billing`
  - [ ] `labResults`
  - [ ] `notifications`
  - [ ] `auditLogs`

## **2.2 Define Core Fields**

- [ ] Define admin fields
- [ ] Define doctor fields
- [ ] Define receptionist fields
- [ ] Define patient fields
- [ ] Define appointment fields
- [ ] Define medical record fields
- [ ] Use camelCase field names consistently
- [ ] Decide which fields are required
- [ ] Decide which fields are optional
- [ ] Define timestamp fields such as `createdAt` and `updatedAt`

## **2.3 Define Relationships**

- [ ] Link users to Firebase Authentication using `authUid`
- [ ] Link appointments to patients using `patientId`
- [ ] Link appointments to doctors using `doctorId`
- [ ] Link medical records to patients using `patientId`
- [ ] Link medical records to doctors using `doctorId`
- [ ] Confirm that all referenced records exist before saving related data

## **2.4 Plan Firestore Indexes**

- [ ] Plan index for patient search
- [ ] Plan index for doctor specialization
- [ ] Plan appointment index by doctor and date
- [ ] Plan appointment index by patient and date
- [ ] Plan medical record index by patient and record date
- [ ] Plan report-related indexes

---

# **Phase 3: Application Foundation**

## **3.1 Build Core Application Structure**

- [ ] Create main HTML entry point
- [ ] Create main JavaScript entry point
- [ ] Create route configuration
- [ ] Create role constants
- [ ] Create app configuration
- [ ] Create reusable layout shell
- [ ] Create sidebar component
- [ ] Create header component
- [ ] Create shared UI components
- [ ] Create shared form utilities
- [ ] Create shared formatter utilities
- [ ] Create shared validator utilities

## **3.2 Build State and Session Handling**

- [ ] Create session store
- [ ] Save authenticated user session
- [ ] Restore session on page reload
- [ ] Clear session on logout
- [ ] Store flash messages
- [ ] Show success and error messages consistently

## **3.3 Build Route Protection**

- [ ] Define public routes
- [ ] Define protected routes
- [ ] Redirect unauthenticated users to login
- [ ] Restrict pages by role
- [ ] Show helpful errors for unauthorized access
- [ ] Test each role against allowed routes

---

# **Phase 4: Authentication Module**

## **4.1 Login**

- [ ] Create login page
- [ ] Add email field
- [ ] Add password field
- [ ] Validate required fields
- [ ] Authenticate with Firebase Authentication
- [ ] Resolve user role from Firestore
- [ ] Store authenticated session
- [ ] Redirect user to dashboard
- [ ] Display login errors clearly

## **4.2 Logout**

- [ ] Add logout action
- [ ] Sign out from Firebase Authentication
- [ ] Clear local session
- [ ] Redirect to login page
- [ ] Confirm protected pages are inaccessible after logout

## **4.3 Registration**

- [ ] Create patient registration page
- [ ] Create doctor registration page if needed
- [ ] Validate registration steps
- [ ] Create Firebase Authentication account
- [ ] Create related Firestore profile document
- [ ] Store profile fields using camelCase
- [ ] Confirm registration redirects correctly
- [ ] Confirm duplicate or invalid email errors are handled

## **4.4 Role Resolution**

- [ ] Check patients collection for patient account
- [ ] Check doctors collection for doctor account
- [ ] Check admins collection for admin account
- [ ] Check receptionists collection for receptionist account
- [ ] Return consistent session user object
- [ ] Handle missing profile records safely

---

# **Phase 5: User / Staff Management Module**

## **5.1 Staff Listing**

- [ ] Create staff list page
- [ ] Fetch admins, doctors, and receptionists
- [ ] Display staff name, role, email, phone, and specialization
- [ ] Add search or filtering if needed
- [ ] Add edit action
- [ ] Add delete action

## **5.2 Staff Creation**

- [ ] Create staff form page
- [ ] Add fields for name, role, email, phone, password, and specialization
- [ ] Validate required fields
- [ ] Create Firebase Auth account if required
- [ ] Create Firestore staff profile
- [ ] Prevent duplicate email accounts
- [ ] Confirm role-specific fields are saved correctly

## **5.3 Staff Update**

- [ ] Load existing staff data
- [ ] Allow allowed fields to be edited
- [ ] Validate updated data
- [ ] Update Firestore profile
- [ ] Keep role changes controlled
- [ ] Confirm old fields are not duplicated

## **5.4 Staff Deactivation or Deletion**

- [ ] Decide whether staff should be deleted or deactivated
- [ ] Prevent deleting the last admin
- [ ] Prevent deleting doctors linked to appointments or medical records
- [ ] Confirm delete/deactivate action with the user
- [ ] Record audit log if audit module is available

---

# **Phase 6: Patient Management Module**

## **6.1 Patient Listing**

- [ ] Create patient list page
- [ ] Fetch patients from Firestore
- [ ] Display name, gender, age, phone, email, and registration date
- [ ] Add search by name, phone, email, or patient ID
- [ ] Add filters such as gender or registration date
- [ ] Add view details action
- [ ] Add edit action
- [ ] Add delete action where allowed

## **6.2 Patient Creation**

- [ ] Create patient form page
- [ ] Add patient demographic fields
- [ ] Add contact fields
- [ ] Add optional medical background fields
- [ ] Validate required fields
- [ ] Calculate age from `dateOfBirth`
- [ ] Save patient using camelCase fields
- [ ] Store `createdAt`
- [ ] Confirm patient appears in the list after saving

## **6.3 Patient Update**

- [ ] Load existing patient record
- [ ] Populate form fields correctly
- [ ] Allow allowed fields to be edited
- [ ] Recalculate age when date of birth changes
- [ ] Save updates using camelCase fields
- [ ] Store `updatedAt`
- [ ] Remove or avoid old snake_case duplicate fields
- [ ] Confirm updated values show on profile and list pages

## **6.4 Patient Details**

- [ ] Create patient details page
- [ ] Show demographic information
- [ ] Show contact information
- [ ] Show appointment history
- [ ] Show medical record history
- [ ] Show role-appropriate actions
- [ ] Restrict access for unauthorized roles

## **6.5 Patient Deletion or Archiving**

- [ ] Decide whether patient records are deleted or archived
- [ ] Prevent deletion if medical history exists
- [ ] Confirm delete/archive action
- [ ] Remove or archive related appointments if allowed
- [ ] Record audit log if audit module is available

---

# **Phase 7: Appointment Module**

## **7.1 Appointment Booking**

- [ ] Create appointment booking page
- [ ] Load patient list
- [ ] Load doctor list
- [ ] Add date field
- [ ] Add time field
- [ ] Add status field
- [ ] Validate required fields
- [ ] Prevent double-booking a doctor at the same date and time
- [ ] Save appointment to Firestore
- [ ] Confirm appointment appears in appointment list

## **7.2 Appointment Listing**

- [ ] Create appointment list page
- [ ] Display patient name
- [ ] Display doctor name
- [ ] Display appointment date and time
- [ ] Display appointment status
- [ ] Add filters by date, doctor, patient, and status
- [ ] Add edit action
- [ ] Add status update action

## **7.3 Appointment Update**

- [ ] Load selected appointment
- [ ] Allow date and time changes
- [ ] Allow doctor reassignment if permitted
- [ ] Validate availability again before saving
- [ ] Update status when appointment is completed or cancelled
- [ ] Confirm updated appointment appears correctly

## **7.4 Role-Based Appointment Behavior**

- [ ] Patient can book their own appointment
- [ ] Receptionist can book appointments for patients
- [ ] Doctor can view assigned appointments
- [ ] Admin can view appointment reports
- [ ] Unauthorized roles cannot modify restricted appointments

---

# **Phase 8: Medical Records Module**

## **8.1 Medical Record Creation**

- [ ] Create medical record entry page
- [ ] Load patient list
- [ ] Load doctor list
- [ ] Auto-select current doctor when doctor is logged in
- [ ] Add diagnosis field
- [ ] Add treatment field
- [ ] Add prescription field if required
- [ ] Validate required fields
- [ ] Save record to Firestore
- [ ] Store `recordDate` or `createdAt`

## **8.2 Patient Medical History**

- [ ] Create patient history page
- [ ] Fetch records by patient
- [ ] Display diagnosis
- [ ] Display treatment
- [ ] Display doctor name
- [ ] Display record date
- [ ] Sort records by newest first
- [ ] Restrict access based on role

## **8.3 Medical Record Update**

- [ ] Allow doctors to edit allowed records
- [ ] Validate updated diagnosis and treatment
- [ ] Store `updatedAt`
- [ ] Preserve original creator information
- [ ] Prevent unauthorized editing
- [ ] Confirm changes appear in patient history

---

# **Phase 9: Dashboard and Reporting Module**

## **9.1 Dashboard Summary**

- [ ] Count total patients
- [ ] Count total doctors
- [ ] Count total appointments
- [ ] Count today's appointments
- [ ] Count pending appointments
- [ ] Show recent patients
- [ ] Show latest appointments
- [ ] Adjust dashboard content by role

## **9.2 Reports**

- [ ] Create reports page
- [ ] Add filters by date range
- [ ] Add filters by appointment status
- [ ] Generate appointment summary
- [ ] Generate patient growth summary
- [ ] Generate doctor workload summary
- [ ] Display results in tables or charts
- [ ] Restrict reports to admin or authorized users

## **9.3 Data Accuracy**

- [ ] Confirm reports use current Firestore data
- [ ] Confirm cancelled appointments are counted correctly
- [ ] Confirm date filters work correctly
- [ ] Confirm totals match list pages

---

# **Phase 10: Settings and Profile Module**

## **10.1 Profile View**

- [ ] Create profile page
- [ ] Show current user information
- [ ] Show role label
- [ ] Show role-specific profile fields
- [ ] Show useful role-based actions
- [ ] Confirm profile loads from Firebase-linked Firestore document

## **10.2 Profile Update**

- [ ] Create settings page
- [ ] Load current profile data
- [ ] Allow safe profile fields to be edited
- [ ] Validate updated fields
- [ ] Save updates using camelCase fields
- [ ] Prevent duplicate snake_case fields from being created
- [ ] Refresh session user after update

## **10.3 Password Update**

- [ ] Add current password field
- [ ] Add new password field
- [ ] Add confirm password field
- [ ] Validate password fields
- [ ] Re-authenticate user if required
- [ ] Update password in Firebase Authentication
- [ ] Show success or error message

---

# **Phase 11: Audit and Logging Module**

## **11.1 Define Audit Events**

- [ ] Login success
- [ ] Login failure
- [ ] Logout
- [ ] Patient created
- [ ] Patient updated
- [ ] Patient deleted or archived
- [ ] Staff created
- [ ] Staff updated
- [ ] Staff deleted or deactivated
- [ ] Appointment created
- [ ] Appointment updated
- [ ] Medical record created
- [ ] Medical record updated

## **11.2 Store Audit Logs**

- [ ] Create `auditLogs` collection
- [ ] Store actor user ID
- [ ] Store actor role
- [ ] Store action name
- [ ] Store affected collection
- [ ] Store affected document ID
- [ ] Store timestamp
- [ ] Store minimal details about the change

## **11.3 Review Audit Logs**

- [ ] Create admin-only audit log page if required
- [ ] Add filters by user, action, and date
- [ ] Prevent unauthorized access to logs

---

# **Phase 12: Security and Access Control**

## **12.1 Frontend Access Control**

- [ ] Hide unauthorized navigation links
- [ ] Protect restricted routes
- [ ] Disable restricted actions in the UI
- [ ] Show clear unauthorized messages

## **12.2 Firestore Security Rules**

- [ ] Write rules for authenticated users
- [ ] Write rules for admin access
- [ ] Write rules for doctor access
- [ ] Write rules for receptionist access
- [ ] Write rules for patient access
- [ ] Prevent patients from reading other patients' private records
- [ ] Prevent unauthorized medical record edits
- [ ] Test security rules with each role

## **12.3 Data Validation and Integrity**

- [ ] Validate required fields before writes
- [ ] Validate referenced patient and doctor IDs
- [ ] Validate appointment status values
- [ ] Validate date and time fields
- [ ] Prevent duplicate appointment slots
- [ ] Keep field naming consistent

---

# **Phase 13: Integration Testing**

## **13.1 Authentication Tests**

- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test logout
- [ ] Test route protection
- [ ] Test role-based redirects

## **13.2 Patient Workflow Tests**

- [ ] Register patient
- [ ] View patient list
- [ ] Search patient
- [ ] Edit patient
- [ ] View patient details
- [ ] Confirm no duplicate snake_case fields are created

## **13.3 Appointment Workflow Tests**

- [ ] Book appointment as patient
- [ ] Book appointment as receptionist
- [ ] View appointment list
- [ ] Filter appointments
- [ ] Update appointment status
- [ ] Test double-booking prevention

## **13.4 Medical Record Workflow Tests**

- [ ] Create medical record as doctor
- [ ] View patient history
- [ ] Edit medical record where allowed
- [ ] Confirm patient can only view permitted records

## **13.5 Reporting Tests**

- [ ] Confirm dashboard totals
- [ ] Confirm report filters
- [ ] Confirm chart or table values
- [ ] Confirm role restrictions

---

# **Phase 14: User Interface Review**

## **14.1 Layout Review**

- [ ] Check desktop layout
- [ ] Check tablet layout
- [ ] Check mobile layout
- [ ] Check sidebar behavior
- [ ] Check forms fit properly
- [ ] Check tables are readable

## **14.2 Form Review**

- [ ] Confirm labels are clear
- [ ] Confirm required fields are marked or validated
- [ ] Confirm error messages appear near fields
- [ ] Confirm success messages appear after actions
- [ ] Confirm buttons show loading states

## **14.3 Accessibility Review**

- [ ] Use semantic headings
- [ ] Use labels for form inputs
- [ ] Confirm keyboard navigation works
- [ ] Confirm color contrast is readable
- [ ] Confirm disabled states are understandable

---

# **Phase 15: Documentation**

## **15.1 Technical Documentation**

- [ ] Update database schema document
- [ ] Update module documentation
- [ ] Update system architecture document
- [ ] Update folder structure document
- [ ] Document Firebase configuration
- [ ] Document Firestore security rules

## **15.2 User Documentation**

- [ ] Write admin usage guide
- [ ] Write doctor usage guide
- [ ] Write receptionist usage guide
- [ ] Write patient usage guide
- [ ] Add screenshots if required

## **15.3 Final Project Documentation**

- [ ] Update SRS if requirements changed
- [ ] Update use case model if workflows changed
- [ ] Update UML diagrams if classes or flows changed
- [ ] Update ERD if collections or fields changed
- [ ] Add implementation screenshots
- [ ] Add testing evidence
- [ ] Add limitations and future improvements

---

# **Phase 16: Deployment Preparation**

## **16.1 Pre-Deployment Checks**

- [ ] Remove unused mock data if production Firebase is used
- [ ] Confirm Firebase configuration is correct
- [ ] Confirm all required Firestore indexes are created
- [ ] Confirm Firestore rules are deployed
- [ ] Confirm Authentication providers are enabled
- [ ] Confirm environment-specific settings

## **16.2 Build and Deploy**

- [ ] Prepare final web app files
- [ ] Deploy to Firebase Hosting or selected hosting platform
- [ ] Test deployed URL
- [ ] Test login on deployed version
- [ ] Test core workflows on deployed version

## **16.3 Final Acceptance Testing**

- [ ] Admin can manage users
- [ ] Receptionist can register patients
- [ ] Patient can book appointments
- [ ] Doctor can view appointments
- [ ] Doctor can create medical records
- [ ] Dashboard displays correct metrics
- [ ] Reports display correct summaries
- [ ] Unauthorized access is blocked

---

# **Phase 17: Future Enhancements**

## **17.1 Billing Module**

- [ ] Define billing requirements
- [ ] Create billing collection
- [ ] Link bills to patients and appointments
- [ ] Track payment status
- [ ] Generate invoices

## **17.2 Laboratory Module**

- [ ] Define lab test request workflow
- [ ] Create lab test collection
- [ ] Link lab results to patients
- [ ] Link lab results to medical records
- [ ] Allow doctors to review results

## **17.3 Notification Module**

- [ ] Define notification types
- [ ] Add appointment reminders
- [ ] Add email or SMS integration
- [ ] Add notification preferences
- [ ] Track sent notifications

## **17.4 Advanced Reporting**

- [ ] Add downloadable reports
- [ ] Add charts for trends
- [ ] Add doctor performance metrics
- [ ] Add patient visit analytics
- [ ] Add monthly report exports

---

# **Final Completion Checklist**

- [ ] All core modules are implemented
- [ ] All role-based workflows are tested
- [ ] Firestore fields use consistent camelCase naming
- [ ] Duplicate legacy fields are removed or migrated
- [ ] UI is responsive and readable
- [ ] Security rules are tested
- [ ] Documentation is updated
- [ ] Final deployment works
- [ ] Project is ready for presentation or submission

