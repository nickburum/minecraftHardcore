# As a player who just died but still has lives left.
execute as @a at @s run playsound minecraft:block.respawn_anchor.deplete master @s ~ ~ ~ 1 0.8 1
execute as @a at @s run playsound minecraft:entity.wither.hurt master @s ~ ~ ~ 0.4 1.4 1
execute if score @s elixir.lives matches 2 run tellraw @a [{text:"☠ ",color:"yellow"},{selector:"@s"},{text:" lost a life. ",color:"gray"},{text:"2 lives left.",color:"yellow"}]
execute if score @s elixir.lives matches 1 run tellraw @a [{text:"☠ ",color:"red"},{selector:"@s"},{text:" lost a life. ",color:"gray"},{text:"Last life!",color:"red",bold:true}]
title @s times 10 70 20
title @s subtitle {text:"-1 life",color:"red"}
title @s title ""
