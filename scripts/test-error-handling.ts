async function testErrorHandling() {
    const baseUrl = 'http://localhost:3000';
    const timestamp = Date.now();
    const validUser = {
        name: `Test User ${timestamp}`,
        email: `duplicate${timestamp}@example.com`,
        password: 'password123'
    };

    console.log('--- STARTING ERROR HANDLING TESTS ---\n');

    // Helper to make requests
    const request = async (endpoint: string, method: string, body: any, headers = {}) => {
        try {
            const res = await fetch(`${baseUrl}${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json', ...headers },
                body: body ? JSON.stringify(body) : undefined
            });
            const data = await res.json();
            return { status: res.status, data };
        } catch (e) {
            return { status: 500, data: { message: (e as Error).message } };
        }
    };

    // 1. Success Case (Setup)
    console.log('1. Creating Base User (Should 201)...');
    const setup = await request('/users', 'POST', validUser);
    console.log(`   Status: ${setup.status} (Expected 201)`);
    if (setup.status !== 201) process.exit(1);

    // 2. Test Prisma Unique Violation (P2002)
    console.log('\n2. Testing Duplicate Email (Should 409)...');
    const duplicate = await request('/users', 'POST', validUser);
    console.log(`   Status: ${duplicate.status} (Expected 409)`);
    console.log(`   Response: ${JSON.stringify(duplicate.data)}`);

    // 3. Test Zod Validation Error
    console.log('\n3. Testing Invalid Email (Should 400)...');
    const invalidEmail = await request('/users', 'POST', { ...validUser, email: 'not-an-email' });
    console.log(`   Status: ${invalidEmail.status} (Expected 400)`);
    console.log(`   Response: ${JSON.stringify(invalidEmail.data)}`);

    // 4. Test AppError (Login Failure - Invalid Credentials)
    console.log('\n4. Testing Wrong Password (Should 401)...');
    const invalidLogin = await request('/login', 'POST', { email: validUser.email, password: 'wrongpassword' });
    console.log(`   Status: ${invalidLogin.status} (Expected 401)`);
    console.log(`   Response: ${JSON.stringify(invalidLogin.data)}`);

    // 5. Test JWT Error (Invalid Token)
    console.log('\n5. Testing Invalid Token (Should 401)...');
    const invalidToken = await request('/profile', 'GET', null, { 'Authorization': 'Bearer invalid.token.here' });
    console.log(`   Status: ${invalidToken.status} (Expected 401)`);
    console.log(`   Response: ${JSON.stringify(invalidToken.data)}`);

    // 6. Test JSON Syntax Error (Malformed Body)
    // We need raw fetch to send bad json
    console.log('\n6. Testing Malformed JSON (Should 400)...');
    try {
        const socketRes = await fetch(`${baseUrl}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{ "name": "Broken JSON", "email": }' // Syntax Error
        });
        const data = await socketRes.json();
        console.log(`   Status: ${socketRes.status} (Expected 400)`);
        console.log(`   Response: ${JSON.stringify(data)}`);
    } catch (e) {
        console.log('   Fetch failed (might handle syntax error differently depending on server config)');
    }
}

testErrorHandling();
