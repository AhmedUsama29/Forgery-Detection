# 🔍 Forgery Detection

A full-stack application that detects document and image forgeries using cryptographic signing (RSA) and integrity verification techniques. The project combines a Python backend with a TypeScript/HTML frontend.

---

## 📌 Features

- **Forgery Detection** – Identifies whether a document or image has been tampered with
- **RSA Digital Signatures** – Uses asymmetric cryptography (private/public key pair) to sign and verify content integrity
- **REST API Backend** – Python-powered server exposing detection endpoints
- **Modern Frontend** – TypeScript + HTML interface for uploading and verifying files

---

## 🗂️ Project Structure

```
Forgery-Detection/
├── main.py              # Python backend entry point (FastAPI / Flask)
├── requirements.txt     # Python dependencies
├── private.pem          # RSA private key (used for signing)
├── public.pem           # RSA public key (used for verification)
├── frontend/            # TypeScript + HTML frontend
│   └── ...
├── package.json         # Node.js / frontend dependencies
└── package-lock.json
```

---

## 🛠️ Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Backend   | Python (FastAPI / Flask)|
| Crypto    | RSA (PEM key pairs)     |
| Frontend  | TypeScript, HTML, CSS   |
| Package Mgmt | pip, npm            |

---

## ⚙️ Setup & Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm

---

### 1. Clone the Repository

```bash
git clone https://github.com/AhmedUsama29/Forgery-Detection.git
cd Forgery-Detection
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
```

The backend will start on `http://localhost:8000` (or whichever port is configured in `main.py`).

### 3. Frontend Setup

```bash
# Install Node dependencies
npm install

# Start the frontend (development)
npm start
```

---

## 🔐 How It Works

1. **Signing** – When a document is submitted, the backend signs its hash using the RSA **private key** (`private.pem`), creating a digital signature.
2. **Verification** – To verify, the backend uses the RSA **public key** (`public.pem`) to check whether the signature matches the document's current hash.
3. **Forgery Detection** – If the document has been altered in any way, the hash will differ from the signed hash, and the verification will **fail**, flagging the document as forged.

---

## 📡 API Endpoints

| Method | Endpoint     | Description                        |
|--------|--------------|------------------------------------|
| POST   | `/sign`      | Sign a document and return a signature |
| POST   | `/verify`    | Verify a document against its signature |

> *Exact endpoint names may vary — check `main.py` for the full API definition.*

---

## 🖥️ Frontend Usage

1. Open the frontend in your browser after running `npm start`
2. Upload a file or paste document content
3. Click **Sign** to generate a cryptographic signature, or **Verify** to check integrity
4. The result will indicate whether the document is **authentic** or **forged**

---

## 🔑 Key Management

> ⚠️ **Security Warning:** The `private.pem` and `public.pem` files in this repository are for **development/demo purposes only**. In a production environment:
> - Never commit private keys to version control
> - Store keys securely using environment variables or a secrets manager
> - Rotate keys regularly

To generate a new key pair:

```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Extract public key
openssl rsa -in private.pem -pubout -out public.pem
```

---

## 📋 Requirements

### Python (`requirements.txt`)
Key dependencies likely include:
- `fastapi` or `flask` – Web framework
- `cryptography` or `pycryptodome` – RSA signing & verification
- `uvicorn` – ASGI server (if FastAPI)

### Node (`package.json`)
- TypeScript compiler
- Frontend build tooling

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push and open a Pull Request

---

## 📄 License

This project is open source. See the repository for license details.

---

## 👥 Team

| Name | GitHub |
|------|--------|
| **Ahmed Osama** | [@AhmedUsama29](https://github.com/AhmedUsama29) |
| **Mariam Ehab** | [@mariemehab](https://github.com/mariemehab) |
| **Mohammed Elsayed** | — |
| **Ahmed Fathy** | — |
| **Mohammed Eslam** | — |
