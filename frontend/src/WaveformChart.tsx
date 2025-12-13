import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register Chart.js components and the annotation plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface WaveformChartProps {
  waveform_data: [number, number][];
  beat_times: number[];
  duration: number;
}

const WaveformChart: React.FC<WaveformChartProps> = ({ waveform_data, beat_times, duration }) => {
  // Create annotation objects for each beat
  const beatAnnotations = beat_times.map((beat_time) => ({
    type: 'line' as const,
    scaleID: 'x',
    value: beat_time,
    borderColor: 'rgba(255, 99, 132, 0.8)',
    borderWidth: 1,
  }));

  const data = {
    labels: waveform_data.map(d => d[0]), // Time axis
    datasets: [
      {
        label: 'Waveform',
        data: waveform_data.map(d => d[1]), // Amplitude
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        pointRadius: 0, // No points on the line
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      title: {
        display: true,
        text: 'Audio Waveform & Detected Beats',
        color: '#FFFFFF'
      },
      tooltip: {
        enabled: false, // Disable tooltips for a cleaner look
      },
      annotation: {
        annotations: beatAnnotations,
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Time (s)',
          color: '#CCCCCC'
        },
        min: 0,
        max: duration,
        ticks: {
          color: '#CCCCCC'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amplitude',
          color: '#CCCCCC'
        },
        min: -1,
        max: 1,
        ticks: {
          color: '#CCCCCC'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%', backgroundColor: '#1E1E1E', padding: '1rem', borderRadius: '0.5rem' }}>
      <Line options={options} data={data} />
    </div>
  );
};

export default WaveformChart;
