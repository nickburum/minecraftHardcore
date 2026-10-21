# As the player who just lost their last life. A cannon shot for everyone.
execute as @a at @s run playsound minecraft:entity.generic.explode master @s ~ ~ ~ 1 0.5 1
execute as @a at @s run playsound minecraft:entity.firework_rocket.large_blast_far master @s ~ ~ ~ 1 0.5 1
execute as @a at @s run playsound minecraft:item.trident.thunder master @s ~ ~ ~ 0.5 0.6 1
schedule function elixir:announce/cannon_echo 6t append

# Subtitle with an empty title: half the size of a title and just below the
# crosshair, so it doesn't block the view. The name goes in the action bar.
title @a times 10 70 20
title @a subtitle {text:"☠ A Champion Has Fallen ☠",color:"dark_red"}
title @a title ""
title @a actionbar [{selector:"@s",color:"gray"},{text:" is out of lives",color:"dark_gray"}]
tellraw @a [{text:"☠ A CHAMPION HAS FALLEN ☠ ",color:"dark_red",bold:true},{selector:"@s",color:"gray"},{text:" is out of lives. Anyone with 2 or more lives can give one up with an Elixir of Life to bring them back.",color:"red"}]
