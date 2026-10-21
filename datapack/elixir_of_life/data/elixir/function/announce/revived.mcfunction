# As the revived player. Uses storage elixir:tmp target.name.
execute unless data storage elixir:tmp target.reviver run data modify storage elixir:tmp target.reviver set value "An ally"
execute as @a at @s run playsound minecraft:block.beacon.activate master @s ~ ~ ~ 1 1.5 1
execute as @a at @s run playsound minecraft:block.amethyst_block.chime master @s ~ ~ ~ 1 1 1
execute as @a at @s run playsound minecraft:block.note_block.chime master @s ~ ~ ~ 0.8 1 1
schedule function elixir:announce/chime_2 4t append
schedule function elixir:announce/chime_3 8t append
schedule function elixir:announce/chime_4 12t append

title @a times 10 70 20
title @a subtitle {text:"✦ A Resurrection Has Occurred ✦",color:"gold"}
title @a title ""
title @a actionbar [{selector:"@s",color:"yellow"},{text:" has returned to the realm",color:"white"}]
function elixir:announce/revived_chat with storage elixir:tmp target
