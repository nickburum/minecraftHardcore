# Macro: dimension, x, y, z, forced.
# Spawn point set with /spawnpoint: use it as is.
$execute if data storage elixir:tmp spawn{forced:1b} in $(dimension) positioned $(x) $(y) $(z) align xyz run return run tp @s ~0.5 ~ ~0.5
# Chunk not loaded, so the block can't be checked: trust the saved spawn point.
$execute in $(dimension) positioned $(x) $(y) $(z) align xyz unless loaded ~ ~ ~ run return run tp @s ~0.5 ~0.6 ~0.5
$execute in $(dimension) positioned $(x) $(y) $(z) align xyz if block ~ ~ ~ #minecraft:beds run return run tp @s ~0.5 ~0.6 ~0.5
$execute in $(dimension) positioned $(x) $(y) $(z) align xyz if block ~ ~ ~ minecraft:respawn_anchor run return run tp @s ~0.5 ~1 ~0.5
# The bed or anchor is gone: fall back to the world spawn.
return fail
