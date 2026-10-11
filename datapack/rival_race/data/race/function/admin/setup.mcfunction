# Usage: /function race:admin/setup {bot:"RivalBot"}   Sets which player is the bot.
$data modify storage race:cfg bot set value "$(bot)"
$tellraw @s [{text:"[Race] ",color:"aqua"},{text:"The bot is ",color:"gray"},{text:"$(bot)",color:"yellow"}]
