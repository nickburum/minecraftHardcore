tag @s remove elixir.fallen
execute store result storage elixir:tmp entry.id int 1 run scoreboard players get @s elixir.id
function elixir:death/unregister with storage elixir:tmp entry
