#!/bin/bash
# ==============================================================================
# Script: autoRun.sh
# Description: Automated test runner that executes multiple consecutive cycles of
#              the full k6 load test (petstore-load-test.js), persists each run's
#              metrics to results/history/, and updates the HTML report.
# Usage: ./autoRun.sh
# ==============================================================================

# Configuration
TOTAL_RUNS=5
SCRIPT_NAME="petstore-load-test.js"
DELAY_BETWEEN_RUNS=5 # seconds

echo "========================================"
echo "  🚀 Automated K6 Load Test Runner"
echo "========================================"
echo "Target: $SCRIPT_NAME"
echo "Cycles: $TOTAL_RUNS"
echo "Delay:  $DELAY_BETWEEN_RUNS seconds"
echo "========================================"
echo ""

# Ensure results directory exists
mkdir -p results/history

for i in $(seq 1 $TOTAL_RUNS); do
    echo "----------------------------------------"
    echo " ▶️  Starting Run #$i of $TOTAL_RUNS"
    echo " ⏱️  Time: $(date '+%H:%M:%S')"
    echo "----------------------------------------"
    
    # Run k6 test
    k6 run "$SCRIPT_NAME"
    
    # Save results to history and update report
    if [ -f "./save-results.sh" ]; then
        echo "💾 Saving results from run #$i..."
        ./save-results.sh
    else
        echo "⚠️  Warning: save-results.sh not found. Skipping history save."
    fi
    
    if [ $i -lt $TOTAL_RUNS ]; then
        echo "⏸️  Waiting $DELAY_BETWEEN_RUNS seconds before next run..."
        sleep $DELAY_BETWEEN_RUNS
    fi
    echo ""
done

echo "========================================"
echo "  ✅ ALL $TOTAL_RUNS RUNS COMPLETED!"
echo "  Report available at: results/report.html"
echo "========================================"
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open results/report.html >/dev/null 2>&1 &
elif command -v firefox >/dev/null 2>&1; then
    firefox results/report.html >/dev/null 2>&1 &
elif command -v brave-browser >/dev/null 2>&1; then
    brave-browser results/report.html >/dev/null 2>&1 &
fi

