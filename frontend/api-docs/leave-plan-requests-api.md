# Leave Plan Requests API

## Endpoints

### List Leave Plan Requests
```
GET /api/v1/leave-plan-requests?skip=0&limit=100
```

**Response (200 Successful Response):**
```json
{
  "data": [
    {
      "description": "string",
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "requested_at": "2025-10-25T13:30:48.411Z",
      "approved_at": "2025-10-25T13:30:48.411Z",
      "status": "string",
      "amount": 0,
      "details": []
    }
  ],
  "count": 0
}
```

### Create Leave Plan Request
```
POST /api/v1/leave-plan-requests
```

**Request Body:**
```json
{
  "description": "string",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "details": [
    {
      "leave_date": "2025-10-25"
    }
  ]
}
```

**Response (200 Successful Response):**
```json
{
  "description": "string",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-10-25T13:30:48.411Z",
  "approved_at": "2025-10-25T13:30:48.411Z",
  "status": "string",
  "amount": 0,
  "details": []
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
  "approved_at": "2025-10-25T13:30:48.411Z",
  "status": "string",
  "amount": 0,
  "details": []
}
```

### Update Leave Plan Request
```
PUT /api/v1/leave-plan-requests/{id}
```

**Parameters:**
- `id` (path, required): string($uuid)

**Request Body:**
```json
{
  "description": "string",
  "details": [
    {
      "leave_date": "2025-10-25"
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
  "requested_at": "2025-10-25T13:30:48.411Z",
  "approved_at": "2025-10-25T13:30:48.411Z",
  "status": "string",
  "amount": 0,
  "details": []
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

## Field Descriptions

- `description`: Reason or description for the leave request
- `leave_type_id`: UUID of the leave type being requested
- `owner_id`: UUID of the user who created the request (auto-assigned)
- `approver_id`: UUID of the user responsible for approving the request
- `requested_at`: Timestamp when the request was created
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
