execute unless data entity @s respawn.pos run return fail
data modify storage elixir:tmp spawn set value {dimension:"minecraft:overworld",forced:0b}
data modify storage elixir:tmp spawn.dimension set from entity @s respawn.dimension
data modify storage elixir:tmp spawn.forced set from entity @s respawn.forced
execute store result storage elixir:tmp spawn.x int 1 run data get entity @s respawn.pos[0]
execute store result storage elixir:tmp spawn.y int 1 run data get entity @s respawn.pos[1]
execute store result storage elixir:tmp spawn.z int 1 run data get entity @s respawn.pos[2]
return run function elixir:revive/tp_respawn_at with storage elixir:tmp spawn
