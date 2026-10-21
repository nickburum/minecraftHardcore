#!/usr/bin/env python3
"""Builds the Server Info books.

Reads tools/info_book.json and writes two data packs:
  - datapack/server_info           the hardcore book (Three Lives, the elixir, voice chat)
  - datapack/server_info_creative  the creative server's book (voice chat only)
Both use the same `info` namespace, so first join, /trigger info and the /info mod work the
same way on both servers. Only give.mcfunction and pack.mcmeta differ; the creative pack's
other files are copied from server_info.

The Elixir of Life's tooltip is copied from the elixir_of_life data pack's own loot table, so
the book always shows exactly the item players get.

    python3 tools/make_info_book.py
"""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC = json.loads((ROOT / "tools" / "info_book.json").read_text())
HARDCORE_PACK = ROOT / "datapack" / "server_info"
CREATIVE_PACK = ROOT / "datapack" / "server_info_creative"
GIVE = Path("data") / "info" / "function" / "give.mcfunction"
ELIXIR = json.loads((ROOT / "datapack" / "elixir_of_life" / "data" / "elixir" / "loot_table" / "elixir_of_life.json").read_text())


def snbt(v):
    """JSON value -> SNBT (quoted keys are valid SNBT, booleans become 1b/0b)."""
    if isinstance(v, bool):
        return "1b" if v else "0b"
    if isinstance(v, dict):
        return "{" + ",".join(f'"{k}":{snbt(x)}' for k, x in v.items()) + "}"
    if isinstance(v, list):
        return "[" + ",".join(snbt(x) for x in v) + "]"
    if isinstance(v, str):
        return json.dumps(v)
    return str(v)


def item_hover(item_id, components=None):
    h = {"action": "show_item", "id": item_id, "count": 1}
    if components:
        h["components"] = components
    return h


elixir_components = ELIXIR["pools"][0]["entries"][0]["functions"][0]["components"]
weakness = {"minecraft:potion_contents": {"potion": "minecraft:weakness"}}

def t(text, **style):
    return {"text": text, **style}

def link(text, url, tip):
    return {"text": text, "color": "blue", "underlined": True,
            "click_event": {"action": "open_url", "url": url},
            "hover_event": {"action": "show_text", "value": tip}}

def item(text, item_id, components=None, color="dark_purple"):
    return {"text": text, "color": color, "underlined": True, "hover_event": item_hover(item_id, components)}

# Voice chat, step by step, for someone who has never installed a mod. Used in both books.
# It names no Minecraft version or mod version, so it stays right when the servers update.
voice_pages = [
    ["", t("Voice chat\n\n", bold=True, color="dark_blue"),
     t("Talk to nearby players with your mic. It's optional and takes about 5 minutes to set up.\n\n"),
     t("Java Edition on a computer only. The next pages show you how.", color="dark_gray")],
    ["", t("Step 1: Fabric\n\n", bold=True, color="dark_blue"),
     t("Fabric lets Minecraft use mods.\n\n"),
     link("Download Fabric", SPEC["fabric_url"], "Opens the Fabric installer page"),
     t(" and open it. Pick "), t("Client", bold=True),
     t(" and the same Minecraft version as this server (usually the newest), then "),
     t("Install", bold=True), t(".")],
    ["", t("Step 2: Run it once\n\n", bold=True, color="dark_blue"),
     t("Open the Minecraft Launcher. Next to Play, pick the new "),
     t("fabric-loader", bold=True), t(" profile. Play it once, then quit.\n\n"),
     t("This makes your mods folder.", color="dark_gray")],
    ["", t("Step 3: The mod\n\n", bold=True, color="dark_blue"),
     link("Get Simple Voice Chat", SPEC["voice_chat_url"], "Opens the download page"),
     t(". Click "), t("Download", bold=True), t(", pick "), t("Fabric", bold=True),
     t(" and the same Minecraft version, then download the file.")],
    ["", t("Step 4: Mods folder\n\n", bold=True, color="dark_blue"),
     t("In the Launcher, open "), t("Installations", bold=True),
     t(". Point at fabric-loader and click the folder icon.\n\n"),
     t("Open "), t("mods", bold=True), t(" and drop the downloaded file in.")],
    ["", t("Step 5: Talk\n\n", bold=True, color="dark_blue"),
     t("Play the fabric-loader profile and join.\n\nPress "), t("V", color="dark_green", bold=True),
     t(" to set up your mic. Allow microphone access if your computer asks.\n\n"),
     t("Hold "), t("Caps Lock", color="dark_green"), t(" to talk.")],
    ["", t("Voice chat tips\n\n", bold=True, color="dark_blue"),
     t("You hear players up to 48 blocks away.\n\n"),
     t("M", color="dark_green"), t(" mutes your mic.\n"),
     t("G", color="dark_green"), t(" makes a group, so friends can talk anywhere.\n\n"),
     t("Stuck? Ask in chat.", color="dark_gray")],
    ["", t("After an update\n\n", bold=True, color="dark_blue"),
     t("When the server moves to a new Minecraft version, do steps 1, 3 and 4 again with the new version.\n\n"),
     t("Delete the old voice chat file from mods first.", color="dark_gray")],
]

