import uuid

from sqlmodel import Field, Relationship, SQLModel


# Policy
class PolicyBase(SQLModel):
    code: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(default="Untitled", max_length=255)
    value: str = Field(max_length=255)
    description: str | None = Field(defaut=None, max_length=255)
    is_active: bool = True

class Policy(PolicyBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


# Public Holiday
class PublicHolidayBase(SQLModel):
    date: str = Field(unique=True, index=True)
    name: str = Field(default="Untitled", max_length=255)
    description: str | None = Field(defaut=None, max_length=255)

class PublicHoliday(PublicHolidayBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


# Leave Type
class LeaveTypeBase(SQLModel):
    code: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(default="Untitled", max_length=255)
    description: str | None = Field(defaut=None, max_length=255)
    is_active: bool = True

class LeaveType(LeaveTypeBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
