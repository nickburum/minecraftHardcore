# Macro: reviver.
title @s subtitle {text:"✦ You Have Been Revived ✦",color:"gold"}
title @s title ""
$title @s actionbar [{text:"$(reviver)",color:"yellow"},{text:" used an Elixir of Life on you",color:"gray"}]
$tellraw @s [{text:"\n✦ You have been revived! ✦\n",color:"gold",bold:true},{text:"$(reviver)",color:"yellow"},{text:" brought you back with an Elixir of Life.\nYou are protected from damage for 15 seconds.\n",color:"gray"}]
