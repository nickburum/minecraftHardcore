# As a player who was out before the switch to three lives, now alive (spectating). Bring them back.
tag @s remove elixir.restore
gamemode survival @s
function elixir:revive/teleport
function elixir:revive/protect
title @s times 10 70 20
title @s subtitle {text:"✦ You're back: 3 lives ✦",color:"green"}
title @s title ""
