import streamlit as st
import librosa
import librosa.display
import numpy as np
import matplotlib.pyplot as plt
import io

# --- Main App Configuration ---
st.set_page_config(
    page_title="BPM Predictor",
    page_icon="🎵",
    layout="centered",
    initial_sidebar_state="auto",
)

# --- Matplotlib Style ---
# Use a dark theme for the plot to match Streamlit's theme
plt.style.use("dark_background")

# --- Helper Functions ---

def analyze_audio(uploaded_file):
    """
    Analyzes the uploaded audio file to find BPM, waveform, and beat times.
    """
    # Load audio file from in-memory buffer
    a = io.BytesIO(uploaded_file.getbuffer())
    y, sr = librosa.load(a, sr=None, mono=True)

    # Estimate tempo and beats
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    bpm = int(np.round(tempo))

    # Get timestamps of beats
    beat_times = librosa.frames_to_time(beats, sr=sr)
    
    return bpm, y, sr, beat_times

def create_waveform_plot(y, sr, beat_times):
    """
    Creates and returns a matplotlib figure of the waveform and beats.
    """
    fig, ax = plt.subplots(figsize=(10, 4))
    
    # Plot the waveform
    librosa.display.waveshow(y, sr=sr, ax=ax, color="cyan", alpha=0.8)
    
    # Draw vertical lines for the beats
    ax.vlines(beat_times, -1, 1, color="lime", linestyle="--", alpha=0.9, label="Detected Beats")
    
    # Customize the plot
    ax.set_title("Audio Waveform & Detected Beats", color="white")
    ax.set_xlabel("Time (s)", color="white")
    ax.set_ylabel("Amplitude", color="white")
    ax.legend()
    ax.grid(True, alpha=0.2)
    
    # Set background color
    fig.patch.set_facecolor('#0E1117')
    ax.set_facecolor('#0E1117')
    
    # Set tick colors
    ax.tick_params(colors='gray', which='both')

    # Set spine colors
    for spine in ax.spines.values():
        spine.set_edgecolor('gray')
        
    return fig

# --- Streamlit UI ---

st.title("🎵 BPM & Beat Analyzer")

st.write(
    "Upload your audio file and we'll analyze its tempo (BPM) and "
    "show you where the beats are on the audio waveform."
)

# File Uploader
uploaded_file = st.file_uploader(
    "Choose an audio file",
    type=["mp3", "wav", "ogg", "flac", "m4a"],
    accept_multiple_files=False,
    label_visibility="collapsed"
)

# --- Analysis and Display ---

if uploaded_file is not None:
    st.audio(uploaded_file, format='audio/wav')
    
    if st.button("Analyze Audio", type="primary"):
        with st.spinner("Analyzing... this might take a moment."):
            try:
                # Perform analysis
                bpm, y, sr, beat_times = analyze_audio(uploaded_file)

                # Display Results
                st.metric(label="Predicted BPM", value=f"{bpm}", delta=None)
                
                st.write("### Analysis Visualization")
                
                # Create and display the plot
                fig = create_waveform_plot(y, sr, beat_times)
                st.pyplot(fig)

            except Exception as e:
                st.error(f"An error occurred during analysis: {e}")
else:
    st.info("👆 Upload a file and click 'Analyze' to get started!")
