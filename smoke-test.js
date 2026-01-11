import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'https://petstore.swagger.io/v2';
const headers = { 
  'Content-Type': 'application/json', 
  'Accept': 'application/json' 
};

export default function () {
  group('Smoke Test - All Endpoints', function () {
    
    // 1. Store - Get Inventory
    let r1 = http.get(`${BASE_URL}/store/inventory`, { headers });
    responseTime.add(r1.timings. duration);
    let check1 = check(r1, { 
      'Inventory:  status 200': (r) => r.status === 200,
      'Inventory: has data': (r) => r.body && r.body.length > 0,
    });
    errorRate.add(check1 ? 0 :  1);
    sleep(0.5);

    // 2. Pet - Find by Status (FIXED URL - no space)
    let r2 = http.get(`${BASE_URL}/pet/findByStatus?status=available`, { headers });
    responseTime.add(r2.timings.duration);
    let check2 = check(r2, { 
      'Find Pets:  status 200': (r) => r.status === 200,
      'Find Pets: returns array': (r) => {
        try {
          return Array.isArray(JSON.parse(r. body));
        } catch(e) {
          return false;
        }
      },
    });
    errorRate.add(check2 ? 0 : 1);
    sleep(0.5);

    // 3. User - Login (FIXED URL - no space)
    let r3 = http.get(`${BASE_URL}/user/login? username=test&password=test`, { headers });
    responseTime.add(r3.timings.duration);
    let check3 = check(r3, { 
      'Login: status 200': (r) => r.status === 200,
      'Login: has response': (r) => r.body && r.body.length > 0,
    });
    errorRate.add(check3 ? 0 : 1);
    sleep(0.5);

    // 4. Store - Get Order (boundary test)
    let r4 = http.get(`${BASE_URL}/store/order/1`, { headers });
    responseTime. add(r4.timings.duration);
    let check4 = check(r4, { 
      'Get Order:  valid response': (r) => r.status === 200 || r.status === 404,
    });
    errorRate.add(check4 ? 0 : 1);
    sleep(0.5);

    // 5. User - Logout
    let r5 = http.get(`${BASE_URL}/user/logout`, { headers });
    responseTime.add(r5.timings. duration);
    let check5 = check(r5, { 
      'Logout:  status 200': (r) => r.status === 200,
    });
    errorRate.add(check5 ? 0 : 1);
    sleep(0.5);
  });
}

export function handleSummary(data) {
  return {
    'results/smoke_summary.json': JSON.stringify(data, null, 2),
  };
}
