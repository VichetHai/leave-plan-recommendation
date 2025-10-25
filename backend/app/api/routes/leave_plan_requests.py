import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.leave_models.leave_plan_request_model import (
    LeavePlanRequest,
    LeavePlanRequestCreate,
    LeavePlanRequestPublic,
    LeavePlanRequestsPublic,
    LeavePlanRequestUpdate,
    LeavePlanDetail,
)
from app.models import Message

router = APIRouter(prefix="/leave-plan-requests", tags=["leave-plan-requests"])


@router.get("/", response_model=LeavePlanRequestsPublic)
def list(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve Items.
    """

    count_statement = (
        select(func.count())
        .select_from(LeavePlanRequest)
        .where(LeavePlanRequest.owner_id == current_user.id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(LeavePlanRequest)
        .where(LeavePlanRequest.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    rows = session.exec(statement).all()

    return LeavePlanRequestsPublic(data=rows, count=count)


@router.get("/{id}", response_model=LeavePlanRequestPublic)
def retrieve(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:  # type: ignore
    """
    Get item by ID.
    """

    row = session.get(LeavePlanRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    return row


@router.post("/", response_model=LeavePlanRequestPublic)
def create(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    row_in: LeavePlanRequestCreate,
) -> Any:
    """
    Create new item.
    """

    requested_at = datetime.utcnow()
    status = "draft"
    details = row_in.details

    dates = [d.leave_date for d in details]
    if len(dates) != len(set(dates)):
        raise HTTPException(
            status_code=422, detail="Duplicate leave dates are not allowed in details"
        )

    row_data = row_in.model_dump(exclude={"details"})
    row = LeavePlanRequest.model_validate(
        row_data,
        update={
            "owner_id": current_user.id,
            "team_id": current_user.team_id,
            "requested_at": requested_at,
            "status": status,
            "amount": len(dates),
        },
    )

    # Convert each detail
    row.details = [
        LeavePlanDetail(**detail.model_dump(), leave_plan_id=row.id)
        for detail in details
    ]

    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.put("/{id}", response_model=LeavePlanRequestPublic)
def update(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
    row_in: LeavePlanRequestUpdate,
) -> Any:
    """
    Update an item.
    """

    details = row_in.details

    dates = [d.leave_date for d in details]
    if len(dates) != len(set(dates)):
        raise HTTPException(
            status_code=422, detail="Duplicate leave dates are not allowed in details"
        )

    row = session.get(LeavePlanRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    if not row.status == "draft":
        raise HTTPException(
            status_code=403, detail="Can not update submitted leave plan"
        )

    row_data = row_in.model_dump(exclude_unset=True, exclude={"details"})
    row.sqlmodel_update(row_data, update={"amount": len(dates)})

    # Reinsert details
    # Remove old details
    for detail in row.details:
        session.delete(detail)
    # Add new details
    row.details = [
        LeavePlanDetail(**detail.model_dump(), leave_plan_id=row.id)
        for detail in details
    ]

    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.delete("/{id}")
def delete(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,  # type: ignore
) -> Message:
    """
    Delete an item.
    """

    row = session.get(LeavePlanRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    if not row.status == "draft":
        raise HTTPException(
            status_code=403, detail="Can not delete submitted leave plan"
        )

    # Remove old details
    for detail in row.details:
        session.delete(detail)

    session.delete(row)
    session.commit()
    return Message(message="Deleted successfully")
