import pytest
from app.services.bom_parser import parse_bom_text

def test_parse_bom_text_format_1():
    raw_text = """
    Bill of Materials
    10  RES-10K  Resistor 10K Ohm 5%
    5   CAP-01uF Capacitor 0.1uF 50V
    """
    
    components = parse_bom_text(raw_text)
    
    assert len(components) == 2
    assert components[0]["quantite_demande"] == 10
    assert components[0]["num_composant_fabric"] == "RES-10K"
    assert "Resistor" in components[0]["description"]

    assert components[1]["quantite_demande"] == 5
    assert components[1]["num_composant_fabric"] == "CAP-01uF"
    assert "Capacitor" in components[1]["description"]

def test_parse_bom_text_format_2():
    raw_text = """
    Reference   Qty   Description
    IC-NE555    2     Timer IC
    LED-RED-01  20    Red LED 5mm
    """
    
    components = parse_bom_text(raw_text)
    
    assert len(components) == 2
    assert components[0]["quantite_demande"] == 2
    assert components[0]["num_composant_fabric"] == "IC-NE555"
    assert components[0]["description"] == "Timer IC"

    assert components[1]["quantite_demande"] == 20
    assert components[1]["num_composant_fabric"] == "LED-RED-01"
    assert components[1]["description"] == "Red LED 5mm"

def test_parse_bom_text_ignores_invalid_lines():
    raw_text = """
    Some random text
    Just a quantity 10
    Just a ref REF-123
    """
    components = parse_bom_text(raw_text)
    assert len(components) == 0
