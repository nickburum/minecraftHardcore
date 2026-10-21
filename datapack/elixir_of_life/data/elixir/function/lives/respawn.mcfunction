# As a player who died with lives left, now alive again. In hardcore they come back as a
# spectator at their spawn point (bed or world spawn): put them back in survival right there.
tag @s remove elixir.respawning
gamemode survival @s
function elixir:revive/protect
title @s times 10 70 20
execute if score @s elixir.lives matches 2 run title @s subtitle {text:"2 lives left",color:"yellow"}
execute if score @s elixir.lives matches 1 run title @s subtitle {text:"Last life. Be careful.",color:"red"}
title @s title ""
