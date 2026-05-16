# Hotel Booking App - Step 2 (Monolith Clustering & Load Balancing)

This branch demonstrates how to scale the monolithic application horizontally using Nginx as a Load Balancer.

## Architecture
- **Load Balancer (Nginx)**: Runs in a container on port 80.
- **API Cluster**: 3 identical instances of the monolithic backend.
- **Database (PostgreSQL)**: Shared database instance.

## Getting Started

1. **Start the clustered stack:**
   ```bash
   docker-compose up -d --build
   ```

2. **Verify the cluster is running:**
   ```bash
   docker-compose ps
   ```
   *You should see one Nginx container and three API containers.*

3. **Check the Load Balancer logs:**
   ```bash
   docker-compose logs -f nginx
   ```

## Testing with cURL
*Note: We now use port **80** (default) instead of 3000.*

### 1. Register a User
```bash
curl -X POST http://localhost/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### 2. Login (Save the token!)
```bash
curl -X POST http://localhost/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```
*Export the token:*
`export TOKEN="your_jwt_token_here"`

### 3. Search Hotels
```bash
curl -X GET "http://localhost/api/search/hotels?city=New%20York"
```

### 4. Create a Booking (Watch the load balancing!)
*Run this multiple times and check the logs (`docker-compose logs api`) to see which instance handles the request.*
```bash
curl -X POST http://localhost/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hotel_id": 1, "rooms": 1}'
```

### 5. List Your Bookings
```bash
curl -X GET http://localhost/api/bookings \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Download Receipt PDF
```bash
curl -X GET http://localhost/api/bookings/1/receipt \
  -H "Authorization: Bearer $TOKEN" \
  --output receipt.pdf
```
