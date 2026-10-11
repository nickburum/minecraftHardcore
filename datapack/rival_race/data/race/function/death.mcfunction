scoreboard players reset @s race.deaths
execute if entity @s[tag=race.bot] run return run function race:voice/bot_death
function race:voice/human_death
