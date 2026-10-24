import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';

const REPORT_FILE = 'test_report.txt';

console.log('🚀 Starting CargoShare Test Suite...');
console.log('Running all E2E and Lifecycle tests. This may take a minute...');

// Run Mocha with no-colors so the text file is clean
const command = 'npx mocha tests/e2e/**/*.test.js --timeout 60000 --no-colors';

const startTime = new Date();

exec(command, (error, stdout, stderr) => {
  const endTime = new Date();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Format the professional report header
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
Test Scope     : End-to-End (E2E) UI & Lifecycle Tests

================================================================================
                             TEST RESULTS
================================================================================
`;

  // Determine overall status
  const overallStatus = error ? 'FAILED' : 'PASSED';
  
  // Extract summary from Mocha output if possible
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

  // Strip any lingering ANSI escape codes (Mocha sometimes leaks them)
  const cleanStdout = stdout.replace(/\x1B\[\d+m/g, '').trim();
  const cleanStderr = stderr ? stderr.replace(/\x1B\[\d+m/g, '').trim() : '';

  const finalReport = header + '\n' + cleanStdout + '\n' + (cleanStderr ? '\nErrors:\n' + cleanStderr + '\n' : '') + summary;

  fs.writeFileSync(REPORT_FILE, finalReport, 'utf8');

  console.log(`\n✅ Testing complete! Professional report generated at: ./${REPORT_FILE}`);
  console.log(`Status: ${overallStatus} (${passed} passed, ${failed} failed)`);
  
  // Exit with correct code based on test success
  process.exit(error ? 1 : 0);
});
