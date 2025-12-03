import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SpectrumChartProps {
  data: number[]; // Array of frequency magnitudes
  height?: number;
}

export function SpectrumChart({ data, height = 300 }: SpectrumChartProps) {
  // Generate rainbow colors for bars
  const generateColors = (count: number) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i / count) * 360;
      colors.push(`hsl(${hue}, 80%, 60%)`);
    }
    return colors;
  };

  const chartData = {
    labels: data.map((_, i) => ``), // Empty labels
    datasets: [
      {
        label: "Magnitude",
        data: data,
        backgroundColor: generateColors(data.length),
        borderColor: "transparent",
        borderWidth: 0,
        borderRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
        min: 0,
        max: 255,
      },
    },
    animation: {
      duration: 0, // Disable animation for real-time updates
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
