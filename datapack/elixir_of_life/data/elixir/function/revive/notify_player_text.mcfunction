# Macro: reviver.
title @s subtitle {text:"✦ You Have Been Revived ✦",color:"gold"}
title @s title ""
$title @s actionbar [{text:"$(reviver)",color:"yellow"},{text:" gave up a life for you",color:"gray"}]
$tellraw @s [{text:"\n✦ You have been revived! ✦\n",color:"gold",bold:true},{text:"$(reviver)",color:"yellow"},{text:" gave up one of their lives to bring you back.\nYou are on your last life. You are protected from damage for 15 seconds.\n",color:"gray"}]
