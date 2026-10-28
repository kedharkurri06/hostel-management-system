require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Worker } = require('worker_threads');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Robust RFC-4180 compliant CSV parser that handles BOM, commas, quotes, and newlines.
 */
function parseCSV(text) {
  const clean = text.replace(/^\ufeff/, '');
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.some(f => f.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Locate CSV file from command line argument or default project locations.
 */
function resolveCSVPath() {
  const candidates = [
    process.argv[2],
    path.resolve(__dirname, '../../../hostel_management_student_details.csv'),
    path.resolve(__dirname, '../../data/students.csv'),
    path.resolve(process.cwd(), 'hostel_management_student_details.csv'),
    path.resolve(process.cwd(), '../hostel_management_student_details.csv'),
    path.resolve(process.cwd(), 'server/data/students.csv')
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

/**
 * Parallel password hashing using Worker threads.
 */
async function hashPasswordsParallel(items, saltRounds = 10) {
  if (items.length === 0) return [];

  const numWorkers = Math.min(Math.max(os.cpus().length, 2), 12);
  const chunkSize = Math.ceil(items.length / numWorkers);
  const workerScript = path.resolve(__dirname, 'hashWorker.js');

  const promises = [];
  let startIndex = 0;

  for (let i = 0; i < numWorkers && startIndex < items.length; i++) {
    const chunk = items.slice(startIndex, startIndex + chunkSize);
    startIndex += chunkSize;

    if (chunk.length === 0) continue;

    const p = new Promise((resolve, reject) => {
      const worker = new Worker(workerScript, {
        workerData: { chunk, saltRounds }
      });
      worker.on('message', (msg) => {
        if (msg.success) resolve(msg.results);
        else reject(new Error(msg.error || 'Worker hashing failed'));
      });
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });

    promises.push(p);
  }

  const resultsNested = await Promise.all(promises);
  return resultsNested.flat();
}

async function runImport() {
  const startTime = Date.now();
  console.log('===============================================================');
  console.log('🚀 HOSTELHUB: STUDENT CSV CREDENTIALS IMPORT');
  console.log('===============================================================');

  const csvPath = resolveCSVPath();
  if (!csvPath) {
    console.error('❌ Error: Could not locate the student CSV file.');
    console.error('Please ensure "hostel_management_student_details.csv" is in the project root,');
    console.error('or place it in "server/data/students.csv".');
    process.exit(1);
  }

  console.log(`📁 Source CSV File: ${csvPath}`);

  const rawCSV = fs.readFileSync(csvPath, 'utf8');
  const parsedRows = parseCSV(rawCSV);

  if (parsedRows.length <= 1) {
    console.error('❌ Error: CSV file is empty or contains only a header.');
    process.exit(1);
  }

  // Header detection
  const header = parsedRows[0].map(h => h.trim());
  const idColIndex = header.findIndex(h => /idno/i.test(h) || /^id$/i.test(h) || /student\s*id/i.test(h));
  const nameColIndex = header.findIndex(h => /name/i.test(h) || /student\s*name/i.test(h));

  const actualIdIdx = idColIndex !== -1 ? idColIndex : 1;
  const actualNameIdx = nameColIndex !== -1 ? nameColIndex : 2;

  console.log(`📋 Header detected: [${header.join(', ')}] (IdNo at col ${actualIdIdx}, Name at col ${actualNameIdx})`);

  let invalidCount = 0;
  let duplicateCount = 0;
  const invalidReasons = [];
  const duplicateRecords = [];

  const seenInCSV = new Map();
  const validRecords = [];

  for (let i = 1; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    const rowNum = i + 1;

    const rawId = row[actualIdIdx];
    const rawName = row[actualNameIdx];

    // Validate and trim IdNo and Name, preserve ID as string
    const studentId = rawId !== undefined && rawId !== null ? String(rawId).trim() : '';
    const name = rawName !== undefined && rawName !== null ? String(rawName).trim() : '';

    if (!studentId || !name) {
      invalidCount++;
      const reason = `Row ${rowNum}: Missing or empty ${!studentId ? 'IdNo' : 'Name'}`;
      invalidReasons.push(reason);
      continue;
    }

    const normalizedId = studentId.toUpperCase();

    if (seenInCSV.has(normalizedId)) {
      duplicateCount++;
      const firstSeen = seenInCSV.get(normalizedId);
      duplicateRecords.push({
        id: studentId,
        rowNum,
        firstRow: firstSeen.rowNum,
        name
      });
      continue;
    }

    const record = { studentId, name, rowNum };
    seenInCSV.set(normalizedId, record);
    validRecords.push(record);
  }

  console.log(`📊 CSV Statistics:`);
  console.log(`   - Total records in file: ${parsedRows.length - 1}`);
  console.log(`   - Valid unique student IDs: ${validRecords.length}`);
  console.log(`   - Duplicate records skipped in CSV: ${duplicateCount}`);
  console.log(`   - Invalid records skipped: ${invalidCount}`);

  if (invalidReasons.length > 0) {
    console.log(`\n⚠️ Sample invalid records (${Math.min(invalidReasons.length, 5)} of ${invalidReasons.length}):`);
    invalidReasons.slice(0, 5).forEach(r => console.log(`   - ${r}`));
  }

  if (duplicateRecords.length > 0) {
    console.log(`\nℹ️ Duplicate student IDs in CSV (${duplicateRecords.length} duplicates):`);
    duplicateRecords.slice(0, 10).forEach(d => {
      console.log(`   - ID: ${d.id} on Row ${d.rowNum} (first seen on Row ${d.firstRow})`);
    });
    if (duplicateRecords.length > 10) {
      console.log(`   ... and ${duplicateRecords.length - 10} more duplicate entries.`);
    }
  }

  // Connect to MongoDB
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_management';
  console.log(`\n🔌 Connecting to MongoDB...`);
  await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 8000 });
  console.log(`✅ Connected to MongoDB.`);

  // Ensure unique sparse indexes on users collection
  const userCollection = mongoose.connection.db.collection('users');
  try {
    const existingIndexes = await userCollection.indexes();
    const emailIdx = existingIndexes.find(idx => idx.name === 'email_1');
    if (emailIdx && !emailIdx.sparse) {
      console.log(`🔄 Re-indexing: dropping non-sparse email_1 index...`);
      await userCollection.dropIndex('email_1');
    }
  } catch (err) {
    // Index may not exist yet, continue
  }

  await userCollection.createIndex({ studentId: 1 }, { unique: true, sparse: true });
  await userCollection.createIndex({ username: 1 }, { unique: true, sparse: true });
  await userCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
  console.log(`✅ Database unique sparse indexes verified for studentId, username, and email.`);

  // Fetch all existing users from MongoDB to implement idempotent strategy
  console.log(`🔍 Inspecting existing users in MongoDB...`);
  const allExistingUsers = await User.find({}, { studentId: 1, username: 1, email: 1, role: 1, name: 1 });
  console.log(`   - Existing user accounts in database: ${allExistingUsers.length}`);

  const existingByStudentId = new Map();
  const existingByEmailOrUsername = new Map();

  for (const u of allExistingUsers) {
    if (u.studentId) existingByStudentId.set(u.studentId.toUpperCase(), u);
    if (u.username) existingByEmailOrUsername.set(u.username.toLowerCase(), u);
    if (u.email) existingByEmailOrUsername.set(u.email.toLowerCase(), u);
  }

  let skippedWardenCount = 0;
  let skippedExistingCount = 0;
  let updatedCount = 0;
  const toUpdate = [];
  const toHashAndInsert = [];

  for (const record of validRecords) {
    const normalizedId = record.studentId.toUpperCase();
    const idLower = record.studentId.toLowerCase();

    // Check if ID matches an existing studentId
    const existing = existingByStudentId.get(normalizedId);
    if (existing) {
      if (existing.role === 'warden') {
        skippedWardenCount++;
      } else {
        // Idempotent: Do not overwrite existing passwords, roles, or account data
        skippedExistingCount++;
      }
      continue;
    }

    // Check if matched by email or username (e.g. VTU28892@hostelhub.edu from seed)
    const matchedByEmail = existingByEmailOrUsername.get(`${idLower}@hostelhub.edu`) ||
                           existingByEmailOrUsername.get(idLower);

    if (matchedByEmail) {
      if (matchedByEmail.role === 'warden') {
        skippedWardenCount++;
      } else {
        // Existing student user without studentId field populated
        toUpdate.push({
          _id: matchedByEmail._id,
          studentId: record.studentId
        });
        updatedCount++;
      }
      continue;
    }

    // New student to insert: initial password is IdNo
    toHashAndInsert.push({
      studentId: record.studentId,
      name: record.name,
      initialPassword: record.studentId
    });
  }

  console.log(`\n📋 Import Plan:`);
  console.log(`   - Accounts to insert: ${toHashAndInsert.length}`);
  console.log(`   - Accounts to update (missing studentId): ${toUpdate.length}`);
  console.log(`   - Existing student accounts skipped (preserved): ${skippedExistingCount}`);
  console.log(`   - Warden accounts protected (skipped): ${skippedWardenCount}`);

  // Apply updates if any
  if (toUpdate.length > 0) {
    console.log(`🔄 Updating ${toUpdate.length} existing student accounts with studentId...`);
    const updateOps = toUpdate.map(u => ({
      updateOne: {
        filter: { _id: u._id },
        update: { $set: { studentId: u.studentId } }
      }
    }));
    await User.bulkWrite(updateOps);
    console.log(`✅ Updated ${toUpdate.length} accounts.`);
  }

  // Hash passwords and batch insert new records
  let importedCount = 0;
  if (toHashAndInsert.length > 0) {
    console.log(`🔐 Hashing passwords using bcrypt across parallel worker threads...`);
    const hashStart = Date.now();
    const hashedUsers = await hashPasswordsParallel(toHashAndInsert, 10);
    console.log(`✅ Hashed ${hashedUsers.length} passwords in ${((Date.now() - hashStart) / 1000).toFixed(1)}s.`);

    console.log(`💾 Inserting records into MongoDB in batches...`);
    const batchSize = 1000;
    for (let i = 0; i < hashedUsers.length; i += batchSize) {
      const batch = hashedUsers.slice(i, i + batchSize);
      await User.insertMany(batch, { ordered: false });
      importedCount += batch.length;
      process.stdout.write(`   Progress: ${importedCount} / ${hashedUsers.length} inserted...\r`);
    }
    console.log(`\n✅ Successfully inserted ${importedCount} new student accounts.`);
  }

  // Verification from MongoDB
  const finalTotalStudents = await User.countDocuments({ role: 'student' });
  const finalTotalWardens = await User.countDocuments({ role: 'warden' });
  const totalUsersInDB = await User.countDocuments();

  const totalTimeSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n===============================================================');
  console.log('🎉 STUDENT IMPORT SUMMARY REPORT');
  console.log('===============================================================');
  console.log(`Total CSV Records Processed  : ${parsedRows.length - 1}`);
  console.log(`Valid Unique Student Records : ${validRecords.length}`);
  console.log(`Duplicates in CSV            : ${duplicateCount}`);
  console.log(`Invalid Records              : ${invalidCount}`);
  console.log(`---------------------------------------------------------------`);
  console.log(`New Accounts Imported        : ${importedCount}`);
  console.log(`Existing Accounts Updated    : ${updatedCount}`);
  console.log(`Existing Accounts Skipped    : ${skippedExistingCount + skippedWardenCount}`);
  console.log(`---------------------------------------------------------------`);
  console.log(`Current Student Accounts in DB: ${finalTotalStudents}`);
  console.log(`Current Warden Accounts in DB : ${finalTotalWardens}`);
  console.log(`Total Accounts in MongoDB     : ${totalUsersInDB}`);
  console.log(`Total Time Taken              : ${totalTimeSeconds}s`);
  console.log('===============================================================');

  // Verify sample imported student
  const sampleStudent = await User.findOne({ studentId: 'VTU27571' }).select('+password');
  if (sampleStudent) {
    const sampleMatches = await sampleStudent.comparePassword('VTU27571');
    console.log(`🔍 Verification check: Student VTU27571 (${sampleStudent.name})`);
    console.log(`   - Role: ${sampleStudent.role}`);
    console.log(`   - Password matches initial student ID: ${sampleMatches ? '✅ YES' : '❌ NO'}`);
  }

  await mongoose.disconnect();
  console.log('🔌 MongoDB connection closed. Done.\n');
  process.exit(0);
}

runImport().catch((err) => {
  console.error('\n❌ Fatal error during import:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});

