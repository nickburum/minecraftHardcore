# Removes everything the pack stores. Disable the pack afterwards with /datapack disable.
scoreboard objectives remove elixir.deaths
scoreboard objectives remove elixir.use
scoreboard objectives remove elixir.revive
scoreboard objectives remove elixir.pending
scoreboard objectives remove elixir.id
scoreboard objectives remove elixir.var
data remove storage elixir:data fallen
data remove storage elixir:data buttons
data remove storage elixir:data pending
data remove storage elixir:data voice_queue
data remove storage elixir:data world_spawn
tag @a remove elixir.fallen
tellraw @s {text:"[Elixir of Life] Uninstalled. Now run /datapack disable on the pack.",color:"gold"}
