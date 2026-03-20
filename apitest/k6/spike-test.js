import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');

export const options = {
  stages:  [
    { duration: '30s', target: 5 },     // Normal load
    { duration: '10s', target: 100 },   // SPIKE!
    { duration: '1m', target: 100 },    // Stay at spike
    { duration:  '10s', target: 5 },     // Back to normal
    { duration: '30s', target: 5 },     // Recovery period
    { duration: '10s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'],
    errors: ['rate<0.5'],
  },
};

const BASE_URL = 'https://petstore.swagger.io/v2';
const headers = { 'Content-Type': 'application/json' };

export default function () {
  // Primary endpoint for spike testing
  const res = http.get(`${BASE_URL}/store/inventory`, { headers });
  
  requestCount.add(1);
  responseTime.add(res. timings.duration);
  
  const success = check(res, {
    'Status is 200':  (r) => r.status === 200,
    'Response time < 10s': (r) => r.timings. duration < 10000,
  });
  
  errorRate.add(success ?  0 : 1);
  
  sleep(0.1);
}

export function handleSummary(data) {
  console.log('\n📊 SPIKE TEST SUMMARY');
  console.log('=====================');
  console.log(`Total Requests: ${data.metrics.requests ? data.metrics. requests.values.count : 'N/A'}`);
  console.log(`Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%`);
  console.log(`Avg Response Time: ${data. metrics.response_time.values.avg. toFixed(2)}ms`);
  console.log(`Max Response Time: ${data.metrics.response_time.values.max.toFixed(2)}ms`);
  console.log(`P95 Response Time: ${data.metrics.response_time.values['p(95)'].toFixed(2)}ms`);
  
  return {
    'results/spike_summary.json':  JSON.stringify(data, null, 2),
  };
}
