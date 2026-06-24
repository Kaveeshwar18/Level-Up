from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class DatabaseHelper:
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.db = None

    async def connect_to_mongo(self):
        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        self.db = self.client[settings.DATABASE_NAME]
        print(f"Connected to MongoDB: {settings.DATABASE_NAME}")

    async def close_mongo_connection(self):
        if self.client:
            self.client.close()
            print("Closed MongoDB connection.")

db_helper = DatabaseHelper()

def get_database():
    if db_helper.db is None:
        raise RuntimeError("Database not initialized. Make sure connect_to_mongo was called.")
    return db_helper.db
