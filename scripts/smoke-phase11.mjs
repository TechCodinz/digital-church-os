#!/usr/bin/env node

const baseUrl = (process.env.STAGING_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
const seedPassword = process.env.STAGING_SEED_PASSWORD || 'ChangeMe123!';
const adminEmail = process.env.STAGING_ADMIN_EMAIL || 'admin@digitalchurchos.test';
const memberEmail = process.env.STAGING_MEMBER_EMAIL || 'member@digitalchurchos.test';
const viewerEmail = process.env.STAGING_VIEWER_EMAIL || 'viewer@digitalchurchos.test';

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  absorb(response) {
    const values = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [response.headers.get('set-cookie')].filter(Boolean);

    for (const value of values) {
      if (!value) continue;
      const first = value.split(';', 1)[0];
      const separator = first.indexOf('=');
      if (separator <= 0) continue;
      const name = first.slice(0, separator).trim();
      const cookieValue = first.slice(separator + 1).trim();
      if (!cookieValue) this.cookies.delete(name);
      else this.cookies.set(name, cookieValue);
    }
  }

  header() {
    return [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
  }
}

function fail(message, details = '') {
  throw new Error(details ? `${message}\n${details}` : message);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.jar?.header()) headers.set('cookie', options.jar.header());
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    body: options.body,
    headers,
    redirect: options.redirect || 'manual',
  });
  options.jar?.absorb(response);
  return response;
}

