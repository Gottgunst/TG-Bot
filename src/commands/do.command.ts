import { Context, Telegraf } from 'telegraf';
import { Command } from './command.class';
import moment from 'moment-timezone';
import 'moment/locale/ru';
import {
  IBotContext,
  TReplyMessage,
  TTaskType,
} from '../context/context.interface';

export class DoCommand extends Command {
  private _worker = 0;
  private _workersArray = ['', 'Владимир', 'Маша', 'Костя'];
  private _buttons = [
    {
      text: '✔ Готово',
      callback_data: 'done_task',
    },
    {
      text: '👥 Назначить',
      callback_data: 'instruct_task',
    },
  ];
  botName = /@\bVist_ToDo_bot\b/i;

  constructor(bot: Telegraf<IBotContext>) {
    super(bot);
  }

  handle(): void {
    this.bot.hears(this.botName, (ctx) => {
      const task = this._parseTask(
        ctx.message.text.replace(this.botName, ''),
        'set',
      );
      this._createTask(ctx, task);
    });

    this.bot.command('do', (ctx) => {
      const task = this._parseTask(ctx.message.text.slice(4), 'set');
      this._createTask(ctx, task);
    });

    this.bot.action('done_task', (ctx) => {
      const task: TReplyMessage = ctx.update.callback_query.message;
      const name = ctx.callbackQuery.from.first_name;

      ctx.editMessageText(this._parseTask(`${task!.text!}\n${name}`, 'done'), {
        parse_mode: 'HTML',
      });
    });

    this.bot.action('instruct_task', (ctx) => {
      const task: TReplyMessage = ctx.update.callback_query.message;
      const parse = task!.text!.split('\n');
      const tag = parse.at(-1);

      this._workersArray.forEach((w, index) => {
        if (w === '') this._worker = 1;
        if (new RegExp(w).test(tag!)) {
          this._worker = index + 1;
          if (index === this._workersArray.length - 1) this._worker = 0;
        }
      });

      ctx.answerCbQuery(
        `Исполнитель ${this._worker > 0 ? '— ' : ' не назначен'}${
          this._workersArray[this._worker]
        }`,
      );

      ctx.editMessageText(this._parseTask(task!.text!, 'instruct'), {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [this._buttons],
        },
      });
    });
  }

  _createTask(ctx: Context, task: string): void {
    ctx.reply(task, {
      parse_mode: 'HTML',
      disable_notification: true,
      allow_sending_without_reply: true,
      reply_markup: {
        inline_keyboard: [this._buttons],
      },
    });

    this.bot.telegram.deleteMessage(
      ctx.message!.chat.id,
      ctx.message!.message_id,
    );
  }

  _parseTask(text: string, type: TTaskType): string {
    const parse = text.split('\n');
    const date = moment
      .tz('Europe/Moscow')
      .locale('ru')
      .format('Do MMM, HH:mm');

    const task = {
      set: {
        firstLine: `⚠  <b>${parse[0]}</b>`,
        other: parse.slice(1).join('\n'),
        dateLine: `<code>[${date}]</code>`,
        tagLine: ` #todo`,
      },
      instruct: {
        firstLine: `<b>${parse[0]}</b>`,
        other: parse.slice(1, -2).join('\n'),
        dateLine: `<code>${parse.slice(-2, -1)}</code>`,
        tagLine: `#todo${this._worker > 0 ? '_' : ''}${
          this._workersArray[this._worker]
        }`,
      },
      done: {
        firstLine: `✅   <i>${parse[0].slice(3)}</i>`,
        other: parse.slice(1, -3).join('\n'),
        dateLine: `<code>[${date}]</code>`,
        tagLine: `#done   <code>${parse.at(-1)}</code>`,
      },
    };

    const mgs = task[type];
    return `${mgs.firstLine}\n${mgs.other}\n${mgs.dateLine}\n${mgs.tagLine}`;
  }
}
