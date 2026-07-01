import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
import app.services.ocr_service
from app.services.ocr_service import extract_text_from_file

# Set dummy key for tests to avoid raising HTTPException in environments without configured keys (like CI)
app.services.ocr_service.OCR_SPACE_API_KEY = "dummy_key"

@pytest.mark.asyncio
async def test_extract_text_from_file_success():
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "IsErroredOnProcessing": False,
        "ParsedResults": [
            {"ParsedText": "10 RES-10K Resistor"}
        ]
    }
    
    # We patch the AsyncClient.post method
    with patch('httpx.AsyncClient.post', return_value=mock_response):
        text = await extract_text_from_file(b"dummy bytes", "test.png")
        
    assert "10 RES-10K Resistor" in text

@pytest.mark.asyncio
async def test_extract_text_from_file_api_error():
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "IsErroredOnProcessing": True,
        "ErrorMessage": ["File too large"]
    }
    
    with patch('httpx.AsyncClient.post', return_value=mock_response):
        with pytest.raises(HTTPException) as excinfo:
            await extract_text_from_file(b"dummy bytes", "test.png")
            
        assert excinfo.value.status_code == 400
        assert "File too large" in excinfo.value.detail
