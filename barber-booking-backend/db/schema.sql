CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'barber', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- CREATE TABLE barber_services (
--     barber_id INT REFERENCES users(id) ON DELETE CASCADE,
--     service_id INT REFERENCES services(id) ON DELETE CASCADE,
--     PRIMARY KEY (barber_id, service_id)
-- );

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id) ON DELETE CASCADE,
    barber_id INT REFERENCES users(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id),
    appointment_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    barber_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TABLE feedbacks (
--     id SERIAL PRIMARY KEY,
--     customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
--     barber_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
--     rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
--     comment TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