async function bodyPreview(response) {
  try {
    return (await response.clone().text()).slice(0, 600).replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

async function expectStatus(label, response, expected) {
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!allowed.includes(response.status)) {
    fail(`${label}: expected HTTP ${allowed.join(' or ')}, got ${response.status}`, await bodyPreview(response));
  }
  pass(`${label} → HTTP ${response.status}`);
}

async function expectRedirect(label, response) {
  await expectStatus(label, response, [301, 302, 303, 307, 308]);
  const location = response.headers.get('location') || '';
  if (!location.includes('/auth/signin') && !location.includes('/auth/error')) {
    fail(`${label}: expected authentication redirect, got ${location || 'no Location header'}`);
  }
}

async function json(response, label) {
  try {
    return await response.json();
  } catch {
    fail(`${label}: expected JSON response`, await bodyPreview(response));
  }
}

async function signIn(email) {
  const jar = new CookieJar();
  const csrfResponse = await request('/api/auth/csrf', { jar });
  await expectStatus(`CSRF for ${email}`, csrfResponse, 200);
  const csrf = await json(csrfResponse, `CSRF for ${email}`);
  if (!csrf.csrfToken) fail(`CSRF for ${email}: missing csrfToken`);

  const form = new URLSearchParams({
    csrfToken: csrf.csrfToken,
    email,
    password: seedPassword,
    callbackUrl: `${baseUrl}/dashboard`,
    json: 'true',
  });

  const callback = await request('/api/auth/callback/credentials?json=true', {
    jar,
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  await expectStatus(`Credentials sign-in for ${email}`, callback, [200, 302]);

  const sessionResponse = await request('/api/auth/session', { jar });
  await expectStatus(`Session for ${email}`, sessionResponse, 200);
  const session = await json(sessionResponse, `Session for ${email}`);
  if (session?.user?.email !== email) {
    fail(`Session for ${email}: expected authenticated email, got ${session?.user?.email || 'none'}`);
  }
  pass(`Authenticated ${email}`);
  return jar;
}

async function main() {
  console.log(`Phase 11 runtime smoke target: ${baseUrl}`);

  // Guest/public truthfulness.
  await expectStatus('Homepage is public', await request('/'), 200);
  await expectStatus('Live Service is public', await request('/live-service'), 200);
  await expectStatus('Conference directory is public', await request('/conferences'), 200);

  const liveConfigResponse = await request('/api/live-service/config');
  await expectStatus('Live Service public config', liveConfigResponse, 200);
  const liveConfig = await json(liveConfigResponse, 'Live Service public config');
  const liveConfigKeys = Object.keys(liveConfig).sort();
  const allowedLiveConfigKeys = ['configured', 'source', 'streamTitle', 'streamUrl'];
  if (liveConfigKeys.some((key) => !allowedLiveConfigKeys.includes(key))) {
    fail(`Live Service public config exposed unexpected keys: ${liveConfigKeys.join(', ')}`);
  }

  const churchesResponse = await request('/api/conferences/churches');
  await expectStatus('Public conference church discovery', churchesResponse, 200);
  const churches = await json(churchesResponse, 'Public conference church discovery');
  const churchRows = Array.isArray(churches) ? churches : churches.churches;
  if (!Array.isArray(churchRows)) fail('Public conference church discovery did not return a church list');
  if (!churchRows.some((church) => church.id === 'staging-church-public')) fail('Public conference discovery omitted staging public church');
  if (churchRows.some((church) => church.id === 'staging-church-private')) fail('Public conference discovery exposed staging private church');
  pass('Conference discovery includes public church and excludes private church');

  const publicCalendar = await request('/api/conferences?churchId=staging-church-public');
  await expectStatus('Guest public conference calendar', publicCalendar, 200);
  const publicConferences = await json(publicCalendar, 'Guest public conference calendar');
  if (!Array.isArray(publicConferences) || !publicConferences.length) fail('Guest public conference calendar returned no seeded conferences');

  await expectStatus('Guest private conference calendar denied', await request('/api/conferences?churchId=staging-church-private'), 403);
  await expectStatus('Guest conference mutation denied', await request('/api/conferences', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  }), 401);

  await expectRedirect('Journey protects guest privacy', await request('/journey'));
  await expectRedirect('Service Response protects guest privacy', await request('/service-response'));
  await expectRedirect('Admin settings protects guest access', await request('/admin/settings'));

  // Signed-in member with STAFF access to the public church.
  const memberJar = await signIn(memberEmail);
  await expectStatus('Member Journey page', await request('/journey', { jar: memberJar }), 200);
  await expectStatus('Member Daily Guide page', await request('/daily-guide', { jar: memberJar }), 200);

  const journeyResponse = await request('/api/journey', { jar: memberJar });
  await expectStatus('Member Journey API', journeyResponse, 200);
  const journey = await json(journeyResponse, 'Member Journey API');
  if (Object.prototype.hasOwnProperty.call(journey, 'spiritualScore')) fail('Journey API reintroduced spiritualScore');
  if (journey?.privacyBoundary?.spiritualScoring !== false) fail('Journey API does not explicitly disable spiritual scoring');
  pass('Journey API preserves no-score privacy boundary');

  const continuitySave = await request('/api/journey/continuity', {
    jar: memberJar,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      source: 'Prayer',
      sourceKey: 'ci-smoke-prayer',
      title: 'CI smoke prayer',
      content: 'Private CI smoke reflection.',
      scriptureRefs: ['Psalm 23'],
      nextStep: 'Continue in prayer.',
    }),
  });
  await expectStatus('Private Journey continuity save', continuitySave, [200, 201]);

  const chatResponse = await request('/api/live-chat', { jar: memberJar });
  await expectStatus('Legacy global live chat stays disabled', chatResponse, 410);
  const chatBody = await json(chatResponse, 'Legacy global live chat');
  if (chatBody.code !== 'TENANT_BROADCAST_SCOPE_REQUIRED') fail('Legacy live chat returned the wrong disabled-scope code');

  const workspacesResponse = await request('/api/church-ops/workspaces', { jar: memberJar });
  await expectStatus('Member church workspaces', workspacesResponse, 200);
  const workspaces = await json(workspacesResponse, 'Member church workspaces');
  const workspaceRows = Array.isArray(workspaces) ? workspaces : workspaces.workspaces;
  if (!Array.isArray(workspaceRows)) fail('Workspace API did not return a list');
  const publicWorkspace = workspaceRows.find((workspace) => workspace.id === 'staging-church-public');
  if (publicWorkspace?.role !== 'STAFF') fail(`Expected member STAFF role for staging public church, got ${publicWorkspace?.role || 'none'}`);
  if (workspaceRows.some((workspace) => workspace.id === 'staging-church-private')) fail('Public STAFF member unexpectedly gained private church access');
  pass('Church workspace membership is tenant-isolated');

  await expectStatus('Member activates public church', await request('/api/church-ops/active', {
    jar: memberJar,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ churchId: 'staging-church-public' }),
  }), 200);

  const recordPayload = {
    churchId: 'staging-church-public',
    module: 'ci-smoke',
    key: 'current',
    title: 'CI smoke operations record',
    classification: 'INTERNAL',
    payload: { ready: true, source: 'phase11-runtime-smoke' },
  };
  await expectStatus('STAFF writes tenant operational record', await request('/api/church-ops/records', {
    jar: memberJar,
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(recordPayload),
  }), 200);

  const recordReadResponse = await request('/api/church-ops/records?churchId=staging-church-public&module=ci-smoke&key=current', { jar: memberJar });
  await expectStatus('STAFF reads tenant operational record', recordReadResponse, 200);
  const recordRead = await json(recordReadResponse, 'STAFF reads tenant operational record');
  if (recordRead?.record?.payload?.ready !== true) fail('Tenant operational record payload did not round-trip');

  await expectStatus('Member cross-church private calendar denied', await request('/api/conferences?churchId=staging-church-private', { jar: memberJar }), 403);

  const conferenceStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const conferenceEnd = new Date(conferenceStart.getTime() + 2 * 60 * 60 * 1000);
  const conferenceCreateResponse = await request('/api/conferences', {
    jar: memberJar,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      churchId: 'staging-church-public',
      title: `CI Tenant Conference ${Date.now()}`,
      theme: 'Runtime tenant authorization',
      scriptureRefs: ['Hebrews 10:24-25'],
      startDate: conferenceStart.toISOString(),
      endDate: conferenceEnd.toISOString(),
      location: 'CI staging',
    }),
  });
  await expectStatus('STAFF creates public-church conference', conferenceCreateResponse, 201);
  const createdConference = await json(conferenceCreateResponse, 'STAFF creates conference');

  await expectStatus('STAFF cannot delete conference', await request(`/api/conferences?id=${encodeURIComponent(createdConference.id)}&churchId=staging-church-public`, {
    jar: memberJar,
    method: 'DELETE',
  }), 403);

  // Signed-in VIEWER with access only to the private church.
  const viewerJar = await signIn(viewerEmail);
  await expectStatus('VIEWER can activate private church', await request('/api/church-ops/active', {
    jar: viewerJar,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ churchId: 'staging-church-private' }),
  }), 200);
  await expectStatus('VIEWER can view private church calendar', await request('/api/conferences?churchId=staging-church-private', { jar: viewerJar }), 200);
  await expectStatus('VIEWER cannot write tenant operational record', await request('/api/church-ops/records', {
    jar: viewerJar,
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...recordPayload, churchId: 'staging-church-private' }),
  }), 403);
  await expectStatus('VIEWER cannot create private-church conference', await request('/api/conferences', {
    jar: viewerJar,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      churchId: 'staging-church-private',
      title: `CI Viewer Conference ${Date.now()}`,
      theme: 'Should be denied',
      scriptureRefs: [],
      startDate: conferenceStart.toISOString(),
      endDate: conferenceEnd.toISOString(),
    }),
  }), 403);

  // Product admin / church owner.
  const adminJar = await signIn(adminEmail);
  await expectStatus('CHURCH_ADMIN opens admin settings', await request('/admin/settings', { jar: adminJar }), 200);
  const adminSettingsResponse = await request('/api/admin/settings', { jar: adminJar });
  await expectStatus('CHURCH_ADMIN reads safe settings', adminSettingsResponse, 200);
  const adminSettings = await json(adminSettingsResponse, 'CHURCH_ADMIN safe settings');
  const settingKeys = Object.keys(adminSettings.settings || {});
  const forbiddenSettingKeys = ['openaiApiKey', 'elevenLabsApiKey', 'stripeSecretKey', 'stripeWebhookSecret', 'paypalClientSecret', 'coinbaseCommerceApiKey', 'bitpayApiKey', 'resendApiKey'];
  if (settingKeys.some((key) => forbiddenSettingKeys.includes(key))) fail('Admin settings response exposed a provider credential field');

  const saveSettingsResponse = await request('/api/admin/settings', {
    jar: adminJar,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ settings: {
      churchName: 'Digital Church OS CI',
      streamTitle: 'CI Live Worship',
      streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    } }),
  });
  await expectStatus('Safe non-secret settings persist', saveSettingsResponse, 200);

  const configuredLiveResponse = await request('/api/live-service/config');
  await expectStatus('Live config reflects persisted settings', configuredLiveResponse, 200);
  const configuredLive = await json(configuredLiveResponse, 'Configured Live Service config');
  if (configuredLive.configured !== true || configuredLive.source !== 'site-config' || configuredLive.streamTitle !== 'CI Live Worship') {
    fail('Live Service config did not resolve persisted settings correctly', JSON.stringify(configuredLive));
  }
  if (typeof configuredLive.streamUrl !== 'string' || configuredLive.streamUrl.includes('@')) fail('Live Service config returned an unsafe stream URL');
  pass('Live Service config persists and exposes only safe non-secret configuration');

  await expectStatus('Credential-bearing stream URL rejected', await request('/api/admin/settings', {
    jar: adminJar,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ settings: { streamUrl: 'https://user:password@example.com/live' } }),
  }), 400);

  await expectStatus('OWNER deletes tenant conference', await request(`/api/conferences?id=${encodeURIComponent(createdConference.id)}&churchId=staging-church-public`, {
    jar: adminJar,
    method: 'DELETE',
  }), 200);

  console.log('\n✅ Phase 11 runtime smoke suite passed.');
  console.log('Validated public access, authentication, no-score Journey, private continuity, disabled global chat, tenant roles, cross-church isolation, conference role split, and safe settings/Live Service configuration.');
}

main().catch((error) => {
  console.error('\n❌ Phase 11 runtime smoke failed');
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
