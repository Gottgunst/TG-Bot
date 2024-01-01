import { Markup, Telegraf } from 'telegraf';
import { Command } from './command.class';
import { IBotContext } from '../context/context.interface';

export class StartCommand extends Command {
  constructor(bot: Telegraf<IBotContext>) {
    super(bot);
  }
  handle(): void {
    this.bot.start((ctx) => {
      const task = `⚠ ${ctx.message.text.slice(3)}`;
      ctx.reply(
        task,
        Markup.inlineKeyboard([
          Markup.button.callback('✅', 'done_task'),
          Markup.button.callback('👥', 'instruct_task'),
        ])
      );
    });

    this.bot.action('done_task', (ctx) => {
      ctx.session.taskComplete = true;
      ctx.editMessageText(`Done`);
    });

    this.bot.action('instruct_task', (ctx) => {
      ctx.session.taskComplete = true;
      ctx.editMessageText('Well…');
    });
  }
}
