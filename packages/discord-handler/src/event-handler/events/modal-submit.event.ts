import { Events, InteractionType, ModalSubmitInteraction } from 'discord.js';

export default {
  type: Events.InteractionCreate,
  shouldExecuteCallback: (interaction) =>
    interaction.type === InteractionType.ModalSubmit,
  callback: async (instance, interaction: ModalSubmitInteraction) => {
    // TODO:
    // 1. check registered modals in ComponentsHandler (registered in instance)
    // 2. call callback
  },
};
