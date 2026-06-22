import re
from typing import List, Dict

def parse_bom_text(raw_text: str) -> List[Dict[str, str]]:
    """
    Parses OCR raw text and attempts to extract BOM components.
    Uses flexible heuristics to find references and quantities anywhere in the line.
    """
    components = []
    lines = raw_text.split("\n")
    
    # Reference pattern: 
    # 1. Contains a hyphen (e.g. RES-10K) 
    # OR 2. Mixed letters and numbers >= 4 chars (e.g. LM358, 1N4148)
    ref_pattern = re.compile(r'\b([A-Z]{2,}-[A-Z0-9\-]+|[A-Z]+[0-9]+[A-Z0-9]*|[0-9]+[A-Z]+[A-Z0-9]*)\b', re.IGNORECASE)
    
    # Quantity pattern: standalone number
    qty_pattern = re.compile(r'\b(\d{1,5})\b')

    for line in lines:
        clean_line = line.strip()
        if not clean_line:
            continue
            
        ref_match = ref_pattern.search(clean_line)
        if not ref_match:
            continue
            
        ref = ref_match.group(1).upper()
        
        # Avoid matching generic words as references (must not be only letters)
        if ref.isalpha():
            continue
            
        # Try to find quantity
        line_without_ref = clean_line[:ref_match.start()] + clean_line[ref_match.end():]
        qty_match = qty_pattern.search(line_without_ref)
        
        qty = 1
        if qty_match:
            qty = int(qty_match.group(1))
            line_without_ref = line_without_ref[:qty_match.start()] + line_without_ref[qty_match.end():]
            
        # Clean description
        desc = line_without_ref.strip(" \t|,-;:_")
        desc = re.sub(r'\s+', ' ', desc) # collapse whitespace
        
        components.append({
            "quantite_demande": qty,
            "num_composant_fabric": ref,
            "description": desc if desc else ref,
            "texte_extrait": clean_line
        })

    return components
