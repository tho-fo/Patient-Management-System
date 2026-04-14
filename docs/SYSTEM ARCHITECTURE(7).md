#  **SYSTEM ARCHITECTURE**

## **Patient Management System**

---

##  **1\. Introduction to System Architecture**

System architecture defines **how different parts of the system interact** to deliver functionality.

For your Patient Management System, we use a **3-tier architecture**, which separates the system into independent layers:

* Presentation Layer (User Interface)  
* Application Layer (Business Logic)  
* Data Layer (Database)

 This separation is very important because it:

* Improves **security**  
* Makes the system **easy to maintain**  
* Allows **future upgrades**

---

##  **2\. Overall Architectural Structure**

Users (Admin / Doctor / Receptionist / Patient)  
               ↓  
Presentation Layer (Frontend UI)  
               ↓  
Application Layer (Backend Logic)  
               ↓  
Data Layer (Database \- MySQL)  
---

##  **3\. Detailed Explanation of Each Layer**

---

###  **3.1 Presentation Layer (Frontend)**

This is the **top layer** where users interact with the system.

#### **Components:**

* Login page  
* Registration forms  
* Dashboard  
* Patient forms  
* Appointment forms

#### **Technologies Used:**

* HTML → structure of pages  
* CSS → styling  
* Bootstrap → responsive design  
* JavaScript → interactivity

####  **Functions:**

* Collect user input (e.g., patient details)  
* Display information (e.g., medical records)  
* Send requests to backend

#### **Example:**

When a receptionist enters a new patient:

* The form collects data  
* Sends it to backend for processing

---

###  **3.2 Application Layer (Backend)**

This is the **core (brain)** of the system.

####  **Components:**

* Authentication system  
* Business logic  
* Validation system  
* API or server scripts

#### **Technologies:**

* PHP (common for your level)  
   *(or Node.js if advanced)*

####  **Functions:**

* Processes requests from frontend  
* Validates input data  
* Applies rules (e.g., no duplicate patient ID)  
* Communicates with database

####  **Example:**

When user logs in:

1. Backend receives username/password  
2. Checks database  
3. Returns success or error

---

###  **3.3 Data Layer (Database)**

This is where **all system data is stored permanently**.

#### **Database Used:**

* MySQL

####  **Tables:**

* patients  
* doctors  
* admin  
* receptionist  
* appointments  
* medical\_records

####  **Functions:**

* Store data  
* Retrieve data  
* Maintain relationships using:  
  * Primary Keys (PK)  
  * Foreign Keys (FK)

####  **Example:**

* A patient record is saved  
* Doctor retrieves it during consultation

---

##  **4\. Interaction Between Layers**

Let’s break it down clearly:

### **Example: Booking Appointment**

1. User enters data (Frontend)  
2. Data sent to backend  
3. Backend validates input  
4. Backend stores in database  
5. Database confirms storage  
6. Backend sends success message  
7. Frontend displays confirmation

---

##  **5\. User Roles in Architecture**

---

###  **Doctor**

* Access patient records  
* Update diagnosis  
* Prescribe treatment

---

###  **Admin**

* Manage system users  
* Generate reports  
* Control system access

---

###  **Receptionist**

* Register patients  
* Schedule appointments

---

###  **Patient**

* View records  
* Book appointments

---

##  **6\. Deployment Architecture (Real Environment)**

This shows how the system runs physically:

Client (Browser)  
   ↓  
Web Server (Apache / XAMPP)  
   ↓  
Application (PHP Scripts)  
   ↓  
Database Server (MySQL)  
---

##  **7\. Security in Architecture**

Security is very important in hospital systems.

####  **Measures:**

* Login authentication  
* Password encryption  
* Role-based access control  
* Database protection

---

##  **8\. Advantages of This Architecture**

* ✔ Separation of concerns  
* ✔ Easy debugging  
* ✔ Scalable system  
* ✔ Secure data handling  
* ✔ Reusable components

---

##  **9\. Limitations**

* Requires server setup  
* Needs technical knowledge  
* Internet required (if web-based)

---

##  **10\. Conclusion**

The 3-tier architecture provides a **strong foundation** for the Patient Management System. It ensures:

* Efficient communication between components  
* Secure handling of patient data  
* Flexibility for future expansion

