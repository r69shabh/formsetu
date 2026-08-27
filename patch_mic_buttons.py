import re
with open('src/App.jsx', 'r') as f:
    app = f.read()

# patch yesno
app = re.sub(
    r'(</button>\n\s*);\n\s*}\)}\n\s*</div>',
    r'\1;\n        })}\n        <MicButton onResult={(t) => onChange(field.id, t)} />\n      </div>',
    app
)

# patch category
app = re.sub(
    r'(</select>\n\s*)(</div>\n\s*\{source && \()',
    r'\1<MicButton onResult={(t) => onChange(field.id, t)} />\n        \2',
    app
)

# patch date
app = re.sub(
    r'(<input type="date"[^>]+/>\n\s*)(</div>\n\s*\{source && \()',
    r'\1<MicButton onResult={(t) => onChange(field.id, t)} />\n        \2',
    app
)

# patch default input
app = re.sub(
    r'(onChange=\{\(event\) => onChange\(field\.id, event\.target\.value\)\}\n\s*/>\n\s*\{field\.suffix && <span className="input-suffix">\{field\.suffix\}</span>\}\n\s*)(</div>\n\s*\{source && \()',
    r'\1<MicButton onResult={(t) => onChange(field.id, t)} />\n      \2',
    app
)

with open('src/App.jsx', 'w') as f:
    f.write(app)

print("Inserted MicButtons")
