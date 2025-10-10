# import uuid
# from datetime import datetime
# from typing import Optional
#
# from sqlmodel import SQLModel, Field, Relationship
#
# from .leave_type_model import LeaveType
# from ..models import User
#
#
# # Shared
# class LeavePlanRequestBase(SQLModel):
#     status: str = Field(max_length=50)
#     description: Optional[str] = None
#     amount: float
#
#
# # Create
# class LeavePlanRequestCreate(LeavePlanRequestBase):
#     leave_type_id: uuid.UUID
#
#
# # Update
# class LeavePlanRequestUpdate(LeavePlanRequestBase):
#     approver_id: Optional[uuid.UUID] = None
#     approved_at: Optional[datetime] = None
#
#
# # Table
# class LeavePlanRequest(LeavePlanRequestBase, table=True):
#     id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
#     owner_id: uuid.UUID = Field(
#         foreign_key="user.id", nullable=False, ondelete="CASCADE"
#     )
#     leave_type_id: uuid.UUID = Field(
#         foreign_key="leavetype.id", nullable=False, ondelete="CASCADE"
#     )
#     approver_id: Optional[uuid.UUID] = Field(
#         default=None, foreign_key="user.id", ondelete="SET NULL"
#     )
#
#     requested_at: datetime = Field(default_factory=datetime.utcnow)
#     approved_at: Optional[datetime] = None
#
#     # Relationships
#     owner: User | None = Relationship(back_populates="leave_plan_requests")
#     approver: User | None = Relationship(back_populates="approved_leave_plan_requests")
#     leave_type: LeaveType | None = Relationship(back_populates="leave_plan_requests")
#     details: list["LeavePlanDetail"] = Relationship(back_populates="leave_plan_request_details")
#
#
# # Public
# class LeavePlanRequestPublic(LeavePlanRequestBase):
#     id: uuid.UUID
#     owner_id: uuid.UUID
#     leave_type_id: uuid.UUID
#     approver_id: Optional[uuid.UUID]
#     requested_at: datetime
#     approved_at: Optional[datetime]
#
#
# class LeavePlanRequestsPublic(SQLModel):
#     data: list[LeavePlanRequestPublic]
#     count: int
#
#
# # plan detail
# class LeavePlanDetailBase(SQLModel):
#     leave_date: datetime = Field(default_factory=datetime.utcnow)
#
#
# class LeavePlanDetailCreate(LeavePlanDetailBase):
#     leave_plan_id: uuid.UUID
#
#
# class LeavePlanDetailUpdate(LeavePlanDetailBase):
#     pass
#
#
# class LeavePlanDetail(LeavePlanDetailBase, table=True):
#     id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
#     leave_plan_id: uuid.UUID = Field(
#         foreign_key="leaveplanrequest.id", nullable=False, ondelete="CASCADE"
#     )
#
#     leave_plan_request: "LeavePlanDetail" = Relationship(
#         back_populates="leave_plan_request_details"
#     )
#
#
# class LeavePlanDetailPublic(LeavePlanDetailBase):
#     id: uuid.UUID
#     leave_plan_id: uuid.UUID
#
#
# class LeavePlanDetailsPublic(SQLModel):
#     data: list[LeavePlanDetailPublic]
#     count: int
