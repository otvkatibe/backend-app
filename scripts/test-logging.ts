import { request } from 'http';

async function testLogging() {
    const baseUrl = 'http://localhost:3000';
    console.log('--- TESTING STRUCTURED LOGGING ---\n');

    const makeRequest = (path: string, name: string) => {
        return new Promise((resolve) => {
            console.log(`Sending request: ${name}...`);
            const req = request(`${baseUrl}${path}`, (res) => {
                console.log(`   Status: ${res.statusCode} (RequestId: ${res.headers['x-request-id']})`);
                resolve(true);
            });
            req.on('error', () => { console.log('Error connecting'); resolve(false) });
            req.end();
        });
    };

    await makeRequest('/status', '1. Success Request');
    await makeRequest('/not-found', '2. 404 Request');
    // Trigger a fake error if you want, but these 2 are enough to see logs in console

    console.log('\n✅ Check your console or "combined.log" for JSON logs with correlations.');
}

testLogging();
