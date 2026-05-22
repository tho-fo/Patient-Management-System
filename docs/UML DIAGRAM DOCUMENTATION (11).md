# **UML DIAGRAM DOCUMENT**

## **Patient Management System - Hospital Management & Patient Care Platform**

---

# **1. INTRODUCTION**

## **1.1 Purpose**

This document defines the key UML diagrams for the Patient Management System. It models the system behavior, structure, and interactions based on the approved requirements, Firebase-based system architecture, Firestore schema, and UI flow.

## **1.2 Scope**

The UML coverage includes:

* Use Case Diagram
* Class Diagram
* Sequence Diagrams
* Activity Diagrams
* Component Diagram

These diagrams focus on the core and extended system scope:

* hospital management system (desktop/web)
* Firebase service operations
* patient management
* appointment scheduling
* medical records handling

---

# **2. USE CASE DIAGRAM**

## **2.1 Purpose**

Shows the main interactions between users and the system.

## **2.2 Actors**

* Admin
* Doctor
* Receptionist
* Patient

## **2.3 Main Use Cases**

* Login
* Register Patient
* Manage Users (Admin)
* Schedule Appointment
* View Appointments
* Update Appointment
* Add Medical Record
* View Medical Record
* Manage Patients
* Generate Reports

## **2.4 Textual Use Case Representation**

Admin

* Login
* Manage Doctors
* Manage Receptionists
* Manage Patients
* Monitor System Activity
* View Reports

Receptionist

* Register Patient
* Schedule Appointment
* View Pending, Approved, and Declined Appointments
* Update Patient Information

Doctor

* View Appointments
* Schedule Approved Appointments
* Approve or Decline Appointment Requests
* View Patient Records
* Add Diagnosis
* Prescribe Treatment
* Update Own Medical Records
* Update Availability

Patient

* Book Appointments
* View Appointments
* View Medical Records

---

# **3. CLASS DIAGRAM**

## **3.1 Purpose**

Shows the main system entities and their relationships.

## **3.2 Core Classes**

* AuthAccount
* Admin
* Doctor
* Receptionist
* Patient
* Appointment
* MedicalRecord

## **3.3 Class Diagram (Text Representation)**

```mermaid
classDiagram

   class AuthAccount {
       +string uid
       +string email
       +string provider
       +string role
       +datetime createdAt
   }

   class Admin {
       +string adminId
       +string firstName
       +string lastName
       +string phone
       +string email
       +datetime createdAt
       +datetime updatedAt
   }

   class Doctor {
       +string doctorId
       +string firstName
       +string lastName
       +list~string~ specialization
       +map availability
       +string phone
       +string email
       +datetime createdAt
       +datetime updatedAt
   }

   class Receptionist {
       +string receptionistId
       +string firstName
       +string lastName
       +string phone
       +string email
       +datetime createdAt
       +datetime updatedAt
   }

   class Patient {
       +string patientId
       +string firstName
       +string lastName
       +string phone
       +string email
       +string address
       +map otherInfo
       +datetime createdAt
       +datetime updatedAt
   }

   class Appointment {
       +string appointmentId
       +string patientId
       +string doctorId
       +string receptionistId
       +string appointmentDate
       +string appointmentTime
       +string status
       +string otherInfo
       +datetime createdAt
       +datetime updatedAt
   }

   class MedicalRecord {
       +string recordId
       +string patientId
       +string diagnosedBy
       +text diagnosis
       +text treatment
       +string status
       +datetime createdAt
       +datetime updatedAt
   }

   AuthAccount "1" --> "0..1" Admin : maps_to
   AuthAccount "1" --> "0..1" Doctor : maps_to
   AuthAccount "1" --> "0..1" Receptionist : maps_to
   AuthAccount "1" --> "0..1" Patient : maps_to
   Patient "1" --> "0..*" Appointment : books
   Doctor "1" --> "0..*" Appointment : attends
   Patient "1" --> "0..*" MedicalRecord : has
   Receptionist "1" --> "0..*" Appointment : books
   Doctor "1" --> "0..*" MedicalRecord : diagnoses
```

---

# **4. SEQUENCE DIAGRAMS**

---

## **4.1 Patient Registration**

### **Purpose**

Shows how a patient is registered into the system.

