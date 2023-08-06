
/*
    In case you need to add a new type, e.g. post that also needs to be stored on the database, you can add it here.

    This file is just an example, you can delete it if you don't need it.
*/
import { z } from 'zod';
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

export type PostType = z.infer<typeof Post.type>;

export default class Post implements DatabaseTableImpl<PostType> {
  private database: DatabaseService | null = null;

  static table : DatabaseTable = {
    name: 'posts',
    parameters: [
      { type: 'INT NOT NULL AUTO_INCREMENT', name: 'id' },
      { type: 'VARCHAR(255) NOT NULL', name: 'title' },
      { type: 'TEXT NOT NULL', name: 'content' },
      { type: 'VARCHAR(255) NOT NULL', name: 'author' },
      { type: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP', name: 'created_at' },
      { type: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', name: 'updated_at' },
      { type: 'PRIMARY KEY (id)', name: '' },
    ]
  };

  static type = z.object({
    id: z.number().optional(),
    title: z.string().min(3).max(255),
    content: z.string().min(4),
    author: z.string().email(),
  });

  constructor(database: DatabaseService) {
    this.database = database;
  }

  setDatabase(database: DatabaseService): void {
    this.database = database;
  }

  async insertOne(data: PostType): Promise<ApiResponse<number>> {
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      const [result] = await connection.query(`INSERT INTO ${Post.table.name} (title, content, author) VALUES (?, ?, ?);`, [data.title, data.content, data.author]);
      return ApiSuccess<number>((result  as ResultSetHeader).insertId); 
    }) as ApiResponse<number>;
  }

  async insertMany(data: PostType[]): Promise<ApiResponse<number[]>> {
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      const ids: number[] = [];
      data.forEach(async (user) => {
        const [result] = await connection.query(`INSERT INTO ${Post.table.name} (title, content, author) VALUES (?, ?, ?);`, [user.title, user.content, user.author]);
        ids.push((result  as ResultSetHeader).insertId);
      });
      return ApiSuccess<number[]>(ids); 
    }) as ApiResponse<number[]>;
  }

  async getOne(where: string): Promise<ApiResponse<PostType>> {
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      const [rows] = await connection.query(`SELECT * FROM ${Post.table.name} WHERE ?;`, [where]);
      const data = ((rows as RowDataPacket[])[0] as PostType);
      return ApiSuccess<PostType>(data); 
    }) as ApiResponse<PostType>;
  }

  async getAll(where: string): Promise<ApiResponse<PostType[]>> {
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      const [rows] = await connection.query(`SELECT * FROM ${Post.table.name} WHERE ?;`, [where]);
      const data = ((rows as RowDataPacket[]) as PostType[]);
      return ApiSuccess<PostType[]>(data); 
    }) as ApiResponse<PostType[]>;
  }
  
  async updateOne(where: string, data: PostType): Promise<ApiResponse<number>> {
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      const [result] = await connection.query(`
        UPDATE ${Post.table.name} 
        SET title = ?, content = ?, author= ?
        WHERE ?;
      `, [data.title, data.content, data.author, where]) ;
      return ApiSuccess<number>((result  as ResultSetHeader).insertId); 
    }) as ApiResponse<number>;
  }

  async deleteOne(where: string, data: PostType): Promise<ApiResponse<PostType>> {
    where = this.defaultWhere(where, data);
    if(!this.database) throw new Error('Database not attached');
    return await this.database?.query(async (connection) => {
      await connection.query(`DELETE FROM ${Post.table.name} WHERE ?;`, [where]) ;
      return ApiSuccess<PostType>(data); 
    }) as ApiResponse<PostType>;
  }

  private defaultWhere(where: string, data: PostType): string {
    if(where === "") return `id = ${data.id}`
    return where;
  }
}
