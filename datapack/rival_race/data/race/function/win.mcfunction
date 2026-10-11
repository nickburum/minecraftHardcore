# As the player who killed the Ender Dragon.
scoreboard players set @s race.dragon 0
title @a times 10 120 30
title @a subtitle [{selector:"@s",color:"yellow"},{text:" killed the Ender Dragon",color:"gray"}]
execute if entity @s[tag=race.bot] run title @a title {text:"THE BOT WINS",color:"red",bold:true}
execute if entity @s[tag=race.human] run title @a title {text:"HUMANS WIN",color:"green",bold:true}
execute if entity @s[tag=race.bot] run function race:voice/win_bot
execute if entity @s[tag=race.human] run function race:voice/win_human
execute as @a at @s run playsound minecraft:ui.toast.challenge_complete master @s ~ ~ ~ 1 1 1
function race:stop
