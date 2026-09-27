from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
from app.database import engine, Base, AsyncSessionLocal
from app.models import User, Component, RoleEnum
from app.core.security import get_password_hash
from app.api import auth, upload, quotes, components

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup tables on startup for MVP
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Auto-seed demo users and components if database is fresh
    async with AsyncSessionLocal() as session:
        user_result = await session.execute(select(User))
        existing_users = user_result.scalars().all()
        if not existing_users:
            demo_users = [
                User(email="client@bom.com", pwd=get_password_hash("client123"), role=RoleEnum.client),
                User(email="commercial@bom.com", pwd=get_password_hash("commercial123"), role=RoleEnum.commercial),
                User(email="acheteur@bom.com", pwd=get_password_hash("acheteur123"), role=RoleEnum.acheteur),
                User(email="admin@bom.com", pwd=get_password_hash("admin123"), role=RoleEnum.admin),
            ]
            session.add_all(demo_users)
            await session.commit()
            print("Auto-seeded 4 demo users into database.")

        comp_result = await session.execute(select(Component))
        existing_comps = comp_result.scalars().all()
        if not existing_comps:
            demo_comps = [
                Component(num_composant_fabric="RC0402FR-071KL", description="Resistor 1k Ohm 1% 0402", prix_unitaire=0.01, stock_disponible=500),
                Component(num_composant_fabric="RC0603FR-0710KL", description="Resistor 10k Ohm 1% 0603", prix_unitaire=0.01, stock_disponible=350),
                Component(num_composant_fabric="STM32F103C8T6", description="MCU 32-bit ARM Cortex M3", prix_unitaire=2.50, stock_disponible=50),
                Component(num_composant_fabric="ATMEGA328P-AU", description="MCU 8-bit AVR 32KB Flash", prix_unitaire=1.80, stock_disponible=80),
                Component(num_composant_fabric="ESP32-WROOM-32D", description="WiFi/Bluetooth Module ESP32", prix_unitaire=3.20, stock_disponible=120),
            ]
            session.add_all(demo_comps)
            await session.commit()
            print("Auto-seeded initial components into database.")
    yield

app = FastAPI(title="Bill of Materials API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(upload.router, prefix="/api", tags=["bom"])
app.include_router(quotes.router, prefix="/api/quotes", tags=["quotes"])
app.include_router(components.router, prefix="/api/components", tags=["components"])

@app.get("/")
def read_root():
    return {"message": "Bill of Materials API"}
