/*
    Here, you can add the sql syntax to add new tables to the database. These will be rendered when the main database instance starts 

    Use RowDataPacket[] for SELECT statements, while using ResultSetHeader when using UPDATE, INSERT and DELETE queries. The latter contains affectedRows and lastInsertId properties.
*/

import DatabaseServiceImpl from "../interfaces/Database/DatabaseServiceImpl";
import DatabaseTable from "../interfaces/Database/DatabaseTable";
import DatabaseTableImpl from "../interfaces/Database/DatabaseTableImple";
import Post from "./post";
import User from "./user";

export function getTablesDefinition() {
  return [User.table, Post.table];
}

export function getActiveTables(database: DatabaseServiceImpl) {

  const Entities = new Map<string, DatabaseTableImpl<unknown>>();

  const post = new Post(database);
  Entities.set(post.getName(), post);

  const user = new User(database);
  Entities.set(user.getName(), user);

  return Entities;
}
