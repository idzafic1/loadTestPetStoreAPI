#!/bin/bash
# ==============================================================================
# Script: save-results.sh
# Description: Collects summary metrics from smoke, stress, spike, and full_load
#              runs, persists them as a timestamped JSON file in results/history/,
#              and triggers node generate-unified-report.js to update results/report.html.
# Usage: ./save-results.sh
# ==============================================================================

mkdir -p results/history
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RUN_ID="run_${TIMESTAMP}"
echo "Saving results:  $RUN_ID"
cat > results/history/${RUN_ID}.json << ENDJSON
{
  "run_id": "${RUN_ID}",
  "timestamp": "$(date -Iseconds)",
  "date_display": "$(date '+%Y-%m-%d %H:%M:%S')",
  "smoke":  $(cat results/smoke_summary.json 2>/dev/null || echo '{}'),
  "stress": $(cat results/stress_summary.json 2>/dev/null || echo '{}'),
  "spike": $(cat results/spike_summary.json 2>/dev/null || echo '{}'),
  "full_load": $(cat results/full_load_summary.json 2>/dev/null || echo '{}')
}
ENDJSON
node generate-unified-report.js
echo "Done! HTML report updated at: results/report.html"
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open results/report.html >/dev/null 2>&1 &
elif command -v firefox >/dev/null 2>&1; then
    firefox results/report.html >/dev/null 2>&1 &
fi

