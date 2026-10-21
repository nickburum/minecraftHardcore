# Three Lives + Elixir of Life: setup. Runs on every /reload and server start.
scoreboard objectives add elixir.deaths deathCount
scoreboard objectives add elixir.use minecraft.used:minecraft.carrot_on_a_stick
scoreboard objectives add elixir.revive trigger
scoreboard objectives add elixir.confirm trigger
scoreboard objectives add elixir.pending dummy
scoreboard objectives add elixir.id dummy
scoreboard objectives add elixir.var dummy
scoreboard objectives add elixir.epoch dummy
scoreboard objectives add elixir.lives dummy {text:"❤ Lives",color:"red"}
# Lives show next to names in the tab list.
scoreboard objectives setdisplay list elixir.lives

# Name colors: green 3 lives, yellow 2, red 1, gray when out.
team add elixir.l3 {text:"3 lives"}
team add elixir.l2 {text:"2 lives"}
team add elixir.l1 {text:"1 life"}
team add elixir.out {text:"Out"}
team modify elixir.l3 color green
team modify elixir.l2 color yellow
team modify elixir.l1 color red
team modify elixir.out color gray

execute unless data storage elixir:data fallen run data modify storage elixir:data fallen set value []
execute unless data storage elixir:data buttons run data modify storage elixir:data buttons set value []
execute unless data storage elixir:data pending run data modify storage elixir:data pending set value []
data remove storage elixir:data voice_queue

# Epoch 2 = the switch to three lives: everyone, including the dead, starts again with 3.
# Players are reset the next time they're online (lives/reset_player).
execute unless score #epoch elixir.var matches 2.. run function elixir:lives/new_epoch

execute unless score #installed elixir.var matches 1 run tellraw @a [{text:"[Elixir of Life] ",color:"gold"},{text:"Installed. Operators: stand at world spawn and run ",color:"gray"},{text:"/function elixir:admin/set_world_spawn",color:"yellow"}]
scoreboard players set #installed elixir.var 1
