title @a times 0 20 5
title @a subtitle ""
title @a title {text:"2",color:"yellow",bold:true}
execute as @a at @s run playsound minecraft:block.note_block.pling master @s ~ ~ ~ 1 1 1
schedule function hpinv:countdown/1 20t replace
