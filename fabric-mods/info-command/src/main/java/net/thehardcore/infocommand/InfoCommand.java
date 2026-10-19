package net.thehardcore.infocommand;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.command.v2.CommandRegistrationCallback;
import net.minecraft.commands.Commands;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerPlayer;

/**
 * Adds /info for every player. Data packs can't register new commands, so this mod only
 * provides the command name: the book itself lives in the server_info data pack
 * (function info:give), which this runs on the player's behalf.
 */
public class InfoCommand implements ModInitializer {
    @Override
    public void onInitialize() {
        CommandRegistrationCallback.EVENT.register((dispatcher, registryAccess, environment) ->
            dispatcher.register(Commands.literal("info").executes(context -> {
                ServerPlayer player = context.getSource().getPlayerOrException();
                MinecraftServer server = context.getSource().getServer();
                // Run as the player, with the server's permissions so the function's /give works.
                server.getCommands().performPrefixedCommand(
                    server.createCommandSourceStack()
                        .withEntity(player)
                        .withLevel(player.level())
                        .withPosition(player.position())
                        .withSuppressedOutput(),
                    "function info:give");
                return 1;
            })));
    }
}
