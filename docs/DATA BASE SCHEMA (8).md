# **DATABASE SCHEMA SPECIFICATION**

## **Patient Management System**

---

## **1. INTRODUCTION**

### **1.1 Purpose**

This document defines the logical database schema for the Patient Management System using **Cloud Firestore**. It specifies the core collections, fields, data types, constraints, relationships, and indexing considerations required to support hospital operations.

---

### **1.2 Scope**

This schema covers:

* admin accounts
* doctors
* receptionists
* patients
* appointments
* medical records

The schema is designed to support:

* hospital management operations
* patient registration
* appointment scheduling
* medical record tracking
* system reporting and analytics

---

## **2. DATABASE DESIGN PRINCIPLES**

The schema is designed based on the following principles:

* Centralized storage of patient data
* Role-based access control (Admin, Doctor, Receptionist, Patient)
* Document-oriented structure for flexibility
* Data integrity using document references and validation logic
* Scalable design for future hospital expansion
* Secure handling of sensitive medical information
* Authentication credentials stored in Firebase Authentication, not Firestore

---

## **3. MAIN COLLECTIONS**

The core database contains:

* admins
* doctors
* receptionists
* patients
* appointments
* medicalRecords

---

## **4. COLLECTION SPECIFICATIONS**

---

### **4.1 admins**

**Purpose**
Stores system administrators who manage the system.

**Fields**

* adminId - String, Document ID
* authUid - String, Not Null
* fullName - String, Not Null
* email - String, Not Null
* createdAt - Timestamp

**Constraints**

* `authUid` must map to a valid Firebase Authentication user
* `email` should match the authenticated user's email
* `fullName` must not be empty

---

### **4.2 doctors**

**Purpose**
Stores all doctors in the hospital.

**Fields**

* doctorId - String, Document ID
* authUid - String, Not Null
* fullName - String, Not Null
* specialization - String
* phone - String
* email - String
* createdAt - Timestamp

**Constraints**

* `doctorId` must be unique
* `authUid` must map to a valid Firebase Authentication user
* `fullName` must not be empty

---

### **4.3 receptionists**

**Purpose**
Stores staff responsible for patient registration and appointment scheduling.

**Fields**

* receptionistId - String, Document ID
* authUid - String, Not Null
* fullName - String, Not Null
* phone - String
* email - String
* createdAt - Timestamp

**Constraints**

* `authUid` must map to a valid Firebase Authentication user
* `fullName` must not be empty

---

### **4.4 patients**

**Purpose**
Stores all registered patient information.

**Fields**

* patientId - String, Document ID
* authUid - String, Optional
* fullName - String, Not Null
* age - Number
* gender - String
* phone - String
* email - String
* address - String
* createdAt - Timestamp

**Constraints**

* `patientId` must be unique
* `fullName` must not be empty
* `age` must be a positive number
* `authUid` is optional but must be valid when present

---

### **4.5 appointments**

**Purpose**
Stores all appointment scheduling records between patients and doctors.

**Fields**

* appointmentId - String, Document ID
* patientId - String, Reference ID
* doctorId - String, Reference ID
* appointmentDate - String, Not Null
* appointmentTime - String, Not Null
* status - String, Default `Pending`
* createdAt - Timestamp

**Constraints**

* `patientId` must reference an existing patient document
* `doctorId` must reference an existing doctor document
* `status` values can be: Pending, Completed, Cancelled

**Notes**

* A patient can have multiple appointments
* A doctor can attend multiple appointments

---

### **4.6 medicalRecords**

**Purpose**
Stores diagnosis and treatment details for patients.

**Fields**

* recordId - String, Document ID
* patientId - String, Reference ID
* doctorId - String, Reference ID
* diagnosis - String
* treatment - String
* recordDate - Timestamp

**Constraints**

* `patientId` must reference an existing patient document
* `doctorId` must reference an existing doctor document

**Notes**

* Each record is created by a doctor
* A patient can have multiple medical records

---

## **5. RELATIONSHIPS**

### **5.1 Core Relationships**

* One patient -> many appointments
* One doctor -> many appointments
* One patient -> many medicalRecords
* One doctor -> many medicalRecords

---

### **5.2 Relationship Explanation**

* `appointments` connects patients and doctors
* `medicalRecords` links diagnosis to both patient and doctor
* Firestore relationships are maintained through reference IDs and validated by the application and backend logic

---

## **6. FIRESTORE RELATIONSHIP SUMMARY**

patients
-> appointments
-> medicalRecords

doctors
-> appointments
-> medicalRecords

admins
-> manages system

receptionists
-> manages patients and appointments

---

## **7. ENUM / CONTROLLED VALUES**

### **7.1 appointment status**

Allowed values:

* Pending
* Completed
* Cancelled

### **7.2 gender**

Allowed values:

* Male
* Female
* Other

---

## **8. VALIDATION RULES**

### **8.1 admins / doctors / receptionists**

* email must be valid
* authUid must be valid
* name must not be empty

---

### **8.2 patients**

* name must not be empty
* age must be positive
* phone number should be valid

---

### **8.3 appointments**

* appointment date must be valid
* appointment time must be valid
* patient and doctor documents must exist

---

### **8.4 medicalRecords**

* diagnosis should not be empty
* patient must exist
* doctor must exist

---

## **9. INDEXING STRATEGY**

To improve performance:

### **patients**

* index on `fullName`
* index on `authUid` when patient self-service is enabled

### **doctors**

* index on `authUid`
* index on `specialization`

### **appointments**

* composite index on `doctorId + appointmentDate`
* composite index on `patientId + appointmentDate`
* index on `status`

### **medicalRecords**

* composite index on `patientId + recordDate`
* composite index on `doctorId + recordDate`

---

## **10. SYSTEM OPERATIONS SUPPORT**

The database supports:

* Patient registration
* Appointment scheduling
* Doctor diagnosis entry
* Retrieval of patient history
* Hospital reporting

---

## **11. FUTURE DATABASE EXTENSIONS**

This schema can be expanded to include:

* billing system
* pharmacy management
* lab test records
* user activity logs
* notification system

---

## **12. FIRESTORE-LIKE REFERENCE STRUCTURE**

```text
patients/{patientId}
  fullName: string
  age: number
  gender: string
  phone: string
  address: string
  createdAt: timestamp

doctors/{doctorId}
  authUid: string
  fullName: string
  specialization: string
  phone: string
  email: string

appointments/{appointmentId}
  patientId: string
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  status: string
  createdAt: timestamp

medicalRecords/{recordId}
  patientId: string
  doctorId: string
  diagnosis: string
  treatment: string
  recordDate: timestamp
```

---

## **13. SUMMARY**

The Patient Management System database schema is designed to:

* Efficiently manage hospital operations
* Maintain strong relationships between data
* Ensure data accuracy and integrity
* Support future scalability

This design provides:

* A structured Firestore data model
* Reliable patient record management
* Efficient appointment handling
* Strong foundation for system expansion
