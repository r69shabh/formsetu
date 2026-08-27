import re
with open('src/App.jsx', 'r') as f:
    app = f.read()

app = app.replace('Sparkles, Upload, X, Zap, Globe, Smartphone, KeyRound, Building2', 'Sparkles, Upload, X, Zap, Globe, Smartphone, KeyRound, Building2, Mic')

with open('src/App.jsx', 'w') as f:
    f.write(app)
print("Added Mic to imports")
