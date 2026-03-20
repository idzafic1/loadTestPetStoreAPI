import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const petCreationTime = new Trend('pet_creation_time');
const petGetTime = new Trend('pet_get_time');
const orderCreationTime = new Trend('order_creation_time');
const inventoryGetTime = new Trend('inventory_get_time');
const userOperationsTime = new Trend('user_operations_time');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

export const options = {
  scenarios: {
    smoke_test: {
      executor: 'constant-vus',
      vus: 1,
      duration:  '30s',
      startTime: '0s',
      tags: { test_type: 'smoke' },
    },
    load_test:  {
      executor:  'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration:  '1m', target: 10 },
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      startTime: '35s',
      tags: { test_type: 'load' },
    },
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 30 },
        { duration: '30s', target: 30 },
        { duration: '20s', target: 50 },
        { duration: '30s', target: 50 },
        { duration: '20s', target: 0 },
      ],
      startTime:  '4m30s',
      tags: { test_type: 'stress' },
    },
    spike_test:  {
      executor:  'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '5s', target: 50 },
        { duration: '20s', target: 50 },
        { duration: '5s', target: 5 },
        { duration: '20s', target: 5 },
        { duration: '10s', target: 0 },
      ],
      startTime: '7m',
      tags: { test_type: 'spike' },
    },
  },
  thresholds: {
    http_req_duration:  ['p(95)<2000'],
    http_req_failed:  ['rate<0.15'],
    errors:  ['rate<0.15'],
    pet_creation_time:  ['p(95)<3000'],
    pet_get_time:  ['p(95)<1000'],
    order_creation_time:  ['p(95)<2000'],
    inventory_get_time:  ['p(95)<1000'],
  },
};

const BASE_URL = 'https://petstore.swagger.io/v2';
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

function generateId() {
  return Math.floor(Math.random() * 900000) + 100000;
}

