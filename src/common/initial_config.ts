import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import bp from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import { Strategy } from 'passport-local';
import { getUserByEmail, getUserByID } from '../utils/AuthQueries';
import { ApiError } from './api_response';
import bcrypt from 'bcrypt';
import dev_log from './dev_log';
import ServerConfigInterface from '../interfaces/Server/ServerConfig';
import ServerInterface from '../interfaces/Server/Server';

export const rateLimiterUsingThirdParty = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes in milliseconds
  max: 300,
  message: 'You have exceeded the 100 requests in 2 minutes limit!',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
});

export default function initial_config(app: Express) {
  dotenv.config();

  // use this when you are behind a proxy (e.g. nginx) (to me this made nginx not work... so I disable it as default)
  // app.set('trust proxy', 1);

  app.use('/public', express.static('public')); // serve files from the public directory
  app.use(cookieParser());
  app.use(rateLimiterUsingThirdParty); // rate limit users based on the IP address
  app.use(bp.urlencoded({ extended: true }));
  app.use(bp.json());
  app.use(morgan('dev')); // log every request to the console, this is very useful for debugging
  app.use(
    cors({
      origin: `*`, // allow all origins
      credentials: true,
    }),
  );
  app.use(compression());

  // express-session makes the login persist within the cookies
  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'secret',
      resave: false,
      saveUninitialized: true,
      proxy: true,
      cookie: {
        secure: process.env.NODE_ENV === 'development' ? false : false,
        httpOnly: process.env.NODE_ENV === 'development' ? false : true,
        sameSite: process.env.NODE_ENV === 'development' ? false : false,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  /*passport.use(
    new Strategy(async function (username, password, done) {
      let user: user | undefined = undefined;

      try {
        const result = await getUserByEmail(username);
        dev_log({ result });

        if (!result) {
          return done(JSON.stringify(ApiError('User not found')));
        }

        if ((result as any).status === 'error') {
          return done(JSON.stringify(ApiError(result.message)));
        }
        user = {
          id: (result as user).id,
          name: (result as user).name,
          email: (result as user).email,
          role: (result as user).role,
          password: (result as user).password,
        };
        if (!bcrypt.compareSync(password, user.password)) {
          return done(JSON.stringify(ApiError('Incorrect password')));
        }
        return done(null, user);
      } catch (error: any) {
        return done(JSON.stringify(ApiError(error.message)));
      }
    }),
  );

  passport.serializeUser(function (user: any, done: any) {
    process.nextTick(function () {
      done(null, user);
    });
  });

  passport.deserializeUser(async function (user: any, done: any) {
    let userObj: user | undefined = undefined;

    try {
      const result = await getUserByID(user.id);
      if ((result as any).status === 'error') {
        return done(JSON.stringify(ApiError((result as any).message)));
      }
      userObj = {
        id: (result as user).id,
        name: (result as user).name,
        email: (result as user).email,
        role: (result as user).role,
        password: (result as user).password,
      };
    } catch (error: any) {
      return done(JSON.stringify(ApiError(error.message)));
    }
    process.nextTick(function () {
      done(null, userObj);
    });
  });*/
}
