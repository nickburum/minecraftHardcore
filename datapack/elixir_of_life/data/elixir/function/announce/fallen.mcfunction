# As the player who died. A cannon shot for everyone, then the announcer.
execute as @a at @s run playsound minecraft:entity.generic.explode master @s ~ ~ ~ 1 0.5
execute as @a at @s run playsound minecraft:entity.firework_rocket.large_blast_far master @s ~ ~ ~ 1 0.5
execute as @a at @s run playsound minecraft:item.trident.thunder master @s ~ ~ ~ 0.5 0.6
schedule function elixir:announce/cannon_echo 6t append
schedule function elixir:announce/fallen_voice 30t append

title @a times 10 80 20
title @a title {text:"A Champion Has Fallen",color:"dark_red",bold:true}
title @a subtitle {selector:"@s",color:"gray"}
tellraw @a [{text:"☠ SYSTEM MESSAGE ☠ ",color:"dark_red",bold:true},{text:"A champion has fallen: ",color:"red"},{selector:"@s",color:"gray"}]
