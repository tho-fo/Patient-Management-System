#  **USE CASE MODEL**

## **PATIENT MANAGEMENT SYSTEM**

---

#  **1\. Introduction**

A Use Case Model is a fundamental part of system analysis and design that describes how users (actors) interact with a system to achieve specific goals. It provides a clear understanding of system functionality from the user’s perspective.

In the Patient Management System, the use case model identifies all system users and defines the interactions they have with the system. This helps in designing a system that meets user requirements and improves healthcare service delivery.

---

# **2\. Actors in the System**

Actors are entities that interact with the system. In this system, there are four primary actors:

---

 **2.1 Admin**

The Admin is responsible for managing and controlling the entire system. The admin ensures that all system operations run smoothly and efficiently.

### **Responsibilities:**

* Managing users (Doctors, Receptionists, Patients)  
* Monitoring system activities  
* Viewing reports

---

## **2.2 Doctor**

The Doctor is responsible for handling medical-related operations in the system.

### **Responsibilities:**

* Viewing patient details  
* Diagnosing patients  
* Prescribing treatment  
* Managing medical records

---

##  **2.3 Receptionist**

The Receptionist acts as the intermediary between patients and the hospital system.

### **Responsibilities:**

* Registering patients  
* Scheduling appointments  
* Updating patient information

---

##  **2.4 Patient** 

The Patient is the end-user of the system who receives healthcare services.

### **Responsibilities:**

* Registering in the system  
* Booking appointments  
* Viewing medical records  
* Managing personal profile

---

# **3\. Use Case Identification**

Use cases represent the different actions that each actor can perform within the system.

---

##  **3.1 Admin Use Cases**

### **Explanation:**

The Admin has full control over the system and manages all users and operations.

| Use Case | Detailed Explanation |
| ----- | ----- |
| Login | Admin enters credentials to access the system |
| Manage Users | Admin can add, update, or delete doctors, receptionists, and patients |
| View Reports | Admin can view system reports such as number of patients, appointments |
| Logout | Admin exits the system |

---

##  **3.2 Doctor Use Cases**

### **Explanation:**

The Doctor focuses on patient care and medical information management.

| Use Case | Detailed Explanation |
| ----- | ----- |
| Login | Doctor logs into the system |
| View Patients | Doctor accesses patient records |
| Update Diagnosis | Doctor records patient diagnosis |
| Prescribe Treatment | Doctor enters treatment or medication |
| View Appointments | Doctor checks scheduled appointments |
| Logout | Doctor logs out |

---

##  **3.3 Receptionist Use Cases**

### **Explanation:**

The Receptionist handles administrative tasks related to patient interaction.

| Use Case | Detailed Explanation |
| ----- | ----- |
| Login | Receptionist logs into system |
| Register Patient | Inputs patient details into system |
| Schedule Appointment | Books appointments for patients |
| Update Patient Info | Edits patient details when necessary |
| Logout | Logs out of system |

---

##  **3.4 Patient Use Cases** 

### **Explanation:**

The Patient interacts with the system to access services and personal health information.

| Use Case | Detailed Explanation |
| ----- | ----- |
| Register | Patient creates an account |
| Login | Patient logs into system |
| View Profile | Patient views personal details |
| Book Appointment | Patient schedules appointment with doctor |
| View Appointments | Patient checks appointment history |
| View Medical Records | Patient accesses diagnosis and treatment |
| Logout | Patient exits system |

---

# **4\. Detailed Use Case Descriptions**

---

## **4.1 Use Case: Login**

* **Actors:** Admin, Doctor, Receptionist, Patient  
* **Description:** Allows users to access the system securely  
* **Precondition:** User must have a registered account

### **Main Flow:**

1. User enters username and password  
2. System verifies credentials  
3. System grants access

### **Alternative Flow:**

* If credentials are incorrect → display error message

### **Postcondition:**

* User is redirected to dashboard

---

##  **4.2 Use Case: Register Patient**

* **Actors:** Receptionist / Patient  
* **Description:** Creates a new patient record

### **Main Flow:**

1. User enters patient details (name, age, contact)  
2. System validates data  
3. System saves information

### **Postcondition:**

* Patient record is stored in database

---

## **4.3 Use Case: Book Appointment**

* **Actors:** Patient / Receptionist  
* **Description:** Schedules an appointment

### **Main Flow:**

1. Select doctor  
2. Choose date and time  
3. Confirm appointment

### **Alternative Flow:**

* If slot unavailable → choose another time

### **Postcondition:**

* Appointment is saved

---

## **4.4 Use Case: Update Medical Record**

* **Actor:** Doctor  
* **Description:** Updates patient medical data

### **Main Flow:**

1. Doctor selects patient  
2. Enters diagnosis  
3. Adds treatment  
4. Saves record

### **Postcondition:**

* Medical record updated

---

##  **4.5 Use Case: Manage Users**

* **Actor:** Admin  
* **Description:** Controls system users

### **Main Flow:**

1. Admin selects user type  
2. Adds/edits/deletes user  
3. Saves changes

---

# **5\. Use Case Relationships**

---

##  **Include Relationship**

Some actions must always happen:

 Example:

* Login is required before accessing system features

---

##  **Extend Relationship**

Optional actions:

 Example:

* Book Appointment → Extend → Cancel Appointment

---

#  **6\. Use Case Diagram Explanation**

The Use Case Diagram visually represents interactions between actors and the system.

### **Key Components:**

* Actors (stick figures)  
* Use Cases (ovals)  
* System boundary (rectangle)

---

##  **Example Structure**

Patient → Book Appointment  
Doctor → Update Diagnosis  
Admin → Manage Users  
Receptionist → Register Patient  
---

#  **7\. Importance of Use Case Model**

The use case model helps to:

* Understand system functionality clearly  
* Identify user requirements  
* Guide system design and development  
* Improve communication between stakeholders

---

#  **8\. Conclusion**

The Use Case Model provides a clear representation of how different users interact with the Patient Management System. By defining all actors and their interactions, the system ensures that all user needs are captured and addressed effectively.

