const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const routes = require('./index');
const dbConnect = require('./dbConnect');

dbConnect();
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// CORS (Cross-Origin Resource Sharing)
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  if (request.method === 'OPTIONS') {
    return response.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(routes);
