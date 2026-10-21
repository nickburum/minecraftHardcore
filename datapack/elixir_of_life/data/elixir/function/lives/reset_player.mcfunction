# As a player from before the current epoch: back to 3 lives, and back in the game if they were out.
scoreboard players operation @s elixir.epoch = #epoch elixir.var
scoreboard players set @s elixir.lives 3
tag @s remove elixir.respawning
execute if entity @s[tag=elixir.fallen] run tag @s add elixir.restore
tag @s remove elixir.fallen
tellraw @s [{text:"[Three Lives] ",color:"gold",bold:true},{text:"You have ",color:"gray"},{text:"3 lives",color:"green"},{text:". Lose them all and you're out until someone gives up a life for you.",color:"gray"}]
