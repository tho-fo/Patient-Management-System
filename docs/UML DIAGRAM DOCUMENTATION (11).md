# **UML DIAGRAM DOCUMENT**

## **Patient Management System – Hospital Management & Patient Care Platform**

---

# **1\. INTRODUCTION**

## **1.1 Purpose**

This document defines the key UML diagrams for the Patient Management System. It models the system behavior, structure, and interactions based on the approved requirements, system architecture, database schema, and UI flow.

## **1.2 Scope**

The UML coverage includes:

* Use Case Diagram  
* Class Diagram  
* Sequence Diagrams  
* Activity Diagrams  
* Component Diagram

These diagrams focus on the core and extended system scope:

* hospital management system (desktop/web)  
* backend system operations  
* patient management  
* appointment scheduling  
* medical records handling

---

# **2\. USE CASE DIAGRAM**

## **2.1 Purpose**

Shows the main interactions between users and the system.

## **2.2 Actors**

* Admin  
* Doctor  
* Receptionist  
* Patient

## **2.3 Main Use Cases**

* Login  
* Register Patient  
* Manage Users (Admin)  
* Schedule Appointment  
* View Appointments  
* Update Appointment  
* Add Medical Record  
* View Medical Record  
* Manage Patients  
* Generate Reports

## **2.4 Textual Use Case Representation**

Admin

* Login  
* Manage Doctors  
* Manage Receptionists  
* View Reports

Receptionist

* Register Patient  
* Schedule Appointment  
* Manage Patient Records

Doctor

* View Appointments  
* View Patient Records  
* Add Diagnosis  
* Update Medical Records

Patient

* View Appointments  
* View Medical Records

---

# **3\. CLASS DIAGRAM**

## **3.1 Purpose**

Shows the main system entities and their relationships.

## **3.2 Core Classes**

* User  
* Doctor  
* Receptionist  
* Patient  
* Appointment  
* MedicalRecord

## **3.3 Class Diagram (Text Representation)**

classDiagram

   class User {  
       \+int id  
       \+string name  
       \+string email  
       \+string password  
       \+string role  
       \+datetime created\_at  
   }

   class Doctor {  
       \+int id  
       \+int user\_id  
       \+string specialization  
       \+string phone  
   }

   class Receptionist {  
       \+int id  
       \+int user\_id  
       \+string phone  
   }

   class Patient {  
       \+int id  
       \+string name  
       \+int age  
       \+string gender  
       \+string phone  
       \+string address  
       \+datetime created\_at  
   }

   class Appointment {  
       \+int id  
       \+int patient\_id  
       \+int doctor\_id  
       \+datetime appointment\_date  
       \+string status  
       \+datetime created\_at  
   }

   class MedicalRecord {  
       \+int id  
       \+int patient\_id  
       \+int doctor\_id  
       \+text diagnosis  
       \+text treatment  
       \+date record\_date  
   }

   User "1" \--\> "1" Doctor : has  
   User "1" \--\> "1" Receptionist : has  
   Patient "1" \--\> "0..\*" Appointment : books  
   Doctor "1" \--\> "0..\*" Appointment : attends  
   Patient "1" \--\> "0..\*" MedicalRecord : has  
   Doctor "1" \--\> "0..\*" MedicalRecord : writes  
---

# **4\. SEQUENCE DIAGRAMS**

---

## **4.1 Patient Registration**

### **Purpose**

Shows how a patient is registered into the system.

sequenceDiagram

   actor Receptionist  
   participant UI as System Interface  
   participant API as Backend System  
   participant DB as Database

   Receptionist-\>\>UI: Enter patient details  
   Receptionist-\>\>UI: Click Save  
   UI-\>\>API: Send patient data  
   API-\>\>DB: Insert patient record  
   DB--\>\>API: Success  
   API--\>\>UI: Patient created  
   UI--\>\>Receptionist: Display success message  
---

## **4.2 Appointment Scheduling**

### **Purpose**

Shows how an appointment is created.

