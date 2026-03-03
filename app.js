require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');

var app = express();

// 配置跨域
const allowlist = [
  'https://servicewechat.com',
];

app.use(cors({
  origin(origin, cb) {
    // 无 Origin（如 curl / server-to-server）也放行
    if (!origin) return cb(null, true);

    if (allowlist.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // 如果你要带 cookie/鉴权信息才开
  maxAge: 86400,     // 预检缓存
}));

// 预检请求（关键：Vercel/浏览器会先发 OPTIONS）
app.options('*', cors());


app.use((req, _res, next) => {
  console.log('DEPLOYMENT env check:',
    'BAIDU_API_KEY=', process.env.BAIDU_API_KEY,
    'BAIDU_API_KEY=', process.env.BAIDU_API_KEY,
  )
  next()
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.options('*', cors())

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
