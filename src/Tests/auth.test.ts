import {it, describe, expect} from '@jest/globals';
import { Role, UserType } from '../Types/user';
import { EXPRESS_SERVER } from '..';
import request from 'supertest';


describe('Auth testing', () => {
    const newUser: UserType = {
        name: 'test',
        role: Role.User,
        password: 'test',
        email: 'test@gmail.com',
    } 
    
    describe('Register new user, with all the parameters', () => {
        it("It should respond with a 200 status code", async () => {
            const response = await request(EXPRESS_SERVER.getServer()).post('/auth/register').send(newUser);
            expect(response.statusCode).toBe(200);
        });
    });
});