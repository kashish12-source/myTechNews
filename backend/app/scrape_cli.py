import sys
import os
import json
import asyncio

# Append parent directories to system path to resolve backend modules properly
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.database import SessionLocal
from backend.app.aggregator import aggregate_news
from backend.app.models import Article, SystemStatus

async def main():
    print("--- Running CLI Tech News Aggregator ---")
    db = SessionLocal()
    try:
        await aggregate_news(db)
        print("Aggregation finished successfully in database.")
        
        # Fetch all articles and export to frontend's news-cache.json
        articles = db.query(Article).all()
        status = db.query(SystemStatus).first()
        last_updated = status.last_updated if status else ""
        
        articles_list = []
        for art in articles:
            articles_list.append({
                "id": art.id,
                "title": art.title,
                "url": art.url,
                "source": art.source,
                "date": art.date,
                "category": art.category,
                "summary": art.summary,
                "importance": art.importance,
                "sentiment": art.sentiment
            })
            
        cache_data = {
            "articles": articles_list,
            "lastUpdated": last_updated
        }
        
        # Write to frontend/src/data/news-cache.json
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        cache_path = os.path.join(root_dir, "frontend", "src", "data", "news-cache.json")
        os.makedirs(os.path.dirname(cache_path), exist_ok=True)
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(cache_data, f, indent=2)
            
        print(f"Successfully exported {len(articles_list)} articles to: {cache_path}")
        
    except Exception as e:
        print(f"Aggregation script failed with error: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
