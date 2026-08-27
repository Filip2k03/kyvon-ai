import pytest

@pytest.mark.asyncio
async def test_code_audit(client):
    code_with_issues = """
    for i in range(len(users)):
        for j in range(len(orders)):
            if users[i].id == orders[j].user_id:
                print(users[i], orders[j])
    """
    res = await client.post("/api/v1/code/analyze", json={
        "code": code_with_issues,
        "language": "python",
        "action": "audit"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["complexity_bound"] == "O(N^2)"
    assert len(data["issues"]) >= 1

@pytest.mark.asyncio
async def test_error_solver(client):
    res = await client.post("/api/v1/code/solve-error", json={
        "error_message": "ModuleNotFoundError: No module named 'torch'",
        "language": "python"
    })
    assert res.status_code == 200
    data = res.json()
    assert "ModuleNotFoundError" in data["error_type"]
    assert "pip install" in data["solution"]
