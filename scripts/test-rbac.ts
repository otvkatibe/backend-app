async function testRBAC() {
    const baseUrl = 'http://localhost:3000';
    const timestamp = Date.now();
    const normalUser = {
        name: `User ${timestamp}`,
        email: `user${timestamp}@example.com`,
        password: 'password123'
    };

    const request = async (endpoint: string, method: string, token: string | null = null, body: any = null) => {
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${baseUrl}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined
            });
            const data = await res.json();
            return { status: res.status, data };
        } catch (e) {
            return { status: 500, data: (e as Error).message };
        }
    };

    console.log('--- TESTING RBAC ---\n');

    // 1. Create Normal User
    console.log('1. Creating Normal User...');
    const createRes = await request('/users', 'POST', null, normalUser);
    if (createRes.status !== 201) {
        console.error('Failed to create user');
        process.exit(1);
    }
    console.log('   User created.');

    // 2. Login
    console.log('2. Logging in...');
    const loginRes = await request('/login', 'POST', null, { email: normalUser.email, password: normalUser.password });
    const token = loginRes.data.token;
    console.log('   Token received.');

    // 3. Try to access Admin Route as Normal User (Should Fail 403)
    console.log('3. Accessing /admin/stats as USER (Should 403)...');
    const forbiddenRes = await request('/admin/stats', 'GET', token);
    console.log(`   Status: ${forbiddenRes.status} (Expected 403)`);
    console.log(`   Response: ${JSON.stringify(forbiddenRes.data)}`);

    // Note: We don't have an endpoint to create ADMINs securely yet, 
    // so we can't test the Success case automatically without manual DB seed.
    // But verifying that USER is blocked is the most important part validation.
}

testRBAC();
