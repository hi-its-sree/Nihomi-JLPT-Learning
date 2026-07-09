import json
import uuid
import psycopg


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

with open("kanji.json", "r", encoding="utf-8") as f:
    kanji_data = json.load(f)

count = 0

for item in kanji_data:

    cur.execute("""
        INSERT INTO "KanjiEntry"
        (
            id,
            character,
            "onReadings",
            "kunReadings",
            meaning,
            level,
            "strokeCount"
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (character) DO NOTHING
    """,
    (
        str(uuid.uuid4()),
        item.get("kanji"),
        item.get("onyomi", []),
        item.get("kunyomi", []),
        item.get("meaning", ""),
        normalize_level(item.get("jlpt")),
        item.get("stroke_count")
    ))

    count += 1

conn.commit()

print(f"Imported {count} kanji")

cur.close()
conn.close()