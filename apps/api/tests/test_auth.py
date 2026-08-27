import pytest

@pytest.mark.asyncio
async def test_register_and_login(client):
    # 1. Register user
    reg_payload = {
        "email": "dev@thuyakyaw.com",
        "password": "supersecurepassword123",
        "full_name": "Thu Ya Kyaw"
    }
    res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "dev@thuyakyaw.com"
    token = data["access_token"]

    # 2. Login user
    login_payload = {
        "email": "dev@thuyakyaw.com",
        "password": "supersecurepassword123"
    }
    res_login = await client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

    # 3. Get profile
    res_me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "dev@thuyakyaw.com"
