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
        articles = db.query(Article).order_by(Article.date.desc()).all()
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
        
        # Build the hierarchical chronological archive grouped by date YYYY-MM-DD
        from collections import defaultdict
        from datetime import datetime, timezone
        
        grouped = defaultdict(list)
        for art in articles:
            try:
                dt = datetime.fromisoformat(art.date)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
            except Exception:
                dt = datetime.now(timezone.utc)
                
            date_key = dt.strftime("%Y-%m-%d")
            time_key = dt.strftime("%H:%M:%S")
            
            grouped[date_key].append({
                "title": art.title,
                "exact_time": time_key,
                "reference_url": art.url,
                "summary": art.summary
            })
            
        # Convert to the requested list schema (sorted by date descending)
        chronological_list = []
        for date_val in sorted(grouped.keys(), reverse=True):
            # Sort articles within the same day by time descending
            day_articles = sorted(grouped[date_val], key=lambda x: x["exact_time"], reverse=True)
            chronological_list.append({
                "date": date_val,
                "articles": day_articles
            })
            
        # Write to frontend/src/data/news-chronological.json
        chrono_path = os.path.join(root_dir, "frontend", "src", "data", "news-chronological.json")
        with open(chrono_path, "w", encoding="utf-8") as f:
            json.dump(chronological_list, f, indent=2)
            
        print(f"Successfully exported chronological archive to: {chrono_path}")
        
    except Exception as e:
        print(f"Aggregation script failed with error: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
