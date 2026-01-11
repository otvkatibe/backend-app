async function testHealth() {
    const baseUrl = 'http://localhost:3000';
    console.log('--- TESTING HEALTH CHECK ---\n');

    try {
        const res = await fetch(`${baseUrl}/health`);
        const body = await res.json();

        console.log(`Status: ${res.status}`);
        console.log('Response:', JSON.stringify(body, null, 2));

        if (res.status === 200 && body.status === 'UP' && body.services.database === 'UP') {
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
