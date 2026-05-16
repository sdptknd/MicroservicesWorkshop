# Hotel Booking App - Step 3 (Microservices & Polyglot)

This branch demonstrates the full decomposition of the monolith into separate microservices using different technologies.

## Architecture
- **API Gateway (Nginx)**: Port 3000. Routes traffic based on paths:
  - `/api/users/*` -> **User Service**
  - `/api/search/*` -> **Search Service**
  - `/api/bookings/*` -> **Booking Service**
- **User Service (Node.js)**: Handles identity and JWTs.
- **Search Service (ASP.NET Core)**: Polyglot service handling hotel data.
- **Booking Service (Node.js)**: Handles bookings and orchestrates with Search Service via internal HTTP calls.

## Getting Started

1. **Start the microservices stack:**
   ```bash
   docker-compose up -d --build
   ```

2. **Verify the services:**
   ```bash
   docker-compose ps
   ```

## Testing with cURL
*The API entry point remains port 3000.*

### 1. Register/Login (User Service)
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### 2. Search (ASP.NET Core Service)
```bash
curl -X GET "http://localhost:3000/api/search/hotels?city=New%20York"
```

### 3. Create Booking (Orchestration Demo)
*Booking Service will now call Search Service internally via HTTP to confirm availability.*
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hotel_id": 1, "rooms": 1}'
```
