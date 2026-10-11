# Macro: slot. Anything in the slot falls out, then the slot gets a lock.
$execute if items entity @s $(slot) * run function hpinv:lock/drop {slot:"$(slot)"}
$item replace entity @s $(slot) with minecraft:paper[minecraft:item_model="minecraft:barrier",minecraft:item_name={text:"Locked Slot",color:"red"},minecraft:lore=[{text:"Heal to unlock this slot.",color:"gray",italic:false}],minecraft:custom_data={hpinv_lock:true},minecraft:max_stack_size=1]
