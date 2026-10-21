#!/usr/bin/env python3
"""Runs every command in a data pack's functions through a live server's parser over RCON.

    python3 tests/parse_check.py <rcon port> datapack/<pack>

Macro lines get placeholder values. Commands run for real, so use a test server.
Commands that remove scoreboards, teams or storage are skipped.
Prints any command the server rejects as unparsable.
"""
import glob
import re
import subprocess
import sys
from pathlib import Path

port, pack = sys.argv[1], Path(sys.argv[2])
rcon = Path(__file__).with_name("rcon.py")
PLACEHOLDERS = {"slot": "hotbar.3", "key": "fall.1", "text": "Test line.", "n": "1", "label": "Test", "bot": "RivalBot", "name": "Steve", "id": "1",
                "dimension": "minecraft:overworld", "x": "0", "y": "64", "z": "0", "forced": "0b", "lives": "3", "have": "3", "after": "2",
                "reviver": "Alex", "buttons": '[{label:{text:"Steve"},action:{type:"minecraft:run_command",command:"trigger elixir.revive set 1"}}]'}
# Commands that would tear down what the others need (an uninstall function), so they aren't run.
SKIP = ("scoreboard objectives remove", "team remove", "data remove storage")
cmds = set()
for f in glob.glob(str(pack / "**" / "*.mcfunction"), recursive=True):
    for line in open(f, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith(SKIP):
            continue
        if line.startswith("$"):
            line = re.sub(r"\$\((\w+)\)", lambda m: PLACEHOLDERS.get(m.group(1), "x"), line[1:])
        cmds.add(line)
bad = []
for c in sorted(cmds):
    out = subprocess.run([sys.executable, str(rcon), port, c], capture_output=True, text=True).stdout
    reply = out.split("\n", 1)[1] if "\n" in out else out
    if re.search(r"Unknown|Incorrect|Expected|Invalid|<--\[HERE\]|Malformed|not a valid", reply):
        bad.append((c[:140], reply.strip()[:200]))
print(f"{len(cmds)} commands checked, {len(bad)} rejected")
for c, r in bad:
    print(" ", c, "\n    ->", r)
sys.exit(1 if bad else 0)
