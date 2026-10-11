scoreboard players set #ahead_cd race.var 2400
function race:voice/human_ahead
execute as @r[tag=race.human,gamemode=survival] at @s run function race:sabotage/pick
