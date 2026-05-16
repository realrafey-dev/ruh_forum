const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

if (process.env.DB_SSL === 'true') {
  dbConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(dbConfig);

const initDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL connected successfully');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
      await conn.query(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE`);
    } catch (e) {
      // Column already exists - ignore
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS trusts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        relation VARCHAR(100) NOT NULL,
        photo VARCHAR(255),
        target_amount DECIMAL(15,2) DEFAULT 0,
        raised_amount DECIMAL(15,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'general',
        target_amount DECIMAL(15,2) DEFAULT 0,
        raised_amount DECIMAL(15,2) DEFAULT 0,
        image VARCHAR(255),
        start_date DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS email_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        to_email VARCHAR(200) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        html TEXT NOT NULL,
        status ENUM('pending','sent','failed') DEFAULT 'pending',
        error_msg TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        trust_id INT,
        campaign_id INT,
        type ENUM('direct', 'trust', 'campaign') NOT NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        amount DECIMAL(15,2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'bank_transfer',
        screenshot VARCHAR(255),
        message TEXT,
        is_anonymous BOOLEAN DEFAULT FALSE,
        zakat BOOLEAN DEFAULT FALSE,
        status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (trust_id) REFERENCES trusts(id) ON DELETE SET NULL,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
      )
    `);

    conn.release();
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
};

module.exports = { pool, initDB };
