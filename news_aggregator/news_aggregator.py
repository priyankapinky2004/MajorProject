#!/usr/bin/env python3
"""
News Aggregator Script for FactNet

This script fetches news articles from various RSS feeds, categorizes them,
and stores them in MongoDB.
"""

import os
import time
import json
import logging
import feedparser
import requests
from pymongo import MongoClient
from datetime import datetime
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import nltk
from dotenv import load_dotenv
import hashlib

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("news_aggregator")

# Download required NLTK data explicitly
def download_nltk_resources():
    """Download required NLTK resources."""
    try:
        logger.info("Downloading required NLTK resources...")
        nltk.download('punkt')
        nltk.download('stopwords')
    except Exception as e:
        logger.error(f"Error downloading NLTK resources: {e}")

# Call this function to ensure resources are downloaded
download_nltk_resources()

# MongoDB connection - Hardcoded for reliability
MONGO_URI = 'mongodb://localhost:27017'
DB_NAME = 'factnet'

# News sources - RSS feeds
NEWS_SOURCES = [
    {
        "name": "BBC News",
        "url": "http://feeds.bbci.co.uk/news/rss.xml",
        "language": "en"
    },
    {
        "name": "Reuters",
        "url": "http://feeds.reuters.com/reuters/topNews",
        "language": "en"
    },
    {
        "name": "CNN",
        "url": "http://rss.cnn.com/rss/edition.rss",
        "language": "en"
    },
]

# Category keywords
CATEGORIES = {
    "Politics": ["government", "election", "president", "minister", "parliament", "law", "policy", "political", "vote", "senator", "congress"],
    "Technology": ["tech", "technology", "software", "hardware", "internet", "digital", "app", "computer", "device", "robot", "AI"],
    "Health": ["health", "medical", "medicine", "doctor", "disease", "virus", "hospital", "patient", "treatment", "vaccine", "pandemic"],
    "Business": ["business", "economy", "market", "finance", "stock", "trade", "company", "investor", "economic", "bank", "money"],
    "Science": ["science", "research", "scientist", "study", "discovery", "experiment", "space", "planet", "climate", "physics", "biology"],
    "Sports": ["sport", "football", "soccer", "basketball", "tennis", "player", "team", "game", "match", "olympic", "championship"]
}

