scoreboard players set @s info.joined 1
function info:give
tellraw @s [{text:"Welcome! ",color:"gold"},{text:"Read the Server Info book in your inventory. Type ",color:"gray"},{text:"/info",color:"green"},{text:" any time for a new copy.",color:"gray"}]
