scoreboard players operation #diff hpinv.var = @s hpinv.prev
scoreboard players operation #diff hpinv.var -= @s hpinv.hearts
scoreboard players operation @s hpinv.lost += #diff hpinv.var
playsound minecraft:block.iron_door.close player @s ~ ~ ~ 0.8 1.6
execute if score @s hpinv.hearts matches 1 run return run function hpinv:voice/one_heart
execute if score @s hpinv.dropflag matches 1 run return run function hpinv:voice/item_dropped
function hpinv:voice/slot_lost
