# Hotel Booking App - Step 1 (Monolith)

This branch contains the initial Monolithic version of the backend.

## Getting Started (The Hard Way: Pure Docker)

To demonstrate why `docker-compose` exists, you can run the containers manually. You must create a network, build the image, run the database, and run the API with explicitly mapped environment variables.

1. **Create the network and data volume:**
   ```bash
   docker network create hotel-network
   docker volume create hotel_pgdata
   ```

2. **Start the Database Container:**
   ```bash
   docker run -d \
     --name hotel_db \
     --network hotel-network \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=hotel_db \
     -p 5432:5432 \
     -v $(pwd)/db-scripts:/docker-entrypoint-initdb.d \
     -v hotel_pgdata:/var/lib/postgresql/data \
     postgres:15-alpine
   ```

3. **Build the API Image:**
   ```bash
   docker build -t monolith-api:latest ./monolith
   ```

4. **Start the API Container:**
   ```bash
   docker run -d \
     --name monolith_api \
     --network hotel-network \
     -e DB_HOST=hotel_db \
     -e DB_PORT=5432 \
     -e DB_USER=postgres \
     -e DB_PASSWORD=password \
     -e DB_NAME=hotel_db \
     -e JWT_SECRET=mysecretkeyforhotelbooking \
     -p 3000:3000 \
     monolith-api:latest
   ```

5. **Check the logs:**
   ```bash
   docker logs -f monolith_api
   ```

6. **Cleanup (Before showing Docker Compose):**
   ```bash
   docker rm -f monolith_api hotel_db
   docker network rm hotel-network
   docker volume rm hotel_pgdata
   ```

---

## Getting Started (The Easy Way: Docker Compose)

After showing how painful the manual commands are, you can use `docker-compose` to do all of the above (network, build, run, env vars) in a single command.

1. **Start the infrastructure (DB & API):**
   ```bash
   docker compose up -d --build
   ```

2. **Check the logs:**
   ```bash
   docker compose logs -f api
   ```

---

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

### 4. Create a Booking (Demonstrates synchronous block)
*This command will hang while the "PDF generates". During this time, the entire backend is blocked.*
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hotel_id": 1, "rooms": 1}'
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
