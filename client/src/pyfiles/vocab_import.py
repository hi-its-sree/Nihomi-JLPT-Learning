import json
import uuid
import psycopg
from pathlib import Path

conn = psycopg.connect(
    "postgresql://tw10569:jlpt2024@localhost:5432/jlpt_learning"
)

cur = conn.cursor()

json_dir = Path.home() / "jlpt-Learning/client/src/pyfiles/vocab"

files = [
    "n5.json",
    "n4.json",
    "n3.json",
    "n2.json",
    "n1.json"
]

count = 0

for filename in files:

    with open(json_dir / filename, encoding="utf-8") as f:
        data = json.load(f)

    for item in data:

        examples = item.get("examples", [])

        example_ja = None
        example_en = None

        if examples:
            example_ja = examples[0].get("ja")
            example_en = examples[0].get("en")

        cur.execute("""
            INSERT INTO "Vocabulary"
            (
                id,
                word,
                reading,
                meaning,
                level,
                example,
                "exampleTl"
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT DO NOTHING
        """,
        (
            str(uuid.uuid4()),
            item.get("word", ""),
            item.get("reading", ""),
            ", ".join(item.get("meanings", [])),
            item.get("level", "OTHER"),
            example_ja,
            example_en
        ))

        count += 1

conn.commit()

print(f"Imported {count} vocabulary items")

cur.close()
conn.close()