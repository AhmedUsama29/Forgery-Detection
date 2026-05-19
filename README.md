#  Forgery Detection & Authentication System

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Angular](https://img.shields.io/badge/Angular-17+-dd1b16.svg?logo=angular&logoColor=white)](https://angular.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A highly secure, hybrid architecture for digital and printed document verification.**
The Document Forgery Detection & Authentication System provides an end-to-end cryptographic and computer vision-based framework to ensure the integrity, authenticity, and non-repudiation of sensitive documents. By utilizing asymmetric cryptography for digital verification and optical character recognition (OCR) coupled with Quick Response (QR) codes for hard-copy validation, the system effectively mitigates sophisticated forgery attempts, including unauthorized modifications and deep-fake document alterations.

---

##  The 4-Layer Defense Mechanism

Our security topology is designed as a multi-tiered validation pipeline, ensuring that tampering is detected at the lowest possible computational cost while providing mathematically provable authenticity.

| Layer | Defense Mechanism | Description |
| :---: | :--- | :--- |
| **0** | **Marker Check** | Fast-fail verification scanning for the embedded `\n%VERIFY_SIG:` hidden marker indicating the presence of our cryptographic signature. |
| **1** | **Cryptographic Check** | Decrypts the Base64-encoded RSA signature and verifies the payload against a computed SHA-256 hash using strict **PKCS#1 v1.5** padding, ensuring mathematical integrity. |
| **2** | **Registry Check** | An $O(1)$ temporal complexity lookup against our SQLite registry using UUIDs and cryptographic hashes to guarantee the certificate has not been revoked or expired. |
| **3** | **Visual / Hard-copy Check** | Decodes canonicalized JSON from the embedded QR code and cross-references the payload with OCR-extracted visible text via **PyMuPDF**, effectively detecting visual tampering (e.g., Photoshop alterations). |

---

##  Technology Stack

| Category | Technologies Used |
| :--- | :--- |
| **Backend & API** | Python, FastAPI, Uvicorn |
| **Frontend UI** | Angular, TypeScript |
| **Database ORM** | SQLite, SQLAlchemy |
| **Cryptography & CV** | RSA, SHA-256 (`PyCryptodome`), PyMuPDF (OCR), `pyzbar` (QR decoding) |

---

## 📂 Project Structure

```text
├── backend/
│   ├── main.py                  # FastAPI application entry point
│   ├── core/                    # Cryptographic & validation logic
│   ├── api/                     # API routers and endpoints
│   ├── models/                  # SQLAlchemy ORM models
│   ├── database.py              # SQLite configuration
│   └── requirements.txt         # Python dependencies
└── frontend/
    ├── src/                     # Angular source code
    │   ├── app/                 # Components & Services
    │   ├── assets/              # Static assets
    │   └── environments/        # Environment configurations
    ├── angular.json             # Angular workspace configuration
    └── package.json             # Node.js dependencies
```

---

##  Installation & Setup

Follow the steps below to run the system locally.

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend
npm install
ng serve
```
*The frontend will be available at `http://localhost:4200/` and the backend Swagger UI at `http://localhost:8000/docs`.*

---

##  Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/issue-certificate` | Generates a new cryptographically signed document and QR code. |
| `POST` | `/verify` | Validates a document by passing it through the 4-Layer Defense Mechanism. |
| `GET`  | `/certificates` | Retrieves a paginated list of all issued certificates. |
| `DELETE` | `/certificates/{doc_id}` | Revokes a specific certificate by its unique identifier. |

---

##  Engineering Team

| Name | GitHub |
|------|--------|
| **Ahmed Osama** | [@AhmedUsama29](https://github.com/AhmedUsama29) |
| **Mariam Ehab** | [@mariemehab](https://github.com/mariemehab) |
| **Mohammed Elsayed** | [@mohamed-Elsayed211](https://github.com/mohamed-Elsayed211) |
| **Ahmed Fathy** | [@ahmedfathy24](https://github.com/ahmedfathy24) |
| **Mohammed Eslam** | [@Mohamed-Eslam6](https://github.com/Mohamed-Eslam6) |

---