```mermaid
sequenceDiagram
   actor Receptionist
   participant UI as System Interface
   participant AUTH as Firebase Authentication
   participant FUNC as Cloud Functions
   participant FS as Cloud Firestore

   Receptionist->>UI: Enter patient details
   Receptionist->>UI: Click Save
   UI->>AUTH: Create patient account (optional)
   AUTH-->>UI: Return authUid
   UI->>FUNC: Validate registration request
   FUNC->>FS: Create patient document
   FS-->>FUNC: Success
   FUNC-->>UI: Patient created
   UI-->>Receptionist: Display success message
```

---

## **4.2 Appointment Scheduling**

### **Purpose**

Shows how an appointment is created.

```mermaid
sequenceDiagram
   actor Receptionist
   participant UI
   participant FUNC as Cloud Functions
   participant FS as Cloud Firestore

   Receptionist->>UI: Select patient and doctor
   Receptionist->>UI: Choose date and time
   UI->>FUNC: Send appointment request
   FUNC->>FS: Check availability and save appointment
   FS-->>FUNC: Success
   FUNC-->>UI: Appointment confirmed
   UI-->>Receptionist: Show confirmation
```

---

## **4.3 Doctor Adds Medical Record**

### **Purpose**

Shows how a doctor records diagnosis and treatment.

```mermaid
sequenceDiagram
   actor Doctor
   participant UI
   participant FUNC as Cloud Functions
   participant FS as Cloud Firestore

   Doctor->>UI: Select patient
   Doctor->>UI: Enter diagnosis and treatment
   UI->>FUNC: Submit medical record
   FUNC->>FS: Save medical record
   FS-->>FUNC: Success
   FUNC-->>UI: Record saved
   UI-->>Doctor: Show confirmation
```

---

## **4.4 View Patient Records**

### **Purpose**

Shows how records are retrieved.

```mermaid
sequenceDiagram
   actor Doctor
   participant UI
   participant FS as Cloud Firestore

   Doctor->>UI: Request patient records
   UI->>FS: Query patient records
   FS-->>UI: Return data
   UI-->>Doctor: Display records
```

---

# **5. ACTIVITY DIAGRAMS**

---

## **5.1 Patient Registration Activity**

```mermaid
flowchart TD
   A[Open Registration Form] --> B[Enter Patient Details]
   B --> C[Submit Form]
   C --> D{Valid Input?}
   D -- No --> E[Show Error]
   E --> B
   D -- Yes --> F[Create Firestore Patient Profile]
   F --> G[Display Success Message]
```

---

## **5.2 Appointment Scheduling Activity**

```mermaid
flowchart TD
   A[Select Patient] --> B[Select Doctor]
   B --> C[Choose Date and Time]
   C --> D[Submit Appointment]
   D --> E{Valid?}
   E -- No --> F[Show Error]
   F --> B
   E -- Yes --> G[Save Appointment in Firestore]
   G --> H[Confirm Booking]
```

---

## **5.3 Medical Record Entry Activity**

```mermaid
flowchart TD
   A[Doctor Login] --> B[View Patients]
   B --> C[Select Patient]
   C --> D[Enter Diagnosis]
   D --> E[Enter Treatment]
   E --> F[Submit Record]
   F --> G[Save to Firestore]
   G --> H[Show Confirmation]
```

---

# **6. COMPONENT DIAGRAM**

## **6.1 Purpose**

Shows the main technical building blocks and their connections.

```mermaid
flowchart LR
   A[User Interface] --> B[Firebase Authentication]
   A --> C[Cloud Functions]
   A --> D[Cloud Firestore]
   C --> D
   B --> E[Role-Based Access Control]
   E --> D
   C --> F[Reporting Module]
```

---

# **7. STATE TRANSITION NOTES**

## **7.1 Appointment State**

Appointments move through these states:

* Pending -> Approved
* Pending -> Declined
* Approved -> Completed

---

## **7.2 User Session State**

* Logged Out -> Login -> Authenticated -> Role Loaded -> Logged In -> Logout

---

# **8. UML DESIGN NOTES**

* **Patient is the central entity** in the system
* **Appointment connects patient and doctor**
* **MedicalRecord stores clinical data**
* **AuthAccount controls authentication and user identity**
* Firestore stores structured application data
* Cloud Functions handle backend validation and workflow processing
* The system is designed to support future modules like billing and laboratory
