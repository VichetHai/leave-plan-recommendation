import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.leave_models.leave_balance_model import (
    LeaveBalance,
    LeaveBalancePublic,
    LeaveBalancesPublic,
    LeaveBalanceCreate,
    LeaveBalanceUpdate,
)
from app.leave_models.leave_type_model import (
    LeaveType,
    LeaveTypeCreate,
    LeaveTypePublic,
)

router = APIRouter(prefix="/leave-balances", tags=["leave-balances"])


@router.get("/", response_model=LeaveBalancesPublic)
def list(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve Items.
    """

    count_statement = select(func.count()).select_from(LeaveBalance)
    count = session.exec(count_statement).one()
    statement = select(LeaveBalance).offset(skip).limit(limit)
    rows = session.exec(statement).all()

    return LeaveBalancesPublic(data=rows, count=count)


@router.post("/", response_model=LeaveBalancePublic)
def create(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    row_in: LeaveBalanceCreate,
) -> Any:
    """
    Create new item.
    """

    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No permissions")

    year = row_in.year
    owner_id = row_in.owner_id
    leave_type_id = row_in.leave_type_id

    exists_statement = select(LeaveBalance).where(
        LeaveBalance.owner_id == owner_id,
        LeaveBalance.year == year,
        LeaveBalance.leave_type_id == leave_type_id,
    )
    exists = session.exec(exists_statement).one()

    if not exists:
        row = LeaveBalance.model_validate(row_in)
        session.add(row)
        session.commit()
        session.refresh(row)
        return row

    return exists


@router.put("/{id}", response_model=LeaveBalancePublic)
def update(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
    row_in: LeaveBalanceUpdate,
) -> Any:
    """
    Update an item.
    """

    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No permissions")

    row = session.get(LeaveBalance, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    update_dict = row_in.model_dump(exclude_unset=True)
    row.sqlmodel_update(update_dict)
    session.add(row)
    session.commit()
    session.refresh(row)
    return row
