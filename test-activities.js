const http = require('http');

async function getAllActivities() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5235,
      path: '/api/activities',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTest() {
  console.log('=== Testing Activity List API ===\n');
  
  try {
    const result = await getAllActivities();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log(`\n活动总数: ${result.data.length}`);
      console.log('\n活动状态分布:');
      const statusCounts = {};
      result.data.forEach(activity => {
        statusCounts[activity.status] = (statusCounts[activity.status] || 0) + 1;
      });
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }
  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
  }
}

runTest();