sequenceDiagram

   actor Receptionist  
   participant UI  
   participant API  
   participant DB

   Receptionist-\>\>UI: Select patient & doctor  
   Receptionist-\>\>UI: Choose date & time  
   UI-\>\>API: Send appointment request  
   API-\>\>DB: Save appointment  
   DB--\>\>API: Success  
   API--\>\>UI: Appointment confirmed  
   UI--\>\>Receptionist: Show confirmation  
---

## **4.3 Doctor Adds Medical Record**

### **Purpose**

Shows how a doctor records diagnosis and treatment.

sequenceDiagram

   actor Doctor  
   participant UI  
   participant API  
   participant DB

   Doctor-\>\>UI: Select patient  
   Doctor-\>\>UI: Enter diagnosis & treatment  
   UI-\>\>API: Submit record  
   API-\>\>DB: Insert medical record  
   DB--\>\>API: Success  
   API--\>\>UI: Record saved  
   UI--\>\>Doctor: Show confirmation  
---

## **4.4 View Patient Records**

### **Purpose**

Shows how records are retrieved.

sequenceDiagram

   actor Doctor  
   participant UI  
   participant API  
   participant DB

   Doctor-\>\>UI: Request patient records  
   UI-\>\>API: GET records  
   API-\>\>DB: Fetch records  
   DB--\>\>API: Return data  
   API--\>\>UI: Send records  
   UI--\>\>Doctor: Display records  
---

# **5\. ACTIVITY DIAGRAMS**

---

## **5.1 Patient Registration Activity**

flowchart TD  
   A\[Open Registration Form\] \--\> B\[Enter Patient Details\]  
   B \--\> C\[Submit Form\]  
   C \--\> D{Valid Input?}  
   D \-- No \--\> E\[Show Error\]  
   E \--\> B  
   D \-- Yes \--\> F\[Save to Database\]  
   F \--\> G\[Display Success Message\]  
---

## **5.2 Appointment Scheduling Activity**

flowchart TD  
   A\[Select Patient\] \--\> B\[Select Doctor\]  
   B \--\> C\[Choose Date & Time\]  
   C \--\> D\[Submit Appointment\]  
   D \--\> E{Valid?}  
   E \-- No \--\> F\[Show Error\]  
   F \--\> B  
   E \-- Yes \--\> G\[Save Appointment\]  
   G \--\> H\[Confirm Booking\]  
---

## **5.3 Medical Record Entry Activity**

flowchart TD  
   A\[Doctor Login\] \--\> B\[View Patients\]  
   B \--\> C\[Select Patient\]  
   C \--\> D\[Enter Diagnosis\]  
   D \--\> E\[Enter Treatment\]  
   E \--\> F\[Submit Record\]  
   F \--\> G\[Save to Database\]  
   G \--\> H\[Show Confirmation\]  
---

# **6\. COMPONENT DIAGRAM**

## **6.1 Purpose**

Shows the main technical building blocks and their connections.

flowchart LR  
   A\[User Interface\] \--\> B\[Backend System\]  
   B \--\> C\[Authentication Module\]  
   B \--\> D\[Patient Module\]  
   B \--\> E\[Appointment Module\]  
   B \--\> F\[Medical Record Module\]  
   B \--\> G\[User Management Module\]  
   B \--\> H\[Reporting Module\]

   C \--\> I\[(Database)\]  
   D \--\> I  
   E \--\> I  
   F \--\> I  
   G \--\> I  
   H \--\> I  
---

# **7\. STATE TRANSITION NOTES**

## **7.1 Appointment State**

Appointments move through these states:

* Scheduled → Completed  
* Scheduled → Cancelled

---

## **7.2 User Session State**

* Logged Out → Login → Logged In → Logout

---

# **8\. UML DESIGN NOTES**

* **Patient is the central entity** in the system  
* **Appointment connects patient and doctor**  
* **MedicalRecord stores clinical data**  
* **User controls authentication and system roles**  
* Doctor and Receptionist are separated for proper role-based access  
* Reporting is handled as a system module, not a stored entity  
* The system is designed to support future modules like billing and laboratory 

