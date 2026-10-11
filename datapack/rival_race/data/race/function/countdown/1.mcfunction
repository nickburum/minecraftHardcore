title @a times 0 20 5
title @a subtitle ""
title @a title {text:"1",color:"yellow",bold:true}
execute as @a at @s run playsound minecraft:block.note_block.pling master @s ~ ~ ~ 1 1 1
schedule function race:countdown/go 20t replace
