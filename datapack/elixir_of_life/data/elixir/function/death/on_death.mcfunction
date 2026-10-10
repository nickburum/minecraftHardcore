# As the player who just died, at their death position.
scoreboard players reset @s elixir.deaths
tag @s add elixir.fallen

function elixir:util/get_name
execute store result storage elixir:tmp entry.id int 1 run scoreboard players get @s elixir.id
data modify storage elixir:tmp entry.name set from storage elixir:tmp name
function elixir:death/register with storage elixir:tmp entry

function elixir:announce/fallen
