import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.auth import create_access_token
from backend.app.database import SessionLocal, engine, Base
from backend.app.models import SavedArticle

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def auth_headers():
    token = create_access_token("test_user@example.com")
    return {"Authorization": f"Bearer {token}"}

def test_save_article_toggle_flow(client, auth_headers):
    # 1. Clean any existing test articles just in case
    db = SessionLocal()
    try:
        db.query(SavedArticle).filter(SavedArticle.user_email == "test_user@example.com").delete()
        db.commit()
    finally:
        db.close()

    # 2. Get initial bookmarks
    response = client.get("/api/saved", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "watch_later" in data
    assert "read_later" in data
    assert len(data["watch_later"]) == 0
    assert len(data["read_later"]) == 0

    # 3. Toggle watch_later on
    response = client.post(
        "/api/saved/toggle",
        headers=auth_headers,
        json={"article_id": "test_art_123", "list_type": "watch_later"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "test_art_123" in data["watch_later"]
    assert "test_art_123" not in data["read_later"]

    # 4. Toggle read_later on
    response = client.post(
        "/api/saved/toggle",
        headers=auth_headers,
        json={"article_id": "test_art_456", "list_type": "read_later"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "test_art_123" in data["watch_later"]
    assert "test_art_456" in data["read_later"]

    # 5. Toggle watch_later off (untoggle)
    response = client.post(
        "/api/saved/toggle",
        headers=auth_headers,
        json={"article_id": "test_art_123", "list_type": "watch_later"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "test_art_123" not in data["watch_later"]
    assert "test_art_456" in data["read_later"]

    # Clean up test database records
    db = SessionLocal()
    try:
        db.query(SavedArticle).filter(SavedArticle.user_email == "test_user@example.com").delete()
        db.commit()
    finally:
        db.close()
