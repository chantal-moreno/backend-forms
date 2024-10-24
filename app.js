const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const routes = require('./index');
const dbConnect = require('./dbConnect');
const cors = require('cors');

dbConnect();
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

const allowedOrigins = [
  'http://localhost:5173',
  'https://proyect-forms.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow postman
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content',
    'Accept',
    'Content-Type',
    'Authorization',
  ],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(routes);
