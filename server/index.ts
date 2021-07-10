import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error/error.middleware';
import { useAuth } from './oauth';

const uri = ``;

const app = express();

app.use('/api/static', express.static(__dirname + '/public'));

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    name: 'sid',
    cookie: {
      httpOnly: true,
      maxAge: 20 * 60 * 1000, // 20 minutes
      // domain: 'your.domain.com',
      // secure: true,
    },
  }),
);

useAuth(app);

app.use(errorMiddleware)


// Connection to database
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    // Launch server
    app.listen(8080, () => {
      // eslint-disable-next-line no-console
      console.log('Serve is up and running at the port 8080');
    });
  })
  // eslint-disable-next-line no-console
  .catch((e: any) => console.log(e));