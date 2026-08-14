import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to replace RentIQ, rentiq, RentDynamic, rentdynamic
    # BUT we must skip rentiq_feedback, rentiq_storage_update.
    # What about rentiq_chats? Let's check if it exists first.

    # Safe visible replacement function
    def replacer(match):
        word = match.group(0)
        # If the word is part of a technical identifier, skip it
        # We can check the surrounding characters
        return word

    # Actually, it's easier to just do a regex replace that uses negative lookarounds
    # or just replace all and then fix the technical ones back.
    
    # 1. Replace RentDynamic (case insensitive) -> RentFlow (preserving case for first letter)
    content = re.sub(r'RentDynamic', 'RentFlow', content, flags=re.IGNORECASE)

    # 2. Replace RentIQ -> RentFlow (case insensitive)
    # But do NOT replace rentiq_feedback, rentiq_storage_update
    # Let's temporarily hide the technical keys
    technical_keys = [
        'rentiq_feedback', 
        'rentiq_storage_update'
    ]
    
    for i, key in enumerate(technical_keys):
        content = content.replace(key, f'__TECH_KEY_{i}__')
        
    # Now replace RentIQ
    content = re.sub(r'RentIQ', 'RentFlow', content)
    content = re.sub(r'rentiq', 'rentflow', content)
    content = re.sub(r'RENTIQ', 'RENTFLOW', content)

    # Restore technical keys
    for i, key in enumerate(technical_keys):
        content = content.replace(f'__TECH_KEY_{i}__', key)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


for root, dirs, files in os.walk('.'):
    if '.git' in root or '.gemini' in root or 'assets' in root:
        continue
    for file in files:
        if file.endswith(('.html', '.css', '.js')):
            process_file(os.path.join(root, file))

print("Replacement complete.")
