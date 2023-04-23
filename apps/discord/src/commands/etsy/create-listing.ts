import { ApplicationCommandOptionType } from 'discord.js';
import { CommandType, TCommandMeta } from '../../core';

export default {
  type: CommandType.SLASH,
  description: 'Creates an Etsy listing.',
  sendTyping: true,
  options: [
    {
      name: 'name',
      description: 'Enter the name',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'description',
      description: 'Enter the description',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'image',
      description: 'Enter the image',
      type: ApplicationCommandOptionType.Attachment,
      required: true,
    },
  ],
  callback: async ({ interaction, args }) => {
    console.log(args);

    // interaction.reply({
    //   content: 'Pong',
    // });

    return {
      content: 'Jeff',
    };
  },
} as TCommandMeta;