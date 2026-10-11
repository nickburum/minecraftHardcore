# Generated layout: 10 hearts = 10 slots.
# hotbar.0 is always open; hotbar.N locks below N+1 hearts; the offhand locks below 10 hearts.
# The 27 backpack slots are always locked.
execute if score @s hpinv.hearts matches ..1 unless items entity @s hotbar.1 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"hotbar.1"}
execute unless score @s hpinv.hearts matches ..1 if items entity @s hotbar.1 *[minecraft:custom_data~{hpinv_lock:true}] run item replace entity @s hotbar.1 with minecraft:air
execute if score @s hpinv.hearts matches ..2 unless items entity @s hotbar.2 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"hotbar.2"}
execute unless score @s hpinv.hearts matches ..2 if items entity @s hotbar.2 *[minecraft:custom_data~{hpinv_lock:true}] run item replace entity @s hotbar.2 with minecraft:air
execute if score @s hpinv.hearts matches ..3 unless items entity @s hotbar.3 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"hotbar.3"}
execute unless score @s hpinv.hearts matches ..3 if items entity @s hotbar.3 *[minecraft:custom_data~{hpinv_lock:true}] run item replace entity @s hotbar.3 with minecraft:air
execute if score @s hpinv.hearts matches ..4 unless items entity @s hotbar.4 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"hotbar.4"}
execute unless score @s hpinv.hearts matches ..4 if items entity @s hotbar.4 *[minecraft:custom_data~{hpinv_lock:true}] run item replace entity @s hotbar.4 with minecraft:air
execute if score @s hpinv.hearts matches ..5 unless items entity @s hotbar.5 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"hotbar.5"}
execute unless score @s hpinv.hearts matches ..5 if items entity @s hotbar.5 *[minecraft:custom_data~{hpinv_lock:true}] run item replace entity @s hotbar.5 with minecraft:air
execute if score @s hpinv.hearts matches ..6 unless items entity @s hotbar.6 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"hotbar.6"}
execute unless score @s hpinv.hearts matches ..6 if items entity @s hotbar.6 *[minecraft:custom_data~{hpinv_lock:true}] run item replace entity @s hotbar.6 with minecraft:air
execute if score @s hpinv.hearts matches ..7 unless items entity @s hotbar.7 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"hotbar.7"}
execute unless score @s hpinv.hearts matches ..7 if items entity @s hotbar.7 *[minecraft:custom_data~{hpinv_lock:true}] run item replace entity @s hotbar.7 with minecraft:air
execute if score @s hpinv.hearts matches ..8 unless items entity @s hotbar.8 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"hotbar.8"}
execute unless score @s hpinv.hearts matches ..8 if items entity @s hotbar.8 *[minecraft:custom_data~{hpinv_lock:true}] run item replace entity @s hotbar.8 with minecraft:air
execute if score @s hpinv.hearts matches ..9 unless items entity @s weapon.offhand *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"weapon.offhand"}
execute unless score @s hpinv.hearts matches ..9 if items entity @s weapon.offhand *[minecraft:custom_data~{hpinv_lock:true}] run item replace entity @s weapon.offhand with minecraft:air
execute unless items entity @s inventory.0 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.0"}
execute unless items entity @s inventory.1 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.1"}
execute unless items entity @s inventory.2 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.2"}
execute unless items entity @s inventory.3 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.3"}
execute unless items entity @s inventory.4 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.4"}
execute unless items entity @s inventory.5 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.5"}
execute unless items entity @s inventory.6 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.6"}
execute unless items entity @s inventory.7 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.7"}
execute unless items entity @s inventory.8 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.8"}
execute unless items entity @s inventory.9 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.9"}
execute unless items entity @s inventory.10 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.10"}
execute unless items entity @s inventory.11 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.11"}
execute unless items entity @s inventory.12 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.12"}
execute unless items entity @s inventory.13 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.13"}
execute unless items entity @s inventory.14 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.14"}
execute unless items entity @s inventory.15 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.15"}
execute unless items entity @s inventory.16 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.16"}
execute unless items entity @s inventory.17 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.17"}
execute unless items entity @s inventory.18 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.18"}
execute unless items entity @s inventory.19 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.19"}
execute unless items entity @s inventory.20 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.20"}
execute unless items entity @s inventory.21 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.21"}
execute unless items entity @s inventory.22 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.22"}
execute unless items entity @s inventory.23 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.23"}
execute unless items entity @s inventory.24 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.24"}
execute unless items entity @s inventory.25 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.25"}
execute unless items entity @s inventory.26 *[minecraft:custom_data~{hpinv_lock:true}] run function hpinv:lock/apply {slot:"inventory.26"}
