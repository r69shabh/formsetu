import re
with open('src/App.jsx', 'r') as f:
    app = f.read()

mic_comp = """
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

function MicButton({ onResult }) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  const startRecording = (e) => {
    e.preventDefault();
    if (!SpeechRecognitionAPI) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }
    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onend = () => {
        setRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setRecording(true);
    } catch (err) {
      console.error(err);
      setRecording(false);
    }
  };

  const stopRecording = (e) => {
    e.preventDefault();
    if (recognitionRef.current && recording) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  };

  return (
    <button 
      className={`mic-button ${recording ? 'recording' : ''}`}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onMouseLeave={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      type="button"
      title="Hold to speak"
    >
      <Mic size={18} />
    </button>
  );
}

function FieldControl({ field, value, source, document, onChange, onChoose, onUpload, onPreview, onSubmit, error, lang }) {"""

app = app.replace("function FieldControl({ field, value, source, document, onChange, onChoose, onUpload, onPreview, onSubmit, error, lang }) {", mic_comp)

with open('src/App.jsx', 'w') as f:
    f.write(app)
print("Inserted MicButton component")
