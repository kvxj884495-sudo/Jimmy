import json
p = r"c:\Users\97158\Downloads\AhmedGemy\data.json"
with open(p, 'r', encoding='utf-8') as f:
    data = json.load(f)
changed = 0
checked = 0
for i, prop in enumerate(data.get('properties', [])):
    imgs = prop.get('images')
    if not imgs:
        continue
    for j, s in enumerate(imgs):
        if isinstance(s, str) and s.startswith('imgs/'):
            checked += 1
            if i != 0:
                imgs[j] = 'imgs1/' + s.split('/', 1)[1]
                changed += 1
with open(p, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f'Checked {checked} image paths; changed {changed} of them.')