# As the revived player. Uses storage elixir:tmp target.reviver.
execute unless data storage elixir:tmp target.reviver run data modify storage elixir:tmp target.reviver set value "An ally"
title @s times 10 70 20
function elixir:revive/notify_player_text with storage elixir:tmp target
particle minecraft:totem_of_undying ~ ~1 ~ 0.5 1 0.5 0.4 80 force @a
