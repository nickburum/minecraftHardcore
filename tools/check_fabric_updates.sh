#!/bin/bash
# Checks for newer Fabric loader, Fabric API and Simple Voice Chat builds for the Minecraft
# version the server already runs, and downloads them (hash-checked) into a staging folder.
#
# It never stops the server, never replaces files in the server folder, and never changes the
# Minecraft version. Applying an update is a separate, manual step (see the end of the output).
#
#   tools/check_fabric_updates.sh [server dir] [staging dir]
#   defaults: ~/vanilla  ~/fabric-updates
#
# Needs curl and python3. Safe to run from cron once the owner has approved it.
set -euo pipefail
SERVER_DIR="${1:-$HOME/vanilla}"
STAGING="${2:-$HOME/fabric-updates}"
# Modrinth release channels to accept. Simple Voice Chat only ships "beta" builds for some versions.
CHANNELS="${CHANNELS:-release,beta}"
UA="minecraftHardcore-update-check (github.com/nickburum/minecraftHardcore)"

log() { echo "[$(date '+%F %T')] $*"; }

# The Minecraft version comes from the Fabric install itself (.fabric/server/<mc>-server.jar).
MC="$(ls "$SERVER_DIR"/.fabric/server/*-server.jar 2>/dev/null | sed -E 's#.*/([^/]+)-server\.jar#\1#' | sort -V | tail -1 || true)"
if [ -z "$MC" ]; then log "No Fabric install found in $SERVER_DIR (.fabric/server missing). Start the Fabric server once first."; exit 1; fi
log "Server folder: $SERVER_DIR   Minecraft: $MC   Staging: $STAGING"
mkdir -p "$STAGING"

python3 - "$MC" "$SERVER_DIR" "$STAGING" "$CHANNELS" "$UA" <<'PY'
import hashlib, json, os, sys, urllib.request
from urllib.parse import unquote
from pathlib import Path

mc, server_dir, staging, channels, ua = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4].split(","), sys.argv[5]

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": ua})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def download(url, dest, sha512=None):
    if dest.exists():
        print(f"  already staged: {dest.name}")
        return
    data = get(url)
    if sha512 and hashlib.sha512(data).hexdigest() != sha512:
        raise SystemExit(f"  HASH MISMATCH for {dest.name}; not saved")
    tmp = dest.with_suffix(".part")
    tmp.write_bytes(data)
    tmp.rename(dest)
    print(f"  downloaded {dest.name}" + (" (sha512 verified)" if sha512 else ""))

updates = []

# Fabric loader + installer: the server launcher jar from meta.fabricmc.net.
loaders = json.loads(get(f"https://meta.fabricmc.net/v2/versions/loader/{mc}"))
loader = next(l["loader"]["version"] for l in loaders if l["loader"].get("stable", True))
installer = next(i["version"] for i in json.loads(get("https://meta.fabricmc.net/v2/versions/installer")) if i.get("stable"))
current_loader = sorted(p.name for p in (server_dir / "libraries/net/fabricmc/fabric-loader").glob("*")) if (server_dir / "libraries/net/fabricmc/fabric-loader").exists() else []
print(f"Fabric loader: installed {', '.join(current_loader) or 'unknown'}, latest stable {loader} (installer {installer})")
if loader not in current_loader:
    name = f"fabric-server-mc.{mc}-loader.{loader}-launcher.{installer}.jar"
    download(f"https://meta.fabricmc.net/v2/versions/loader/{mc}/{loader}/{installer}/server/jar", staging / name)
    updates.append(f"Fabric loader {loader}: replace the server launcher jar with {name}")

# Mods from Modrinth: newest build for this Minecraft version on Fabric.
mods_dir = server_dir / "mods"
# (Modrinth project, label, file name prefix of its jars)
for project, label, prefix in [("fabric-api", "Fabric API", "fabric-api-"), ("simple-voice-chat", "Simple Voice Chat", "voicechat-")]:
    versions = json.loads(get(f"https://api.modrinth.com/v2/project/{project}/version?game_versions=%5B%22{mc}%22%5D&loaders=%5B%22fabric%22%5D"))
    versions = [v for v in versions if v["version_type"] in channels]
    if not versions:
        print(f"{label}: no {'/'.join(channels)} build for {mc}")
        continue
    v = versions[0]
    f = next(x for x in v["files"] if x.get("primary")) if any(x.get("primary") for x in v["files"]) else v["files"][0]
    # unquote: a jar downloaded straight from its URL can be named ...%2B26.3.jar instead of ...+26.3.jar
    installed = sorted(unquote(p.name) for p in mods_dir.glob("*.jar") if p.name.startswith(prefix)) if mods_dir.exists() else []
    print(f"{label}: installed {', '.join(installed) or 'none'}, latest {v['version_number']} ({v['version_type']})")
    if f["filename"] not in installed:
        download(f["url"], staging / f["filename"], f["hashes"]["sha512"])
        updates.append(f"{label} {v['version_number']}: swap {', '.join(installed) or '(not installed)'} for {f['filename']}")

print()
if updates:
    print("Updates staged in", staging)
    for u in updates:
        print("  -", u)
    print("To apply: ask the owner, check for players, stop the server, back up mods/ and the launcher jar,")
    print("copy the staged files in, remove the replaced ones, start the server, and check the log.")
else:
    print("Everything is up to date.")
PY
