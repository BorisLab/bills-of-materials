import re
from typing import List, Dict

def parse_bom_text(raw_text: str) -> List[Dict[str, str]]:
    """
    Parses OCR raw text and attempts to extract BOM components.
    Looks for patterns that resemble:
    [Quantity] [Reference] [Description]
    or
    [Reference] [Quantity] [Description]
    
    This is a basic heuristic parser.
    """
    components = []
    
    # Split text into lines
    lines = raw_text.split("\n")
    
    # Typical BOM line Regex heuristic:
    # Matches a line that contains:
    # 1. An optional sequence of digits (Quantity)
    # 2. An alphanumeric string often with hyphens (Reference)
    # 3. Some text (Description)
    
    # E.g.: "10  RES-10K  Resistor 10K Ohm 5%"
    # or "CAP-01  5  Capacitor 0.1uF"
    
    # Pattern 1: [Qty] [Ref] [Desc]
    pattern1 = re.compile(r'^\s*(?P<qty>\d+)\s+(?P<ref>[A-Z0-9\-_]{3,})\s+(?P<desc>.*)$', re.IGNORECASE)
    
    # Pattern 2: [Ref] [Qty] [Desc]
    pattern2 = re.compile(r'^\s*(?P<ref>[A-Z0-9\-_]{3,})\s+(?P<qty>\d+)\s+(?P<desc>.*)$', re.IGNORECASE)

    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Try Pattern 1
        match = pattern1.match(line)
        if match:
            components.append({
                "quantite_demande": int(match.group("qty")),
                "num_composant_fabric": match.group("ref"),
                "description": match.group("desc").strip()
            })
            continue
            
        # Try Pattern 2
        match = pattern2.match(line)
        if match:
            components.append({
                "quantite_demande": int(match.group("qty")),
                "num_composant_fabric": match.group("ref"),
                "description": match.group("desc").strip()
            })
            continue

    return components
