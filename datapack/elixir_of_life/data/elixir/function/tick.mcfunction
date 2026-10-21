# New players get an id and the recipe.
execute as @a unless score @s elixir.id matches 1.. run function elixir:player/first_seen

# Players from before the switch to three lives get reset to 3 (once).
execute as @a if score @s elixir.id matches 1.. unless score @s elixir.epoch = #epoch elixir.var run function elixir:lives/reset_player
execute as @e[type=player,tag=elixir.restore] run function elixir:lives/restore

# Deaths (dead players are only matched by @a, not @e).
execute as @a[scores={elixir.deaths=1..}] at @s run function elixir:death/on_death

# Elixir right-clicked.
execute as @a[scores={elixir.use=1..}] at @s run function elixir:use/on_use

# A name was picked in the revive menu (shows the confirm popup), or the popup was confirmed.
execute as @a[scores={elixir.revive=1..}] at @s run function elixir:revive/request
execute as @a[scores={elixir.confirm=1..}] at @s run function elixir:revive/confirm

# Died with lives left and respawned: back into survival.
execute as @e[type=player,tag=elixir.respawning] run function elixir:lives/respawn

# Bring back revived players once they are alive (respawned as spectator) and online.
execute as @e[type=player,scores={elixir.pending=1..}] run function elixir:revive/perform

# Out players stay spectators.
execute as @e[type=player,tag=elixir.fallen,gamemode=!spectator] unless score @s elixir.pending matches 1.. run function elixir:death/forget

# Name colors follow lives.
function elixir:lives/colors
