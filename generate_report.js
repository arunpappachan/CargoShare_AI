import { exec, spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import http from 'http';

const REPORT_FILE = 'test_report.txt';

console.log('================================================================================');
console.log('                 CARGOSHARE AI - AUTOMATED TEST RUNNER                         ');
console.log('================================================================================\n');

function checkPort(port, path = '/') {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}${path}`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(port, path = '/', timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await checkPort(port, path);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  const childProcesses = [];

  try {
    // 1. Ensure Backend is running on port 5000
    const backendUp = await checkPort(5000, '/api/health');
    if (!backendUp) {
      console.log('⚙️  Starting Backend server on port 5000...');
      const backendProc = spawn('node', ['backend/server.js'], {
        shell: true,
        stdio: 'pipe',
      });
      childProcesses.push(backendProc);
      const ready = await waitForServer(5000, '/api/health', 25000);
      if (!ready) {
        console.warn('⚠️  Backend server did not respond in time, proceeding anyway...');
      } else {
        console.log('✅ Backend server is online and healthy.');
      }
    } else {
      console.log('📡 Connected to active Backend on port 5000.');
    }

    // 2. Ensure Frontend is running on port 5173
    const frontendUp = await checkPort(5173, '/');
    if (!frontendUp) {
      console.log('⚙️  Starting Vite Frontend on port 5173...');
      const frontendProc = spawn('npx', ['vite', '--port', '5173'], {
        shell: true,
        stdio: 'pipe',
      });
      childProcesses.push(frontendProc);
      const ready = await waitForServer(5173, '/', 25000);
      if (!ready) {
        console.warn('⚠️  Frontend dev server did not respond in time, proceeding anyway...');
      } else {
        console.log('✅ Frontend application is online and ready.');
      }
    } else {
      console.log('📡 Connected to active Frontend on port 5173.');
    }

    console.log('\n🚀 Executing Automated E2E Test Suite (Mocha + Selenium WebDriver)...');
    console.log('Please wait while Chrome executes tests headlessly...\n');

    const startTime = new Date();
    const command = 'npx mocha tests/e2e/**/*.test.js --timeout 60000 --no-colors';

    exec(command, (error, stdout, stderr) => {
      const endTime = new Date();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      const header = `================================================================================
                           CARGOSHARE AI
                     AUTOMATED TEST EXECUTION REPORT
================================================================================

REPORT DETAILS
--------------
Date generated : ${endTime.toUTCString()}
Execution Time : ${duration} seconds
Environment    : ${os.type()} ${os.release()} (${os.arch()})
Node Version   : ${process.version}
Test Framework : Mocha, Chai & Selenium WebDriver
Test Scope     : End-to-End (E2E) UI, Auth, Carrier, Exporter, Lifecycle Workflows

================================================================================
                             TEST RESULTS
================================================================================
`;

      const overallStatus = error ? 'FAILED' : 'PASSED';
      const passingMatch = stdout.match(/(\d+)\s+passing/);
      const failingMatch = stdout.match(/(\d+)\s+failing/);

      const passed = passingMatch ? passingMatch[1] : 0;
      const failed = failingMatch ? failingMatch[1] : 0;
      const total = parseInt(passed) + parseInt(failed);

      const summary = `
================================================================================
                                SUMMARY
================================================================================
Total Tests Executed : ${total}
Tests Passed         : ${passed}
Tests Failed         : ${failed}

OVERALL STATUS       : ${overallStatus}
================================================================================
`;

      const cleanStdout = stdout.replace(/\x1B\[\d+m/g, '').trim();
      const cleanStderr = stderr ? stderr.replace(/\x1B\[\d+m/g, '').trim() : '';

      const finalReport = header + '\n' + cleanStdout + '\n' + (cleanStderr ? '\nErrors:\n' + cleanStderr + '\n' : '') + summary;

      fs.writeFileSync(REPORT_FILE, finalReport, 'utf8');

      console.log(`\n================================================================================`);
      console.log(`✅ Automated Testing Complete! Report generated: ./${REPORT_FILE}`);
      console.log(`Summary: ${total} Total | ${passed} Passed | ${failed} Failed`);
      console.log(`Status : ${overallStatus}`);
      console.log(`================================================================================\n`);

      // Clean up child processes
      for (const p of childProcesses) {
        try {
          p.kill();
        } catch (_) {}
      }

      process.exit(error ? 1 : 0);
    });
  } catch (err) {
    console.error('Fatal Test Runner Error:', err);
    for (const p of childProcesses) {
      try {
        p.kill();
      } catch (_) {}
    }
    process.exit(1);
  }
}

main();
