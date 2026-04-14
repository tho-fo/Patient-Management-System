# **DATA REQUIREMENTS**

## **PATIENT MANAGEMENT SYSTEM**

---

#  **1\. Introduction**

Data requirements describe the type of data that the system will collect, store, process, and manage. In the Patient Management System, data plays a critical role in ensuring that patient information, appointments, and medical records are properly handled.

This section defines the structure, type, relationships, and constraints of data used in the system.

---

# **2\. Types of Data in the System**

The system will handle several categories of data, including:

* Patient data  
* Doctor data  
* Administrative data  
* Appointment data  
* Medical records

Each category of data is stored in a structured format within a relational database.

---

#  **3\. Data Entities and Their Attributes**

Entities represent real-world objects in the system. Each entity contains attributes (fields) that describe it.

---

## **3.1 Patient Entity**

This entity stores all information related to patients.

### **Attributes:**

* patient\_id (Primary Key)  
* name  
* age  
* gender  
* phone  
* email  
* address  
* password

### **Description:**

The Patient entity is central to the system as it holds personal and medical-related information for each patient.

---

##  **3.2 Doctor Entity**

Stores details of doctors in the hospital.

### **Attributes:**

* doctor\_id (Primary Key)  
* name  
* specialization  
* phone  
* email  
* password

### **Description:**

Doctors are responsible for diagnosis and treatment. Their information is linked to appointments and medical records.

---

## **3.3 Admin Entity**

Stores system administrator details.

### **Attributes:**

* admin\_id (Primary Key)  
* name  
* email  
* password

### **Description:**

Admin controls system operations and manages users.

---

##  **3.4 Receptionist Entity**

Stores details of reception staff.

### **Attributes:**

* receptionist\_id (Primary Key)  
* name  
* phone  
* email  
* password

### **Description:**

Receptionists handle patient registration and appointment scheduling.

---

##  **3.5 Appointment Entity**

Stores appointment details.

### **Attributes:**

* appointment\_id (Primary Key)  
* patient\_id (Foreign Key)  
* doctor\_id (Foreign Key)  
* appointment\_date  
* appointment\_time  
* status

### **Description:**

This entity links patients and doctors and tracks scheduled visits.

---

##  **3.6 Medical Records Entity**

Stores patient medical history.

### **Attributes:**

* record\_id (Primary Key)  
* patient\_id (Foreign Key)  
* doctor\_id (Foreign Key)  
* diagnosis  
* treatment  
* date

### **Description:**

This entity keeps track of patient diagnosis and treatment over time.

---

# **4\. Data Relationships**

Relationships define how entities are connected.

### **Key Relationships:**

* One Patient → Many Appointments (**1:M**)  
* One Doctor → Many Appointments (**1:M**)  
* One Patient → Many Medical Records (**1:M**)  
* One Doctor → Many Medical Records (**1:M**)

### **Explanation:**

* A patient can have multiple appointments  
* A doctor can treat multiple patients  
* Each medical record belongs to one patient and one doctor

---

# **🟦 5\. Data Dictionary (IMPORTANT FOR UNIVERSITY)**

A data dictionary provides detailed information about each data field.

---

## **Example: Patient Table**

| Field | Type | Description |
| ----- | ----- | ----- |
| patient\_id | INT | Unique identifier |
| name | VARCHAR | Patient name |
| age | INT | Patient age |
| gender | VARCHAR | Male/Female |
| phone | VARCHAR | Contact number |
| email | VARCHAR | Email address |
| password | VARCHAR | Login password |

---

## **Example: Appointment Table**

| Field | Type | Description |
| ----- | ----- | ----- |
| appointment\_id | INT | Unique ID |
| patient\_id | INT | Links to patient |
| doctor\_id | INT | Links to doctor |
| appointment\_date | DATE | Date of visit |
| appointment\_time | TIME | Time of visit |
| status | VARCHAR | Pending/Completed |

---

# **6\. Data Integrity Constraints**

To ensure data accuracy and consistency:

* **Primary Key (PK):** Uniquely identifies records  
* **Foreign Key (FK):** Links tables  
* **NOT NULL:** Prevents empty fields  
* **UNIQUE:** Avoids duplicate entries

---

#  **7\. Data Storage and Management**

* Data will be stored in a **MySQL relational database**  
* Data will be organized into tables  
* Relationships will be maintained using foreign keys  
* Regular backups will be implemented

---

# **8\. Data Security Requirements**

To protect sensitive information:

* User authentication (login system)  
* Password encryption  
* Role-based access control  
* Restricted access to medical records

---

# **9\. Data Flow Overview**

The system will process data as follows:

1. Patient registers → data stored  
2. Appointment created → linked to doctor  
3. Doctor updates medical record  
4. Admin monitors system data

---

# **10\. Conclusion**

The data requirements define the structure and organization of information within the Patient Management System. Proper data management ensures accuracy, security, and efficiency in hospital operations.

