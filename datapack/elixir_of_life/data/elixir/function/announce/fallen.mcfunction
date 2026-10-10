# As the player who died. A cannon shot for everyone, then the announcer.
execute as @a at @s run playsound minecraft:entity.generic.explode master @s ~ ~ ~ 1 0.5 1
execute as @a at @s run playsound minecraft:entity.firework_rocket.large_blast_far master @s ~ ~ ~ 1 0.5 1
execute as @a at @s run playsound minecraft:item.trident.thunder master @s ~ ~ ~ 0.5 0.6 1
schedule function elixir:announce/cannon_echo 6t append
schedule function elixir:announce/fallen_voice 30t append

# Subtitle with an empty title: half the size of a title and just below the
# crosshair, so it doesn't block the view. The name goes in the action bar.
title @a times 10 70 20
title @a subtitle {text:"☠ A Champion Has Fallen ☠",color:"dark_red"}
title @a title ""
title @a actionbar [{selector:"@s",color:"gray"},{text:" has fallen",color:"dark_gray"}]
tellraw @a [{text:"☠ SYSTEM MESSAGE ☠ ",color:"dark_red",bold:true},{text:"A champion has fallen: ",color:"red"},{selector:"@s",color:"gray"}]
