advancement revoke @s only hpinv:hurt_fall
execute if score #active hpinv.var matches 1 if entity @s[tag=hpinv.player] run function hpinv:voice/fall
