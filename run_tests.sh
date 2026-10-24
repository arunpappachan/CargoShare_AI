#!/bin/bash

# CargoShare Automated Test Runner
# This script runs all E2E & Lifecycle tests and generates a professional text report.

echo "========================================"
echo "   CargoShare Automated Test Suite"
echo "========================================"
echo ""
echo "Running tests... (This may take a minute)"
echo ""

# Execute the Node script which runs Mocha, strips formatting, and builds test_report.txt
node generate_report.js

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ All tests passed successfully!"
else
    echo ""
    echo "❌ Some tests failed. Please review the report for details."
fi

echo "📄 You can view your professional report at: test_report.txt"
echo ""

exit $EXIT_CODE
