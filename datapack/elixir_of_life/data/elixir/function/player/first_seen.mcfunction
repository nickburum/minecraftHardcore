scoreboard players add #next_id elixir.var 1
scoreboard players operation @s elixir.id = #next_id elixir.var
scoreboard players set @s elixir.lives 3
scoreboard players operation @s elixir.epoch = #epoch elixir.var
recipe give @s elixir:elixir_of_life
