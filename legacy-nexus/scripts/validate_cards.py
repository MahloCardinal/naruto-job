import json, collections, pathlib

p = pathlib.Path(__file__).resolve().parents[1] / "data" / "cards.json"
db = json.loads(p.read_text(encoding="utf-8"))
cards = db["cards"]
ids = [c["id"] for c in cards]
assert len(cards) == db["total"] == 290
assert len(ids) == len(set(ids)), "ID duplicati"
assert all(all(c.get(k) for k in ("id", "name", "rarity", "url")) for c in cards), "Campi obbligatori mancanti"
counts = collections.Counter(str(c["season"]) for c in cards)
expected = {"1": 85, "2": 100, "3": 100, "Event": 5}
assert dict(counts) == expected, (dict(counts), expected)
print("OK: 290 carte, ID univoci, campi obbligatori presenti.")
print("Distribuzione:", dict(counts))
