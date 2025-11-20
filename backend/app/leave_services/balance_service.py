import uuid
from datetime import datetime

from sqlmodel import Session, select

from app.leave_models.leave_balance_model import LeaveBalance, LeaveBalanceCreate
from app.leave_models.leave_type_model import LeaveType


def generate_balance(*, session: Session, owner_id: uuid.UUID) -> LeaveBalance | None:
    leave_type = session.exec(select(LeaveType)).first()
    if not leave_type:
        return None

    year = str(datetime.now().year)
    row_in = LeaveBalanceCreate(
        year=year,
        balance=leave_type.entitlement,
        leave_type_id=leave_type.id,
        owner_id=owner_id,
    )

    exists_statement = select(LeaveBalance).where(
        LeaveBalance.owner_id == owner_id,
        LeaveBalance.year == year,
        LeaveBalance.leave_type_id == leave_type.id,
    )
    exists = session.exec(exists_statement).first()

    if not exists:
        row = LeaveBalance.model_validate(row_in)
        session.add(row)
        session.commit()
        session.refresh(row)
        return row

    return exists
