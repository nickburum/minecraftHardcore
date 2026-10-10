# Macro: reviver.
$title @s subtitle [{text:"$(reviver)",color:"yellow"},{text:" used an Elixir of Life",color:"gray"}]
$tellraw @s [{text:"\n✦ You have been revived! ✦\n",color:"gold",bold:true},{text:"$(reviver)",color:"yellow"},{text:" brought you back with an Elixir of Life.\nYou are protected from damage for 15 seconds.\n",color:"gray"}]
