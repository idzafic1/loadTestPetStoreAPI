import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCounter = new Counter('total_requests');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration:  '1m', target: 25 },    // Increase to 25 users
    { duration:  '1m', target: 50 },    // Increase to 50 users
    { duration: '1m', target: 75 },    // Increase to 75 users
    { duration: '30s', target: 100 },  // Peak at 100 users
    { duration: '1m', target: 100 },   // Stay at peak
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed:  ['rate<0.3'],
    errors: ['rate<0.3'],
  },
};

const BASE_URL = 'https://petstore.swagger.io/v2';
const headers = { 'Content-Type': 'application/json' };

function generateId() {
  return Math.floor(Math.random() * 900000) + 100000;
}

export default function () {
  requestCounter.add(1);
  
  // Mix of different operations
  const operations = [
    // GET Inventory (read)
    () => {
      let res = http.get(`${BASE_URL}/store/inventory`, { headers });
      return { res, name: 'Get Inventory' };
    },
    // GET Pets by Status (read) - FIXED URL
    () => {
      let res = http.get(`${BASE_URL}/pet/findByStatus?status=available`, { headers });
      return { res, name: 'Find Pets' };
    },
    // GET Pet by ID (read)
    () => {
      let res = http.get(`${BASE_URL}/pet/${generateId()}`, { headers });
      return { res, name: 'Get Pet' };
    },
    // POST Pet (write)
    () => {
      let payload = JSON.stringify({
        id: generateId(),
        name: `StressPet_${Date.now()}`,
        photoUrls: ['http://example.com/photo. jpg'],
        status: 'available'
      });
      let res = http.post(`${BASE_URL}/pet`, payload, { headers });
      return { res, name: 'Create Pet' };
    },
    // GET User Login - FIXED URL
    () => {
      let res = http.get(`${BASE_URL}/user/login?username=test&password=test`, { headers });
      return { res, name:  'Login' };
    },
  ];

  // Random operation selection
  const opIndex = Math.floor(Math.random() * operations.length);
  const { res, name } = operations[opIndex]();
  
  responseTime.add(res.timings.duration);
  
  const success = check(res, {
    [`${name}: Status OK`]: (r) => r.status >= 200 && r.status < 500,
    [`${name}: Response time < 5s`]: (r) => r.timings.duration < 5000,
  });
  
  errorRate.add(success ? 0 :  1);
  
  sleep(0.1 + Math.random() * 0.4);
}

export function handleSummary(data) {
  console.log('\n📊 STRESS TEST SUMMARY');
  console.log('======================');
  console.log(`Total Requests: ${data.metrics.total_requests ?  data.metrics.total_requests. values. count : 'N/A'}`);
  console.log(`Error Rate: ${(data.metrics.errors. values.rate * 100).toFixed(2)}%`);
  console.log(`Avg Response Time: ${data.metrics.response_time.values. avg.toFixed(2)}ms`);
  console.log(`P95 Response Time:  ${data.metrics. response_time.values['p(95)'].toFixed(2)}ms`);
  console.log(`Max Response Time: ${data.metrics.response_time.values. max.toFixed(2)}ms`);
  
  return {
    'results/stress_summary.json': JSON.stringify(data, null, 2),
  };
}
