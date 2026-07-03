import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_end_to_end_integration(async_client: AsyncClient):
    # 1. Register users with different roles
    # Admin
    response = await async_client.post("/auth/register", json={
        "email": "admin@example.com",
        "password": "password123",
        "role": "admin"
    })
    assert response.status_code == 201
    
    # Commercial
    response = await async_client.post("/auth/register", json={
        "email": "comm@example.com",
        "password": "password123",
        "role": "commercial"
    })
    assert response.status_code == 201

    # Client
    response = await async_client.post("/auth/register", json={
        "email": "client@example.com",
        "password": "password123",
        "role": "client"
    })
    assert response.status_code == 201

    # 2. Login users
    admin_login = await async_client.post("/auth/login", data={"username": "admin@example.com", "password": "password123"})
    admin_token = admin_login.json()["access_token"]
    
    comm_login = await async_client.post("/auth/login", data={"username": "comm@example.com", "password": "password123"})
    comm_token = comm_login.json()["access_token"]

    client_login = await async_client.post("/auth/login", data={"username": "client@example.com", "password": "password123"})
    client_token = client_login.json()["access_token"]

    # 3. Client creates a Quote
    quote_data = [
        {"num_composant_fabric": "RC0402FR-071KL", "description": "Resistor 1k", "quantite_demande": 10},
        {"num_composant_fabric": "TEST-COMP-01", "description": "Test Component", "quantite_demande": 5}
    ]
    response = await async_client.post("/api/quotes", json=quote_data, headers={"Authorization": f"Bearer {client_token}"})
    assert response.status_code == 201
    quote = response.json()
    assert quote["statut"] == "en_attente"
    quote_id = quote["id_devis"]
    assert quote["prix_total"] > 0

    # 4. Client sees only their quotes
    response = await async_client.get("/api/quotes", headers={"Authorization": f"Bearer {client_token}"})
    assert response.status_code == 200
    assert len(response.json()) == 1

    # 5. Commercial lists all quotes and validates the quote
    response = await async_client.get("/api/quotes", headers={"Authorization": f"Bearer {comm_token}"})
    assert response.status_code == 200
    assert len(response.json()) >= 1
    
    response = await async_client.put(f"/api/quotes/{quote_id}?statut=valide", headers={"Authorization": f"Bearer {comm_token}"})
    assert response.status_code == 200

    # Verify status changed
    response = await async_client.get("/api/quotes", headers={"Authorization": f"Bearer {client_token}"})
    assert response.json()[0]["statut"] == "valide"

    # 6. Admin lists components and updates price
    response = await async_client.get("/api/components", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    components = response.json()
    assert len(components) >= 2 # The ones created by the quote
    
    comp_id = components[0]["id_composant"]
    response = await async_client.put(f"/api/components/{comp_id}", json={"prix_unitaire": 99.99}, headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    
    # Verify price changed
    response = await async_client.get("/api/components", headers={"Authorization": f"Bearer {admin_token}"})
    updated_comp = next(c for c in response.json() if c["id_composant"] == comp_id)
    assert updated_comp["prix_unitaire"] == 99.99

    # 7. Client cannot update component price
    response = await async_client.put(f"/api/components/{comp_id}", json={"prix_unitaire": 1.0}, headers={"Authorization": f"Bearer {client_token}"})
    assert response.status_code == 403

    # 8. Client cannot update quote status
    response = await async_client.put(f"/api/quotes/{quote_id}?statut=rejete", headers={"Authorization": f"Bearer {client_token}"})
    assert response.status_code == 403
