import {it, describe, expect, beforeAll} from '@jest/globals';
import User, { Role, UserType } from '../../Types/user';
import { AVAILABLE_DATABASE_SERVICES, EXPRESS_SERVER } from '../..';
import request from 'supertest';
import { Status } from '../../Common/ApiResponse';


describe('Auth testing', () => {

    jest.setTimeout(10 * 1000);

    const sentUser = {
        name: 'test',
        role: Role.User,
        password: 'test',
        username: 'test@gmail.com',
    }
    const internalUser: UserType = {
        name: sentUser.name,
        role: sentUser.role,
        password: sentUser.password,
        email: sentUser.username,
    } 
    
    async function cleanDatabase(){
        if(!AVAILABLE_DATABASE_SERVICES.main) {
            throw new Error('Database service not available');
        }
        const userTable = new User(AVAILABLE_DATABASE_SERVICES.main);
        const deleteResult = await userTable.deleteOne(internalUser);
        console.log({deleteResult});
    }

    describe('Register new user', () => {
        

        it("Delete an user", async () => {
            const server = await request(`http://localhost:${process.env.PORT}`).post('/auth/register').send(sentUser);
            await cleanDatabase();
        });

        it("Possible conditions", async () => {
            const server = await request(`http://localhost:${process.env.PORT}`);
            let response = await server.post('/auth/register').send(sentUser);
            expect(response.body.status).toBe(Status.Success);

            response = await server.post('/auth/register').send({
                username: sentUser.username,
                password: sentUser.password,
            });
            expect(response.body.status).toBe(Status.Error);

            response = await server.post('/auth/register').send(sentUser);
            expect(response.body.status).toBe(Status.Error);
        });

    });

    describe("Login", () => {
        it("Possible conditions", async () => {
            const server = await request(`http://localhost:${process.env.PORT}`);
            
            // Don't send password
            let response = await server.post('/auth/login').send({
                username: sentUser.username,
            });
            expect(response.status).toBe(400);

            // Don't send username
            response = await server.post('/auth/login').send({
                password: sentUser.password,
            });

            expect(response.status).toBe(400);

            // Send wrong password
            response = await server.post('/auth/login').send({
                username: sentUser.username,
                password: 'wrong',
            });

            expect(response.status).toBe(500);

            // Send wrong username
            response = await server.post('/auth/login').send({
                username: 'wrong',
                password: sentUser.password,
            });

            expect(response.status).toBe(500);

            // Send correct username and password
            response = await server.post('/auth/login').send({
                username: sentUser.username,
                password: sentUser.password,
            });

            expect(response.status).toBe(200);
        });
    });
});