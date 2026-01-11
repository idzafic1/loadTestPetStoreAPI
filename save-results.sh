#!/bin/bash
mkdir -p results/history
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RUN_ID="run_${TIMESTAMP}"
echo "Saving results:  $RUN_ID"
cat > results/history/${RUN_ID}.json << ENDJSON
{
  "run_id": "${RUN_ID}",
  "timestamp": "$(date -Iseconds)",
  "date_display": "$(date '+%Y-%m-%d %H:%M')",
  "smoke":  $(cat results/smoke_summary.json 2>/dev/null || echo '{}'),
  "stress": $(cat results/stress_summary.json 2>/dev/null || echo '{}'),
  "spike": $(cat results/spike_summary.json 2>/dev/null || echo '{}'),
  "full_load": $(cat results/full_load_summary.json 2>/dev/null || echo '{}')
}
ENDJSON
node generate-unified-report.js
echo "Done!  Open:  firefox results/report.html"
