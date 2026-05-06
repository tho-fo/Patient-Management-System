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
* medical_records

---

## **4. COLLECTION SPECIFICATIONS**

---

### **4.1 admins**

**Purpose**
Stores system administrators who manage the system.

**Fields**

* admin_id - String, Document ID
* auth_uid - String, Not Null
* full_name - String, Not Null
* email - String, Not Null
* created_at - Timestamp

**Constraints**

* `auth_uid` must map to a valid Firebase Authentication user
* `email` should match the authenticated user's email
* `full_name` must not be empty

---

### **4.2 doctors**

**Purpose**
Stores all doctors in the hospital.

**Fields**

* doctor_id - String, Document ID
* auth_uid - String, Not Null
* full_name - String, Not Null
* specialization - String
* phone - String
* email - String
* created_at - Timestamp

**Constraints**

* `doctor_id` must be unique
* `auth_uid` must map to a valid Firebase Authentication user
* `full_name` must not be empty

---

### **4.3 receptionists**

**Purpose**
Stores staff responsible for patient registration and appointment scheduling.

**Fields**

* receptionist_id - String, Document ID
* auth_uid - String, Not Null
* full_name - String, Not Null
* phone - String
* email - String
* created_at - Timestamp

**Constraints**

* `auth_uid` must map to a valid Firebase Authentication user
* `full_name` must not be empty

---

### **4.4 patients**

**Purpose**
Stores all registered patient information.

**Fields**

* patient_id - String, Document ID
* auth_uid - String, Optional
* full_name - String, Not Null
* age - Number
* gender - String
* phone - String
* email - String
* address - String
* created_at - Timestamp

**Constraints**

* `patient_id` must be unique
* `full_name` must not be empty
* `age` must be a positive number
* `auth_uid` is optional but must be valid when present

---

### **4.5 appointments**

**Purpose**
Stores all appointment scheduling records between patients and doctors.

**Fields**

* appointment_id - String, Document ID
* patient_id - String, Reference ID
* doctor_id - String, Reference ID
* appointment_date - String, Not Null
* appointment_time - String, Not Null
* status - String, Default `Pending`
* created_at - Timestamp

**Constraints**

* `patient_id` must reference an existing patient document
* `doctor_id` must reference an existing doctor document
* `status` values can be: Pending, Completed, Cancelled

**Notes**

* A patient can have multiple appointments
* A doctor can attend multiple appointments

---

### **4.6 medical_records**

**Purpose**
Stores diagnosis and treatment details for patients.

**Fields**

* record_id - String, Document ID
* patient_id - String, Reference ID
* doctor_id - String, Reference ID
* diagnosis - String
* treatment - String
* record_date - Timestamp

**Constraints**

* `patient_id` must reference an existing patient document
* `doctor_id` must reference an existing doctor document

**Notes**

* Each record is created by a doctor
* A patient can have multiple medical records

---

## **5. RELATIONSHIPS**

### **5.1 Core Relationships**

* One patient -> many appointments
* One doctor -> many appointments
* One patient -> many medical_records
* One doctor -> many medical_records

---

### **5.2 Relationship Explanation**

* `appointments` connects patients and doctors
* `medical_records` links diagnosis to both patient and doctor
* Firestore relationships are maintained through reference IDs and validated by the application and backend logic

---

## **6. FIRESTORE RELATIONSHIP SUMMARY**

patients
-> appointments
-> medical_records

doctors
-> appointments
-> medical_records

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
* auth_uid must be valid
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

### **8.4 medical_records**

* diagnosis should not be empty
* patient must exist
* doctor must exist

---

## **9. INDEXING STRATEGY**

To improve performance:

### **patients**

* index on `full_name`
* index on `auth_uid` when patient self-service is enabled

### **doctors**

* index on `auth_uid`
* index on `specialization`

### **appointments**

* composite index on `doctor_id + appointment_date`
* composite index on `patient_id + appointment_date`
* index on `status`

### **medical_records**

* composite index on `patient_id + record_date`
* composite index on `doctor_id + record_date`

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
patients/{patient_id}
  full_name: string
  age: number
  gender: string
  phone: string
  address: string
  created_at: timestamp

doctors/{doctor_id}
  auth_uid: string
  full_name: string
  specialization: string
  phone: string
  email: string

appointments/{appointment_id}
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: string
  created_at: timestamp

medical_records/{record_id}
  patient_id: string
  doctor_id: string
  diagnosis: string
  treatment: string
  record_date: timestamp
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
