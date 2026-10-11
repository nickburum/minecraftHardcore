# As a challenge player who just died.
scoreboard players reset @s hpinv.deaths
scoreboard players add #deaths hpinv.var 1
# They respawn with full hearts; don't announce that as "slots regained".
scoreboard players set @s hpinv.prev 10
function hpinv:voice/death
