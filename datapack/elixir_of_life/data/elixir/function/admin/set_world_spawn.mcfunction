# Run while standing at the world spawn. Revived players with no bed or
# respawn anchor are sent here.
data modify storage elixir:data world_spawn.dimension set from entity @s Dimension
execute store result storage elixir:data world_spawn.x int 1 run data get entity @s Pos[0]
execute store result storage elixir:data world_spawn.y int 1 run data get entity @s Pos[1]
execute store result storage elixir:data world_spawn.z int 1 run data get entity @s Pos[2]
tellraw @s [{text:"[Elixir of Life] ",color:"gold"},{text:"Revive spawn set to ",color:"gray"},{storage:"elixir:data",nbt:"world_spawn",color:"yellow"}]
