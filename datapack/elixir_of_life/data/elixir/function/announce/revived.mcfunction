# As the revived player. Uses storage elixir:tmp target.name.
execute as @a at @s run playsound minecraft:block.beacon.activate master @s ~ ~ ~ 1 1.5 1
execute as @a at @s run playsound minecraft:block.amethyst_block.chime master @s ~ ~ ~ 1 1 1
execute as @a at @s run playsound minecraft:block.note_block.chime master @s ~ ~ ~ 0.8 1 1
schedule function elixir:announce/chime_2 4t append
schedule function elixir:announce/chime_3 8t append
schedule function elixir:announce/chime_4 12t append

data modify storage elixir:data voice_queue append value {name:""}
data modify storage elixir:data voice_queue[-1].name set from storage elixir:tmp target.name
schedule function elixir:announce/revived_voice 40t append

title @a times 10 70 20
title @a subtitle {text:"✦ A Resurrection Has Occurred ✦",color:"gold"}
title @a title ""
title @a actionbar [{selector:"@s",color:"yellow"},{text:" has returned to the realm",color:"white"}]
tellraw @a [{text:"✦ SYSTEM MESSAGE ✦ ",color:"gold",bold:true},{text:"A resurrection has occurred. The champion ",color:"yellow"},{selector:"@s",color:"white",bold:true},{text:" has returned to the realm.",color:"yellow"}]
