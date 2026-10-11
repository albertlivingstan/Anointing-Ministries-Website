import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const comments=sqliteTable('verse_comments',{id:text('id').primaryKey(),verseKey:text('verse_key').notNull(),userId:text('user_id').notNull(),name:text('name').notNull(),message:text('message').notNull(),createdAt:integer('created_at').notNull()});
export const likes=sqliteTable('verse_likes',{verseKey:text('verse_key').notNull(),userId:text('user_id').notNull()},t=>[primaryKey({columns:[t.verseKey,t.userId]})]);
export const counters=sqliteTable('rate_counters',{key:text('key').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull()});
export const liveCache=sqliteTable('live_cache',{key:text('key').primaryKey(),value:text('value').notNull(),expires:integer('expires').notNull()});
