const axios = require('axios');

const BASE_URL = 'http://localhost:5005';

async function testParentProfile() {
    try {
        console.log('1. Attempting login...');
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'testparent@example.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('Login successful, token received.');

        console.log('\n2. Fetching current profile (GET /api/parent/me)...');
        const getRes = await axios.get(`${BASE_URL}/api/parent/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('GET Result:', JSON.stringify(getRes.data, null, 2));

        console.log('\n3. Updating profile (PUT /api/parent/update)...');
        const updateRes = await axios.put(`${BASE_URL}/api/parent/update`, {
            fullName: 'Manas Rege',
            phoneNumber: '9876543210',
            address: '123 Daycare Street, Mumbai',
            profileImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('PUT Result:', JSON.stringify(updateRes.data, null, 2));

        console.log('\n4. Verifying update (GET /api/parent/me again)...');
        const verifyRes = await axios.get(`${BASE_URL}/api/parent/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Final GET Result:', JSON.stringify(verifyRes.data, null, 2));

    } catch (error) {
        console.error('Error testing API:', error.response ? error.response.data : error.message);
    }
}

testParentProfile();
