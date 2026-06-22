import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(async_client: AsyncClient):
    response = await async_client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123", "role": "commercial"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id_utilisateur" in data

@pytest.mark.asyncio
async def test_register_existing_user(async_client: AsyncClient):
    await async_client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"},
    )
    response = await async_client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_login_user(async_client: AsyncClient):
    await async_client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"},
    )
    response = await async_client.post(
        "/auth/login",
        data={"username": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient):
    await async_client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"},
    )
    response = await async_client.post(
        "/auth/login",
        data={"username": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
