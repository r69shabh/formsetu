css = """
/* ==========================================================================
   Mic Button
   ========================================================================== */
.mic-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--line-light);
  border: 1px solid var(--line);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  margin-left: 8px;
}

.mic-button:hover {
  background: #e9edf2;
  color: var(--ink);
}

.mic-button:active, .mic-button.recording {
  background: #ef4444; /* red for recording */
  color: #ffffff;
  border-color: #ef4444;
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
}

.choice-row .mic-button {
  margin-left: auto;
}
"""
with open('src/styles.css', 'a') as f:
    f.write(css)
print("Appended mic css")
