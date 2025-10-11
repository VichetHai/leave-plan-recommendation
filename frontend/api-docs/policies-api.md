# Policies API Reference

## GET /api/v1/policies

Retrieve a list of policies.

### Parameters

- `skip` (integer, query): Number of items to skip. Default value: 0.
- `limit` (integer, query): Maximum number of items to retrieve. Default value: 100.

### Responses

#### 200 Successful Response

Content-Type: `application/json`

```json
{
  "data": [
    {
      "code": "string",
      "name": "string",
      "value": "string",
      "description": "string",
      "is_active": true,
      "id": "string"
    }
  ],
  "count": 0
}
```

#### 422 Validation Error

Content-Type: `application/json`

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

## POST /api/v1/policies

Create a new policy.

### Request Body

Content-Type: `application/json`

```json
{
  "code": "string",
  "name": "string",
  "value": "string",
  "description": "string",
  "is_active": true
}
```

### Responses

#### 200 Successful Response

Content-Type: `application/json`

```json
{
  "code": "string",
  "name": "string",
  "value": "string",
  "description": "string",
  "is_active": true,
  "id": "string"
}
```

#### 422 Validation Error

Content-Type: `application/json`

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

## GET /api/v1/policies/{id}

Retrieve a policy by its ID.

### Parameters

- `id` (string, path): The unique identifier of the policy.

### Responses

#### 200 Successful Response

Content-Type: `application/json`

```json
{
  "code": "string",
  "name": "string",
  "value": "string",
  "description": "string",
  "is_active": true,
  "id": "string"
}
```

#### 422 Validation Error

Content-Type: `application/json`

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

## PUT /api/v1/policies/{id}

Update a policy by its ID.

### Parameters

- `id` (string, path): The unique identifier of the policy.

### Request Body

Content-Type: `application/json`

```json
{
  "code": "string",
  "name": "string",
  "value": "string",
  "description": "string",
  "is_active": true
}
```

### Responses

#### 200 Successful Response

Content-Type: `application/json`

```json
{
  "code": "string",
  "name": "string",
  "value": "string",
  "description": "string",
  "is_active": true,
  "id": "string"
}
```

#### 422 Validation Error

Content-Type: `application/json`

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

## DELETE /api/v1/policies/{id}

Delete a policy by its ID.

### Parameters

- `id` (string, path): The unique identifier of the policy.

### Responses

#### 200 Successful Response

Content-Type: `application/json`

```json
{
  "message": "string"
}
```

#### 422 Validation Error

Content-Type: `application/json`

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