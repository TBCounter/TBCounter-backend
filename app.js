var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");
var { OCRQueue } = require('./sockets.js')

var indexRouter = require('./routes/index');
var authRouter = require('./routes/jwtAuth.js');
var accountsRouter = require('./routes/accounts.js');
var imagesRouter = require('./routes/images.js')
var changelogRouter = require('./routes/changelog.js')
var chestRouter = require('./routes/chests.js')
var databaseRouter = require('./routes/database.js')

const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

var app = express();

const db = require("./db/index.js");

db.sequelize.sync({ force: false })
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(OCRQueue)],
  serverAdapter: serverAdapter,
});




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/accounts', accountsRouter);
app.use('/images', imagesRouter);
app.use('/changelog', changelogRouter);
app.use('/chest', chestRouter)
app.use('/db', databaseRouter)
// bull-board route
app.use('/admin/queues', serverAdapter.getRouter());

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
