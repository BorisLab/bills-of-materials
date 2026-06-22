import asyncio
import os
import sys

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal, engine, Base
from app.models import Component
from sqlalchemy.future import select

COMPONENTS_DATA = [
    # Resistors
    {"num_composant_fabric": "RC0402FR-071KL", "description": "Resistor 1k Ohm 1% 0402", "prix_unitaire": 0.01},
    {"num_composant_fabric": "RC0603FR-0710KL", "description": "Resistor 10k Ohm 1% 0603", "prix_unitaire": 0.01},
    {"num_composant_fabric": "CRCW0805100KFKEA", "description": "Resistor 100k Ohm 1% 0805", "prix_unitaire": 0.02},
    {"num_composant_fabric": "ERJ-3EKF1002V", "description": "Resistor 10k Ohm 1% 0603 Panasonic", "prix_unitaire": 0.015},
    {"num_composant_fabric": "RC0402JR-070RL", "description": "Resistor 0 Ohm Jumper 0402", "prix_unitaire": 0.005},
    
    # Capacitors
    {"num_composant_fabric": "CC0402KRX7R7BB104", "description": "Capacitor 0.1uF 16V X7R 0402", "prix_unitaire": 0.03},
    {"num_composant_fabric": "GRM188R71H104KA93D", "description": "Capacitor 0.1uF 50V X7R 0603", "prix_unitaire": 0.04},
    {"num_composant_fabric": "CL10A106MQ8NNNC", "description": "Capacitor 10uF 6.3V X5R 0603", "prix_unitaire": 0.05},
    {"num_composant_fabric": "C0805C104K5RACTU", "description": "Capacitor 0.1uF 50V X7R 0805", "prix_unitaire": 0.035},
    {"num_composant_fabric": "TAJB106K016RNJ", "description": "Tantalum Capacitor 10uF 16V", "prix_unitaire": 0.15},
    
    # Microcontrollers & ICs
    {"num_composant_fabric": "STM32F103C8T6", "description": "MCU 32-bit ARM Cortex M3", "prix_unitaire": 2.50},
    {"num_composant_fabric": "ATMEGA328P-AU", "description": "MCU 8-bit AVR 32KB Flash", "prix_unitaire": 1.80},
    {"num_composant_fabric": "ESP32-WROOM-32D", "description": "WiFi/Bluetooth Module ESP32", "prix_unitaire": 3.20},
    {"num_composant_fabric": "LM358DT", "description": "Operational Amplifier Dual", "prix_unitaire": 0.12},
    {"num_composant_fabric": "NE555P", "description": "Timer IC Single", "prix_unitaire": 0.25},
    {"num_composant_fabric": "CH340G", "description": "USB to Serial Controller", "prix_unitaire": 0.40},
    {"num_composant_fabric": "LM1117T-3.3", "description": "LDO Voltage Regulator 3.3V 800mA", "prix_unitaire": 0.35},
    {"num_composant_fabric": "TPS54331DR", "description": "Step-Down Converter 3A", "prix_unitaire": 0.95},
    {"num_composant_fabric": "MAX232CSE+", "description": "RS-232 Transceiver", "prix_unitaire": 1.10},
    
    # Diodes & LEDs
    {"num_composant_fabric": "1N4148W", "description": "Switching Diode 100V SOD-123", "prix_unitaire": 0.02},
    {"num_composant_fabric": "B5819W", "description": "Schottky Diode 40V 1A SOD-123", "prix_unitaire": 0.05},
    {"num_composant_fabric": "SML-D12U1WT86", "description": "LED Red Clear 0603 SMD", "prix_unitaire": 0.08},
    {"num_composant_fabric": "APT1608SGC", "description": "LED Green Clear 0603 SMD", "prix_unitaire": 0.08},
    {"num_composant_fabric": "WS2812B", "description": "RGB LED with IC 5050", "prix_unitaire": 0.18},
    
    # Connectors & Misc
    {"num_composant_fabric": "61300311121", "description": "Pin Header 1x3 2.54mm", "prix_unitaire": 0.10},
    {"num_composant_fabric": "XH2.54-2P", "description": "JST XH 2.54mm 2-Pin Connector", "prix_unitaire": 0.06},
    {"num_composant_fabric": "105017-0001", "description": "Micro USB Connector", "prix_unitaire": 0.45},
    {"num_composant_fabric": "TYPE-C-31-M-12", "description": "USB Type-C Receptacle", "prix_unitaire": 0.55},
    {"num_composant_fabric": "B3F-1000", "description": "Tactile Switch 6x6x4.3mm", "prix_unitaire": 0.15},
]

# Generate more generic components to reach 100
for i in range(1, 71):
    COMPONENTS_DATA.append({
        "num_composant_fabric": f"GENERIC-COMP-{i:03d}",
        "description": f"Composant Générique Standard Type {i}",
        "prix_unitaire": round(0.01 + (i * 0.05), 2)
    })

async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print(f"Starting to seed {len(COMPONENTS_DATA)} components...")
        count_added = 0
        for comp_data in COMPONENTS_DATA:
            result = await session.execute(
                select(Component).where(Component.num_composant_fabric == comp_data["num_composant_fabric"])
            )
            exists = result.scalars().first()
            if not exists:
                new_comp = Component(
                    num_composant_fabric=comp_data["num_composant_fabric"],
                    description=comp_data["description"],
                    prix_unitaire=comp_data["prix_unitaire"]
                )
                session.add(new_comp)
                count_added += 1
        
        await session.commit()
        print(f"Successfully added {count_added} new components to the database.")

if __name__ == "__main__":
    asyncio.run(seed_database())
