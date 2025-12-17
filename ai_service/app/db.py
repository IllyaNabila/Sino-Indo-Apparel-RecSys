from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
import sys
from pprint import pprint # Use pprint for nicely formatted output

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/")

# --- Establish Connection ---
try:
    # Set a timeout to avoid waiting indefinitely if the server is unreachable
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # The ping command is cheap and confirms an active connection.
    client.admin.command('ping')
except ConnectionFailure as e:
    print(f"❌ Could not connect to MongoDB: {e}")
    # Exit if the DB is not available, as the app cannot run without it.
    sys.exit(1)

db = client["test"]

# --- Define Collections ---
products_col = db["products"]
businesses_col = db["businesses"]
profiles_col = db["profiles"]
preferences_col = db["preferences"]

if __name__ == "__main__":
    print("✅ MongoDB connection successful.")
    print(f"Host: {client.HOST}:{client.PORT}")
    print("-" * 20)
    print("Attempting to fetch one document from the 'products' collection...")
    
    first_product = preferences_col.find_one()

    if first_product:
        print("✅ Successfully fetched a document:")
        pprint(first_product)
    else:
        print("⚠️ Connection su")