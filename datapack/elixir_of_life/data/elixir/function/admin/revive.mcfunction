# Usage: /function elixir:admin/revive {name:"PlayerName"}
# Revives a player without using an elixir. Offline players return when they join.
$scoreboard players set $(name) elixir.pending 1
$tellraw @s [{text:"[Elixir of Life] ",color:"gold"},{text:"$(name)",color:"yellow"},{text:" will be revived.",color:"gray"}]
