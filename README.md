# Hotel Booking App - Step 1 (Monolith)

This branch contains the initial Monolithic version of the backend.

## Getting Started

1. **Start the infrastructure (DB & API):**
   ```bash
   docker compose up -d --build
   ```

2. **Check the logs (especially during the 30s block):**
   ```bash
   docker compose logs -f api
   ```

## Testing with cURL

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### 2. Login (Save the token!)
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```
*Export the token to a variable for the next commands:*
`export TOKEN="your_jwt_token_here"`

### 3. Search Hotels (Unauthenticated)
```bash
curl -X GET "http://localhost:3000/api/search/hotels?city=New York"
```

### 4. Create a Booking (Demonstrates 30s synchronous block)
*This command will hang for 30 seconds while the "PDF generates". During this time, the entire backend is blocked.*
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hotel_id": 1}'
```

### 5. List Your Bookings
```bash
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Download Receipt PDF
```bash
curl -X GET http://localhost:3000/api/bookings/1/receipt \
  -H "Authorization: Bearer $TOKEN" \
  --output receipt.pdf
```
