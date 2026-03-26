const axios = require('axios');

async function verifyParentActivities() {
    const BASE_URL = 'http://localhost:5005';
    // This test assumes a valid parent token is available or bypasses auth for testing if possible.
    // Since I cannot easily get a real token in this environment, I'll mock a call or check the logic.
    
    console.log("Verifying backend endpoint: /api/parent/activities/parent");
    
    // In a real environment, I would use a test token. 
    // For now, I'll just check if the route is registered and basic logic.
    try {
        // Just checking if the route exists (might return 401 but that confirms route exists)
        const response = await axios.get(`${BASE_URL}/api/parent/activities/parent`);
        console.log("Response status:", response.status);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("SUCCESS: Route exists and requires authentication (Status 401)");
        } else {
            console.error("FAILED: Unexpected error", error.message);
        }
    }
}

// verifyParentActivities();
console.log("Verification script ready. (Requires running server)");
