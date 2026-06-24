import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.app.database import SessionLocal
from backend.app.models import Article

def migrate():
    print("--- Upgrading existing database article summaries ---")
    db = SessionLocal()
    try:
        articles = db.query(Article).all()
        updated_count = 0
        for art in articles:
            summary = art.summary.strip() if art.summary else ""
            if not summary or len(summary) < 15 or summary.lower() == "comments":
                art.summary = f"Latest technical updates, releases, and discussions from {art.source} covering \"{art.title}\". Tap the link to view the full details and community commentary."
                updated_count += 1
        
        if updated_count > 0:
            db.commit()
            print(f"SUCCESS: Retroactively upgraded {updated_count} articles in the database.")
        else:
            print("No articles required upgrading.")
            
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
