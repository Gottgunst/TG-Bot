import { Context } from 'telegraf';

export interface SessionData {
  taskComplete: boolean;
}

export interface IBotContext extends Context {
  session: SessionData;
}
