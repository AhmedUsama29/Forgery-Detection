from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io, base64, os, shutil, uuid, json

# مكتبات التشفير
from Crypto.Hash import SHA256
from Crypto.Signature import pkcs1_15
from Crypto.PublicKey import RSA

# مكتبات الـ PDF والـ QR
import fitz  # PyMuPDF
import qrcode
from reportlab.pdfgen import canvas
from PIL import Image
from pyzbar.pyzbar import decode

app = FastAPI(title="Hybrid Digital Degree Security API 🎓🔐")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PUB_KEY = "public.pem"
PRIV_KEY = "private.pem"
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class StudentData(BaseModel):
    student_name: str
    faculty: str
    grade: str
    graduation_year: str

# 1. إصدار الشهادة (النظام الهجين - Byte Level)
@app.post("/issue-certificate")
def issue_certificate(student: StudentData):
    if not os.path.exists(PRIV_KEY):
        raise HTTPException(400, "Private key not found.")
    
    # --- الطبقة الأولى: حماية البيانات (QR Code) ---
    data_dict = student.dict()
    data_string = json.dumps(data_dict, separators=(',', ':'), sort_keys=True).encode('utf-8')
    data_hash = SHA256.new(data_string)
    
    priv_key = RSA.import_key(open(PRIV_KEY, "rb").read())
    data_sig = pkcs1_15.new(priv_key).sign(data_hash)
    data_sig_b64 = base64.b64encode(data_sig).decode()
    
    qr_content = json.dumps({"data": data_dict, "signature": data_sig_b64})
    qr = qrcode.make(qr_content)
    qr_path = f"{UPLOAD_DIR}/qr_{uuid.uuid4()}.png"
    qr.save(qr_path)
    
    # رسم الـ PDF
    temp_pdf = f"{UPLOAD_DIR}/temp_{uuid.uuid4()}.pdf"
    c = canvas.Canvas(temp_pdf)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(100, 750, "Benha University - Official Certificate")
    c.setFont("Helvetica", 14)
    c.drawString(100, 700, f"Name: {student.student_name}")
    c.drawString(100, 670, f"Faculty: {student.faculty}")
    c.drawString(100, 640, f"Grade: {student.grade}")
    c.drawString(100, 610, f"Year: {student.graduation_year}")
    c.drawImage(qr_path, 400, 100, width=150, height=150)
    c.save()
    os.remove(qr_path)

    # --- الطبقة الثانية: حماية الملف (Byte Append Signature) ---
    with open(temp_pdf, "rb") as f:
        pdf_bytes = f.read()
    
    file_hash = SHA256.new(pdf_bytes)
    file_sig = pkcs1_15.new(priv_key).sign(file_hash)
    file_sig_b64 = base64.b64encode(file_sig).decode()
    
    # السر هنا: بنلزق التوقيع في آخر الملف خارج تركيبة الـ PDF
    final_bytes = pdf_bytes + f"\n%VERIFY_SIG:{file_sig_b64}".encode('utf-8')
    
    encoded_pdf = base64.b64encode(final_bytes).decode('utf-8')
    os.remove(temp_pdf)
    
    return {"file_name": f"Certificate_{student.student_name}.pdf", "pdf_base64": encoded_pdf}


# 2. التحقق الشامل (Hybrid Verification)
@app.post("/verify")
async def verify(file: UploadFile = File(...)):
    path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.pdf")
        
    try:
        # أ- فحص الـ Soft Copy كـ (Raw Bytes)
        raw_bytes = await file.read()
        marker = b"\n%VERIFY_SIG:"
        
        if marker not in raw_bytes:
            return {"status": "failed", "message": "Soft Copy Tampering: No File Signature found! ❌"}
            
        # نفصل الملف الأصلي عن التوقيع اللي في الآخر
        original_pdf_bytes, file_sig_b64_bytes = raw_bytes.rsplit(marker, 1)
        
        current_file_hash = SHA256.new(original_pdf_bytes)
        pub_key = RSA.import_key(open(PUB_KEY, "rb").read())
        
        try:
            pkcs1_15.new(pub_key).verify(current_file_hash, base64.b64decode(file_sig_b64_bytes))
            soft_copy_status = "Secure ✅"
        except Exception:
            return {"status": "failed", "message": "Soft Copy Tampering: Binary file modified after signing! ❌"}

        # ب- نحفظ الملف الأصلي عشان نقرأ منه الـ QR والنص
        with open(path, "wb") as f:
            f.write(original_pdf_bytes)

        doc = fitz.open(path)
        qr_data = None
        page_text = ""
        for page in doc:
            page_text += page.get_text("text")
            pix = page.get_pixmap(dpi=300)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            decoded = decode(img)
            if decoded:
                qr_data = json.loads(decoded[0].data.decode('utf-8'))
                break
        
        if not qr_data:
            return {"status": "error", "message": "No valid QR code found."}

        # ج- مطابقة البيانات بالـ QR (قفلنا ثغرة الـ Word)
        ext = qr_data["data"]
        if (ext["student_name"] not in page_text or 
            ext["grade"] not in page_text or 
            ext["faculty"] not in page_text or 
            ext["graduation_year"] not in page_text):
            return {"status": "failed", "message": "Visual Tampering: Text on PDF does not match QR! ❌"}

        # د- التأكد من توقيع الـ QR
        data_string = json.dumps(ext, separators=(',', ':'), sort_keys=True).encode('utf-8')
        pkcs1_15.new(pub_key).verify(SHA256.new(data_string), base64.b64decode(qr_data["signature"]))

        return {
            "status": "success",
            "soft_copy": soft_copy_status,
            "hard_copy": "Authentic ✅",
            "student_info": ext
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"status": "failed", "message": f"Security Breach or Tampering detected."}
    finally:
        if 'doc' in locals(): doc.close()
        if os.path.exists(path): os.remove(path)