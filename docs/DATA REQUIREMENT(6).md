# **DATA REQUIREMENTS**

## **PATIENT MANAGEMENT SYSTEM**

---

# **1. Introduction**

Data requirements describe the type of data that the system will collect, store, process, and manage. In the Patient Management System, data plays a critical role in ensuring that patient information, appointments, and medical records are properly handled.

This section defines the structure, type, relationships, and constraints of data used in the system.

---

# **2. Types of Data in the System**

The system will handle several categories of data, including:

* Admin data
* Doctor data
* Receptionist data
* Patient data
* Appointment data
* Medical records

Each category of data is stored in a structured format within **Cloud Firestore** collections and documents.

---

# **3. Data Entities and Their Attributes**

Entities represent real-world objects in the system. Each entity contains attributes (fields) that describe it.

---

## **3.1 Admin Entity**

This entity stores administrator profile information.

### **Attributes:**

* adminId (Document ID)
* authUid
* fullName
* email
* createdAt

### **Description:**

Admin profiles are linked to Firebase Authentication accounts through `authUid` and are used to manage system-level operations.

---

## **3.2 Doctor Entity**

Stores details of doctors in the hospital.

### **Attributes:**

* doctorId (Document ID)
* authUid
* fullName
* specialization
* phone
* email
* createdAt

### **Description:**

Doctors are responsible for diagnosis and treatment. Their information is linked to appointments and medical records.

---

## **3.3 Receptionist Entity**

Stores details of reception staff.

### **Attributes:**

* receptionistId (Document ID)
* authUid
* fullName
* phone
* email
* createdAt

### **Description:**

Receptionists handle patient registration and appointment scheduling.

---

## **3.4 Patient Entity**

This entity stores all information related to patients.

### **Attributes:**

* patientId (Document ID)
* authUid (optional for patient self-service accounts)
* fullName
* age
* gender
* phone
* email
* address
* createdAt

### **Description:**

The Patient entity is central to the system as it holds personal and medical-related information for each patient.

---

## **3.5 Appointment Entity**

Stores appointment details.

### **Attributes:**

* appointmentId (Document ID)
* patientId (Reference ID)
* doctorId (Reference ID)
* appointmentDate
* appointmentTime
* status
* createdAt

### **Description:**

This entity links patients and doctors and tracks scheduled visits.

---

## **3.6 Medical Records Entity**

Stores patient medical history.

### **Attributes:**

* recordId (Document ID)
* patientId (Reference ID)
* doctorId (Reference ID)
* diagnosis
* treatment
* recordDate

### **Description:**

This entity keeps track of patient diagnosis and treatment over time.

---

# **4. Data Relationships**

Relationships define how entities are connected.

### **Key Relationships:**

* One Patient -> Many Appointments (**1:M**)
* One Doctor -> Many Appointments (**1:M**)
* One Patient -> Many Medical Records (**1:M**)
* One Doctor -> Many Medical Records (**1:M**)

### **Explanation:**

* A patient can have multiple appointments
* A doctor can treat multiple patients
* Each medical record belongs to one patient and one doctor
* Relationships are maintained using document IDs and validated by application logic and security rules

---

# **5. Data Dictionary**

A data dictionary provides detailed information about each data field.

---

## **Example: Patient Collection**

| Field | Type | Description |
| ----- | ----- | ----- |
| patientId | String | Unique document identifier |
| authUid | String | Firebase Authentication UID |
| fullName | String | Patient name |
| age | Number | Patient age |
| gender | String | Male/Female/Other |
| phone | String | Contact number |
| email | String | Email address |
| address | String | Residential address |

---

## **Example: Appointment Collection**

| Field | Type | Description |
| ----- | ----- | ----- |
| appointmentId | String | Unique document ID |
| patientId | String | Links to patient |
| doctorId | String | Links to doctor |
| appointmentDate | String | Date of visit |
| appointmentTime | String | Time of visit |
| status | String | Pending/Completed/Cancelled |

---

# **6. Data Integrity Constraints**

To ensure data accuracy and consistency:

* **Document ID:** Uniquely identifies records
* **Reference IDs:** Link related documents
* **Required fields:** Prevent incomplete records
* **Controlled values:** Avoid invalid status or gender values
* **Authentication link:** `authUid` must match the correct Firebase account where applicable

---

# **7. Data Storage and Management**

* Data will be stored in **Cloud Firestore**
* Data will be organized into collections and documents
* Relationships will be maintained using document IDs, validation logic, and security rules
* Regular backup/export procedures should be implemented

---

# **8. Data Security Requirements**

To protect sensitive information:

* Firebase Authentication for login control
* Role-based access control
* Firestore security rules
* Restricted access to medical records

---

# **9. Data Flow Overview**

The system will process data as follows:

1. A user account is authenticated through Firebase Authentication
2. A related profile document is stored in Firestore
3. An appointment is created and linked to patient and doctor documents
4. A doctor updates a medical record
5. Admin monitors system data and reports

---

# **10. Conclusion**

The data requirements define the structure and organization of information within the Patient Management System. Proper data management ensures accuracy, security, and efficiency in hospital operations while using Firebase Authentication and Cloud Firestore as the core platform.
