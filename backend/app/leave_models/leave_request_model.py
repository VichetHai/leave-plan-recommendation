import uuid
from datetime import date, datetime
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship


# Shared properties
class LeaveRequestBase(SQLModel):
    start_date: date
    end_date: date
    amount: float
    status: str = Field(
        max_length=50, include=["draft", "pending", "approved", "rejected"]
    )
    description: Optional[str] = None


# Create
class LeaveRequestCreate(LeaveRequestBase):
    team_id: uuid.UUID
    leave_type_id: uuid.UUID


# Update
class LeaveRequestUpdate(LeaveRequestBase):
    approver_id: Optional[uuid.UUID] = None
    approved_at: Optional[datetime] = None


# Database table
class LeaveRequest(LeaveRequestBase, table=True):
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
    approver_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="user.id", ondelete="SET NULL"
    )

    requested_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None

    # Relationships
    owner: "User" = Relationship(
        back_populates="leave_requests",
        sa_relationship_kwargs={"foreign_keys": "[LeaveRequest.owner_id]"},
    )
    approver: "User" = Relationship(
        back_populates="approved_leave_requests",
        sa_relationship_kwargs={"foreign_keys": "[LeaveRequest.approver_id]"},
    )
    team: "Team" = Relationship(back_populates="leave_requests")
    leave_type: "LeaveType" = Relationship(back_populates="leave_requests")


# Public (for API responses)
class LeaveRequestPublic(LeaveRequestBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    team_id: uuid.UUID
    leave_type_id: uuid.UUID
    approver_id: Optional[uuid.UUID]
    requested_at: datetime
    approved_at: Optional[datetime]


# Public list wrapper
class LeaveRequestsPublic(SQLModel):
    data: list[LeaveRequestPublic]
    count: int
