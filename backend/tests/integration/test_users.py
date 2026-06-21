_VALID_USER = {"email": "carol@example.com", "password": "Passw0rd!"}


async def test_get_me(client):
    resp = await client.post("/api/auth/register", json=_VALID_USER)
    token = resp.json()["access_token"]

    me = await client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    body = me.json()
    assert body["email"] == _VALID_USER["email"]
    assert "id" in body
    assert "created_at" in body


async def test_get_me_requires_auth(client):
    resp = await client.get("/api/users/me")
    assert resp.status_code == 403


async def test_get_me_invalid_token(client):
    resp = await client.get("/api/users/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert resp.status_code == 401
