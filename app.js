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
  'https://servicewechat.com/wx635e4a26b43e8ad4/devtools/page-frame.html',
];

// 允许微信相关 Origin（开发者工具/小程序 WebView 常见）
// 你也可以先在后端打印 req.headers.origin 来确认你本机具体是什么
function isWeChatOrigin(origin) {
  if (!origin) return false
  return (
    origin.includes('servicewechat.com') ||     // 常见：小程序相关
    origin.includes('wechatdevtools') ||        // 部分情况下 devtools 会出现
    origin.includes('qq.com')                   // 有时会走到 qq.com 域
  )
}

app.use(cors({
  origin(origin, cb) {
    // 没有 Origin（如 curl、server-to-server）放行
    if (!origin) return cb(null, true)

    if (allowlist.includes(origin) || isWeChatOrigin(origin)) {
      return cb(null, true)
    }
    return cb(new Error(`Not allowed by CORS: ${origin}`))
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // 小程序大多用 token header，不一定需要 cookie；不需要就别开，省坑
  credentials: false,
  maxAge: 86400,
}))

// 关键：预检 OPTIONS
app.options('*', cors())


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
