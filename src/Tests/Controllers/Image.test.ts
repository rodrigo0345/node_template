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
            const server = request(`http://localhost:${process.env.PORT}`);

            console.log({port: process.env.PORT});
            const image_filepath = path.resolve('attachments/test.png');
            const response = await server.post('/image').attach('image', path.resolve('attachments/test.png'));
            console.log({image_filepath});
            expect(response.status).toBe(200);
        });

        it('Uploading a pdf', async () => {
            const server = request(`http://localhost:${process.env.PORT}`);
            const response = await server.post('/image').attach('image', path.resolve('attachments/test.pdf'));
            expect(response.status).toBe(500);
        });
    });

});
