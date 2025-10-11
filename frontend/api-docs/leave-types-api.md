---

### PUT `/api/v1/leave-types/{id}`

Update a leave type by ID.

#### Parameters

| Name | Type   | In   | Description         | Required |
|------|--------|------|---------------------|----------|
| id   | string | path | Leave type ID (UUID) | Yes      |

#### Request Body

**Content-Type:** application/json

```json
{
  "code": "string",
  "name": "string",
  "description": "string",
  "is_active": true
}
```

##### Request Fields

- `code`: string — Unique code for the leave type (required)
- `name`: string — Name of the leave type (required)
- `description`: string — Description of the leave type
- `is_active`: boolean — Whether the leave type is active

#### Successful Response

**Status:** 200 OK
**Content-Type:** application/json

```json
{
  "code": "string",
  "name": "string",
  "description": "string",
  "is_active": true,
  "id": "string"
}
```

##### Response Fields

- `code`: string — Unique code for the leave type
- `name`: string — Name of the leave type
- `description`: string — Description of the leave type
- `is_active`: boolean — Whether the leave type is active
- `id`: string — Unique identifier

#### Validation Error

**Status:** 422 Unprocessable Entity
**Content-Type:** application/json

```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

##### Error Fields

- `detail`: Array of error objects
  - `loc`: array — Location of the error
  - `msg`: string — Error message
  - `type`: string — Error type

#### Example Request

```json
{
  "code": "ANNUAL",
  "name": "Annual Leave",
  "description": "Paid annual leave",
  "is_active": true
}
```

#### Example Response

```json
{
  "code": "ANNUAL",
  "name": "Annual Leave",
  "description": "Paid annual leave",
  "is_active": true,
  "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"
}
```

---

### DELETE `/api/v1/leave-types/{id}`

Delete a leave type by ID.

#### Parameters

| Name | Type   | In   | Description         | Required |
|------|--------|------|---------------------|----------|
| id   | string | path | Leave type ID (UUID) | Yes      |

#### Successful Response

**Status:** 200 OK
**Content-Type:** application/json

```json
{
  "message": "string"
}
```

##### Response Fields

- `message`: string — Success message

#### Validation Error

**Status:** 422 Unprocessable Entity
**Content-Type:** application/json

```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

##### Error Fields

- `detail`: Array of error objects
  - `loc`: array — Location of the error
  - `msg`: string — Error message
  - `type`: string — Error type

#### Example Request

```
DELETE /api/v1/leave-types/3a95f654-5717-45f2-b3fc-2c963f6e0fa6
```

#### Example Response

```json
{
  "message": "Leave type deleted successfully."
}
```
---

### GET `/api/v1/leave-types/{id}`

Retrieve a leave type by ID.

#### Parameters

| Name | Type   | In   | Description         | Required |
|------|--------|------|---------------------|----------|
| id   | string | path | Leave type ID (UUID) | Yes      |

#### Successful Response

**Status:** 200 OK
**Content-Type:** application/json

```json
{
  "code": "string",
  "name": "string",
  "description": "string",
  "is_active": true,
  "id": "string"
}
```

##### Response Fields

- `code`: string — Unique code for the leave type
- `name`: string — Name of the leave type
- `description`: string — Description of the leave type
- `is_active`: boolean — Whether the leave type is active
- `id`: string — Unique identifier

#### Validation Error

**Status:** 422 Unprocessable Entity
**Content-Type:** application/json

```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

##### Error Fields

- `detail`: Array of error objects
  - `loc`: array — Location of the error
  - `msg`: string — Error message
  - `type`: string — Error type

#### Example Request

```
GET /api/v1/leave-types/3a95f654-5717-45f2-b3fc-2c963f6e0fa6
```

#### Example Response

```json
{
  "code": "ANNUAL",
  "name": "Annual Leave",
  "description": "Paid annual leave",
  "is_active": true,
  "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"
}
```
# Leave Types API Reference

## Endpoints

---

### GET `/api/v1/leave-types/`

Retrieve a list of leave types.

#### Parameters

| Name   | Type    | In     | Description         | Default |
|--------|---------|--------|---------------------|---------|
| skip   | integer | query  | Number of items to skip | 0       |
| limit  | integer | query  | Max items to return     | 100     |

#### Successful Response

**Status:** 200 OK
**Content-Type:** application/json

```json
{
  "data": [
    {
      "code": "string",
      "name": "string",
      "description": "string",
      "is_active": true,
      "id": "string"
    }
  ],
  "count": 0
}
```

##### Response Fields

- `data`: Array of leave type objects
  - `code`: string — Unique code for the leave type
  - `name`: string — Name of the leave type
  - `description`: string — Description of the leave type
  - `is_active`: boolean — Whether the leave type is active
  - `id`: string — Unique identifier
- `count`: integer — Total number of leave types

#### Validation Error

**Status:** 422 Unprocessable Entity
**Content-Type:** application/json

```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

##### Error Fields

- `detail`: Array of error objects
  - `loc`: array — Location of the error
  - `msg`: string — Error message
  - `type`: string — Error type

#### Example Request

```
GET /api/v1/leave-types?skip=0&limit=100
```

#### Example Response

```json
{
  "data": [
    {
      "code": "ANNUAL",
      "name": "Annual Leave",
      "description": "Paid annual leave",
      "is_active": true,
      "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"
    }
  ],
  "count": 1
}
```

---

### POST `/api/v1/leave-types/`

Create a new leave type.

#### Request Body

**Content-Type:** application/json

```json
{
  "code": "string",
  "name": "string",
  "description": "string",
  "is_active": true
}
```

##### Request Fields

- `code`: string — Unique code for the leave type (required)
- `name`: string — Name of the leave type (required)
- `description`: string — Description of the leave type
- `is_active`: boolean — Whether the leave type is active

#### Successful Response

**Status:** 200 OK
**Content-Type:** application/json

```json
{
  "code": "string",
  "name": "string",
  "description": "string",
  "is_active": true,
  "id": "string"
}
```

##### Response Fields

- `code`: string — Unique code for the leave type
- `name`: string — Name of the leave type
- `description`: string — Description of the leave type
- `is_active`: boolean — Whether the leave type is active
- `id`: string — Unique identifier

#### Validation Error

**Status:** 422 Unprocessable Entity
**Content-Type:** application/json

```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

##### Error Fields

- `detail`: Array of error objects
  - `loc`: array — Location of the error
  - `msg`: string — Error message
  - `type`: string — Error type

#### Example Request

```json
{
  "code": "ANNUAL",
  "name": "Annual Leave",
  "description": "Paid annual leave",
  "is_active": true
}
```

#### Example Response

```json
{
  "code": "ANNUAL",
  "name": "Annual Leave",
  "description": "Paid annual leave",
  "is_active": true,
  "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"
}
```
