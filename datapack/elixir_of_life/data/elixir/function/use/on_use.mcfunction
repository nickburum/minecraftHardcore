# As a player who used a carrot on a stick this tick.
scoreboard players reset @s elixir.use
execute if items entity @s weapon.mainhand *[minecraft:custom_data~{elixir_of_life:true}] run return run function elixir:use/open_menu
execute if items entity @s weapon.offhand *[minecraft:custom_data~{elixir_of_life:true}] run return run function elixir:use/open_menu
execute if items entity @s weapon.mainhand *[minecraft:custom_data~{elixir_raw:true}] run return run function elixir:use/unrefined
execute if items entity @s weapon.offhand *[minecraft:custom_data~{elixir_raw:true}] run return run function elixir:use/unrefined