function generateName(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export default function () {
  // GROUP 1: Store Operations
  group('Store Operations', function () {
    // Get Inventory
    let inventoryRes = http.get(`${BASE_URL}/store/inventory`, { headers });
    inventoryGetTime.add(inventoryRes.timings.duration);
    
    let inventoryCheck = check(inventoryRes, {
      'Inventory:  status is 200': (r) => r.status === 200,
      'Inventory:  response time OK': (r) => r.timings.duration < 2000,
      'Inventory: is JSON': (r) => {
        const ct = r.headers['Content-Type'];
        return ct && ct.includes('application/json');
      },
    });
    
    if (inventoryCheck) {
      successfulRequests.add(1);
      errorRate.add(0);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }

    sleep(0.5);

    // Place Order
    const orderId = generateId();
    const orderPayload = JSON.stringify({
      id:  orderId,
      petId: generateId(),
      quantity: Math.floor(Math.random() * 5) + 1,
      shipDate: new Date().toISOString(),
      status: 'placed',
      complete: false,
    });

    let orderRes = http.post(`${BASE_URL}/store/order`, orderPayload, { headers });
    orderCreationTime.add(orderRes.timings.duration);
    
    let orderCheck = check(orderRes, {
      'Order: status is 200': (r) => r.status === 200,
      'Order: response time OK': (r) => r.timings.duration < 3000,
    });
    
    if (orderCheck) {
      successfulRequests.add(1);
      errorRate.add(0);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }

    sleep(0.3);
  });

  // GROUP 2: Pet Operations
  group('Pet Operations', function () {
    // Create Pet
    const petId = generateId();
    const petName = generateName('LoadTestPet');
    const petPayload = JSON.stringify({
      id: petId,
      category: { id: 1, name: 'Dogs' },
      name: petName,
      photoUrls:  ['https://example.com/photo.jpg'],
      tags: [{ id: 1, name: 'loadtest' }],
      status: 'available',
    });

    let createPetRes = http.post(`${BASE_URL}/pet`, petPayload, { headers });
    petCreationTime.add(createPetRes.timings.duration);
    
    let createCheck = check(createPetRes, {
      'Create Pet:  status is 200':  (r) => r.status === 200,
      'Create Pet: response time OK': (r) => r.timings.duration < 3000,
      'Create Pet: returns pet data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.name === petName;
        } catch (e) {
          return false;
        }
      },
    });
    
    if (createCheck) {
      successfulRequests.add(1);
      errorRate.add(0);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }

    sleep(0.3);

    // Get Pet by ID
    let getPetRes = http.get(`${BASE_URL}/pet/${petId}`, { headers });
    petGetTime.add(getPetRes.timings.duration);
    
    let getCheck = check(getPetRes, {
      'Get Pet:  status is 200':  (r) => r.status === 200,
      'Get Pet: response time OK': (r) => r.timings.duration < 2000,
    });
    
    if (getCheck) {
      successfulRequests.add(1);
      errorRate.add(0);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }

    sleep(0.3);

    // Find Pets by Status - FIXED URL (no space after ?)
    let findPetsRes = http.get(`${BASE_URL}/pet/findByStatus?status=available`, { headers });
    
    let findCheck = check(findPetsRes, {
      'Find Pets: status is 200': (r) => r.status === 200,
      'Find Pets: returns array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch (e) {
          return false;
        }
      },
    });
    
    if (findCheck) {
      successfulRequests.add(1);
      errorRate.add(0);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }

    sleep(0.3);

    // Update Pet
    const updatePayload = JSON.stringify({
      id: petId,
      category: { id: 1, name: 'Dogs' },
      name: petName + '_updated',
      photoUrls: ['https://example.com/photo.jpg'],
      tags: [{ id: 1, name: 'loadtest' }],
      status: 'sold',
    });

    let updatePetRes = http.put(`${BASE_URL}/pet`, updatePayload, { headers });
    
    let updateCheck = check(updatePetRes, {
      'Update Pet: status is 200': (r) => r.status === 200,
      'Update Pet: response time OK':  (r) => r.timings.duration < 3000,
    });
    
    if (updateCheck) {
      successfulRequests.add(1);
      errorRate.add(0);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }

    sleep(0.3);

    // Delete Pet (cleanup)
    let deletePetRes = http.del(`${BASE_URL}/pet/${petId}`, null, { headers });
    
    check(deletePetRes, {
      'Delete Pet: status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    });

    sleep(0.3);
  });

  // GROUP 3: User Operations
  group('User Operations', function () {
    // Create User
    const username = generateName('loadtestuser');
    const userPayload = JSON.stringify({
      id: generateId(),
      username: username,
      firstName: 'Load',
      lastName:  'Tester',
      email: `${username}@loadtest.com`,
      password: 'testpass123',
      phone: '1234567890',
      userStatus: 1,
    });

    let createUserRes = http.post(`${BASE_URL}/user`, userPayload, { headers });
    userOperationsTime.add(createUserRes.timings.duration);
    
    let createUserCheck = check(createUserRes, {
      'Create User:  status is 200':  (r) => r.status === 200,
      'Create User: response time OK': (r) => r.timings.duration < 3000,
    });
    
    if (createUserCheck) {
      successfulRequests.add(1);
      errorRate.add(0);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }

    sleep(0.3);

    // Login - FIXED URL (no space after ?)
    let loginRes = http.get(`${BASE_URL}/user/login?username=${username}&password=testpass123`, { headers });
    
    let loginCheck = check(loginRes, {
      'Login:  status is 200':  (r) => r.status === 200,
      'Login: has session': (r) => r.body && r.body.includes('logged in'),
    });
    
    if (loginCheck) {
      successfulRequests.add(1);
      errorRate.add(0);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }

    sleep(0.3);

    // Get User
    let getUserRes = http.get(`${BASE_URL}/user/${username}`, { headers });
    userOperationsTime.add(getUserRes.timings.duration);
    
    check(getUserRes, {
      'Get User: status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    });

    sleep(0.3);

    // Logout
    let logoutRes = http.get(`${BASE_URL}/user/logout`, { headers });
    
    check(logoutRes, {
      'Logout: status is 200': (r) => r.status === 200,
    });

    sleep(0.3);

    // Delete User (cleanup)
    http.del(`${BASE_URL}/user/${username}`, null, { headers });

    sleep(0.2);
  });

  sleep(1);
}

export function setup() {
  console.log('🚀 Starting Petstore API Load Test');
  console.log('📊 Testing scenarios:  Smoke, Load, Stress, and Spike');
  
  let res = http.get(`${BASE_URL}/store/inventory`);
  if (res.status !== 200) {
    throw new Error('API is not accessible. Aborting test.');
  }
  
  return { startTime: new Date().toISOString() };
}

export function teardown(data) {
  console.log('✅ Load test completed');
  console.log(`⏱️ Started at: ${data.startTime}`);
  console.log(`⏱️ Ended at: ${new Date().toISOString()}`);
}

export function handleSummary(data) {
  return {
    'results/full_load_summary.json': JSON.stringify(data, null, 2),
  };
}
