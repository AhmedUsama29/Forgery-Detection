from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import io, base64, os, uuid, json
from datetime import datetime
from sqlalchemy import create_engine, Column, String, DateTime, Text, Integer
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = "sqlite:///./forgery_detection.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class CertificateRecord(Base):
    __tablename__ = "certificates"
    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(String, unique=True, index=True, nullable=False)
    student_name = Column(String, nullable=False)
    faculty = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    graduation_year = Column(String, nullable=False)
    sha256_hash = Column(String, nullable=False, index=True)
    signature_b64 = Column(Text, nullable=False)
    certificate_json = Column(Text, nullable=False)
    issued_at = Column(DateTime, nullable=False, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

from Crypto.Hash import SHA256
from Crypto.Signature import pkcs1_15
from Crypto.PublicKey import RSA
import fitz
import qrcode
from PIL import Image
from pyzbar.pyzbar import decode
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

app = FastAPI(title="Unified Forgery Detection System 🎓🛡️")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

PUB_KEY, PRIV_KEY, UPLOAD_DIR = "public.pem", "private.pem", "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def ensure_rsa_keys_exist():
    if not os.path.exists(PRIV_KEY):
        key = RSA.generate(2048)
        with open(PRIV_KEY, "wb") as f: f.write(key.export_key())
        with open(PUB_KEY, "wb") as f: f.write(key.publickey().export_key())

ensure_rsa_keys_exist()

class StudentData(BaseModel):
    student_name: str
    faculty: str
    grade: str
    graduation_year: str

def create_pro_pdf(student, qr_path):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("T", fontSize=24, textColor=colors.navy, alignment=TA_CENTER, spaceAfter=20)
    body_style = ParagraphStyle("B", fontSize=14, alignment=TA_CENTER, spaceAfter=12)
    elements = [
        Spacer(1, 2*cm), Paragraph("Benha University - Official Certificate", title_style), Spacer(1, 1*cm),
        Paragraph(f"This is to certify that <b>{student.student_name}</b>", body_style),
        Paragraph(f"has graduated from the Faculty of <b>{student.faculty}</b>", body_style),
        Paragraph(f"with a general grade of <b>{student.grade}</b>", body_style),
        Paragraph(f"Class of <b>{student.graduation_year}</b>", body_style),
        Spacer(1, 2*cm), RLImage(qr_path, width=4*cm, height=4*cm), Spacer(1, 1*cm),
        Paragraph("<font size=8 color=grey>Digitally signed and verifiable via QR and EOF Signature.</font>", body_style)
    ]
    doc.build(elements)
    return buffer.getvalue()

@app.post("/issue-certificate")
def issue_certificate(student: StudentData, db: Session = Depends(get_db)):
    priv_key = RSA.import_key(open(PRIV_KEY, "rb").read())
    data_string = json.dumps(student.model_dump(), separators=(',', ':'), sort_keys=True).encode('utf-8')
    data_sig = pkcs1_15.new(priv_key).sign(SHA256.new(data_string))
    qr_content = json.dumps({"data": student.model_dump(), "signature": base64.b64encode(data_sig).decode()})
    qr_path = f"{UPLOAD_DIR}/qr_{uuid.uuid4()}.png"
    qrcode.make(qr_content).save(qr_path)
    pdf_bytes = create_pro_pdf(student, qr_path)
    os.remove(qr_path)
    file_hash = SHA256.new(pdf_bytes)
    file_sig = pkcs1_15.new(priv_key).sign(file_hash)
    file_sig_b64 = base64.b64encode(file_sig).decode()
    final_pdf_bytes = pdf_bytes + f"\n%VERIFY_SIG:{file_sig_b64}".encode('utf-8')
    
    doc_id = str(uuid.uuid4())
    
    pdf_save_path = f"{UPLOAD_DIR}/cert_{doc_id}.pdf"
    with open(pdf_save_path, "wb") as f:
        f.write(final_pdf_bytes)

    record = CertificateRecord(
        doc_id=doc_id, student_name=student.student_name,
        faculty=student.faculty, grade=student.grade, graduation_year=student.graduation_year,
        sha256_hash=file_hash.hexdigest(), signature_b64=file_sig_b64,
        certificate_json=json.dumps(student.model_dump()), issued_at=datetime.utcnow()
    )
    db.add(record)
    db.commit()
    return {"file_name": f"Cert_{student.student_name}.pdf", "pdf_base64": base64.b64encode(final_pdf_bytes).decode()}

@app.get("/certificates")
def get_all_certificates(db: Session = Depends(get_db)):
    return db.query(CertificateRecord).all()

@app.delete("/certificates/{doc_id}")
def delete_certificate(doc_id: str, db: Session = Depends(get_db)):
    record = db.query(CertificateRecord).filter(CertificateRecord.doc_id == doc_id).first()
    if not record: 
        raise HTTPException(404, "Not found")
    
    pdf_path = f"{UPLOAD_DIR}/cert_{doc_id}.pdf"
    if os.path.exists(pdf_path):
        os.remove(pdf_path)
    
    db.delete(record)
    db.commit()
    return {"status": "success", "message": "Certificate revoked"}

@app.get("/certificates/{doc_id}")
def get_cert(doc_id: str, db: Session = Depends(get_db)):
    record = db.query(CertificateRecord).filter(CertificateRecord.doc_id == doc_id).first()
    if not record: 
        raise HTTPException(404, "Not found")
    return record

@app.get("/certificates/{doc_id}/pdf")
def get_certificate_pdf(doc_id: str, db: Session = Depends(get_db)):
    """إعادة ملف PDF للشهادة باستخدام doc_id"""
    record = db.query(CertificateRecord).filter(CertificateRecord.doc_id == doc_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    pdf_path = f"{UPLOAD_DIR}/cert_{doc_id}.pdf"
    
    if os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename=certificate_{doc_id}.pdf"}
        )
    else:
        raise HTTPException(status_code=404, detail="PDF file not found")

@app.post("/verify")
async def verify(file: UploadFile = File(...), db: Session = Depends(get_db)):
    raw_bytes = await file.read()
    marker = b"\n%VERIFY_SIG:"
    
    if marker not in raw_bytes: 
        return {"status": "failed", "message": "Soft Copy Tampering: Signature completely missing! ❌"}
        
    original_pdf_bytes, sig_and_extra = raw_bytes.rsplit(marker, 1)
    
    clean_sig = sig_and_extra.strip()
    if len(clean_sig) > 400:
        return {"status": "failed", "message": "Tampering Detected: File was modified after issuance! (Incremental Update) ❌"}
    
    current_hash = SHA256.new(original_pdf_bytes)
    pub_key = RSA.import_key(open(PUB_KEY, "rb").read())
    
    try:
        pkcs1_15.new(pub_key).verify(current_hash, base64.b64decode(clean_sig.decode('utf-8')))
        
        db_record = db.query(CertificateRecord).filter(CertificateRecord.sha256_hash == current_hash.hexdigest()).first()
        db_status = "Found in Registry ✅" if db_record else "Not in Registry (Off-chain) ⚠️"
        
        path = f"{UPLOAD_DIR}/v_{uuid.uuid4()}.pdf"
        with open(path, "wb") as f: f.write(original_pdf_bytes)
        
        doc = fitz.open(path)
        qr_data, page_text = None, ""
        for page in doc:
            page_text += page.get_text("text")
            pix = page.get_pixmap(dpi=300)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            decoded = decode(img)
            if decoded:
                qr_data = json.loads(decoded[0].data.decode('utf-8'))
                break
        doc.close()
        os.remove(path)

        if not qr_data: 
            return {"status": "failed", "message": "QR Code not readable or missing! ❌"}
        
        ext = qr_data["data"]
        
        if ext["student_name"] not in page_text or ext["grade"] not in page_text:
            return {"status": "failed", "message": "Visual Tampering detected! Text does not match QR. ❌"}
            
        return {
            "status": "success",
            "soft_copy": "Secure ✅",
            "database": db_status,
            "hard_copy": "Authentic ✅",
            "student_info": ext
        }
    except Exception as e:
        print("Verification Error:", e)
        return {"status": "failed", "message": "Tampered or Invalid Signature! ❌"}