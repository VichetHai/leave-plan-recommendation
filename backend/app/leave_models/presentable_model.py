import uuid

from sqlmodel import SQLModel


class UserPresentable(SQLModel):
    id: uuid.UUID
    full_name: str
    email: str

class TeamPresentable(SQLModel):
    id: uuid.UUID
    name: str

class LeaveTypePresentable(SQLModel):
    id: uuid.UUID
    code: str
    name: str
