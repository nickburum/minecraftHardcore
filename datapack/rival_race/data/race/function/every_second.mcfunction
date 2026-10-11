function race:tag_players with storage race:cfg
execute as @a run function race:milestones
# Is any human ahead of the bot?
scoreboard players set #bot race.var 0
scoreboard players set #human race.var 0
execute as @a[tag=race.bot] run scoreboard players operation #bot race.var > @s race.stage
execute as @a[tag=race.human] run scoreboard players operation #human race.var > @s race.stage
execute if score #human race.var > #bot race.var if score #ahead_cd race.var matches 0 if score #sabotage race.var matches 1 run function race:human_ahead
