import uuid
from datetime import date

from sqlmodel import SQLModel, Field, Relationship


class LeavePlanDetailBase(SQLModel):
    leave_date: date


class LeavePlanDetailCreate(LeavePlanDetailBase):
    leave_plan_id: uuid.UUID


class LeavePlanDetailUpdate(LeavePlanDetailBase):
    pass


class LeavePlanDetail(LeavePlanDetailBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    leave_plan_id: uuid.UUID = Field(
        foreign_key="leaveplanrequest.id", nullable=False, ondelete="CASCADE"
    )

    leave_plan_request: "LeavePlanRequest" | None = Relationship(
        back_populates="details"
    )


class LeavePlanDetailPublic(LeavePlanDetailBase):
    id: uuid.UUID
    leave_plan_id: uuid.UUID


class LeavePlanDetailsPublic(SQLModel):
    data: list[LeavePlanDetailPublic]
    count: int
