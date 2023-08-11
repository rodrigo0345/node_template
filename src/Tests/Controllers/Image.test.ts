import {it, describe, expect, beforeAll} from '@jest/globals';
import User, { Role, UserType } from '../../Types/user';
import { AVAILABLE_DATABASE_SERVICES, EXPRESS_SERVER } from '../..';
import request from 'supertest';
import { Status } from '../../Common/ApiResponse';
import path from 'path';
import dotenv from 'dotenv';

describe('Image testing', () => {
    dotenv.config();

    describe('Upload file', () => {

        it('Uploading image', async () => {
            const server = await request(`http://localhost:${process.env.PORT}`);

            console.log({port: process.env.PORT});
            const response = await server.post('/image').attach('image', path.resolve('attachments/test.png'));
            expect(response.status).toBe(200);
        });

        it('Uploading a pdf', async () => {
            const server = await request(`http://localhost:${process.env.PORT}`);
            const response = await server.post('/image').attach('image', path.resolve('attachments/test.pdf'));
            expect(response.status).toBe(500);
        });
    });

});