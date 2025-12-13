import React, { useState } from 'react';
import axios from 'axios';
import WaveformChart from './WaveformChart';
import './App.css';

function App() {
  // State management for file, results, loading, and errors
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bpm, setBpm] = useState<number | null>(null);
  const [beatTimes, setBeatTimes] = useState<number[]>([]);
  const [waveformData, setWaveformData] = useState<[number, number][]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Reset state when a new file is selected
    setBpm(null);
    setError('');
    setWaveformData([]);
    setBeatTimes([]);
    setSelectedFile(null); // Clear previous file selection

    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select an audio file first.');
      return;
    }

    setIsLoading(true);
    setBpm(null);
    setError('');
    setWaveformData([]);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/api/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { bpm, beat_times, waveform_data, duration } = response.data;
      if (bpm && beat_times && waveform_data && duration) {
        setBpm(bpm);
        setBeatTimes(beat_times);
        setWaveformData(waveform_data);
        setDuration(duration);
      } else {
        setError('Received incomplete data from the server.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'An unexpected error occurred.';
      setError(`Analysis Failed: ${errorMessage}`);
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Analyzing... this may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return <div className="alert alert-danger" role="alert"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>;
    }

    if (bpm !== null && waveformData.length > 0) {
      return (
        <div className="w-100">
          <div className="row align-items-center mb-4">
            <div className="col-md-6 text-center">
              <p className="bpm-label mb-0">Predicted BPM</p>
              <p className="bpm-display">{bpm}</p>
            </div>
            <div className="col-md-6">
                <p className="text-muted">This chart visualizes the audio waveform (in blue) and the detected beat instances (red vertical lines). It provides a visual representation of the rhythm analysis.</p>
            </div>
          </div>
          <WaveformChart waveform_data={waveformData} beat_times={beatTimes} duration={duration} />
        </div>
      );
    }

    return (
      <div className="text-center text-muted">
        <i className="bi bi-music-note-beamed" style={{ fontSize: '3rem' }}></i>
        <p>Your analysis results will appear here.</p>
      </div>
    );
  };

  return (
    <div className="container-fluid d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <main className="col-11 col-md-10 col-lg-8">
        <div className="card shadow-lg">
          <div className="card-header text-white text-center py-3">
            <h1><i className="bi bi-soundwave"></i> BPM Predictor</h1>
          </div>
          <div className="card-body p-4 p-md-5">
            <p className="card-text text-center text-muted mb-4">
              Upload an audio file (.mp3, .wav, etc.) to detect its Beats Per Minute (BPM) and visualize the results.
            </p>
            
            <form onSubmit={handleFormSubmit} className="mb-4">
              <div className="input-group mb-3">
                <input 
                  type="file" 
                  className="form-control" 
                  id="audioFile" 
                  accept="audio/*" 
                  onChange={handleFileChange}
                />
                <label className="input-group-text" htmlFor="audioFile"><i className="bi bi-folder2-open"></i></label>
              </div>
              <div className="d-grid">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg" 
                  disabled={isLoading || !selectedFile}
                >
                  <i className="bi bi-activity me-2"></i>
                  {isLoading ? 'Analyzing...' : 'Analyze BPM'}
                </button>
              </div>
            </form>

            <hr className="my-4" style={{ borderColor: '#444' }} />

            <div id="results" className="d-flex justify-content-center align-items-center" style={{ minHeight: '350px' }}>
              {renderResult()}
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center mt-4 text-muted">
        <p>Powered by FastAPI, React & Chart.js</p>
      </footer>
    </div>
  );
}

export default App;
