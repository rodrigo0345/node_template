import {
    it,
    describe,
    expect,
    beforeAll,
} from '@jest/globals';
import User, {
    Role,
    UserType,
} from '../../Types/user';
import {
    AVAILABLE_DATABASE_SERVICES,
    EXPRESS_SERVER,
} from '../..';
import request from 'supertest';
import { Status } from '../../Common/ApiResponse';
import dotenv from 'dotenv';
import { getTablesDefinition } from '../../Types/db';
import { DatabaseConfig } from '../../Interfaces/Database/Database';
import MySQL from '../../Databases/MySQL';
import DatabaseService from '../../Databases/DatabaseService';

describe('Auth testing', () => {
    dotenv.config();

    jest.setTimeout(10 * 1000);

    const sentUser = {
        name: 'test',
        role: Role.User,
        password: 'test',
        username: 'test@gmail.com',
    };
    const internalUser: UserType = {
        name: sentUser.name,
        role: sentUser.role,
        password: sentUser.password,
        email: sentUser.username,
    };

    describe('Register new user', () => {
        it('Possible conditions', async () => {
            const mysqlConfig: DatabaseConfig =
                {
                    port: Number.parseInt(
                        process.env
                            .M_DATABASE_PORT ??
                            '3306',
                    ),
                    host:
                        process.env
                            .M_DATABASE_HOST ??
                        'localhost',
                    user:
                        process.env
                            .M_DATABASE_USER ??
                        'root',
                    password:
                        process.env
                            .M_DATABASE_PASSWORD ??
                        'password',
                    database:
                        process.env
                            .M_DATABASE_NAME ??
                        'main',
                    testTimer:
                        Number.parseInt(
                            process.env
                                .M_DATABASE_TIME_TO_CHECK ??
                                '10000',
                        ),
                    idleTimeout:
                        Number.parseInt(
                            process.env
                                .M_DATABASE_IDLE_TIMEOUT ??
                                '10000',
                        ),
                };
            const mysqlTables = [
                User.table,
            ];
            const mysql = new MySQL(
                mysqlConfig,
                mysqlTables,
            );
            const mainDatabaseService =
                new DatabaseService(
                    mysql,
                );

            await mainDatabaseService.connect(
                0,
            );
            const userTable = new User(
                mainDatabaseService,
            );
            const result =
                await userTable.deleteOne(
                    internalUser,
                );
            console.log({ result });

            const server = request(
                `http://localhost:${process.env.PORT}`,
            );
            let response = await server
                .post('/auth/register')
                .send(sentUser);
            expect(
                response.body.status,
            ).toBe(Status.Success);

            response = await server
                .post('/auth/register')
                .send({
                    username:
                        sentUser.username,
                    password:
                        sentUser.password,
                });
            expect(
                response.body.status,
            ).toBe(Status.Error);

            response = await server
                .post('/auth/register')
                .send(sentUser);
            expect(
                response.body.status,
            ).toBe(Status.Error);
        });
    });

    describe('Login', () => {
        it('Possible conditions', async () => {
            const server =
                await request(
                    `http://localhost:${process.env.PORT}`,
                );

            // Don't send password
            let response = await server
                .post('/auth/login')
                .send({
                    username:
                        sentUser.username,
                });
            expect(
                response.status,
            ).toBe(400);

            // Don't send username
            response = await server
                .post('/auth/login')
                .send({
                    password:
                        sentUser.password,
                });

            expect(
                response.status,
            ).toBe(400);

            // Send wrong password
            response = await server
                .post('/auth/login')
                .send({
                    username:
                        sentUser.username,
                    password: 'wrong',
                });

            expect(
                response.status,
            ).toBe(500);

            // Send wrong username
            response = await server
                .post('/auth/login')
                .send({
                    username: 'wrong',
                    password:
                        sentUser.password,
                });

            expect(
                response.status,
            ).toBe(500);

            // Send correct username and password
            response = await server
                .post('/auth/login')
                .send({
                    username:
                        sentUser.username,
                    password:
                        sentUser.password,
                });

            expect(
                response.status,
            ).toBe(200);
        });
    });
});
