from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.journal import JournalCreate, JournalResponse
from app.services.journal import journal_service
from app.routers.dependencies import get_current_user

router = APIRouter(prefix="/journal", tags=["journal"])

@router.get("", response_model=List[JournalResponse])
async def get_journals(current_user: dict = Depends(get_current_user)):
    return await journal_service.get_journals(current_user["id"])

@router.get("/date/{date}", response_model=JournalResponse)
async def get_journal_by_date(date: str, current_user: dict = Depends(get_current_user)):
    journal = await journal_service.get_journal_by_date(current_user["id"], date)
    if not journal:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No journal entry for this date")
    return journal

@router.post("", response_model=JournalResponse)
async def create_or_update_journal(schema: JournalCreate, current_user: dict = Depends(get_current_user)):
    return await journal_service.create_or_update_journal(current_user["id"], schema)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal(id: str, current_user: dict = Depends(get_current_user)):
    await journal_service.delete_journal(current_user["id"], id)
    return None
