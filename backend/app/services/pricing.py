import hashlib

def calculate_deterministic_price(reference: str) -> float:
    """
    Calculates a deterministic price for a component based on its reference.
    Uses MD5 hash of the reference to generate a consistent float value
    between 0.10 and 100.00.
    """
    if not reference:
        return 0.0

    # Create a consistent hash of the reference string
    hash_object = hashlib.md5(reference.encode('utf-8'))
    hash_hex = hash_object.hexdigest()
    
    # Convert first 8 characters of hex hash to an integer
    hash_int = int(hash_hex[:8], 16)
    
    # Normalize the integer to a float between 0.0 and 1.0
    normalized = hash_int / 0xFFFFFFFF
    
    # Scale to our desired range: 0.10 to 100.00
    min_price = 0.10
    max_price = 100.00
    price = min_price + (normalized * (max_price - min_price))
    
    # Return rounded to 2 decimal places
    return round(price, 2)
