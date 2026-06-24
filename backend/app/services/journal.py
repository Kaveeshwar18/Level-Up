from datetime import datetime, timezone
from fastapi import HTTPException
from app.repositories.mongodb import journal_repository
from app.schemas.journal import JournalCreate

class JournalService:
    async def get_journals(self, user_id: str) -> list:
        return await journal_repository.find_all({"userId": user_id}, sort=[("date", -1)])

    async def get_journal_by_date(self, user_id: str, date_str: str) -> dict:
        return await journal_repository.find_one({"userId": user_id, "date": date_str})

    async def create_or_update_journal(self, user_id: str, schema: JournalCreate) -> dict:
        existing = await journal_repository.find_one({"userId": user_id, "date": schema.date})
        if existing:
            updated = await journal_repository.update(existing["id"], {"content": schema.content})
            return updated
        else:
            data = schema.model_dump()
            data["userId"] = user_id
            data["createdAt"] = datetime.now(timezone.utc)
            return await journal_repository.create(data)

    async def delete_journal(self, user_id: str, journal_id: str) -> bool:
        journal = await journal_repository.find_one({"id": journal_id, "userId": user_id})
        if not journal:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return await journal_repository.delete(journal_id)

journal_service = JournalService()
