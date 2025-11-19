import uuid

from sqlmodel import SQLModel


class UserPresentable(SQLModel):
    id: uuid.UUID
    full_name: str
    email: str

class TeamPresentable(SQLModel):
    id: uuid.UUID
    name: str
