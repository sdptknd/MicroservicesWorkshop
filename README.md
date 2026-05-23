# Hotel Booking App - Step 6 (Enterprise API Gateway & Load Balancing)

This branch introduces an Enterprise-grade routing architecture, completely mimicking the separation of concerns found in advanced Kubernetes setups (like Ingress Controllers and internal Service Meshes).

## Architecture Updates
Instead of a single Nginx monolith, traffic is now split across 4 dedicated Nginx containers:
1. **`nginx-gateway`**: The only public-facing container (Port 3000). Handles path-based routing (e.g., `/api/users` $\rightarrow$ `nginx-user`).
2. **`nginx-user`**: Hidden internal Layer 7 Load Balancer for the User Service.
3. **`nginx-search`**: Hidden internal Layer 7 Load Balancer for the Search Service.
4. **`nginx-booking`**: Hidden internal Layer 7 Load Balancer for the Booking Service.

**Internal Service-to-Service Communication**:
The Booking Service now connects to `http://nginx-search:80` when asking for hotel availability, meaning internal traffic is now fully load-balanced by a dedicated Layer 7 proxy rather than relying on Docker's basic Layer 4 DNS Round-Robin.

---

This branch demonstrates how to solve read-heavy database bottlenecks using a **Cache-Aside** pattern with Redis.

## Architecture Updates
- **Search Service (.NET)**: Now uses `StackExchange.Redis` to cache search results.
- **Message Broker & Cache (Redis)**: Redis is now acting as *both* a task queue (for the worker) and a high-speed cache.

## The Caching Flow
1. **Cache Miss**: The first time you search for a city, the service checks Redis, finds nothing, and queries the slow database (simulated 5s delay). It saves the result in Redis with a 30-second Time-To-Live (TTL).
2. **Cache Hit**: If you search for the same city within 30 seconds, the service fetches the result directly from Redis, returning instantly (< 50ms).
3. **Expiration**: After 30 seconds, the cache expires, ensuring the data stays fresh.

---

# Hotel Booking App - Step 4 (Asynchronous Background Processing)

This branch demonstrates how to decouple slow tasks using a message queue (Redis) and a background worker.

## Architecture
- **API Gateway (Nginx)**: Port 3000.
- **Microservices**: User, Search (.NET), and Booking Services.
- **Message Broker (Redis)**: Uses a **Redis List** as a task queue.
- **Worker Service (Node.js)**: Listens to Redis using a `BRPOP` loop. It handles the 30-second PDF generation in the background.

## The Async Flow
1. User sends `POST /api/bookings`.
2. **Booking Service** creates a `PENDING` booking and pushes a task to Redis.
3. **Booking Service** returns `201 Created` **instantly**.
4. **Worker Service** pops the task, waits 30 seconds, generates the PDF, and updates the DB to `COMPLETED`.

## Getting Started

1. **Start the full async stack:**
   ```bash
   docker-compose up -d --build
   ```

2. **Verify scaling:**
   ```bash
   docker-compose ps
   ```
   *Note: We have 2 replicas of the Worker Service to demonstrate parallel background processing.*

## Testing with cURL

### 1. Create a Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hotel_id": 1, "rooms": 1}'
```
*Observe that the response is now **instant**, even though the PDF isn't ready.*

### 2. Check Status
```bash
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN"
```
*Check the `status` field. It will say `PENDING` for 30 seconds before switching to `COMPLETED`.*

### 3. Download Receipt
*Wait 30 seconds before running this.*
```bash
curl -X GET http://localhost:3000/api/bookings/1/receipt \
  -H "Authorization: Bearer $TOKEN" \
  --output receipt.pdf
```
