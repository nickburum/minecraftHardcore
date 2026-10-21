# As a revived player who is alive and online.
scoreboard players reset @s elixir.pending
tag @s remove elixir.fallen

data remove storage elixir:tmp target
execute store result storage elixir:tmp req.id int 1 run scoreboard players get @s elixir.id
function elixir:revive/take_pending with storage elixir:tmp req
execute unless data storage elixir:tmp target.name run function elixir:util/get_name
execute unless data storage elixir:tmp target.name run data modify storage elixir:tmp target.name set from storage elixir:tmp name
function elixir:death/unregister with storage elixir:tmp req

gamemode survival @s
# Back from being out: on their last life, red name.
scoreboard players set @s elixir.lives 1
function elixir:revive/teleport
function elixir:revive/protect
# Announce to everyone first, so the revived player's own notice replaces it on their screen.
function elixir:announce/revived
execute at @s run function elixir:revive/notify_player
