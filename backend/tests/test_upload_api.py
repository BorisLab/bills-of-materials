from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.services.bom_parser import parse_bom_text

client = TestClient(app)

@patch('app.api.upload.extract_text_from_file')
def test_upload_bom_success(mock_extract):
    # Mock the OCR service to return a dummy string
    mock_extract.return_value = "10 RES-10K Resistor"
    
    # Send a dummy file
    response = client.post(
        "/api/upload-bom",
        files={"file": ("test.png", b"dummy content", "image/png")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["num_composant_fabric"] == "RES-10K"
    assert data[0]["quantite_demande"] == 10

def test_upload_bom_no_file():
    # If we don't send a file, FastAPI typically returns 422 Unprocessable Entity
    response = client.post("/api/upload-bom")
    assert response.status_code == 422
