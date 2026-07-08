import json
import uuid
import psycopg

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
        item.get("jlpt") or "OTHER",
        item.get("stroke_count")
    ))

    count += 1

conn.commit()

print(f"Imported {count} kanji")

cur.close()
conn.close()