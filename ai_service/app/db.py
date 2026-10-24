from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
import sys
from pprint import pprint # Use pprint for nicely formatted output

try:
    import dns.resolver
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ["8.8.8.8", "1.1.1.1"]
except Exception:
    pass

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

MONGO_URI = os.getenv("MONGO_URI", "")

if not MONGO_URI:
    print("⚠️ Warning: MONGO_URI environment variable is not set. Please set it in your environment or .env file.")

# --- Establish Connection ---
mongo_kwargs = {"serverSelectionTimeoutMS": 5000}
try:
    import certifi
    mongo_kwargs["tlsCAFile"] = certifi.where()
except ImportError:
    if os.path.exists("/etc/ssl/cert.pem"):
        os.environ.setdefault("SSL_CERT_FILE", "/etc/ssl/cert.pem")
        if MONGO_URI.startswith("mongodb+srv://") or "tls=true" in MONGO_URI or "ssl=true" in MONGO_URI:
            mongo_kwargs["tlsCAFile"] = "/etc/ssl/cert.pem"

client = MongoClient(MONGO_URI or "mongodb://localhost:27017", **mongo_kwargs)
db = client["test"]

# --- Define Collections ---
products_col = db["products"]
businesses_col = db["businesses"]
profiles_col = db["profiles"]
preferences_col = db["preferences"]

if __name__ == "__main__":
    try:
        client.admin.command("ping")
        print(f"✅ MongoDB connection successful! Connected to database: '{db.name}'")
        collections = db.list_collection_names()
        print(f"📂 Collections ({len(collections)}): {collections}")
        for col_name in ["products", "businesses", "profiles", "preferences", "users"]:
            if col_name in collections:
                print(f"   - {col_name}: {db[col_name].count_documents({})} documents")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        sys.exit(1)