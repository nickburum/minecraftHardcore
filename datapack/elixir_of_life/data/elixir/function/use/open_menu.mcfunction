execute unless data storage elixir:data buttons[0] run return run function elixir:use/no_fallen
execute unless score @s elixir.lives matches 2.. run return run function elixir:use/last_life
scoreboard players enable @s elixir.revive
playsound minecraft:block.amethyst_block.resonate player @s ~ ~ ~ 0.8 1.4
function elixir:use/show_dialog with storage elixir:data
