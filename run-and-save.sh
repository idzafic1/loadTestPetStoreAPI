#!/bin/bash
# ==============================================================================
# Script: run-and-save.sh
# Description: Interactive runner allowing selection between Quick (Smoke),
#              Standard (Stress + Spike), and Full Load tests. Automatically
#              triggers save-results.sh upon test completion.
# Usage: ./run-and-save.sh
# ==============================================================================

echo "========================================"
echo "  Run Tests and Save to History"
echo "========================================"
echo ""
echo "  1) Quick - Smoke only (1 min)"
echo "  2) Standard - Stress + Spike (8 min)"
echo "  3) Full - Complete Load Test (8 min)"
echo ""
read -p "Choice [1-3]: " choice
case $choice in
    1) k6 run smoke-test.js ;;
    2) k6 run stress-test.js; sleep 2; k6 run spike-test.js ;;
    3) k6 run petstore-load-test.js ;;
    *) echo "Invalid"; exit 1 ;;
esac
echo ""
./save-results.sh
