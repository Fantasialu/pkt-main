const http = require('http');

async function getPendingActivities() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5235,
      path: '/api/admin/activities?status=pending',
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

async function approveActivity(activityId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5235,
      path: `/api/admin/activities/${activityId}/approve`,
      method: 'PATCH',
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
          resolve({ statusCode: res.statusCode, ...result });
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
  console.log('=== Testing Admin Approval API ===\n');
  
  // Step 1: Get pending activities
  console.log('1. 获取待审核活动列表...');
  try {
    const result = await getPendingActivities();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data.length > 0) {
      const activityId = result.data[0].id;
      console.log(`\n2. 找到待审核活动ID: ${activityId}`);
      
      // Step 2: Try to approve
      console.log('\n3. 尝试审核通过...');
      const approvalResult = await approveActivity(activityId);
      console.log('Approval Response:', JSON.stringify(approvalResult, null, 2));
      
      if (approvalResult.success) {
        console.log('\n✅ 审核功能测试成功！');
      } else {
        console.log('\n❌ 审核失败:', approvalResult.message);
      }
    } else {
      console.log('\n⚠️  没有待审核的活动');
    }
  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
  }
}

runTest();
