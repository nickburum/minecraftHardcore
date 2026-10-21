# As the player who just died, at their death position. Every death costs a life.
scoreboard players reset @s elixir.deaths
scoreboard players remove @s elixir.lives 1
execute if score @s elixir.lives matches ..0 run return run function elixir:lives/out
tag @s add elixir.respawning
function elixir:announce/lost_life
