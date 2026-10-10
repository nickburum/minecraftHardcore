# Macro: name. Message for the player who used the elixir.
$execute if entity @a[name=$(name),limit=1] run return run tellraw @s [{text:"The Elixir of Life takes hold. ",color:"gold"},{text:"$(name)",color:"yellow"},{text:" is returning to the realm.",color:"gold"}]
$tellraw @s [{text:"The Elixir of Life takes hold. ",color:"gold"},{text:"$(name)",color:"yellow"},{text:" is offline and will return the next time they join.",color:"gold"}]
