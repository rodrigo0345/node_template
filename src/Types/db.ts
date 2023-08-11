/*
    Here, you can add the sql syntax to add new tables to the database. These will be rendered when the main database instance starts 

    Use RowDataPacket[] for SELECT statements, while using ResultSetHeader when using UPDATE, INSERT and DELETE queries. The latter contains affectedRows and lastInsertId properties.
*/

import Post from "./post";
import User from "./user";

export function getTablesDefinition() {
  return [User.table, Post.table];
}
