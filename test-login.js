const http = require('http');

const data = JSON.stringify({
  email: 'admin@example.com',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 5235,
  path: '/api/users/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', body);
    try {
      const result = JSON.parse(body);
      if (result.success) {
        console.log('登录成功！');
        console.log('Token:', result.data.token);
        console.log('User:', result.data.user);
      } else {
        console.log('登录失败:', result.message);
      }
    } catch (err) {
      console.log('解析响应失败:', err);
    }
  });
});

req.on('error', (error) => {
  console.error('请求错误:', error);
});

req.write(data);
req.end();
