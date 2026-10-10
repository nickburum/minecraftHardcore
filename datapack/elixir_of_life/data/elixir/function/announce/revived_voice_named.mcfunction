data remove storage elixir:tmp voice.key
function elixir:announce/lookup_voice with storage elixir:tmp voice
execute unless data storage elixir:tmp voice.key run return fail
function elixir:announce/play_named with storage elixir:tmp voice
return 1
