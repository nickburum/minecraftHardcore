# Writes the executing player's name to storage elixir:tmp name.
# Uses a player head loot table and reads the name from its profile.
data remove storage elixir:tmp name
summon minecraft:item_display ~ ~ ~ {Tags:["elixir.probe"]}
loot replace entity @n[type=minecraft:item_display,tag=elixir.probe] contents loot elixir:player_head
data modify storage elixir:tmp name set from entity @n[type=minecraft:item_display,tag=elixir.probe] item.components."minecraft:profile".name
kill @e[type=minecraft:item_display,tag=elixir.probe]
