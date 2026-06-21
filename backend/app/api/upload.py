from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict
from app.services.ocr_service import extract_text_from_file
from app.services.bom_parser import parse_bom_text

router = APIRouter()

@router.post("/upload-bom", response_model=List[Dict[str, str]])
async def upload_bom_file(file: UploadFile = File(...)):
    """
    Receives a BOM file (PDF or Image), sends it to OCR API,
    and returns parsed BOM components for validation.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Read the file bytes
    file_bytes = await file.read()
    
    # Extract text using OCR Service
    try:
        raw_text = await extract_text_from_file(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")
        
    # Parse the extracted text using Regex heuristics
    components = parse_bom_text(raw_text)
    
    # Ensure quantity is returned as int but our response typing is simple Dict for now.
    # We will format it as list of dicts.
    return components
