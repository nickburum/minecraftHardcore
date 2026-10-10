# As a player who pressed a revive button. Score = id of the fallen player.
execute store result storage elixir:tmp req.id int 1 run scoreboard players get @s elixir.revive
scoreboard players reset @s elixir.revive

execute unless function elixir:revive/has_elixir run return run tellraw @s {text:"You need an Elixir of Life in your inventory.",color:"red"}

data remove storage elixir:tmp target
function elixir:revive/find_fallen with storage elixir:tmp req
execute unless data storage elixir:tmp target run return run tellraw @s {text:"That champion has already returned to the realm.",color:"red"}

# Remember who revived them, and where, in case they have no spawn point.
function elixir:util/get_name
data modify storage elixir:tmp target.reviver set from storage elixir:tmp name
data modify storage elixir:tmp target.fallback.dimension set from entity @s Dimension
execute store result storage elixir:tmp target.fallback.x int 1 run data get entity @s Pos[0]
execute store result storage elixir:tmp target.fallback.y int 1 run data get entity @s Pos[1]
execute store result storage elixir:tmp target.fallback.z int 1 run data get entity @s Pos[2]

clear @s minecraft:carrot_on_a_stick[minecraft:custom_data~{elixir_of_life:true}] 1
function elixir:revive/commit with storage elixir:tmp target

playsound minecraft:item.totem.use player @s ~ ~ ~ 0.6 1.6
function elixir:revive/feedback with storage elixir:tmp target
