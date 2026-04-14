# **DATABASE SCHEMA SPECIFICATION**

## **Patient Management System**

---

## **1\. INTRODUCTION**

### **1.1 Purpose**

This document defines the logical database schema for the Patient Management System. It specifies the core tables, fields, data types, constraints, relationships, and indexing considerations required to support hospital operations.

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

## **2\. DATABASE DESIGN PRINCIPLES**

The schema is designed based on the following principles:

* Centralized storage of patient data  
* Role-based access control (Admin, Doctor, Receptionist)  
* Normalized structure to reduce redundancy  
* Data integrity using relationships (FK constraints)  
* Scalable design for future hospital expansion  
* Secure handling of sensitive medical information

---

## **3\. MAIN TABLES**

The core database contains:

* admin  
* doctors  
* receptionists  
* patients  
* appointments  
* medical\_records

---

## **4\. TABLE SPECIFICATIONS**

---

### **4.1 admin**

**Purpose**  
 Stores system administrators who manage the system.

**Fields**

* admin\_id — INT, Primary Key, Auto Increment  
* full\_name — VARCHAR(100), Not Null  
* email — VARCHAR(100), Unique, Not Null  
* password — VARCHAR(255), Not Null

**Constraints**

* email must be unique  
* password must be securely stored (hashed)  
* full\_name must not be empty

---

### **4.2 doctors**

**Purpose**  
 Stores all doctors in the hospital.

**Fields**

* doctor\_id — INT, Primary Key, Auto Increment  
* full\_name — VARCHAR(100), Not Null  
* specialization — VARCHAR(100)  
* phone — VARCHAR(20)  
* email — VARCHAR(100), Unique  
* password — VARCHAR(255), Not Null

**Constraints**

* doctor\_id must be unique  
* email should be unique  
* password must not be null

---

### **4.3 receptionists**

**Purpose**  
 Stores staff responsible for patient registration and appointment scheduling.

**Fields**

* receptionist\_id — INT, Primary Key, Auto Increment  
* full\_name — VARCHAR(100), Not Null  
* phone — VARCHAR(20)  
* email — VARCHAR(100), Unique  
* password — VARCHAR(255), Not Null

**Constraints**

* email should be unique  
* password must not be empty

---

### **4.4 patients**

**Purpose**  
 Stores all registered patient information.

**Fields**

* patient\_id — INT, Primary Key, Auto Increment  
* full\_name — VARCHAR(100), Not Null  
* age — INT  
* gender — VARCHAR(10)  
* phone — VARCHAR(20)  
* address — TEXT  
* created\_at — TIMESTAMP, Default Current Timestamp

**Constraints**

* patient\_id must be unique  
* full\_name must not be empty  
* age must be a positive number

---

### **4.5 appointments**

**Purpose**  
 Stores all appointment scheduling records between patients and doctors.

**Fields**

* appointment\_id — INT, Primary Key, Auto Increment  
* patient\_id — INT, Foreign Key  
* doctor\_id — INT, Foreign Key  
* appointment\_date — DATE, Not Null  
* appointment\_time — TIME, Not Null  
* status — VARCHAR(50), Default 'Pending'

**Constraints**

* patient\_id references patients.patient\_id  
* doctor\_id references doctors.doctor\_id  
* status values can be: Pending, Completed, Cancelled

**Notes**

* A patient can have multiple appointments  
* A doctor can attend multiple appointments

---

### **4.6 medical\_records**

**Purpose**  
 Stores diagnosis and treatment details for patients.

**Fields**

* record\_id — INT, Primary Key, Auto Increment  
* patient\_id — INT, Foreign Key  
* doctor\_id — INT, Foreign Key  
* diagnosis — TEXT  
* treatment — TEXT  
* record\_date — TIMESTAMP, Default Current Timestamp

**Constraints**

* patient\_id references patients.patient\_id  
* doctor\_id references doctors.doctor\_id

**Notes**

* Each record is created by a doctor  
* A patient can have multiple medical records

---

## **5\. RELATIONSHIPS**

### **5.1 Core Relationships**

* One patient → many appointments  
* One doctor → many appointments  
* One patient → many medical\_records  
* One doctor → many medical\_records

---

### **5.2 Relationship Explanation**

* appointments connects patients and doctors  
* medical\_records links diagnosis to both patient and doctor

---

## **6\. RELATIONAL SUMMARY**

patients  
 ├── appointments  
 └── medical\_records

doctors  
 ├── appointments  
 └── medical\_records

admin  
 └── manages system

receptionists  
 └── manages patients and appointments

---

## **7\. ENUM / CONTROLLED VALUES**

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

## **8\. VALIDATION RULES**

### **8.1 admin / doctors / receptionists**

* email must be valid  
* password must be encrypted  
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
* patient and doctor must exist

---

### **8.4 medical\_records**

* diagnosis should not be empty  
* patient must exist  
* doctor must exist

---

## **9\. INDEXING STRATEGY**

To improve performance:

### **patients**

* index on patient\_id

### **doctors**

* index on doctor\_id

### **appointments**

* index on patient\_id  
* index on doctor\_id  
* index on appointment\_date

### **medical\_records**

* index on patient\_id  
* index on doctor\_id

---

## **10\. SYSTEM OPERATIONS SUPPORT**

The database supports:

* Patient registration  
* Appointment scheduling  
* Doctor diagnosis entry  
* Retrieval of patient history  
* Hospital reporting

---

## **11\. FUTURE DATABASE EXTENSIONS**

This schema can be expanded to include:

* billing system  
* pharmacy management  
* lab test records  
* user activity logs  
* notification system

---

## **12\. SQL-LIKE REFERENCE STRUCTURE**

patients (  
 patient\_id INT PRIMARY KEY,  
 full\_name VARCHAR(100),  
 age INT,  
 gender VARCHAR(10),  
 phone VARCHAR(20),  
 address TEXT,  
 created\_at TIMESTAMP  
)

doctors (  
 doctor\_id INT PRIMARY KEY,  
 full\_name VARCHAR(100),  
 specialization VARCHAR(100),  
 phone VARCHAR(20),  
 email VARCHAR(100),  
 password VARCHAR(255)  
)

appointments (  
 appointment\_id INT PRIMARY KEY,  
 patient\_id INT REFERENCES patients(patient\_id),  
 doctor\_id INT REFERENCES doctors(doctor\_id),  
 appointment\_date DATE,  
 appointment\_time TIME,  
 status VARCHAR(50)  
)

medical\_records (  
 record\_id INT PRIMARY KEY,  
 patient\_id INT REFERENCES patients(patient\_id),  
 doctor\_id INT REFERENCES doctors(doctor\_id),  
 diagnosis TEXT,  
 treatment TEXT,  
 record\_date TIMESTAMP  
)  
---

## **13\. SUMMARY**

The Patient Management System database schema is designed to:

* Efficiently manage hospital operations  
* Maintain strong relationships between data  
* Ensure data accuracy and integrity  
* Support future scalability

This design provides:

* A structured and normalized database  
* Reliable patient record management  
* Efficient appointment handling  
* Strong foundation for system expansion

