import json
import psycopg
from pathlib import Path


def normalize_level(value):
    if value is None:
        return "OTHER"

    raw = str(value).strip().upper()

    mapping = {
        "1": "N1",
        "2": "N2",
        "3": "N3",
        "4": "N4",
        "5": "N5",
        "OTHER": "OTHER",
        "N1": "N1",
        "N2": "N2",
        "N3": "N3",
        "N4": "N4",
        "N5": "N5",
    }

    return mapping.get(raw, raw if raw in {"N1", "N2", "N3", "N4", "N5", "OTHER"} else "OTHER")


conn = psycopg.connect(
    "postgresql://tw10569:jlpt2024@localhost:5432/jlpt_learning"
)

cur = conn.cursor()

kanji_dir = Path.home() / "jlpt-Learning/client/src/pyfiles/kanji"

files = [
    "n5.json",
    "n4.json",
    "n3.json",
    "n2.json",
    "n1.json"
]

updated = 0

for file_name in files:

    file_path = kanji_dir / file_name

    with open(file_path, encoding="utf-8") as f:
        data = json.load(f)

    for item in data:

        cur.execute("""
            UPDATE "KanjiEntry"
            SET level = %s
            WHERE character = %s
        """, (
            normalize_level(item.get("level")),
            item["character"]
        ))

        updated += cur.rowcount

conn.commit()

print(f"Updated {updated} kanji")

cur.close()
conn.close()
