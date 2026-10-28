const { parentPort, workerData } = require('worker_threads');
const bcrypt = require('bcryptjs');

const { chunk, saltRounds = 10 } = workerData;
const results = [];

for (const item of chunk) {
  const hash = bcrypt.hashSync(item.initialPassword, saltRounds);
  results.push({
    studentId: item.studentId,
    name: item.name,
    password: hash,
    role: 'student'
  });
}

parentPort.postMessage({ success: true, results });

