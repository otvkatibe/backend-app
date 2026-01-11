async function testUserFlow() {
    const baseUrl = 'http://localhost:3000';
    const timestamp = Date.now();
    const userData = {
        name: `Test User ${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'password123'
    };

    console.log('1. Creating User...');
    try {
        const createRes = await fetch(`${baseUrl}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!createRes.ok) {
            const error = await createRes.text();
            throw new Error(`Create failed: ${createRes.status} - ${error}`);
        }
        const createData = await createRes.json();
        console.log('✅ User Created:', createData);

        console.log('\n2. Logging in...');
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userData.email, password: userData.password })
        });

        if (!loginRes.ok) {
            const error = await loginRes.text();
            throw new Error(`Login failed: ${loginRes.status} - ${error}`);
        }
        const loginData = await loginRes.json();
        console.log('✅ Login Successful. Token received.');

        console.log('\n3. Accessing Profile...');
        const profileRes = await fetch(`${baseUrl}/profile`, {
            headers: { 'Authorization': `Bearer ${loginData.token}` }
        });

        if (!profileRes.ok) {
            const error = await profileRes.text();
            throw new Error(`Profile access failed: ${profileRes.status} - ${error}`);
        }
        const profileData = await profileRes.json();
        console.log('✅ Profile Accessed:', profileData);

        console.log('\n🎉 ALL TESTS PASSED!');
    } catch (error) {
        console.error('❌ TEST FAILED:', error);
        process.exit(1);
    }
}

testUserFlow();
