# First time a player joins: hand them the book.
execute as @a unless score @s info.joined matches 1 run function info:first_join
# /trigger info
execute as @a[scores={info=1..}] run function info:give
scoreboard players reset @a[scores={info=1..}] info
scoreboard players enable @a info
