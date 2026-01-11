async function testRateLimit() {
    const baseUrl = 'http://localhost:3000';

    console.log('--- TESTING RATE LIMITING ---\n');

    // Helper to make requests
    const request = async (endpoint: string, method: string) => {
        try {
            const res = await fetch(`${baseUrl}${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: method === 'POST' ? JSON.stringify({ email: 'test@example.com', password: '123' }) : undefined
            });
            return res.status;
        } catch (e) {
            return 500;
        }
    };

    // 1. Test Auth Limit (Max 5)
    console.log('1. Spamming /login (Limit: 5)...');
    for (let i = 1; i <= 7; i++) {
        const status = await request('/login', 'POST');
        if (status === 429) {
            console.log(`   Request ${i}: BLOCKED (429) - SUCCESS ✅`);
            break;
        } else {
            console.log(`   Request ${i}: Allowed (${status})`);
        }

        if (i === 7) {
            console.error('   FAILED: Did not block after 5 requests ❌');
            process.exit(1);
        }
    }

    // Note: We won't test Global Limit (100) because it takes too long for a quick script
}

testRateLimit();
