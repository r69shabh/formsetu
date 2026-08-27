import re
with open('src/App.jsx', 'r') as f:
    app = f.read()

app = re.sub(
    r'(<input type="date"[^\n]+/>\n\s*)(</div>\n\s*\{source && \()',
    r'\1<MicButton onResult={(t) => onChange(field.id, t)} />\n        \2',
    app
)

with open('src/App.jsx', 'w') as f:
    f.write(app)
print("Patched date")
