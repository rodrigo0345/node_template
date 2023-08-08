import {it, describe, expect, beforeAll} from '@jest/globals';
import User, { Role, UserType } from '../Types/user';
import { AVAILABLE_DATABASE_SERVICES, EXPRESS_SERVER } from '..';
import request from 'supertest';
import { Status } from '../Common/ApiResponse';


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

    describe('Register new user, with all the parameters', () => {
        it("Delete an user", async () => {
            const server = await request(EXPRESS_SERVER.getServer()).post('/auth/register').send(sentUser);
            await cleanDatabase();
        });

        it("It should respond with a 200 status code", async () => {
            const server = await request(EXPRESS_SERVER.getServer());
            const response = await server.post('/auth/register').send(sentUser);
            expect(response.body.status).toBe(Status.Success);
        });
    });
});