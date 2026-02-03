-- Match-A-Fit Database Schema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    age SMALLINT CHECK (age >= 0),
    date_of_birth DATE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- store hashed password (e.g., bcrypt)
    gender VARCHAR(32),
    phone VARCHAR(30) UNIQUE
);

CREATE TABLE clothing_items (
    id SERIAL PRIMARY KEY,
    image BYTEA, -- binary image data uploaded by user
    image_filename VARCHAR(255),
    image_mime VARCHAR(100),
    type VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE outfits (
    id SERIAL PRIMARY KEY, 
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    upper_item_id INTEGER REFERENCES clothing_items(id) ON DELETE CASCADE,
    lower_item_id INTEGER REFERENCES clothing_items(id) ON DELETE CASCADE,
    footwear_item_id INTEGER REFERENCES clothing_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);


