import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { TextChannel, WebhookClient } from 'discord.js';
@ApplyOptions<ListenerOptions>({
  event: "starboardNewMsg",
  emitter: "starboardEvents"
})
export class UserEvent extends Listener {
  public async run(reaction: any) {
    try {
    const config = await this.container.db.table(`config_${reaction.message.guildId}`);
    const tracked = await this.container.db.table(`tracked_${reaction.message.guildId}`);
    if(await config.get("webhook_enabled") == true) {
        const webhook = await config.get("webhook_url");
        const embed = this.container.starboard.utils.embed(reaction.message, reaction.count);
        const webhookClient = new WebhookClient({url: webhook});
        const msg = await webhookClient.send(embed);
        await tracked.set(`_${reaction.message.id}`, msg.id)
        await tracked.push(`array`,`${reaction.message.id}`)
    } else {
      const embed = this.container.starboard.utils.embed(reaction.message, `${reaction.count}`, config);
      const channelId = await config.get("channelId")
      const channel = this.container.client.channels.cache.get(channelId) as TextChannel;
      const msg = await channel.send(embed)
      await tracked.set(`_${reaction.message.id}`, msg.id)
      await tracked.push(`array`,`${reaction.message.id}`)
    }
  } catch (err) {
    reaction.message.channel.send(`Error: ${err}`);
  }
}
}
