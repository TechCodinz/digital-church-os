#!/usr/bin/env node

const baseUrl = (process.env.STAGING_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');

const endpoints = [
  { name: 'Release readiness', path: '/api/release/readiness', protected: true },
  { name: 'Scripture search metadata', path: '/api/scripture/search' },
  { name: 'Care escalations', path: '/api/care/escalations', protected: true },
  { name: 'Broadcast rooms', path: '/api/broadcast/rooms' },
  { name: 'Worship media catalog', path: '/api/worship/media' },
  { name: 'Media rights providers', path: '/api/media-rights/providers' },
  { name: 'Release feature flags', path: '/api/release/feature-flags', protected: true },
  { name: 'Marketplace templates', path: '/api/marketplace/templates' },
  { name: 'Rewards wallet', path: '/api/rewards/wallet', protected: true },
  { name: 'Command center reports', path: '/api/command-center/reports', protected: true },
];

function classify(status) {
  if ([200, 201, 202, 204].includes(status)) return { state: 'PASS', ok: true };
  if ([301, 302, 303, 307, 308, 401, 403].includes(status)) return { state: 'PROTECTED_ROUTE_EXISTS', ok: true };
  if (status === 405) return { state: 'ROUTE_EXISTS_METHOD_NOT_ALLOWED', ok: true };
  if (status === 404) return { state: 'MISSING_ROUTE', ok: false };
  if (status >= 500) return { state: 'RUNTIME_FAILURE', ok: false };
  return { state: `UNEXPECTED_${status}`, ok: false };
}

async function check(endpoint) {
  const url = `${baseUrl}${endpoint.path}`;
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'manual', headers: { accept: 'application/json' } });
    const result = classify(res.status);
    let bodyPreview = '';
    try {
      const text = await res.text();
      bodyPreview = text.slice(0, 240).replace(/\s+/g, ' ').trim();
    } catch {
      bodyPreview = '';
    }
    return { ...endpoint, url, status: res.status, ...result, bodyPreview };
  } catch (error) {
    return { ...endpoint, url, status: null, state: 'FETCH_FAILED', ok: false, error: error.message };
  }
}

console.log(`Staging smoke test target: ${baseUrl}`);
console.log('Protected endpoints treat 401/403/redirect as route-exists, not failure.');

const results = [];
for (const endpoint of endpoints) {
  const result = await check(endpoint);
  results.push(result);
  const icon = result.ok ? '✅' : '❌';
  const statusLabel = result.status ? `HTTP ${result.status}` : 'NO_RESPONSE';
  console.log(`${icon} ${result.name}: ${result.state} (${statusLabel}) ${result.path}`);
  if (!result.ok && result.error) console.log(`   error: ${result.error}`);
  if (!result.ok && result.bodyPreview) console.log(`   body: ${result.bodyPreview}`);
}

const grouped = results.reduce((acc, item) => {
  acc[item.state] = (acc[item.state] || 0) + 1;
  return acc;
}, {});

console.log('\nSummary');
console.table(grouped);

const failures = results.filter((r) => !r.ok);
if (failures.length > 0) {
  console.log('\nFailures requiring attention:');
  for (const failure of failures) {
    console.log(`- ${failure.name}: ${failure.state} ${failure.path}`);
  }
  process.exit(1);
}

console.log('\nSmoke test completed. Routes are reachable or correctly protected.');
