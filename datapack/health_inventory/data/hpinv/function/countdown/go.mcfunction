title @a times 0 30 10
title @a subtitle {text:"10 hearts = 10 slots. Beat the game!",color:"gray"}
title @a title {text:"GO!",color:"green",bold:true}
execute as @a at @s run playsound minecraft:block.note_block.pling master @s ~ ~ ~ 1 2 1
scoreboard players set #active hpinv.var 1
function hpinv:voice/start
