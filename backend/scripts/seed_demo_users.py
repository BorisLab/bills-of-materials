import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal, engine, Base
from app.models import User, RoleEnum
from app.core.security import get_password_hash
from sqlalchemy.future import select

DEMO_USERS = [
    {"email": "client@bom.com", "password": "client123", "role": RoleEnum.client},
    {"email": "commercial@bom.com", "password": "commercial123", "role": RoleEnum.commercial},
    {"email": "acheteur@bom.com", "password": "acheteur123", "role": RoleEnum.acheteur},
    {"email": "admin@bom.com", "password": "admin123", "role": RoleEnum.admin},
]

async def seed_users():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        for u_data in DEMO_USERS:
            result = await session.execute(select(User).where(User.email == u_data["email"]))
            user = result.scalars().first()
            if not user:
                new_user = User(
                    email=u_data["email"],
                    pwd=get_password_hash(u_data["password"]),
                    role=u_data["role"]
                )
                session.add(new_user)
                print(f"Utilisateur créé : {u_data['email']} ({u_data['role'].value})")
            else:
                user.role = u_data["role"]
                user.pwd = get_password_hash(u_data["password"])
                print(f"Utilisateur mis à jour : {u_data['email']} ({u_data['role'].value})")
        await session.commit()
        print("Seed des utilisateurs de démonstration terminé.")

if __name__ == "__main__":
    asyncio.run(seed_users())
