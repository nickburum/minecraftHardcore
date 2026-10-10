# Elixir of Life: setup. Runs on every /reload and server start.
scoreboard objectives add elixir.deaths deathCount
scoreboard objectives add elixir.use minecraft.used:minecraft.carrot_on_a_stick
scoreboard objectives add elixir.revive trigger
scoreboard objectives add elixir.pending dummy
scoreboard objectives add elixir.id dummy
scoreboard objectives add elixir.var dummy

execute unless data storage elixir:data fallen run data modify storage elixir:data fallen set value []
execute unless data storage elixir:data buttons run data modify storage elixir:data buttons set value []
execute unless data storage elixir:data pending run data modify storage elixir:data pending set value []
execute unless data storage elixir:data voice_queue run data modify storage elixir:data voice_queue set value []

function elixir:announce/voice_map

execute unless score #installed elixir.var matches 1 run tellraw @a [{text:"[Elixir of Life] ",color:"gold"},{text:"Installed. Operators: stand at world spawn and run ",color:"gray"},{text:"/function elixir:admin/set_world_spawn",color:"yellow"}]
scoreboard players set #installed elixir.var 1
