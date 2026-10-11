# Only when they can survive the landing (8 blocks, about 2.5 hearts).
execute unless entity @s[nbt={OnGround:1b}] run return run function race:sabotage/blind
execute store result score #hp race.var run data get entity @s Health
execute if score #hp race.var matches ..13 run return run function race:sabotage/blind
function race:voice/sabotage_launch
tp @s ~ ~8 ~
playsound minecraft:entity.firework_rocket.launch master @s ~ ~ ~ 1 1
