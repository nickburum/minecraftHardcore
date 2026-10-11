# /function race:start  Fresh race for everyone online: advancements reset, scoreboard on the sidebar.
function race:stop
function race:tag_players with storage race:cfg
advancement revoke @a everything
scoreboard players reset * race.stage
execute as @a run scoreboard players set @s race.stage 0
scoreboard players set @a race.deaths 0
scoreboard players set @a race.dragon 0
tag @a remove race.m1
tag @a remove race.m2
tag @a remove race.m3
tag @a remove race.m4
tag @a remove race.m5
tag @a remove race.m6
tag @a remove race.m7
tag @a remove race.m8
scoreboard objectives setdisplay sidebar race.stage
scoreboard players set #ticks race.var 0
scoreboard players set #cooldown race.var 0
scoreboard players set #ahead_cd race.var 0
execute store result score #sab_timer race.var run random value 3600..6000
title @a times 10 50 10
title @a subtitle {text:"First to kill the Ender Dragon wins",color:"gray"}
title @a title {text:"Race the Bot",color:"aqua",bold:true}
execute as @a at @s run playsound minecraft:block.beacon.activate master @s ~ ~ ~ 1 1.2 1
schedule function race:countdown/3 70t replace
