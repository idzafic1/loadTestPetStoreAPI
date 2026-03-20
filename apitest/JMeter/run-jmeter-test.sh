#!/bin/bash
# JMeter Comprehensive Load Test Script

set -e

# Print header
echo "========================================"
echo "  JMeter Comprehensive Load Test"
echo "========================================"
echo ""

# Move to script directory (so it works from anywhere)
cd "$(dirname "$0")"

# Clear old results
echo "Clearing old results..."
rm -rf results/jmeter-report
rm -f results/jmeter-report.csv

# Run test and generate report
echo "Running comprehensive test...  (1-5 minutes)"
echo ""
~/apache-jmeter-5.6.3/bin/jmeter -n -t petstore-comprehensive.jmx -l results/jmeter-report.csv -e -o results/jmeter-report

echo ""
echo "========================================"
echo "  Test Complete!"
echo "========================================"
echo ""
echo "Results:"
echo "  - HTML Report: results/jmeter-report/index.html"
echo "  - CSV Data: results/jmeter-report.csv"
echo ""
echo "Opening report..."
brave-browser ./results/jmeter-report/index.html &
