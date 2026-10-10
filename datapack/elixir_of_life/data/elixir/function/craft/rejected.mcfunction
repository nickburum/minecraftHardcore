# Macro: slot.
$item replace entity @s $(slot) with minecraft:golden_apple
playsound minecraft:block.fire.extinguish player @s ~ ~ ~ 1 1
tellraw @s [{text:"The elixir curdles. ",color:"red"},{text:"It needs a Potion of Weakness. Your golden apple was returned.",color:"gray"}]
