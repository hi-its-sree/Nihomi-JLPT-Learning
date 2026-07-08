import xml.etree.ElementTree as ET
import json

tree = ET.parse("kanjidic2.xml")
root = tree.getroot()

kanji_data = []

for character in root.findall("character"):

    literal = character.findtext("literal")

    misc = character.find("misc")

    stroke_count = None
    grade = None
    freq = None
    jlpt = None

    if misc is not None:

        if misc.find("stroke_count") is not None:
            stroke_count = int(misc.findtext("stroke_count"))

        if misc.find("grade") is not None:
            grade = int(misc.findtext("grade"))

        if misc.find("freq") is not None:
            freq = int(misc.findtext("freq"))

        if misc.find("jlpt") is not None:
            jlpt = misc.findtext("jlpt")

    onyomi = []
    kunyomi = []

    reading_meaning = character.find("reading_meaning")

    if reading_meaning is not None:

        rmgroup = reading_meaning.find("rmgroup")

        if rmgroup:

            for reading in rmgroup.findall("reading"):

                r_type = reading.attrib.get("r_type")

                if r_type == "ja_on":
                    onyomi.append(reading.text)

                elif r_type == "ja_kun":
                    kunyomi.append(reading.text)

            meanings = [
                m.text
                for m in rmgroup.findall("meaning")
                if not m.attrib
            ]

    else:
        meanings = []

    kanji_data.append({
        "kanji": literal,
        "meaning": ", ".join(meanings),
        "onyomi": onyomi,
        "kunyomi": kunyomi,
        "stroke_count": stroke_count,
        "grade": grade,
        "freq": freq,
        "jlpt": jlpt
    })

with open(
    "kanji.json",
    "w",
    encoding="utf-8"
) as f:
    json.dump(
        kanji_data,
        f,
        ensure_ascii=False,
        indent=2
    )

print(f"Exported {len(kanji_data)} kanji")