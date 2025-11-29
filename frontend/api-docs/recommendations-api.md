# Recommendations API

## Endpoints

### Get Leave Plan Recommendations
GET /api/v1/recommends/leave-plan?year=2025
## Recommend Leave Plan API

### GET /api/v1/recommends/leave-plan

Retrieve recommended leave plans for a given year.

#### Parameters
| Name  | In     | Type    | Required | Description                       | Default |
|-------|--------|---------|----------|-----------------------------------|---------|
| year  | query  | integer | false    | Year to generate recommendations  | 2025    |

#### Responses

**200: Successful Response**
```json
{
  "data": [
    {
      "leave_date": "2025-11-15",
      "bridge_holiday": true,
      "team_workload": 0,
      "preference_score": 0,
      "predicted_score": 0
    }
  ]
}
```

**422: Validation Error**
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

**Parameters:**
- `year` (query, integer, required): Year to generate leave recommendations
  - Default: 2025

**Response (200 Successful Response):**
```json
{
  "data": [
    {
      "leave_date": "2025-10-25",
      "leave_period": "FULL_DAY",
      "leave_reason_score": 0.8,
      "predicted_score": 0.9
    }
  ]
}
```

**Validation Error (422):**
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

- `leave_date`: The recommended date for taking leave (ISO 8601 format)
- `leave_period`: The period of leave (e.g., "FULL_DAY", "HALF_DAY_AM", "HALF_DAY_PM")
- `leave_reason_score`: Score indicating the strength of the reason for leave (0.0 to 1.0)
- `predicted_score`: Predicted approval/success score for the leave request (0.0 to 1.0)
