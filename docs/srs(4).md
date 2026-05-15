# **SOFTWARE REQUIREMENT SPECIFICATION (SRS)**

## **PATIENT MANAGEMENT SYSTEM**

---

# **1. INTRODUCTION**

## **1.1 Purpose of the System**

The purpose of this document is to provide a detailed description of the requirements for the Patient Management System. It serves as a guide for developers, stakeholders, and users to understand the system's functionality and constraints.

The system is designed to automate hospital operations such as patient registration, appointment scheduling, and medical record management.

---

## **1.2 Scope of the System**

The Patient Management System is a web-based application that enables hospitals to manage patient data efficiently.

The system will allow:

* Admin to manage system operations
* Doctors to manage patient medical records
* Receptionists to register patients and schedule appointments
* Patients to access their information and book appointments

---

## **1.3 Definitions, Acronyms, and Abbreviations**

| Term | Meaning |
| ----- | ----- |
| PMS | Patient Management System |
| SRS | Software Requirement Specification |
| Admin | System administrator |
| UI | User Interface |
| DBMS | Database Management System |
| UID | Unique user identifier from Firebase Authentication |

---

## **1.4 Overview of the Document**

This document provides a detailed description of system requirements including functional requirements, non-functional requirements, and system features.

---

# **2. OVERALL DESCRIPTION**

## **2.1 System Perspective**

The Patient Management System is a web-based system that uses Firebase services to authenticate users, process backend operations, and store or retrieve patient information.

It replaces the manual system of record keeping with a digital solution.

---

## **2.2 System Users (Actors)**

The system consists of four main users:

### **Admin**

* Manages the entire system

### **Doctor**

* Handles patient diagnosis and treatment

### **Receptionist**

* Registers patients and schedules appointments

### **Patient**

* Books appointments and views records

---

## **2.3 Operating Environment**

The system will operate on:

* Web browsers (Chrome, Edge)
* Operating systems (Windows, Linux)
* Internet-connected client devices
* Firebase project environment

---

## **2.4 Design and Implementation Constraints**

* Requires internet connectivity
* Depends on Firebase project configuration and availability
* Must ensure data security through Firebase Authentication and Firestore rules
* Limited to hospital environment

---

## **2.5 Assumptions and Dependencies**

* Users have basic computer knowledge
* System will be used in a healthcare facility
* Firebase Authentication, Cloud Functions, and Cloud Firestore are available

---

# **3. SYSTEM FEATURES (FUNCTIONAL REQUIREMENTS)**

---

## **3.1 Admin Module**

### **Description:**

The admin controls and manages the entire system.

### **Functions:**

* Login/logout
* Add, edit, delete users (Doctor, Receptionist, Patient)
* View system reports
* Monitor system activities

---

## **3.2 Doctor Module**

### **Description:**

The doctor manages patient medical information.

### **Functions:**

* Login/logout
* View patient details
* Add diagnosis
* Prescribe treatment
* View appointment schedule

---

## **3.3 Receptionist Module**

### **Description:**

The receptionist handles patient registration and appointments.

### **Functions:**

* Login/logout
* Register new patients
* Schedule appointments
* Update patient details

---

## **3.4 Patient Module**

### **Description:**

The patient interacts with the system to access healthcare services.

### **Functions:**

* Register account
* Login/logout
* View profile
* Book appointment
* View appointment history
* View medical records

---

# **4. NON-FUNCTIONAL REQUIREMENTS**

---

## **4.1 Performance Requirements**

* The system should respond quickly to user actions
* Should handle multiple users simultaneously

---

## **4.2 Security Requirements**

* User authentication using Firebase Authentication
* Password protection handled by Firebase Authentication
* Role-based access control
* Firestore security rules for restricted data access
* Data confidentiality

---

## **4.3 Usability Requirements**

* User-friendly interface
* Easy navigation
* Minimal training required

---

## **4.4 Reliability Requirements**

* System should be available whenever hospital staff need it
* Backup/export strategy should be implemented for cloud data

---

## **4.5 Maintainability**

* Easy to update and modify
* Well-structured code

---

# **5. SYSTEM MODELS**

## **5.1 Use Case Diagram**

(Insert UML Use Case Diagram here)

---

## **5.2 ER / Data Model Diagram**

(Insert ER or Firestore data model diagram here)

---

## **5.3 Data Flow (Optional)**

(Insert Data Flow Diagram if required)

---

# **6. DATABASE REQUIREMENTS**

The system will use **Cloud Firestore** with the following main collections:

* admins
* doctors
* receptionists
* patients
* appointments
* medicalRecords

Authentication credentials will be managed by **Firebase Authentication**, while profile documents will reference the authenticated user through `authUid`.

---

# **7. EXTERNAL INTERFACE REQUIREMENTS**

## **7.1 User Interface**

* Web-based interface
* Dashboard for each user

## **7.2 Hardware Interface**

* Computer system

## **7.3 Software Interface**

* Web browser
* Firebase Authentication
* Cloud Firestore
* Firebase Cloud Functions

---

# **8. ASSUMPTIONS AND LIMITATIONS**

### **Assumptions:**

* Users are trained
* System is used in a hospital
* Firebase services are properly configured

### **Limitations:**

* Requires electricity
* Requires internet access
* Limited to defined modules

---

# **9. CONCLUSION**

The SRS document provides a complete description of the Patient Management System requirements. It serves as a foundation for system design and implementation, ensuring that the final product meets user needs and operates efficiently.
