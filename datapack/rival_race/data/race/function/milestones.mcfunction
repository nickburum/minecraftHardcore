# Generated list: milestones use the game's own advancements, so the bot and humans are judged the same way.
execute if entity @s[advancements={minecraft:story/upgrade_tools=true},tag=!race.m1] run function race:milestone/reach {n:1,key:"stone",label:"Stone tools"}
execute if entity @s[advancements={minecraft:story/smelt_iron=true},tag=!race.m2] run function race:milestone/reach {n:2,key:"iron",label:"Iron"}
execute if entity @s[advancements={minecraft:story/obtain_armor=true},tag=!race.m3] run function race:milestone/reach {n:3,key:"armor",label:"Armor"}
execute if entity @s[advancements={minecraft:story/mine_diamond=true},tag=!race.m4] run function race:milestone/reach {n:4,key:"diamonds",label:"Diamonds"}
execute if entity @s[advancements={minecraft:story/enter_the_nether=true},tag=!race.m5] run function race:milestone/reach {n:5,key:"nether",label:"The Nether"}
execute if entity @s[advancements={minecraft:nether/obtain_blaze_rod=true},tag=!race.m6] run function race:milestone/reach {n:6,key:"blaze",label:"Blaze rod"}
execute if entity @s[advancements={minecraft:story/follow_ender_eye=true},tag=!race.m7] run function race:milestone/reach {n:7,key:"eye",label:"Eye of ender"}
execute if entity @s[advancements={minecraft:story/enter_the_end=true},tag=!race.m8] run function race:milestone/reach {n:8,key:"end",label:"The End"}
