require('dotenv').config({ path: require('path').join(__dirname, '../../.env.test') });

// Ensure test environment
process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'financaspro_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_32_chars_minimum!!';
