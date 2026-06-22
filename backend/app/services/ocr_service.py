import os
import httpx
from fastapi import HTTPException

OCR_SPACE_API_KEY = os.getenv("OCR_SPACE_API_KEY", "")
OCR_SPACE_API_URL = "https://api.ocr.space/parse/image"

async def extract_text_from_file(file_bytes: bytes, file_name: str) -> str:
    """
    Sends the file to OCR.Space API and returns the extracted text.
    """
    if not OCR_SPACE_API_KEY:
        raise HTTPException(status_code=500, detail="OCR_SPACE_API_KEY is not configured.")

    # Prepare payload
    payload = {
        "apikey": OCR_SPACE_API_KEY,
        "language": "eng",
        "isTable": "true",  # Recommended for tables like BOM
        "OCREngine": "2",   # Engine 2 is best all-around
    }

    # Prepare file
    # Ensure extension is supported (pdf, png, jpg, etc.)
    # OCR API expects multipart/form-data
    files = {
        "file": (file_name, file_bytes)
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(OCR_SPACE_API_URL, data=payload, files=files)
            response.raise_for_status()
            result = response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Error connecting to OCR API: {str(e)}")

    if result.get("IsErroredOnProcessing"):
        error_msg = result.get("ErrorMessage", ["Unknown OCR error"])[0]
        raise HTTPException(status_code=400, detail=f"OCR API Error: {error_msg}")

    # Combine text from all parsed pages
    parsed_text = ""
    parsed_results = result.get("ParsedResults", [])
    for res in parsed_results:
        parsed_text += res.get("ParsedText", "") + "\n"

    return parsed_text
