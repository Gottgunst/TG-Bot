import { Context } from 'telegraf';
import { Message, MessageEntity } from 'telegraf/typings/core/types/typegram';

export interface SessionData {
  taskComplete: boolean;
}

export interface IBotContext extends Context {
  session: SessionData;
}

export type TReplyMessage =
  | (Message & {
      text?: string;
      entities?: MessageEntity[] | undefined;
    })
  | undefined;

export type TTaskType = 'set' | 'instruct' | 'done';
