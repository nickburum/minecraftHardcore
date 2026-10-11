# As the player who killed the Ender Dragon.
scoreboard players set @s hpinv.dragon 0
function hpinv:voice/dragon
title @a times 10 120 30
title @a subtitle {text:"Beat Minecraft with a health inventory!",color:"yellow"}
title @a title {text:"CHALLENGE COMPLETE",color:"gold",bold:true}
execute as @a at @s run playsound minecraft:ui.toast.challenge_complete master @s ~ ~ ~ 1 1 1
summon minecraft:firework_rocket ~2 ~1 ~ {LifeTime:20,FireworksItem:{id:"minecraft:firework_rocket",components:{"minecraft:fireworks":{explosions:[{shape:"large_ball",colors:[I;16711680,16766720],has_trail:true,has_twinkle:true}]}}}}
summon minecraft:firework_rocket ~-2 ~1 ~ {LifeTime:28,FireworksItem:{id:"minecraft:firework_rocket",components:{"minecraft:fireworks":{explosions:[{shape:"star",colors:[I;16766720],has_twinkle:true}]}}}}
summon minecraft:firework_rocket ~ ~1 ~2 {LifeTime:36,FireworksItem:{id:"minecraft:firework_rocket",components:{"minecraft:fireworks":{explosions:[{shape:"burst",colors:[I;65535,16711935],has_trail:true}]}}}}
function hpinv:admin/stats
function hpinv:stop
