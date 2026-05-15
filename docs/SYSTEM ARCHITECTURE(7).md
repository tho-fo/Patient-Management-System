# **SYSTEM ARCHITECTURE**

## **Patient Management System**

---

## **1. Introduction to System Architecture**

System architecture defines **how different parts of the system interact** to deliver functionality.

For the Patient Management System, we use a **Firebase-based 3-tier architecture**, which separates the system into independent layers:

* Presentation Layer (User Interface)
* Application/Service Layer (Firebase services and backend logic)
* Data Layer (Cloud Firestore)

This separation is very important because it:

* Improves **security**
* Makes the system **easy to maintain**
* Allows **future upgrades**

---

## **2. Overall Architectural Structure**

Users (Admin / Doctor / Receptionist / Patient)
-> Presentation Layer (Frontend UI)
-> Application Layer (Firebase Authentication + Cloud Functions)
-> Data Layer (Cloud Firestore)

---

## **3. Detailed Explanation of Each Layer**

---

### **3.1 Presentation Layer (Frontend)**

This is the **top layer** where users interact with the system.

#### **Components:**

* Login page
* Registration forms
* Dashboard
* Patient forms
* Appointment forms

#### **Technologies Used:**

* HTML -> structure of pages
* CSS -> styling
* Bootstrap -> responsive design
* JavaScript -> interactivity

#### **Functions:**

* Collect user input (for example, patient details)
* Display information (for example, medical records)
* Send requests to Firebase services

#### **Example:**

When a receptionist enters a new patient:

* The form collects data
* The application validates the data
* The data is sent to Firestore or Cloud Functions for processing

---

### **3.2 Application / Service Layer**

This is the **core service layer** of the system.

#### **Components:**

* Firebase Authentication
* Business logic services
* Validation rules
* Firebase Cloud Functions
* Firestore security rules

#### **Technologies:**

* Firebase Authentication
* Firebase Cloud Functions
* Firebase SDK

#### **Functions:**

* Authenticates users
* Processes requests from frontend
* Validates input data
* Applies business rules (for example, no duplicate patient ID)
* Controls secure access to Firestore data

#### **Example:**

When a user logs in:

1. Firebase Authentication receives the login request
2. The user is verified
3. The application loads the user's role and permissions
4. The user is granted access to the correct dashboard

---

### **3.3 Data Layer (Database)**

This is where **all system data is stored permanently**.

#### **Database Used:**

* Cloud Firestore

#### **Main Collections:**

* admins
* doctors
* receptionists
* patients
* appointments
* medicalRecords

#### **Functions:**

* Store data
* Retrieve data
* Maintain document relationships using document IDs and references

#### **Example:**

* A patient record is saved in the `patients` collection
* A doctor retrieves it during consultation

---

## **4. Interaction Between Layers**

### **Example: Booking Appointment**

1. User enters data (Frontend)
2. Data is sent to the service layer
3. Input is validated
4. Appointment is stored in Cloud Firestore
5. Firestore confirms the write
6. The application returns success
7. Frontend displays confirmation

---

## **5. User Roles in Architecture**

### **Doctor**

* Access patient records
* Update diagnosis
* Prescribe treatment

### **Admin**

* Manage system users
* Generate reports
* Control system access

### **Receptionist**

* Register patients
* Schedule appointments

### **Patient**

* View records
* Book appointments

---

## **6. Deployment Architecture (Real Environment)**

This shows how the system runs physically:

Client (Browser)
-> Web Application
-> Firebase Authentication / Cloud Functions / Cloud Firestore

Optional deployment support:

* Firebase Hosting for frontend deployment
* Firebase Emulator Suite for local testing

---

## **7. Security in Architecture**

Security is very important in hospital systems.

#### **Measures:**

* Firebase Authentication for login control
* Role-based access control
* Firestore security rules
* Protected handling of patient records
* Audit logging through backend services

---

## **8. Advantages of This Architecture**

* Separation of concerns
* Reduced server maintenance
* Easy scaling with managed cloud services
* Secure data handling
* Faster implementation for authentication and backend workflows

---

## **9. Limitations**

* Requires internet connectivity
* Depends on Firebase service availability
* Requires careful security-rule configuration

---

## **10. Conclusion**

The Firebase-based 3-tier architecture provides a strong foundation for the Patient Management System. It ensures:

* Efficient communication between components
* Secure handling of patient data
* Flexibility for future expansion
* Simpler backend management through managed cloud services
