import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Games Table ─────────────────────────────────────────────────────────────
export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull().default("New Game"),
  shareCode: varchar("share_code", { length: 8 }).unique().notNull(),
  mode: varchar("mode", { length: 10 }).notNull().default("edit"),
  gridRows: integer("grid_rows").default(7),
  gridCols: integer("grid_cols").default(7),
  settings: jsonb("settings").default({}),
  isPublic: boolean("is_public").default(true),
  editPassword: varchar("edit_password", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Categories Table ────────────────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull().default("Category"),
  position: integer("position").notNull(),
  color: varchar("color", { length: 7 }).default("#3B82F6"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Questions Table ─────────────────────────────────────────────────────────
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  rowIndex: integer("row_index").notNull(),
  points: integer("points").notNull(),
  questionText: text("question_text").default(""),
  answerText: text("answer_text").default(""),
  mediaUrl: varchar("media_url", { length: 500 }),
  mediaType: varchar("media_type", { length: 10 }),
  isRevealed: boolean("is_revealed").default(false),
  editingBy: varchar("editing_by", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Teams Table ─────────────────────────────────────────────────────────────
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  score: integer("score").default(0),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Game State Table ────────────────────────────────────────────────────────
export const gameState = pgTable("game_state", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .unique()
    .references(() => games.id, { onDelete: "cascade" }),
  activeQuestionId: uuid("active_question_id"),
  activeTeamId: uuid("active_team_id"),
  status: varchar("status", { length: 20 }).default("waiting"),
  timerSeconds: integer("timer_seconds").default(30),
  revealedQuestions: jsonb("revealed_questions").default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const gamesRelations = relations(games, ({ many, one }) => ({
  categories: many(categories),
  questions: many(questions),
  teams: many(teams),
  gameState: one(gameState),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  game: one(games, {
    fields: [categories.gameId],
    references: [games.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  category: one(categories, {
    fields: [questions.categoryId],
    references: [categories.id],
  }),
  game: one(games, {
    fields: [questions.gameId],
    references: [games.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one }) => ({
  game: one(games, {
    fields: [teams.gameId],
    references: [games.id],
  }),
}));

export const gameStateRelations = relations(gameState, ({ one }) => ({
  game: one(games, {
    fields: [gameState.gameId],
    references: [games.id],
  }),
}));
