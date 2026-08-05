import json
import os

vocab_files = ["nouns.json", "nouns2.json", "verbs.json", "adjectives.json", "others.json"]
all_vocab = []

for file in vocab_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            all_vocab.extend(json.load(f))

with open("phrases.json", 'r', encoding='utf-8') as f:
    phrases = json.load(f)

vocab_json = json.dumps(all_vocab, ensure_ascii=False)
phrases_json = json.dumps(phrases, ensure_ascii=False)

with open("Social_Media_Game.html", 'r', encoding='utf-8') as f:
    html = f.read()

idx1 = html.find("const allVocab = [")
idx2 = html.find("const phrases = [", idx1)
idx3 = html.find("let particles =", idx2)

if idx1 != -1 and idx2 != -1 and idx3 != -1:
    part1 = html[:idx1]
    part2 = f"const allVocab = {vocab_json};\n\nconst phrases = {phrases_json};\n\n"
    part3 = html[idx3:]
    
    with open("Social_Media_Game.html", 'w', encoding='utf-8') as f:
        f.write(part1 + part2 + part3)
    print("Injected successfully!")
else:
    print("Failed to find indices.")
