# New players get an id and the recipe.
execute as @a unless score @s elixir.id matches 1.. run function elixir:player/first_seen

# Deaths (dead players are only matched by @a, not @e).
execute as @a[scores={elixir.deaths=1..}] at @s run function elixir:death/on_death

# Elixir right-clicked.
execute as @a[scores={elixir.use=1..}] at @s run function elixir:use/on_use

# A button in the revive menu was pressed.
execute as @a[scores={elixir.revive=1..}] at @s run function elixir:revive/request

# Bring back revived players once they are alive (respawned as spectator) and online.
execute as @e[type=player,scores={elixir.pending=1..}] run function elixir:revive/perform

# A fallen player who is alive and not a spectator was brought back some other way
# (admin /gamemode, or the world is not hardcore). Drop them from the list.
execute as @e[type=player,tag=elixir.fallen,gamemode=!spectator] run function elixir:death/forget
