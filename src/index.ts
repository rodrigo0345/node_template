import express from 'express';
import initial_config from './common/initial_config';
import M_Database from './databases/MainDatabase';
import { router } from './routes/posts';
import Cache from './databases/Cache';
import dev_log from './common/dev_log';
import { upload } from './routes/image';
import { authRouter } from './routes/auth';

/* 
    Here is the entry point of the application.
    I have laid out some working examples of how to use the database and the router.
    The public folder is used to serve static files, such as images, html, etc...
    To test functionallity such as the database and the file uploads, use:
    - localhost:8000/public/file.html
    - localhost:8000/public/index.html
    This is also a good way to test if everything is working properly
    To run the app in containers simply run 'docker-compose up' in the root directory of the project and the app will be available on localhost:8000. Once you are done, run 'docker-compose down' to stop the containers.
    If you need to change the code, there is no need to restart the containers, just save the file and the changes will be applied automatically.
    The benefit of using containers is that you don't need to install anything on your machine, everything is done inside the container and it brings already configured database and cache.
*/

// the timeout is used to give the database and cache time to start
export let mDatabase: M_Database;
export let cache: Cache;

const offset_time = Number.parseInt(process.env.M_DATABASE_OFFSET_TIME ?? '10000');

setTimeout(() => {
  mDatabase = new M_Database(
    process.env.M_DATABASE_PORT,
    process.env.M_DATABASE_HOST,
    process.env.M_DATABASE_USER,
    process.env.M_DATABASE_PASSWORD,
    process.env.M_DATABASE_NAME,
    offset_time,
    process.env.M_DATABASE_TIME_TO_CHECK,
  );
  cache = new Cache(process.env.REDIS_URL);
}, offset_time);


const app = express();
initial_config(app);

// for logging purposes
console.log('Node mode:', process.env.NODE_ENV ?? 'not set');

// example of how to use the router
app.use('/posts', router);
app.use('/image', upload);
app.use('/auth', authRouter);

// used '0.0.0.0' to use within docker, if not using docker, it is not needed
const server = app.listen(
  Number.parseInt(process.env.PORT ?? '3000'),
  '0.0.0.0',
  () => {
    console.log(`Server started on port ${process.env.PORT ?? 3000}`);
  },
);

// node needs to be told to close the database connection when the process is terminated
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  console.log('Closing http server.');
  server.close((err) => {
    mDatabase.close();

    // redis kills itself automatically
    console.log('Http server closed.');
    process.exit(err ? 1 : 0);
  });
});
