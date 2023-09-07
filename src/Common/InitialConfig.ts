import express, {
    Express,
} from 'express';
import rateLimit from 'express-rate-limit';
import bp from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import passport from 'passport';
import session from 'express-session';
import { Strategy } from 'passport-local';
import { ApiError } from './ApiResponse';
import bcrypt from 'bcrypt';
import dev_log from './DevLog';
import ServerConfigInterface from '../Interfaces/Server/ServerConfig';
import ServerInterface from '../Interfaces/Server/Server';
import User, {
    UserType,
} from '../Types/user';
import { AVAILABLE_DATABASE_SERVICES } from '..';
import { z } from 'zod';

export const rateLimiterUsingThirdParty =
    rateLimit({
        windowMs: 2 * 60 * 1000, // 2 minutes in milliseconds
        max: 300,
        message:
            'You have exceeded the 100 requests in 2 minutes limit!',
        standardHeaders: true,
        legacyHeaders: false,
        skipFailedRequests: false,
    });

export default function initial_config(
    app: Express,
) {
    // use this when you are behind a proxy (e.g. nginx) (to me this made nginx not work... so I disable it as default)
    // app.set('trust proxy', 1);

    app.use(
        '/public',
        express.static('public'),
    ); // serve files from the public directory
    app.use(cookieParser());
    app.use(rateLimiterUsingThirdParty); // rate limit users based on the IP address
    app.use(
        bp.urlencoded({
            extended: true,
        }),
    );
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
            secret:
                process.env
                    .SESSION_SECRET ??
                'secret',
            resave: false,
            saveUninitialized: true,
            proxy: true,
            cookie: {
                secure:
                    process.env
                        .NODE_ENV ===
                    'development'
                        ? false
                        : false,
                httpOnly:
                    process.env
                        .NODE_ENV ===
                    'development'
                        ? false
                        : true,
                sameSite:
                    process.env
                        .NODE_ENV ===
                    'development'
                        ? false
                        : false,
            },
        }),
    );
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new Strategy(async function (
            username,
            password,
            done,
        ) {
            if (
                !AVAILABLE_DATABASE_SERVICES.main
            ) {
                return done(
                    JSON.stringify(
                        ApiError(
                            'Database service not available',
                        ),
                    ),
                );
            }
            const userTable = new User(
                AVAILABLE_DATABASE_SERVICES.main,
            );

            try {
                z.string()
                    .email()
                    .parse(username);

                dev_log({
                    username,
                    password,
                });

                const result =
                    await userTable.getOneByEmail(
                        username,
                    );

                dev_log({ result });

                if (!result) {
                    return done(
                        JSON.stringify(
                            ApiError(
                                'Strategy Error:' +
                                    'User not found',
                            ),
                        ),
                    );
                }

                if (
                    result.status ===
                    'error'
                ) {
                    return done(
                        JSON.stringify(
                            result.message,
                        ),
                    );
                }

                if (!result.data) {
                    return done(
                        JSON.stringify(
                            ApiError(
                                'Strategy Error:' +
                                    'User not found',
                            ),
                        ),
                    );
                }

                let user: UserType = {
                    id: result.data.id,
                    name: result.data
                        .name,
                    email: result.data
                        .email,
                    role: result.data
                        .role,
                    password:
                        result.data
                            .password,
                };

                dev_log({
                    password,
                    stored: user.password,
                });
                if (
                    !bcrypt.compareSync(
                        password,
                        user.password,
                    )
                ) {
                    return done(
                        JSON.stringify(
                            ApiError(
                                'Strategy Error:' +
                                    'Incorrect password',
                            ),
                        ),
                    );
                }
                return done(null, user);
            } catch (error: any) {
                return done(
                    JSON.stringify(
                        ApiError(
                            'Strategy Error:' +
                                error.message,
                        ),
                    ),
                );
            }
        }),
    );

    passport.serializeUser(function (
        user: any,
        done: any,
    ) {
        process.nextTick(function () {
            done(null, user);
        });
    });

    passport.deserializeUser(
        async function (
            user: any,
            done: any,
        ) {
            if (
                !AVAILABLE_DATABASE_SERVICES.main
            ) {
                return done(
                    JSON.stringify(
                        ApiError(
                            'Database service not available',
                        ),
                    ),
                );
            }
            const userTable = new User(
                AVAILABLE_DATABASE_SERVICES.main,
            );

            let userObj: UserType;
            try {
                const result =
                    await userTable.getOneByEmail(
                        user.email,
                    );
                dev_log({
                    result,
                    user,
                });

                if (
                    result.status ===
                    'error'
                ) {
                    return done(
                        JSON.stringify(
                            result.message,
                        ),
                    );
                }
                if (!result.data) {
                    return done(
                        JSON.stringify(
                            ApiError(
                                'Deserializing Error:' +
                                    ' User not found',
                            ),
                        ),
                    );
                }

                userObj = {
                    id: result.data.id,
                    name: result.data
                        .name,
                    email: result.data
                        .email,
                    role: result.data
                        .role,
                    password:
                        result.data
                            .password,
                };
            } catch (error: any) {
                return done(
                    JSON.stringify(
                        ApiError(
                            'Deserializing Error:' +
                                error.message,
                        ),
                    ),
                );
            }
            process.nextTick(
                function () {
                    done(null, userObj);
                },
            );
        },
    );
}
