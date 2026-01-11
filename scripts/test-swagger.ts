async function testSwagger() {
    const baseUrl = 'http://localhost:3000';
    console.log('--- TESTING SWAGGER UI ---\n');

    try {
        const res = await fetch(`${baseUrl}/api-docs/`);

        console.log(`Status: ${res.status}`);
        const contentType = res.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (res.status === 200 && contentType && contentType.includes('text/html')) {
            console.log('\n✅ Swagger UI Accessible');
        } else {
            console.error('\n❌ Failed to access Swagger UI');
            process.exit(1);
        }
    } catch (e) {
        console.error('Failed to connect:', e);
        process.exit(1);
    }
}

testSwagger();
