execute unless score #active race.var matches 1 run return 0
scoreboard players add #ticks race.var 1
execute if score #cooldown race.var matches 1.. run scoreboard players remove #cooldown race.var 1
execute if score #ahead_cd race.var matches 1.. run scoreboard players remove #ahead_cd race.var 1

# Once a second: who's who, milestones, and whether the human has pulled ahead.
scoreboard players operation #sec race.var = #ticks race.var
scoreboard players operation #sec race.var %= #20 race.var
execute if score #sec race.var matches 0 run function race:every_second

execute as @a[scores={race.deaths=1..}] at @s run function race:death
execute as @a[scores={race.dragon=1..}] at @s run return run function race:win

# The System's "help": a sabotage every 3 to 5 minutes.
execute if score #sabotage race.var matches 1 run scoreboard players remove #sab_timer race.var 1
execute if score #sab_timer race.var matches ..0 run function race:sabotage/scheduled
