title @a times 0 20 5
title @a subtitle ""
title @a title {text:"3",color:"yellow",bold:true}
execute as @a at @s run playsound minecraft:block.note_block.pling master @s ~ ~ ~ 1 1 1
schedule function hpinv:countdown/2 20t replace
