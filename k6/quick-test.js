import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const res = http.get('https://petstore.swagger.io/v2/store/inventory');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
