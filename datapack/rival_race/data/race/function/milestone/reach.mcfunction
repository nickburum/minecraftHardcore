# Macro: n, key, label. As the player who just reached a milestone.
$tag @s add race.m$(n)
scoreboard players add @s race.stage 1
$tellraw @a [{text:"[RACE] ",color:"aqua",bold:true},{selector:"@s",color:"yellow"},{text:" reached ",color:"gray"},{text:"$(label)",color:"white"}]
execute as @a at @s run playsound minecraft:entity.experience_orb.pickup master @s ~ ~ ~ 0.6 1.4 1
$execute if entity @s[tag=race.bot] run return run function race:voice/bot_$(key)
function race:voice/human_milestone
