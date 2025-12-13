import os
import shutil
import tempfile
import librosa
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import soundfile as sf

# Initialize FastAPI app
app = FastAPI(
    title="BPM Prediction API",
    description="An API to predict the BPM of a song and provide data for visualization.",
    version="2.0.0",
)

# CORS (Cross-Origin Resource Sharing) middleware
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def read_root():
    """A simple endpoint to check if the API is running."""
    return {"message": "Welcome to the BPM Prediction API!"}

MAX_WAVEFORM_POINTS = 2000

@app.post("/api/predict", tags=["BPM Prediction"])
async def predict_bpm(file: UploadFile = File(...)):
    """
    Receives an audio file, predicts its BPM, and returns the value
    along with waveform data and beat timestamps for visualization.
    """
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_audio_file:
            shutil.copyfileobj(file.file, temp_audio_file)
            temp_audio_path = temp_audio_file.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save temporary file: {str(e)}")
    finally:
        file.file.close()

    try:
        y, sr = librosa.load(temp_audio_path, sr=None, mono=True) # Load as mono

        # Estimate tempo and beats
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        bpm = int(np.round(tempo))

        # Get timestamps of beats
        beat_times = librosa.frames_to_time(beats, sr=sr)

        # Downsample waveform for sending to frontend
        if y.shape[0] > MAX_WAVEFORM_POINTS:
            step = y.shape[0] // MAX_WAVEFORM_POINTS
            y_downsampled = y[::step]
        else:
            y_downsampled = y
            
        # Create time axis for the waveform
        time_axis = np.linspace(0, len(y) / sr, len(y_downsampled)).tolist()
        waveform_data = np.stack((time_axis, y_downsampled), axis=-1).tolist()

        # Convert numpy arrays to lists for JSON serialization
        return {
            "bpm": bpm,
            "beat_times": beat_times.tolist(),
            "waveform_data": waveform_data,
            "duration": librosa.get_duration(y=y, sr=sr)
        }

    except Exception as e:
        # This will catch errors during librosa processing
        raise HTTPException(status_code=400, detail=f"Error processing audio file: {str(e)}")

    finally:
        # Clean up the temporary file
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

# To run the app locally: uvicorn main:app --reload