class NewsAggregator:
    def __init__(self):
        """Initialize the news aggregator."""
        # Hardcoded connection string for testing
        mongo_uri = "mongodb://localhost:27017"
        self.client = MongoClient(mongo_uri)
        self.db = self.client[DB_NAME]
        self.articles_collection = self.db['articles']
        
        # Initialize NLP tools - handle exceptions
        try:
            self.ps = PorterStemmer()
            self.stop_words = set(stopwords.words('english'))
        except Exception as e:
            logger.error(f"Error initializing NLP tools: {e}")
            self.ps = None
            self.stop_words = set()
        
        # Ensure indexes
        self.articles_collection.create_index("article_id", unique=True)
        self.articles_collection.create_index("url", unique=True)
        self.articles_collection.create_index("published_date")
        self.articles_collection.create_index("category")
        
        logger.info("News Aggregator initialized")

    def preprocess_text(self, text):
        """Preprocess text for categorization."""
        try:
            if not text:
                return []
            
            # Tokenize, remove stopwords and stem words
            tokens = word_tokenize(text.lower())
            filtered_tokens = [self.ps.stem(w) for w in tokens if w.isalpha() and w not in self.stop_words]
            return filtered_tokens
        except Exception as e:
            logger.error(f"Error preprocessing text: {e}")
            # Return simple word split as fallback
            return text.lower().split() if text else []

    def categorize_article(self, title, description):
        """Categorize article based on keywords in title and description."""
        try:
            combined_text = f"{title} {description}"
            
            # Simple keyword matching as fallback
            if self.ps is None:
                # Simple categorization without NLP
                for category, keywords in CATEGORIES.items():
                    for keyword in keywords:
                        if keyword.lower() in combined_text.lower():
                            return category
                return "Miscellaneous"
            
            # NLP-based categorization
            tokens = self.preprocess_text(combined_text)
            
            # Count category keywords
            category_counts = {cat: 0 for cat in CATEGORIES}
            for token in tokens:
                for category, keywords in CATEGORIES.items():
                    stemmed_keywords = [self.ps.stem(keyword) for keyword in keywords]
                    if token in stemmed_keywords:
                        category_counts[category] += 1
            
            # Select category with most keyword matches
            max_count = max(category_counts.values())
            if max_count == 0:
                return "Miscellaneous"  # No matches found
            
            # Find all categories with max count
            top_categories = [cat for cat, count in category_counts.items() if count == max_count]
            return top_categories[0]  # Return first in case of a tie
        except Exception as e:
            logger.error(f"Error categorizing article: {e}")
            return "Miscellaneous"  # Default category if categorization fails

    def generate_article_id(self, url, title):
        """Generate a unique article ID based on URL and title."""
        combined = f"{url}_{title}"
        return hashlib.md5(combined.encode()).hexdigest()

    def calculate_dummy_fact_check_score(self):
        """Generate a dummy fact-check score for MVP purposes."""
        # In a real system, this would involve actual fact-checking algorithms
        # For the MVP, we'll use a random score between 50 and 100
        import random
        return random.randint(50, 100)

    def fetch_and_store_articles(self):
        """Fetch articles from all sources and store in MongoDB."""
        total_articles = 0
        new_articles = 0
        
        for source in NEWS_SOURCES:
            logger.info(f"Fetching articles from {source['name']}")
            try:
                feed = feedparser.parse(source['url'])
                
                for entry in feed.entries:
                    try:
                        # Extract article data
                        title = entry.get('title', '')
                        description = entry.get('summary', '')
                        url = entry.get('link', '')
                        
                        # Skip articles without title or URL
                        if not title or not url:
                            continue
                        
                        # Generate unique ID
                        article_id = self.generate_article_id(url, title)
                        
                        # Check if article already exists
                        if self.articles_collection.find_one({"article_id": article_id}):
                            continue
                        
                        # Parse publication date
                        published_date = None
                        if 'published_parsed' in entry:
                            published_date = datetime(*entry.published_parsed[:6])
                        else:
                            published_date = datetime.now()
                        
                        # Categorize the article - using simplified approach if needed
                        category = "Miscellaneous"  # Default category
                        try:
                            category = self.categorize_article(title, description)
                        except Exception:
                            pass  # Keep default category if categorization fails
                        
                        # Prepare article data
                        article = {
                            "article_id": article_id,
                            "title": title,
                            "description": description,
                            "url": url,
                            "source": source['name'],
                            "language": source['language'],
                            "category": category,
                            "published_date": published_date,
                            "created_at": datetime.now(),
                            "fact_check_score": self.calculate_dummy_fact_check_score(),
                            "upvotes": 0,
                            "downvotes": 0,
                            "verified": False
                        }
                        
                        # Insert article
                        try:
                            self.articles_collection.insert_one(article)
                            new_articles += 1
                            logger.info(f"Added new article: {title[:50]}...")
                        except Exception as e:
                            logger.error(f"Error inserting article: {e}")
                        
                        total_articles += 1
                    except Exception as e:
                        logger.error(f"Error processing entry: {e}")
                        continue
                
            except Exception as e:
                logger.error(f"Error processing feed {source['name']}: {e}")
                continue
                
        logger.info(f"Fetched {total_articles} articles, {new_articles} new articles added")
        return new_articles

def main():
    """Main function to run the news aggregator."""
    logger.info("Starting News Aggregator")
    try:
        aggregator = NewsAggregator()
        
        while True:
            try:
                new_articles = aggregator.fetch_and_store_articles()
                logger.info(f"Added {new_articles} new articles")
                
                # Wait for the next scheduled run
                interval_minutes = int(os.getenv('FETCH_INTERVAL_MINUTES', '30'))
                logger.info(f"Waiting for {interval_minutes} minutes until next fetch")
                time.sleep(interval_minutes * 60)
                
            except KeyboardInterrupt:
                logger.info("Stopping News Aggregator")
                break
            except Exception as e:
                logger.error(f"Error in main loop: {e}")
                # Wait a bit before retrying
                time.sleep(5 * 60)
    except Exception as e:
        logger.error(f"Fatal error initializing News Aggregator: {e}")

if __name__ == "__main__":
    main()