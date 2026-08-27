import pytest

@pytest.mark.asyncio
async def test_learning_path_creation(client):
    res = await client.post("/api/v1/learning/paths", json={
        "target_skill": "PyTorch Distributed Training",
        "difficulty_level": "expert"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["target_skill"] == "PyTorch Distributed Training"

    res_list = await client.get("/api/v1/learning/paths")
    assert res_list.status_code == 200
    paths = res_list.json()
    assert len(paths) >= 1
    assert len(paths[0]["topics"]) == 3
