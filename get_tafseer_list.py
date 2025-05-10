import glob
import json
import os

# Find all book_* files
files = glob.glob('data/tafseer/*/book_*')
# Normalize slashes for cross-platform compatibility
files = [f.replace('\\', '/') for f in files]

# Path to prioritize
priority_path = 'data/tafseer/ma3any/book_0'

# Remove it if found and reinsert at the top
if priority_path in files:
    files.remove(priority_path)
    files.insert(0, priority_path)

# Save to index.json
output_path = 'data/tafseer/index.json'
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(files, f, ensure_ascii=False, indent=2)

print(f"Saved {len(files)} entries to {output_path} with {priority_path} on top (if it existed).")
