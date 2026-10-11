# /function hpinv:start  Starts the challenge for everyone online, with an intro and countdown.
function hpinv:stop
scoreboard players set #active hpinv.var 0
tag @a add hpinv.player

# The challenge needs mobs and damage.
execute store result score #difficulty hpinv.var run difficulty
execute if score #difficulty hpinv.var matches 0 run tellraw @a {text:"[Challenge] Difficulty was Peaceful, so it's now Normal.",color:"gray"}
execute if score #difficulty hpinv.var matches 0 run difficulty normal

gamemode survival @a[tag=hpinv.player]
clear @a[tag=hpinv.player]
effect clear @a[tag=hpinv.player]
effect give @a[tag=hpinv.player] minecraft:instant_health 1 10 true
effect give @a[tag=hpinv.player] minecraft:saturation 1 20 true
tag @a remove hpinv.seen_nether
tag @a remove hpinv.seen_end
tag @a remove hpinv.seen_diamond
scoreboard players set @a[tag=hpinv.player] hpinv.prev 10
scoreboard players set @a[tag=hpinv.player] hpinv.lost 0
scoreboard players set @a[tag=hpinv.player] hpinv.drops 0
scoreboard players set @a[tag=hpinv.player] hpinv.deaths 0
scoreboard players set @a[tag=hpinv.player] hpinv.dragon 0
scoreboard players set @a[tag=hpinv.player] hpinv.diamond 0
scoreboard players set #ticks hpinv.var 0
scoreboard players set #deaths hpinv.var 0
scoreboard players set #cooldown hpinv.var 0

title @a times 10 50 10
title @a subtitle {text:"My health is my inventory",color:"red"}
title @a title {text:"Minecraft, but...",color:"gold",bold:true}
execute as @a at @s run playsound minecraft:block.beacon.activate master @s ~ ~ ~ 1 1.2 1
schedule function hpinv:countdown/3 70t replace
