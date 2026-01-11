async function testHealth() {
    const baseUrl = 'http://localhost:3000';
    console.log('--- TESTING HEALTH CHECK ---\n');

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const res = await fetch(`${baseUrl}/health`, {
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) {
            console.error(`❌ Request failed with status ${res.status}`);
            process.exit(1);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error(`❌ Invalid content-type: ${contentType}`);
            process.exit(1);
        }

        const body = await res.json();

        console.log(`Status: ${res.status}`);
        console.log('Response:', JSON.stringify(body, null, 2));

        if (res.status === 200 && body?.status === 'UP' && body?.services?.database === 'UP') {
            console.log('\n✅ Health Check PASSED');
        } else {
            console.error('\n❌ Health Check FAILED');
            process.exit(1);
        }
    } catch (e) {
        console.error('Failed to connect:', e);
        process.exit(1);
    }
}

testHealth();
