import uuid
from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel


# Leave Plan Request
# Shared properties
class LeavePlanRequestBase(SQLModel):
    status: str = Field(max_length=50)
    description: str | None = None
    amount: float


# Create
class LeavePlanRequestCreate(LeavePlanRequestBase):
    leave_type_id: uuid.UUID


# Update
class LeavePlanRequestUpdate(LeavePlanRequestBase):
    approver_id: uuid.UUID | None = None
    approved_at: datetime | None = None


# Table
class LeavePlanRequest(LeavePlanRequestBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    team_id: uuid.UUID = Field(
        foreign_key="team.id", nullable=False, ondelete="CASCADE"
    )
    leave_type_id: uuid.UUID = Field(
        foreign_key="leavetype.id", nullable=False, ondelete="CASCADE"
    )
    approver_id: uuid.UUID | None = Field(
        default=None, foreign_key="user.id", ondelete="SET NULL"
    )

    requested_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: datetime | None = None

    # Relationships
    owner: "User" = Relationship(
        back_populates="leave_plan_requests",
        sa_relationship_kwargs={"foreign_keys": "[LeavePlanRequest.owner_id]"},
    )
    approver: "User" = Relationship(
        back_populates="approved_leave_plan_requests",
        sa_relationship_kwargs={"foreign_keys": "[LeavePlanRequest.approver_id]"},
    )
    team: "Team" = Relationship(back_populates="leave_plan_requests")
    leave_type: "LeaveType" = Relationship(back_populates="leave_plan_requests")
    details: list["LeavePlanDetail"] = Relationship(back_populates="leave_plan_request")


# Public (for API responses)
class LeavePlanRequestPublic(LeavePlanRequestBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    leave_type_id: uuid.UUID
    approver_id: uuid.UUID | None
    requested_at: datetime
    approved_at: datetime | None


# Public list wrapper
class LeavePlanRequestsPublic(SQLModel):
    data: list[LeavePlanRequestPublic]
    count: int


# Leave Plan Request Details
# Shared properties
class LeavePlanDetailBase(SQLModel):
    leave_date: datetime = Field(default_factory=datetime.utcnow)


# Create
class LeavePlanDetailCreate(LeavePlanDetailBase):
    leave_plan_id: uuid.UUID | None


# Update
class LeavePlanDetailUpdate(LeavePlanDetailBase):
    leave_plan_id: uuid.UUID | None


# Database table
class LeavePlanDetail(LeavePlanDetailBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    leave_plan_id: uuid.UUID = Field(
        foreign_key="leaveplanrequest.id", nullable=False, ondelete="CASCADE"
    )

    leave_plan_request: "LeavePlanRequest" = Relationship(back_populates="details")


# Public (for API responses)
class LeavePlanDetailPublic(LeavePlanDetailBase):
    id: uuid.UUID
    leave_plan_id: uuid.UUID


# Public list wrapper
class LeavePlanDetailsPublic(SQLModel):
    data: list[LeavePlanDetailPublic]
    count: int
