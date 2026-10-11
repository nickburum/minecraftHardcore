# Macro: key, text. Plays one announcer line for everyone and shows it in chat.
$execute as @a at @s run playsound hpinv:announcer.$(key) master @s ~ ~ ~ 1 1 1
$tellraw @a [{text:"[SYSTEM] ",color:"aqua",bold:true},{text:"$(text)",color:"white"}]
