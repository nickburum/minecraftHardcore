# As a player who confirmed giving up a life. Score = id of the player who is out. Checks again,
# since things may have changed while the popup was open.
execute store result storage elixir:tmp req.id int 1 run scoreboard players get @s elixir.confirm
scoreboard players reset @s elixir.confirm
execute unless function elixir:revive/check run return 0

# Remember who gave the life, and where, in case the revived player has no spawn point.
function elixir:util/get_name
data modify storage elixir:tmp target.reviver set from storage elixir:tmp name
data modify storage elixir:tmp target.fallback.dimension set from entity @s Dimension
execute store result storage elixir:tmp target.fallback.x int 1 run data get entity @s Pos[0]
execute store result storage elixir:tmp target.fallback.y int 1 run data get entity @s Pos[1]
execute store result storage elixir:tmp target.fallback.z int 1 run data get entity @s Pos[2]

clear @s minecraft:carrot_on_a_stick[minecraft:custom_data~{elixir_of_life:true}] 1
scoreboard players remove @s elixir.lives 1
function elixir:revive/commit with storage elixir:tmp target

playsound minecraft:item.totem.use player @s ~ ~ ~ 0.6 1.6
playsound minecraft:block.respawn_anchor.deplete player @s ~ ~ ~ 0.8 1
function elixir:revive/feedback with storage elixir:tmp target
