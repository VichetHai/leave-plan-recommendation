# Leave Balances API

## Endpoints

### List Leave Balances
```
GET /api/v1/leave-balances?skip=0&limit=100
```

**Response (200 Successful Response):**
```json
{
  "data": [
    {
      "year": "str1",
      "balance": 15,
      "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    }
  ],
  "count": 0
}
```

### Create Leave Balance
```
POST /api/v1/leave-balances
```

**Request Body:**
```json
{
  "year": "str1",
  "balance": 0,
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response (200 Successful Response):**
```json
{
  "year": "str1",
  "balance": 0,
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### Get My Leave Balance
```
GET /api/v1/leave-balances/me
```

**Response (200 Successful Response):**
```json
{
  "year": "str1",
  "balance": 15,
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### Get Leave Balance by ID
```
GET /api/v1/leave-balances/{id}
```

**Parameters:**
- `id` (path, required): string($uuid)

**Response (200 Successful Response):**
```json
{
  "year": "str1",
  "balance": 0,
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### Update Leave Balance
```
PUT /api/v1/leave-balances/{id}
```

**Parameters:**
- `id` (path, required): string($uuid)

**Request Body:**
```json
{
  "year": "str1",
  "balance": 0,
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response (200 Successful Response):**
```json
{
  "year": "str1",
  "balance": 0,
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### Delete Leave Balance
```
DELETE /api/v1/leave-balances/{id}
```

**Parameters:**
- `id` (path, required): string($uuid)

**Response (200 Successful Response):**
```json
{
  "message": "string"
}
```
