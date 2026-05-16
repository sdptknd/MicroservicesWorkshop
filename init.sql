-- Create schemas
CREATE SCHEMA IF NOT EXISTS user_schema;
CREATE SCHEMA IF NOT EXISTS search_schema;
CREATE SCHEMA IF NOT EXISTS booking_schema;

-- User Schema Tables
CREATE TABLE IF NOT EXISTS user_schema.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search Schema Tables
CREATE TABLE IF NOT EXISTS search_schema.hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    available_rooms INTEGER NOT NULL DEFAULT 0
);

-- Insert mock hotels
INSERT INTO search_schema.hotels (name, city, price_per_night, available_rooms) VALUES
('Grand Plaza', 'New York', 200.00, 10),
('Ocean View Resort', 'Miami', 150.00, 5),
('Mountain Retreat', 'Denver', 120.00, 2),
('City Center Inn', 'New York', 100.00, 20)
ON CONFLICT DO NOTHING;

-- Booking Schema Tables
CREATE TABLE IF NOT EXISTS booking_schema.bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    hotel_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    receipt_path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
