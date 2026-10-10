# Macro: slot.
$item modify entity @s $(slot) elixir:refine
playsound minecraft:block.brewing_stand.brew player @s ~ ~ ~ 1 1.2
playsound minecraft:block.amethyst_block.chime player @s ~ ~ ~ 1 1.5
title @s actionbar {text:"You brewed an Elixir of Life.",color:"gold"}
