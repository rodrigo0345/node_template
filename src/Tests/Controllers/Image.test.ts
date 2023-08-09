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
        it('Activating the server', async () => {
            await request(EXPRESS_SERVER.getServer()).get('/');
        });
        it('Uploading image', async () => {
            const server = await request(`http://localhost:${process.env.PORT}`);

            console.log({port: process.env.PORT});
            const response = await server.post('/image/upload').attach('image', path.resolve('FilesForTesting/test.png'));
            expect(response.status).toBe(Status.Success);
        });

        it('Uploading a pdf', async () => {
            const server = await request(`http://localhost:${process.env.PORT}`);
            const response = await server.post('/image/upload').attach('image', path.resolve('FilesForTesting/test.pdf'));
            expect(response.status).toBe(Status.Error);
        });
    });

});