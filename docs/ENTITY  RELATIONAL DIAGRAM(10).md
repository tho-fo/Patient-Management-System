# **ENTITY RELATIONSHIP DIAGRAM (ERD)**

## **Patient Management System – Hospital Management & Patient Care Platform**

---

# **1\. INTRODUCTION**

## **1.1 Purpose**

This document defines the Entity Relationship Diagram for the Patient Management System. It shows the major data entities, their attributes, and the relationships between them.

## **1.2 Scope**

The ERD covers the core system and extended modules required for:

* user management (Admin, Doctor, Receptionist)  
* patient registration and management  
* appointment scheduling  
* medical record tracking  
* system reporting and operations

---

# **2\. CORE ENTITIES**

The main entities in the system are:

* User  
* Patient  
* Doctor  
* Receptionist  
* Appointment  
* MedicalRecord

---

# **3\. ENTITY DEFINITIONS**

---

## **3.1 User**

Represents all system users (Admin, Doctor, Receptionist).

**Key Attributes:**

* id  
* name  
* email  
* password  
* role  
* created\_at

---

## **3.2 Patient**

Represents a registered patient in the hospital system.

**Key Attributes:**

* id  
* name  
* age  
* gender  
* phone  
* address  
* created\_at

---

## **3.3 Doctor**

Represents a doctor in the hospital.

**Key Attributes:**

* id  
* user\_id  
* specialization  
* phone

---

## **3.4 Receptionist**

Represents front desk staff responsible for patient registration and appointments.

**Key Attributes:**

* id  
* user\_id  
* phone

---

## **3.5 Appointment**

Represents a scheduled meeting between a patient and a doctor.

**Key Attributes:**

* id  
* patient\_id  
* doctor\_id  
* appointment\_date  
* status  
* created\_at

---

## **3.6 MedicalRecord**

Represents the diagnosis and treatment information of a patient.

**Key Attributes:**

* id  
* patient\_id  
* doctor\_id  
* diagnosis  
* treatment  
* record\_date

---

# **4\. RELATIONSHIPS**

---

## **4.1 User → Doctor**

One user can be one doctor profile  
 Each doctor is linked to one user

**Relationship:** User 1 : 1 Doctor

---

## **4.2 User → Receptionist**

One user can be one receptionist profile  
 Each receptionist is linked to one user

**Relationship:** User 1 : 1 Receptionist

---

## **4.3 Patient → Appointment**

One patient can have many appointments  
 Each appointment belongs to one patient

**Relationship:** Patient 1 : M Appointment

---

## **4.4 Doctor → Appointment**

One doctor can have many appointments  
 Each appointment belongs to one doctor

**Relationship:** Doctor 1 : M Appointment

---

## **4.5 Patient → MedicalRecord**

One patient can have many medical records  
 Each record belongs to one patient

**Relationship:** Patient 1 : M MedicalRecord

---

## **4.6 Doctor → MedicalRecord**

One doctor can create many medical records  
 Each record is created by one doctor

**Relationship:** Doctor 1 : M MedicalRecord

---

# **5\. TEXTUAL ER DIAGRAM**

User  
 ├── 1 : 1 Doctor  
 ├── 1 : 1 Receptionist

Patient  
 ├──\< Appointment  
 └──\< MedicalRecord

Doctor  
 ├──\< Appointment  
 └──\< MedicalRecord

Appointment  
 (links Patient and Doctor)

MedicalRecord  
 (links Patient and Doctor)

---

# **6\. MERMAID ER DIAGRAM (TEXT REPRESENTATION)**

erDiagram

   USERS ||--|| DOCTORS : has  
   USERS ||--|| RECEPTIONISTS : has

   PATIENTS ||--o{ APPOINTMENTS : books  
   DOCTORS ||--o{ APPOINTMENTS : attends

   PATIENTS ||--o{ MEDICAL\_RECORDS : has  
   DOCTORS ||--o{ MEDICAL\_RECORDS : writes

   USERS {  
       int id PK  
       string name  
       string email  
       string password  
       string role  
       timestamp created\_at  
   }

   DOCTORS {  
       int id PK  
       int user\_id FK  
       string specialization  
       string phone  
   }

   RECEPTIONISTS {  
       int id PK  
       int user\_id FK  
       string phone  
   }

   PATIENTS {  
       int id PK  
       string name  
       int age  
       string gender  
       string phone  
       string address  
       timestamp created\_at  
   }

   APPOINTMENTS {  
       int id PK  
       int patient\_id FK  
       int doctor\_id FK  
       datetime appointment\_date  
       string status  
       timestamp created\_at  
   }

   MEDICAL\_RECORDS {  
       int id PK  
       int patient\_id FK  
       int doctor\_id FK  
       text diagnosis  
       text treatment  
       date record\_date  
   }  
---

# **7\. DESIGN NOTES**

* **Patient is a central entity** for hospital operations  
* **Appointment connects Patient and Doctor**  
* **MedicalRecord stores clinical data** and links both Patient and Doctor  
* **User entity controls authentication and roles**  
* Doctor and Receptionist are separated for role-based control  
* The system is designed for scalability (billing, lab modules can be added later) 

