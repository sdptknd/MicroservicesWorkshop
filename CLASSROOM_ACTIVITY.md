# The Ultimate Classroom Scale-Out Activity

In this activity, you will distribute the entire Microservices architecture across the classroom using physical laptops connected to the same WiFi network. This perfectly simulates a real-world multi-node datacenter deployment!

## 🚨 Step 1: Pre-requisites for EVERY Student
1. Connect to the exact same WiFi network.
2. Clone the repository.
3. Find your machine's local IP address and write it down on a piece of paper or put it in the classroom chat.
   - **Mac/Linux:** Open terminal and run `ifconfig | grep "inet "` (look for `192.168.x.x` or `10.x.x.x`).
   - **Windows:** Open command prompt and run `ipconfig` (look for IPv4 Address).

---

## 🗄️ Step 2: The Core Infrastructure (2 Students)

**Student 1: The Database Host**
1. Run `docker-compose up -d db`
2. Announce your IP Address to the classroom as `<DB_IP>`.

**Student 2: The Redis Cache/Broker Host**
1. Run `docker-compose up -d redis`
2. Announce your IP Address to the classroom as `<REDIS_IP>`.

---

## 💻 Step 3: The Microservice Clusters (Multiple Students)
*Divide the remaining students into 4 groups: Search, User, Booking, and Worker.*

**Instructions for all Service Hosts:**
1. Open your code editor and open `docker-compose.yml`.
2. Find your specific service (e.g., `search-service`).
3. **Delete** the `depends_on:` block so Docker doesn't try to start local databases.
4. **Update the Environment Variables:**
   - Change `- DB_HOST=db` to `- DB_HOST=<DB_IP>`
   - Change `- REDIS_HOST=redis` to `- REDIS_HOST=<REDIS_IP>`
5. **If you are a Booking Service host:** 
   - Wait for the Search LB Leader (Step 4) to announce their IP. 
   - Change `- SEARCH_SERVICE_URL=http://nginx-search:80` to `- SEARCH_SERVICE_URL=http://<SEARCH_LB_IP>:80`
6. Run `docker-compose up -d <your-service-name>` (e.g., `docker-compose up -d search-service`).
7. Give your IP address to your group's **Load Balancer Leader**.

*(Note: In `docker-compose.yml`, you will need to add a `ports:` block to your service so other laptops can reach it! e.g. `ports: ["8080:8080"]` for Search, or `["3000:3000"]` for User/Booking).*

---

## ⚖️ Step 4: The Load Balancer Leaders (3 Students)
*Assign 1 student per microservice group to be the LB Leader (Search LB, User LB, Booking LB).*

1. Collect the IP addresses from all the students running your specific microservice.
2. Open your specific Nginx config file (e.g., `nginx/search.conf`).
3. Replace the Docker DNS upstream with the physical IPs of your classmates.
   **Example for Search LB:**
   ```nginx
   upstream search_service {
       server 192.168.1.101:8080; # Alice's Laptop
       server 192.168.1.102:8080; # Bob's Laptop
       server 192.168.1.103:8080; # Charlie's Laptop
   }
   ```
4. Run `docker-compose up -d nginx-<your-group>` (e.g., `docker-compose up -d nginx-search`).
5. Announce your IP address to the classroom as `<SEARCH_LB_IP>`, `<USER_LB_IP>`, or `<BOOKING_LB_IP>`.

---

## 🚪 Step 5: The API Gateway Leader (1 Student)

1. Collect the 3 IP addresses from the Load Balancer Leaders.
2. Open `nginx/gateway.conf`.
3. Update the routing rules to point to the physical IP addresses of the Load Balancer Leaders.
   **Example:**
   ```nginx
   location /api/users/ {
       proxy_pass http://192.168.1.50:80/api/users/; # User LB IP
   }
   location /api/search/ {
       proxy_pass http://192.168.1.51:80/api/search/; # Search LB IP
   }
   location /api/bookings/ {
       proxy_pass http://192.168.1.52:80/api/bookings/; # Booking LB IP
   }
   ```
4. Run `docker-compose up -d nginx-gateway`.
5. Announce your IP Address to the classroom as the **Master API URL**.

---

## 🚀 Step 6: The Grand Finale!
Everyone in the classroom opens their web browser or Terminal and hits the Gateway Leader's IP Address (e.g., `http://192.168.1.200:3000/api/search/hotels`). 

The Gateway Leader routes it to the Search LB Leader. The Search LB Leader distributes the traffic across the class laptops. The laptop querying the data hits the Database Leader's laptop, stores it in the Redis Leader's laptop, and returns it to the screen!
