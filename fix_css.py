import os

files = ["vr.html", "notion.html", "wire-loop-game.html", "stem-racing.html", "holo-map.html", "macau-map.html"]
for f in files:
    path = os.path.join(r"d:\Users\Jason\Documents\GitHub\jasonchongcnh.github.io", f)
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
    content = content.replace('<link rel="stylesheet" href="./assets/css/styles.css">', '<link rel="stylesheet" href="./css/styles.css">')
    with open(path, "w", encoding="utf-8") as file:
        file.write(content)
