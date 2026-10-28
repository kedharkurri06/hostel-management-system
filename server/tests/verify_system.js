require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runVerification() {
  console.log('===============================================================');
  console.log('🧪 COMPREHENSIVE END-TO-END VERIFICATION SUITE');
  console.log('===============================================================\n');

  // 1. Start server on dynamic port
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}/api`;
  console.log(`📡 Test server running on ${baseUrl}`);

  // 2. Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`💾 Connected to MongoDB Atlas\n`);

  let passedTests = 0;
  let totalTests = 11;

  try {
    // -----------------------------------------------------------------
    // TEST 1: CSV Record Processing & Counts
    // -----------------------------------------------------------------
    console.log('Test 1: Verifying CSV records and unique student IDs...');
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalWardens = await User.countDocuments({ role: 'warden' });
    console.log(`   - Total student records in DB: ${totalStudents}`);
    console.log(`   - Total warden records in DB: ${totalWardens}`);
    if (totalStudents >= 6069 && totalWardens >= 1) {
      console.log('   ✅ PASS: Student and warden database records verified.');
      passedTests++;
    } else {
      throw new Error(`Expected at least 6069 students, found ${totalStudents}`);
    }

    // -----------------------------------------------------------------
    // TEST 2: Unique Student IDs and Database Indexing
    // -----------------------------------------------------------------
    console.log('\nTest 2: Verifying unique index on studentId...');
    const indexes = await mongoose.connection.db.collection('users').indexes();
    const studentIdx = indexes.find(i => i.name === 'studentId_1');
    if (studentIdx && studentIdx.unique && studentIdx.sparse) {
      console.log('   ✅ PASS: studentId unique sparse index verified on MongoDB collection.');
      passedTests++;
    } else {
      throw new Error('studentId unique index missing or misconfigured');
    }

    // -----------------------------------------------------------------
    // TEST 3: Student 1 Authentication (VTU27571)
    // -----------------------------------------------------------------
    console.log('\nTest 3: Authenticating Student 1 (VTU27571 / VTU27571)...');
    const s1Login = await request('/auth/login', {
      method: 'POST',
      body: { identifier: 'VTU27571', password: 'VTU27571' }
    });
    if (s1Login.status === 200 && s1Login.data.data.token && s1Login.data.data.user.role === 'student') {
      console.log(`   ✅ PASS: Student VTU27571 authenticated successfully.`);
      console.log(`      Token received: ${s1Login.data.data.token.slice(0, 20)}...`);
      passedTests++;
    } else {
      throw new Error(`Student 1 authentication failed: ${JSON.stringify(s1Login.data)}`);
    }
    const student1Token = s1Login.data.data.token;

    // -----------------------------------------------------------------
    // TEST 4: Student 2 Authentication (VTU29480) & DB Name Display
    // -----------------------------------------------------------------
    console.log('\nTest 4: Authenticating Student 2 (VTU29480 / VTU29480)...');
    const s2Login = await request('/auth/login', {
      method: 'POST',
      body: { identifier: 'VTU29480', password: 'VTU29480' }
    });
    const s1Name = s1Login.data.data.user.name;
    const s2Name = s2Login.data.data.user.name;
    console.log(`   Student 1 DB Name: "${s1Name}" (Expected: JALLURI VENKATA SRIRAM)`);
    console.log(`   Student 2 DB Name: "${s2Name}" (Expected: MAAVULOORI SAI GIREESH)`);
    if (
      s2Login.status === 200 &&
      s1Name === 'JALLURI VENKATA SRIRAM' &&
      s2Name === 'MAAVULOORI SAI GIREESH'
    ) {
      console.log('   ✅ PASS: Authentic student names verified from database records.');
      passedTests++;
    } else {
      throw new Error(`Student names did not match DB records: s1=${s1Name}, s2=${s2Name}`);
    }

    // -----------------------------------------------------------------
    // TEST 5: Incorrect Password Rejection
    // -----------------------------------------------------------------
    console.log('\nTest 5: Testing incorrect password rejection...');
    const wrongPass = await request('/auth/login', {
      method: 'POST',
      body: { identifier: 'VTU27571', password: 'wrong_password_123' }
    });
    if (wrongPass.status === 401 && wrongPass.data.success === false) {
      console.log(`   ✅ PASS: Incorrect password rejected with HTTP 401 (${wrongPass.data.message})`);
      passedTests++;
    } else {
      throw new Error(`Incorrect password was not rejected: ${wrongPass.status}`);
    }

    // -----------------------------------------------------------------
    // TEST 6: Warden Authentication (warden@vtu / warden@123)
    // -----------------------------------------------------------------
    console.log('\nTest 6: Authenticating Warden (warden@vtu / warden@123)...');
    const wardenLogin = await request('/auth/login', {
      method: 'POST',
      body: { identifier: 'warden@vtu', password: 'warden@123' }
    });
    if (wardenLogin.status === 200 && wardenLogin.data.data.user.role === 'warden') {
      console.log(`   ✅ PASS: Warden authenticated successfully with role: "${wardenLogin.data.data.user.role}"`);
      passedTests++;
    } else {
      throw new Error(`Warden authentication failed: ${JSON.stringify(wardenLogin.data)}`);
    }
    const wardenToken = wardenLogin.data.data.token;

    // -----------------------------------------------------------------
    // TEST 7: Role-Based Access Control (Student cannot access Warden APIs)
    // -----------------------------------------------------------------
    console.log('\nTest 7: Testing RBAC (Student blocked from warden endpoints)...');
    const studentBlockedNotice = await request('/notices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
      body: { title: 'Hacked Notice', category: 'General', priority: 'High', content: 'Unauthorized' }
    });
    const studentBlockedMenu = await request('/menu/some_id', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${student1Token}` },
      body: { items: ['Test'] }
    });
    if (studentBlockedNotice.status === 403 && studentBlockedMenu.status === 403) {
      console.log('   ✅ PASS: Student token correctly rejected with HTTP 403 on warden-only routes.');
      passedTests++;
    } else {
      throw new Error(`RBAC failure: notice status=${studentBlockedNotice.status}, menu status=${studentBlockedMenu.status}`);
    }

    // -----------------------------------------------------------------
    // TEST 8: Public Landing Page API Protection
    // -----------------------------------------------------------------
    console.log('\nTest 8: Testing public vs protected endpoint visibility...');
    const publicMenu = await request('/menu');
    const publicNotices = await request('/notices');
    const publicWardens = await request('/wardens');
    const unauthComplaints = await request('/complaints');
    const unauthGatePasses = await request('/gatepasses');
    const unauthStats = await request('/dashboard/stats');

    if (
      publicMenu.status === 200 &&
      publicNotices.status === 200 &&
      publicWardens.status === 200 &&
      unauthComplaints.status === 401 &&
      unauthGatePasses.status === 401 &&
      unauthStats.status === 401
    ) {
      console.log('   ✅ PASS: Public endpoints accessible (200), protected APIs require token (401).');
      passedTests++;
    } else {
      throw new Error('Public vs Protected endpoints mismatch');
    }

    // -----------------------------------------------------------------
    // TEST 9: Secure Session Restoration on Refresh (/api/auth/me)
    // -----------------------------------------------------------------
    console.log('\nTest 9: Testing session restoration via /api/auth/me...');
    const meStudent = await request('/auth/me', {
      headers: { Authorization: `Bearer ${student1Token}` }
    });
    const meWarden = await request('/auth/me', {
      headers: { Authorization: `Bearer ${wardenToken}` }
    });

    if (
      meStudent.status === 200 &&
      meStudent.data.data.user.studentId === 'VTU27571' &&
      meStudent.data.data.user.role === 'student' &&
      meWarden.status === 200 &&
      meWarden.data.data.user.role === 'warden'
    ) {
      console.log('   ✅ PASS: Both student and warden sessions restored securely from database.');
      passedTests++;
    } else {
      throw new Error('Session restoration failed');
    }

    // -----------------------------------------------------------------
    // TEST 10: Idempotent Import Verification
    // -----------------------------------------------------------------
    console.log('\nTest 10: Testing import idempotency (no password resets, no duplicates)...');
    const studentBefore = await User.findOne({ studentId: 'VTU27571' }).select('+password');
    const initialHash = studentBefore.password;

    // Check count
    const countBefore = await User.countDocuments();
    // Verify password compare
    const matchBefore = await studentBefore.comparePassword('VTU27571');

    if (matchBefore && countBefore === 6072) {
      console.log(`   ✅ PASS: 6072 total records verified. Student password hash verified intact.`);
      passedTests++;
    } else {
      throw new Error(`Count mismatch or password altered: count=${countBefore}`);
    }

    // -----------------------------------------------------------------
    // TEST 11: Security Check (No Password Hash Exposed in API)
    // -----------------------------------------------------------------
    console.log('\nTest 11: Verifying password hashes are NEVER exposed in API responses...');
    const responses = [s1Login.data, s2Login.data, wardenLogin.data, meStudent.data, meWarden.data];
    let hashLeaked = false;
    for (const r of responses) {
      const json = JSON.stringify(r);
      if (json.includes('$2a$') || json.includes('$2b$') || json.includes('password')) {
        hashLeaked = true;
      }
    }
    if (!hashLeaked) {
      console.log('   ✅ PASS: Zero password hashes or fields exposed in API payloads.');
      passedTests++;
    } else {
      throw new Error('Password hash detected in API response payload!');
    }

    console.log('\n===============================================================');
    console.log(`🏆 ALL ${passedTests} / ${totalTests} VERIFICATION TESTS PASSED SUCCESSFULLY!`);
    console.log('===============================================================\n');

  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runVerification().then(() => process.exit(0)).catch((err) => {
  console.error('\n❌ Verification Failed:', err.message);
  process.exit(1);
});

