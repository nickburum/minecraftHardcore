title @a times 0 30 10
title @a subtitle ""
title @a title {text:"GO!",color:"green",bold:true}
execute as @a at @s run playsound minecraft:block.note_block.pling master @s ~ ~ ~ 1 2 1
scoreboard players set #active race.var 1
function race:voice/start
