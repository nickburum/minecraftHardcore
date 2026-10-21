# As a player who picked a name in the revive menu. Score = id of the player who is out.
# Checks everything, then asks them to confirm giving up a life.
execute store result storage elixir:tmp req.id int 1 run scoreboard players get @s elixir.revive
scoreboard players reset @s elixir.revive
execute unless function elixir:revive/check run return 0
execute store result storage elixir:tmp target.have int 1 run scoreboard players get @s elixir.lives
execute store result storage elixir:tmp target.after int 1 run scoreboard players remove @s elixir.lives 1
scoreboard players add @s elixir.lives 1
scoreboard players enable @s elixir.confirm
function elixir:revive/show_confirm with storage elixir:tmp target