pages = [
    # Page 1: the three lives rule.
    ["", t("Three Lives\n", bold=True, color="dark_red"),
     t("This is hardcore with 3 lives. Every death costs one. Your name color shows how many you have:\n\n"),
     t("Green", color="dark_green", bold=True), t(" 3 lives\n"),
     t("Yellow", color="gold", bold=True), t(" 2 lives\n"),
     t("Red", color="red", bold=True), t(" last life\n"),
     t("Gray", color="dark_gray", bold=True), t(" out")],
    # Page 2: dying.
    ["", t("When you die\n\n", bold=True, color="dark_red"),
     t("Click "), t("Spectate World", italic=True),
     t(". You come back at your bed (or spawn) on your next life.\n\n"),
     t("Lose your last life and you're out: a spectator until a friend gives up a life for you.")],
    # Page 3: the Elixir of Life recipe.
    ["", t("Elixir of Life\n\n", bold=True, color="dark_purple"),
     item("Elixir of Life", "minecraft:carrot_on_a_stick", elixir_components),
     t("\n\n= "),
     item("Golden Apple", "minecraft:golden_apple", None, color="gold"),
     t("\n+ "),
     item("Potion of Weakness", "minecraft:potion", weakness, color="dark_aqua"),
     t("\n\nAny crafting grid. Hover over the names to see the items.", color="dark_gray")],
    # Page 4: saving someone.
    ["", t("Saving a friend\n\n", bold=True, color="dark_purple"),
     t("Hold the "), item("Elixir", "minecraft:carrot_on_a_stick", elixir_components),
     t(", right-click, pick who to bring back and confirm.\n\n"),
     t("It costs one of YOUR lives", color="red"),
     t(", so you need at least 2. They come back on their last life.")],
    # Pages 5 on: voice chat, step by step.
    *voice_pages,
    # Last page: good to know.
    ["", t("Good to know\n\n", bold=True, color="dark_red"),
     t("/info", color="dark_green"), t(" gives you this book again.\n\n"),
     t("Everyone's lives are shown in the tab list.\n\n"),
     t("Craft the elixir with the wrong potion and you just get the golden apple back.", color="dark_gray")],
]

# The creative server's book: only voice chat.
creative_pages = [
    *voice_pages,
    ["", t("Good to know\n\n", bold=True, color="dark_blue"),
     t("/info", color="dark_green"), t(" gives you this book again.")],
]


def check_fits(name, pages):
    """Warn if a page probably runs past the 14 lines a book page shows (about 19 characters a line)."""
    import textwrap
    for i, page in enumerate(pages, 1):
        text = "".join(c["text"] for c in page[1:] if isinstance(c, dict))
        lines = sum(max(1, len(textwrap.wrap(par, 19))) for par in text.split("\n"))
        if lines > 14:
            print(f"WARNING: {name} page {i} is about {lines} lines; a book page shows 14")


def write_give(pack, pages):
    content = {"title": SPEC["title"], "author": SPEC["author"], "pages": pages}
    out = pack / GIVE
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        "# Generated by tools/make_info_book.py from tools/info_book.json. Gives the executing player the Server Info book.\n"
        f"give @s minecraft:written_book[minecraft:written_book_content={snbt(content)}]\n"
    )
    print(f"wrote {out.relative_to(ROOT)} ({len(pages)} pages)")


check_fits("hardcore", pages)
check_fits("creative", creative_pages)
write_give(HARDCORE_PACK, pages)

# The creative pack: the same functions as server_info, its own book and description.
for f in HARDCORE_PACK.rglob("*"):
    rel = f.relative_to(HARDCORE_PACK)
    if f.is_file() and rel != GIVE and rel.name != "pack.mcmeta":
        (CREATIVE_PACK / rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(f, CREATIVE_PACK / rel)
meta = json.loads((HARDCORE_PACK / "pack.mcmeta").read_text())
meta["pack"]["description"] = [
    {"text": "Server Info (creative)", "color": "gold", "bold": True},
    {"text": "\nThe /info book: voice chat", "color": "gray"},
]
(CREATIVE_PACK / "pack.mcmeta").write_text(json.dumps(meta, indent=2) + "\n")
write_give(CREATIVE_PACK, creative_pages)
