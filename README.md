# Petstore API Performance & Automated Testing Suite

[![k6 Load Testing](https://img.shields.io/badge/Load_Testing-k6-7D64FF?logo=k6&logoColor=white)](https://k6.io/)
[![Postman Collection](https://img.shields.io/badge/API_Testing-Postman-FF6C37?logo=postman&logoColor=white)](https://www.postman.com/)
[![Newman CLI](https://img.shields.io/badge/CLI-Newman-FF6C37)](https://www.npmjs.com/package/newman)
[![Live Report](https://img.shields.io/badge/Live_Dashboard-GitHub_Pages-22c55e)](https://idzafic1.github.io/loadTestPetStoreAPI/)

## Overview

This repository contains an end-to-end performance and automated API testing suite built for the public **Swagger Petstore REST API v2** (`https://petstore.swagger.io/v2`). The project evaluates system throughput, latency percentiles, error rates, and failure boundaries across multiple testing tiers—including baseline smoke tests, ramping multi-scenario load tests (up to 50 concurrent virtual users over ~8.2 minutes), stress tests, instantaneous spike tests, and functional contract/boundary test suites. Test results are tracked across consecutive executions, archived in JSON format, and visualized in an interactive HTML dashboard.

---

## What Was Tested

### Target API
- **Swagger Petstore API v2** (`https://petstore.swagger.io/v2`)
- **Endpoints Covered**:
  - `/store/inventory` (GET)
  - `/store/order` (POST, GET by ID, DELETE)
  - `/pet` (POST create, PUT update)
  - `/pet/{petId}` (GET, POST form-data, DELETE)
  - `/pet/findByStatus` (GET with query filtering: available, pending, sold)
  - `/user` (POST single, POST bulk with array/list)
  - `/user/login` (GET session authentication)
  - `/user/{username}` (GET profile, PUT update, DELETE)
  - `/user/logout` (GET)

### Test Types
1. **Smoke Testing**: 1 Virtual User (VU), baseline verification checking that all core endpoints return expected HTTP 200/JSON responses with sub-second response times.
2. **Load Testing**: Ramping concurrency from 0 to 20 VUs in stages to simulate expected everyday operational traffic.
3. **Stress Testing**: Progressive ramping up to 50–100 VUs to determine system behavior, error margins, and latency degradation near capacity limits.
4. **Spike Testing**: Sudden traffic bursts jumping to 50–100 VUs within 5–10 seconds to test rate limiting, recovery speed, and connection stability.
5. **Functional & Boundary Testing**: Comprehensive Postman/Newman test suite covering 63 requests, testing boundary inputs (negative IDs, invalid enums, empty request bodies, string IDs), and validating schema contracts.

---

## Tools

- **[k6](https://k6.io/)**: Modern developer-centric load testing tool used for scripting performance scenarios in JavaScript (ES6), measuring custom trend metrics, and setting automated pass/fail thresholds.
- **[Postman](https://www.postman.com/) & [Newman](https://www.npmjs.com/package/newman)**: Functional API testing, pre-request scripts, dynamic environment variables, and CLI automation.
- **[Node.js](https://nodejs.org/)**: Metric aggregation script (`generate-unified-report.js`) compiling historical JSON runs into an interactive HTML visualization (`results/report.html`).
- **[Apache JMeter](https://jmeter.apache.org/)**: Comparative load, stress, spike, and endurance testing with APDEX score calculations (detailed in the academic project report).
- **Bash**: Automation and test execution scripts (`autoRun.sh`, `run-and-save.sh`, `save-results.sh`).

---

## Repository Structure

```text
loadTestPetStoreAPI/
├── docs/
│   ├── images/
│   │   ├── jmeter-active-threads.png     # Thread groups progression over time
│   │   ├── jmeter-key-metrics.png        # Four key metrics comparison in JMeter
│   │   ├── jmeter-results-table.png      # JMeter scenario & APDEX breakdown
│   │   ├── k6-load-test-summary.png      # k6 Full Load metrics table
│   │   └── newman-test-summary.png       # Newman CLI execution summary
│   └── reports/
│       ├── README.md                     # Summary of attached project reports
│       ├── api-and-performance-testing-report.pdf  # Comprehensive QA & performance report (87 pages)
│       └── whitebox-testing-and-refactoring-report.pdf # Whitebox & code tuning report (60 pages)
├── results/
│   ├── history/                          # Archived timestamped runs (JSON)
│   ├── full_load_summary.json            # Latest k6 full load metrics
│   └── report.html                       # Generated Chart.js visual report
├── autoRun.sh                            # Script running 5 automated load test cycles
├── generate-unified-report.js            # Aggregates history runs into report.html
├── index.html                            # Root redirect / landing for GitHub Pages
├── petstore-collection.json              # Postman collection (63 requests across Store, Pet, User)
├── petstore-environment.json             # Postman environment variables
├── petstore-load-test.js                 # Multi-scenario k6 load test (Smoke, Load, Stress, Spike)
├── quick-test.js                         # Minimal single-endpoint check
├── run-and-save.sh                       # Interactive runner with preset test selections
├── save-results.sh                       # Archives run metrics and rebuilds report.html
├── smoke-test.js                         # Dedicated k6 smoke test script (1 min)
├── spike-test.js                         # Dedicated k6 spike test script (100 VUs burst)
└── stress-test.js                        # Dedicated k6 stress test script (100 VUs ramp-up)
```

---

## How to Run

### Prerequisites

- **Node.js** (v18 or newer)
- **k6** (v0.40+ recommended):
  - Fedora/RHEL:
    ```bash
    sudo dnf install https://dl.k6.io/rpm/repo.rpm
    sudo dnf install k6
    ```
  - Debian/Ubuntu:
    ```bash
    sudo gpg -k
    sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update && sudo apt-get install k6
    ```
- **Newman** (optional, for Postman collection execution):
  ```bash
  npm install -g newman
  ```

---

### Executing Tests

#### 1. Quick Verification (Smoke Test)
```bash
# Minimal 1-request check:
k6 run quick-test.js

# Full smoke test across 5 endpoints (1 VU, 1 minute):
k6 run smoke-test.js
```

#### 2. Full Multi-Scenario Load Test (Recommended)
Executes Smoke, Load, Stress, and Spike scenarios concurrently with custom metrics and threshold checks (~8.2 minutes):
```bash
k6 run petstore-load-test.js
```

#### 3. Individual Stress & Spike Tests
```bash
# Stress test: ramping up to 100 VUs
k6 run stress-test.js

# Spike test: sudden surge to 100 VUs in 10 seconds
k6 run spike-test.js
```

#### 4. Interactive Test Runner
Provides an interactive menu to choose between Quick, Standard, or Full test runs and automatically archives the output:
```bash
chmod +x *.sh
./run-and-save.sh
```

#### 5. Automated Multi-Cycle Runner
Runs 5 consecutive benchmark iterations with cool-down intervals and updates the historical report:
```bash
./autoRun.sh
```

#### 6. Functional & Boundary Tests with Newman
```bash
newman run petstore-collection.json -e petstore-environment.json
```

---

### How Results Are Saved & Reported

1. Each test script utilizes k6's `handleSummary()` callback to write JSON summary files into `results/` (e.g., `results/full_load_summary.json`).
2. `./save-results.sh` archives each execution into `results/history/run_<TIMESTAMP>.json`.
3. `generate-unified-report.js` compiles the history into `results/report.html`, featuring response time trends, error rate graphs, and latency distributions.
4. Live results are also hosted directly via GitHub Pages: [https://idzafic1.github.io/loadTestPetStoreAPI/](https://idzafic1.github.io/loadTestPetStoreAPI/).

---

## Results and Key Findings

### k6 Full Load Test Benchmark (Real Numbers)

From the benchmark run documented in `results/full_load_summary.json` and the final report (493.2s duration, max 50 concurrent VUs, 1,143 iterations):

| Metric | Measured Value | Threshold / Target | Status |
| :--- | :--- | :--- | :---: |
| **Total HTTP Requests** | **13,750** | — | Completed |
| **Throughput** | **27.86 req/s** | Sustained load | [OK] Pass |
| **Failed Requests (`http_req_failed`)** | **43** (0.31%) | `< 15.0%` | [OK] Pass |
| **Assertion Checks Pass Rate** | **99.71%** | `> 90.0%` | [OK] Pass |
| **Average Response Time (`avg`)** | **151.13 ms** | — | Fast |
| **Median Response Time (`p50`)** | **131.66 ms** | — | Consistent |
| **90th Percentile (`p90`)** | **159.65 ms** | — | Stable |
| **95th Percentile (`p95`)** | **265.63 ms** | `< 2000 ms` | [OK] Pass |
| **Maximum Response Time (`max`)** | **6,142.65 ms** | Network/timeout outlier | Tracked |
| **Data Received** | **161.93 MB** | — | — |
| **Data Sent** | **2.34 MB** | — | — |

#### Results by Operation Group:
- **User Operations** (`Create User`, `Login`, `Get User`, `Logout`): **100.00% check pass rate** (1,143/1,143 for every check). Average duration: **140.24 ms** (P95: 157.18 ms). The user authentication system proved the most stable component under load.
- **Pet Operations** (`Create`, `Get`, `Find`, `Update`, `Delete`): **99.13% – 100.00% pass rate**. Update and Delete achieved 100% pass rates. Average creation time: **140.65 ms** (P95: 159.34 ms).
- **Store Operations** (`Inventory`, `Order`): **98.61% – 100.00% pass rate**. Order creation response times were 100% compliant. Inventory GET showed 16 status check failures (98.61% pass), indicating periodic server-side rate limits or cold-start timeouts.

![k6 Load Test Summary](./docs/images/k6-load-test-summary.png)

---

### Newman Functional & Contract Test Results

Execution of the Postman collection via Newman CLI yielded:
- **65 requests executed** across 3 modules (Store: 18, Pet: 21, User: 24).
- **366 assertions passed (100% pass rate)** across 126 test scripts and 69 pre-request scripts.
- **Execution duration**: 10.7 seconds with an average response time of **148 ms** (range: 129 ms – 628 ms).
- **Critical Business Logic & Security Vulnerabilities Identified**:
  - The API allowed negative quantities when placing orders (`quantity: -5`).
  - Order statuses accepted arbitrary string values rather than strictly validating enum values (`placed`, `approved`, `delivered`).
  - Empty request bodies to `POST /pet` created ghost records with generated large random IDs rather than returning `400 Bad Request`.
  - The deprecated endpoint `/pet/findByTags` remained fully active without deprecation headers.

![Newman Test Execution Summary](./docs/images/newman-test-summary.png)

---

### Apache JMeter Benchmark & Bottleneck Discovery

The extended academic study evaluated the Petstore API across 4 Thread Groups (Smoke: 1 VU, Stress: 50 VUs ramp-up, Spike: 75 VUs burst, Endurance: 15 VUs sustained) totaling **1,510 requests**:
- **Overall APDEX Score**: **0.919** ("Excellent" service level).
- **Error Rate**: **0.13%** (only 2 timeouts out of 1,510 requests, both on `GET /store/inventory` under stress).
- **Global Average Latency**: **478 ms**; P95: **1,171 ms**.
- **Critical Bottleneck Identified**: `GET /pet/findByStatus?status=available` under 50-thread concurrent stress experienced severe latency degradation to **1,180 ms average** and **1,343 ms maximum** (APDEX fell to **0.500**). In comparison, simple ID lookups and write operations remained under 450 ms. This pinpointed an unindexed table scan or missing caching layer on filtered database queries under high concurrency.

![JMeter Results Table & APDEX](./docs/images/jmeter-results-table.png)

![JMeter Key Metrics Analysis](./docs/images/jmeter-key-metrics.png)

![JMeter Active Threads Over Time](./docs/images/jmeter-active-threads.png)

---

## Reports & Academic Documentation

Full documentation reports are available in the [`docs/reports/`](./docs/reports/) directory:

- **[API & Performance Testing Report (`api-and-performance-testing-report.pdf`)](./docs/reports/api-and-performance-testing-report.pdf)**  
  *(Original: `VVSprojekat3.pdf`, 87 pages)*  
  Covers Black-box testing methodologies (Equivalence Partitioning, Boundary Value Analysis, Decision Tables), Selenium IDE and NUnit automation frameworks, Postman/Newman functional API testing, and detailed k6 & Apache JMeter performance comparisons with 10 visual analytical charts.

- **[White-Box Testing & Code Tuning Report (`whitebox-testing-and-refactoring-report.pdf`)](./docs/reports/whitebox-testing-and-refactoring-report.pdf)**  
  *(Original: `VVS.pdf`, 60 pages)*  
  Covers McCabe cyclomatic complexity analysis, control flow graph construction, branch/condition test coverage, .NET/C# performance code tuning (StringBuilder, LINQ elimination, loop optimization, caching), and Martin Fowler design smell refactoring.

---

## What I Learned

- **Percentiles Expose What Averages Hide**: The global average response time of 151 ms in k6 suggested an effortlessly performant API, but percentile analysis (P95 of 265 ms, tail latency peaks exceeding 6 seconds) and JMeter's scenario breakdown exposed that database filtering queries (`/pet/findByStatus`) were severely degrading under concurrent load.
- **Load Profiles Require Purpose-Built Architecture**: Implementing distinct test stages (smoke baseline, gradual ramp-up, burst spike, and cooldown) in k6 and JMeter revealed that systems often tolerate steady-state traffic well but falter on rapid connection ramp-ups and uncached read bursts.
- **Contract & Boundary Testing Must Precede Load Testing**: Running Newman prior to load testing was critical; it revealed that the backend accepted logically invalid data (such as negative order quantities and empty POST bodies). High throughput is meaningless if the API processes invalid data without proper backend validation.
- **Automated Metric Persistence and CI-Ready Reporting**: Implementing automated summary hooks (`handleSummary`) and history-tracking shell scripts demonstrated the power of repeatable performance regression testing, transforming raw terminal metrics into actionable visual dashboards.

---

## Kratak pregled projekta (Bosanski jezik)

Ovaj repozitorij predstavlja sveobuhvatno testiranje performansi i funkcionalno testiranje javnog **Swagger Petstore REST API-ja**, izrađeno u sklopu predmeta *Verifikacija i validacija softvera* (VVS). 

Projekat obuhvata:
- **k6 Load Testiranje**: Skriptirani testovi u JavaScriptu (Smoke, Load, Stress, Spike) koji su kroz 13.750 HTTP zahtjeva simulirali opterećenje do 50 konkurentnih korisnika, uz prosječnu latenciju od 151,13 ms i nisku stopu grešaka od 0,31%.
- **Postman & Newman Automatizacija**: Kolekcija od 63 zahtjeva i 366 asertacija koja pokriva CRUD operacije, granične vrijednosti i autentifikaciju, te identifikuje propuste u validaciji podataka na backendu (npr. prihvatanje negativne količine narudžbe).
- **Apache JMeter Analiza**: Detaljna komparativna analiza kroz 4 scenarija (1.510 zahtjeva, APDEX 0,919) koja je precizno lokalizovala glavno usko grlo sistema (`GET /pet/findByStatus` pod opterećenjem dostiže 1.180 ms).
- **Vizualizacija i Historija**: Automatizovane Bash skripte za arhiviranje rezultata u JSON formatu i generisanje interaktivnog HTML izvještaja.
