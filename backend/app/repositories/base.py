from typing import Any, Dict, List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database

class BaseRepository:
    def __init__(self, collection_name: str):
        self.collection_name = collection_name

    @property
    def db(self) -> AsyncIOMotorDatabase:
        return get_database()

    @property
    def collection(self):
        return self.db[self.collection_name]

    def _to_object_id(self, id_val: Any) -> ObjectId:
        if isinstance(id_val, str):
            try:
                return ObjectId(id_val)
            except Exception:
                raise ValueError(f"Invalid ObjectId string: {id_val}")
        return id_val

    def _map_id(self, document: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if document is None:
            return None
        # Copy to avoid modifying original doc in memory unexpectedly
        doc = dict(document)
        if "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        return doc

    async def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        try:
            obj_id = self._to_object_id(id)
        except ValueError:
            return None
        doc = await self.collection.find_one({"_id": obj_id})
        return self._map_id(doc)

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        # Map str ids in query if they are querying by _id
        query_mapped = dict(query)
        if "id" in query_mapped:
            query_mapped["_id"] = self._to_object_id(query_mapped.pop("id"))
        if "_id" in query_mapped:
            try:
                query_mapped["_id"] = self._to_object_id(query_mapped["_id"])
            except ValueError:
                return None
        doc = await self.collection.find_one(query_mapped)
        return self._map_id(doc)

    async def find_all(self, query: Dict[str, Any] = None, sort: List[tuple] = None, limit: int = None) -> List[Dict[str, Any]]:
        if query is None:
            query = {}
        query_mapped = dict(query)
        if "id" in query_mapped:
            query_mapped["_id"] = self._to_object_id(query_mapped.pop("id"))
        if "_id" in query_mapped:
            try:
                query_mapped["_id"] = self._to_object_id(query_mapped["_id"])
            except ValueError:
                return []
        
        cursor = self.collection.find(query_mapped)
        if sort:
            cursor = cursor.sort(sort)
        if limit:
            cursor = cursor.limit(limit)
        docs = await cursor.to_list(length=1000)
        return [self._map_id(doc) for doc in docs]

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        doc = dict(data)
        # Ensure we don't have id or _id in doc before inserting
        if "id" in doc:
            del doc["id"]
        if "_id" in doc:
            del doc["_id"]
        
        result = await self.collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        return doc

    async def update(self, id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            obj_id = self._to_object_id(id)
        except ValueError:
            return None
        
        doc = {k: v for k, v in data.items() if k not in ["id", "_id"]}
        result = await self.collection.find_one_and_update(
            {"_id": obj_id},
            {"$set": doc},
            return_document=True
        )
        return self._map_id(result)

    async def delete(self, id: str) -> bool:
        try:
            obj_id = self._to_object_id(id)
        except ValueError:
            return False
        result = await self.collection.delete_one({"_id": obj_id})
        return result.deleted_count > 0
