# Macro: bot. The bot gets race.bot, everyone else race.human.
tag @a remove race.bot
tag @a remove race.human
$tag $(bot) add race.bot
tag @a[tag=!race.bot] add race.human
