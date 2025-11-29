# Leave Plan Requests API

## Endpoints

### GET `/api/v1/leave-plan-requests/`

Retrieve a paginated list of leave plan requests.

#### Parameters

| Name | Type   | In    | Description                 | Default |
|------|--------|-------|-----------------------------|---------|
| skip | integer| query | Number of items to skip     | 0       |
| limit| integer| query | Maximum items to return     | 100     |

#### Successful Response

**Status:** 200 OK  
**Content-Type:** application/json

```json
{
  "data": [
    {
      "description": "string",
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "requested_at": "2025-11-15T10:21:47.233Z",
      "submitted_at": "2025-11-15T10:21:47.233Z",
      "approved_at": "2025-11-15T10:21:47.233Z",
      "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "status": "string",
      "amount": 0,
      "details": []
    }
  ],
  "count": 0
}
```

##### Response Fields

- `data`: Array of leave plan request objects
  - `id`: string — Unique identifier (UUID)
  - `description`: string — Reason or description for the leave request
  - `owner_id`: string — UUID of the requester
  - `leave_type_id`: string — UUID of the leave type
  - `requested_at`: string(date-time) — When the request was created
  - `submitted_at`: string(date-time) — When the request was formally submitted
  - `approved_at`: string(date-time | null) — When the request was approved (if applicable)
  - `approver_id`: string — UUID of the approver (if assigned)
  - `status`: string — Current status (e.g., "pending", "approved", "rejected")
  - `amount`: number — Total leave amount (days)
  - `details`: array — Per-date details
- `count`: integer — Total number of requests

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

### POST `/api/v1/leave-plan-requests/`

Create a new leave plan request.

#### Request Body

**Content-Type:** application/json

```json
{
  "description": "string",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "details": [
    {
      "leave_date": "2025-11-15"
    }
  ]
}
```

##### Request Fields

- `description`: string — Reason or description for the leave request (required)
- `leave_type_id`: string — UUID of the leave type (required)
- `details`: array — List of dates to take leave on; each item has `leave_date` in `YYYY-MM-DD` format (at least one item required)

#### Successful Response

**Status:** 200 OK  
**Content-Type:** application/json

```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-11-15T10:27:57.140Z",
  "submitted_at": "2025-11-15T10:27:57.140Z",
  "approved_at": "2025-11-15T10:27:57.140Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "string",
  "amount": 0,
  "details": []
}
```

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

### Get Leave Plan Request by ID
```
GET /api/v1/leave-plan-requests/{id}
```

**Parameters:**
- `id` (path, required): string($uuid)

**Response (200 Successful Response):**
```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-10-25T13:30:48.411Z",
  "submitted_at": "2025-10-25T13:30:48.411Z",
  "approved_at": "2025-10-25T13:30:48.411Z",
  "status": "string",
  "amount": 0,
  "details": []
}
```

**Validation Error (422 Unprocessable Entity):**
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

### PUT `/api/v1/leave-plan-requests/{id}`

Update a leave plan request by ID.

**Parameters:**
- `id` (path, required): string($uuid)

**Request Body:**

**Content-Type:** application/json

```json
{
  "description": "string",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "details": [
    {
      "leave_date": "2025-11-15"
    }
  ]
}
```

**Response (200 Successful Response):**
```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-11-15T10:31:23.353Z",
  "submitted_at": "2025-11-15T10:31:23.353Z",
  "approved_at": "2025-11-15T10:31:23.353Z",
  "status": "string",
  "amount": 0,
  "details": []
}
```

**Validation Error (422 Unprocessable Entity):**
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

### Delete Leave Plan Request
```
DELETE /api/v1/leave-plan-requests/{id}
```

**Parameters:**
- `id` (path, required): string($uuid)

**Response (200 Successful Response):**
```json
{
  "message": "string"
}
```

**Validation Error (422 Unprocessable Entity):**
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

### PUT `/api/v1/leave-plan-requests/{id}/submit`

Submit an item.

**Parameters:**
- `id` (path, required): string($uuid)

**Successful Response**

**Status:** 200 OK  
**Content-Type:** application/json

```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-11-15T10:31:54.619Z",
  "submitted_at": "2025-11-15T10:31:54.619Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approved_at": "2025-11-15T10:31:54.619Z",
  "status": "string",
  "amount": 0,
  "details": []
}
```

**Validation Error (422 Unprocessable Entity):**
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

### PUT `/api/v1/leave-plan-requests/{id}/approve`

Approve an item.

**Parameters:**
- `id` (path, required): string($uuid)

**Successful Response**

**Status:** 200 OK  
**Content-Type:** application/json

```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-11-15T10:32:07.575Z",
  "submitted_at": "2025-11-15T10:32:07.575Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approved_at": "2025-11-15T10:32:07.575Z",
  "status": "string",
  "amount": 0,
  "details": []
}
```

**Validation Error (422 Unprocessable Entity):**
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

### PUT `/api/v1/leave-plan-requests/{id}/reject`

Reject an item.

**Parameters:**
- `id` (path, required): string($uuid)

**Successful Response**

**Status:** 200 OK  
**Content-Type:** application/json

```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-11-15T10:32:21.135Z",
  "submitted_at": "2025-11-15T10:32:21.135Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approved_at": "2025-11-15T10:32:21.135Z",
  "status": "string",
  "amount": 0,
  "details": []
}
```

**Validation Error (422 Unprocessable Entity):**
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

## Field Descriptions

- `description`: Reason or description for the leave request
- `leave_type_id`: UUID of the leave type being requested
- `owner_id`: UUID of the user who created the request (auto-assigned)
- `approver_id`: UUID of the user responsible for approving the request
- `requested_at`: Timestamp when the request was created
- `submitted_at`: Timestamp when the request was submitted for approval
- `approved_at`: Timestamp when the request was approved (null if pending)
- `status`: Current status of the request (e.g., "pending", "approved", "rejected")
- `amount`: Total number of leave days requested
- `details`: Array of leave date details, each containing a `leave_date` field

## Status Values

- `pending`: Request is awaiting approval
- `approved`: Request has been approved
- `rejected`: Request has been rejected

## Notes

- The `owner_id` is automatically set to the authenticated user when creating a request
- The `details` array contains objects with `leave_date` field in ISO 8601 format (YYYY-MM-DD)
- The `amount` is automatically calculated based on the number of leave dates in `details`
- Only the request owner or approver can update/delete the request
