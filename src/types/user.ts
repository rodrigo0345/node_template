/*
    In case you need to add a new type, e.g. post that also needs to be stored on the database, you can add it here.

    This file is just an example, you can delete it if you don't need it.
*/

import { z } from "zod";
import DatabaseService from "../databases/DatabaseService";
import DatabaseTable from "../interfaces/Database/DatabaseTable";
import DatabaseTableImpl from "../interfaces/Database/DatabaseTableImple";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ApiError, ApiResponse, ApiSuccess } from "../common/api_response";
import { table } from "console";

export type post = {
  id?: number;
  title: string;
  content: string;
  author: string;
};

export type UserType = z.infer<typeof User.type>;

export enum Role {
  Admin = 'admin',
  User = 'user',
};

export default class User implements DatabaseTableImpl<UserType> {
  private database: DatabaseService | null = null;

  static table : DatabaseTable = {
    name: 'users',
    parameters: [
      { type: 'INT NOT NULL AUTO_INCREMENT', name: 'id' },
      { type: 'VARCHAR(255) NOT NULL', name: 'name' },
      { type: 'VARCHAR(10) NOT NULL', name: 'role' },
      { type: 'VARCHAR(255) NOT NULL UNIQUE', name: 'email' },
      { type: 'VARCHAR(255) NOT NULL', name: 'password' },
      { type: 'BOOLEAN NOT NULL DEFAULT FALSE', name: 'deleted' },
      { type: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP', name: 'created_at' },
      { type: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', name: 'updated_at' },
      { type: 'PRIMARY KEY (id)', name: '' },
    ]
  };

  static type = z.object({
    id: z.number().optional(),
    name: z.string().min(3).max(255),
    role: z.nativeEnum(Role),
    password: z.string().min(4),
    email: z.string().email(),
  });

  constructor(database: DatabaseService) {
    this.database = database;
  }

  setDatabase(database: DatabaseService): void {
    this.database = database;
  }

  async insertOne(data: UserType): Promise<ApiResponse<number>> {
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      const [result] = await connection.query(`INSERT INTO ${User.table.name} (name, role, password, email) VALUES (?, ?, ?, ?);`, [data.name, data.role, data.password, data.email]) ;
      return ApiSuccess<number>((result  as ResultSetHeader).insertId); 
    }) as ApiResponse<number>;
  }

  async insertMany(data: UserType[]): Promise<ApiResponse<number[]>> {
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      const ids: number[] = [];
      data.forEach(async (user) => {
        const [result] = await connection.query(`INSERT INTO ${User.table.name} (name, role, password, email) VALUES (?, ?, ?, ?);`, [user.name, user.role, user.password, user.email]) ;
        ids.push((result  as ResultSetHeader).insertId);
      });
      return ApiSuccess<number[]>(ids); 
    }) as ApiResponse<number[]>;
  }

  async getOne(where: string): Promise<ApiResponse<UserType>> {
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      const [rows] = await connection.query(`SELECT * FROM ${User.table.name} WHERE ?;`, [where]);
      const data = ((rows as RowDataPacket[])[0] as UserType);
      return ApiSuccess<UserType>(data); 
    }) as ApiResponse<UserType>;
  }

  async getAll(where: string): Promise<ApiResponse<UserType[]>> {
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      const [rows] = await connection.query(`SELECT * FROM ${User.table.name} WHERE ?;`, [where]);
      const data = ((rows as RowDataPacket[]) as UserType[]);
      return ApiSuccess<UserType[]>(data); 
    }) as ApiResponse<UserType[]>;
  }
  
  async updateOne(where: string, data: UserType): Promise<ApiResponse<number>> {
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      const [result] = await connection.query(`
        UPDATE ${User.table.name} 
        SET name = ?, role = ?, password = ?, email = ?
        WHERE ?;
      `, [data.name, data.role, data.password, data.email, where]) ;
      return ApiSuccess<number>((result  as ResultSetHeader).insertId); 
    }) as ApiResponse<number>;
  }

  async deleteOne(where: string, data: UserType): Promise<ApiResponse<UserType>> {
    where = this.defaultWhere(where, data);
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      await connection.query(`DELETE FROM ${User.table.name} WHERE ?;`, [where]) ;
      return ApiSuccess<UserType>(data); 
    }) as ApiResponse<UserType>;
  }

  private defaultWhere(where: string, data: UserType): string {
    if(where === "") return `id = ${data.id}`
    return where;
  }
}