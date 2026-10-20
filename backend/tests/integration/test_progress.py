_VALID_USER = {"email": "bob@example.com", "password": "Passw0rd!"}


async def _auth_headers(client) -> dict:
    resp = await client.post("/api/auth/register", json=_VALID_USER)
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ─── GET /api/progress ────────────────────────────────────────────────────────

async def test_get_progress_starts_empty(client):
    headers = await _auth_headers(client)
    resp = await client.get("/api/progress", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == {"completed": []}


async def test_get_progress_requires_auth(client):
    resp = await client.get("/api/progress")
    assert resp.status_code == 401


# ─── POST /api/progress/{node_id} ─────────────────────────────────────────────

async def test_mark_complete(client):
    headers = await _auth_headers(client)
    resp = await client.post("/api/progress/what-is-ai", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == {"node_id": "what-is-ai", "completed": True}


async def test_mark_complete_appears_in_progress(client):
    headers = await _auth_headers(client)
    await client.post("/api/progress/what-is-ai", headers=headers)
    resp = await client.get("/api/progress", headers=headers)
    assert "what-is-ai" in resp.json()["completed"]


async def test_mark_complete_idempotent(client):
    headers = await _auth_headers(client)
    await client.post("/api/progress/what-is-ai", headers=headers)
    resp = await client.post("/api/progress/what-is-ai", headers=headers)
    assert resp.status_code == 200
    # Still only one entry
    progress = await client.get("/api/progress", headers=headers)
    assert progress.json()["completed"].count("what-is-ai") == 1


async def test_mark_complete_unknown_node(client):
    headers = await _auth_headers(client)
    resp = await client.post("/api/progress/not-a-real-node", headers=headers)
    assert resp.status_code == 404


async def test_mark_complete_fine_tuning_node(client):
    # Ensures 'fine-tuning' was added to _VALID_NODES
    headers = await _auth_headers(client)
    resp = await client.post("/api/progress/fine-tuning", headers=headers)
    assert resp.status_code == 200


async def test_mark_complete_requires_auth(client):
    resp = await client.post("/api/progress/what-is-ai")
    assert resp.status_code == 401


# ─── DELETE /api/progress/{node_id} ──────────────────────────────────────────

async def test_mark_incomplete(client):
    headers = await _auth_headers(client)
    await client.post("/api/progress/what-is-ai", headers=headers)
    resp = await client.delete("/api/progress/what-is-ai", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == {"node_id": "what-is-ai", "completed": False}


async def test_mark_incomplete_removes_from_progress(client):
    headers = await _auth_headers(client)
    await client.post("/api/progress/what-is-ai", headers=headers)
    await client.delete("/api/progress/what-is-ai", headers=headers)
    resp = await client.get("/api/progress", headers=headers)
    assert "what-is-ai" not in resp.json()["completed"]


async def test_mark_incomplete_unknown_node(client):
    headers = await _auth_headers(client)
    resp = await client.delete("/api/progress/not-a-real-node", headers=headers)
    assert resp.status_code == 404


async def test_mark_incomplete_requires_auth(client):
    resp = await client.delete("/api/progress/what-is-ai")
    assert resp.status_code == 401


# ─── All 14 valid node IDs are accepted ───────────────────────────────────────

async def test_all_valid_nodes_accepted(client):
    headers = await _auth_headers(client)
    valid_nodes = [
        "what-is-ai", "types-of-ml", "neural-networks", "activations",
        "transformers", "attention", "tokenization", "fine-tuning",
        "rag", "embeddings", "retrieval", "prompt-engineering",
        "hallucinations", "use-cases",
    ]
    for node in valid_nodes:
        resp = await client.post(f"/api/progress/{node}", headers=headers)
        assert resp.status_code == 200, f"Expected 200 for node '{node}', got {resp.status_code}"

    resp = await client.get("/api/progress", headers=headers)
    assert set(resp.json()["completed"]) == set(valid_nodes)
