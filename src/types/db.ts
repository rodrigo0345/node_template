/*
    Here, you can add the sql syntax to add new tables to the database. These will be rendered when the main database instance starts 
*/

import DatabaseTable from "../interfaces/Database/DatabaseTable";

export const mysqlTables: DatabaseTable[] = [
  {
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
  },
  {
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
  }
] 

const tables = [
  // this is an example table, you can delete it if you don't need it
  {
    filename: 'post.ts', // the filename needs to reference a file within the types folder
    name: 'posts',
    // Dont forget to add "IF NOT EXISTS"
    createTable: `
            CREATE TABLE IF NOT EXISTS posts (
                id INT NOT NULL AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                author VARCHAR(255) NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            );`,
    insertTable: `
            INSERT INTO posts (title, content, author)
            VALUES (?, ?, ?);`,
  },
  {
    filename: 'user.ts',
    name: 'users',
    createTable: `
            CREATE TABLE IF NOT EXISTS users (
                id INT NOT NULL AUTO_INCREMENT UNIQUE,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(10) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                deleted BOOLEAN NOT NULL DEFAULT FALSE,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            );`,
    insertTable: `
            INSERT INTO users (name, role, email, password)
            VALUES (?, ?, ?, ?);`,
  },
];

export default tables;
