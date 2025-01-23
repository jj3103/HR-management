import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

// Helper function to generate random colors
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const GenderDiversityGraph = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
      },
    ],
  });
  const [topRank, setTopRank] = useState({ rank: '', count: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/personnel/rank');
        const apiData = response.data;

        const labels = apiData.map(item => item.rank);
        const data = apiData.map(item => item.totalNumber);
        const backgroundColor = labels.map(() => getRandomColor());

        // Find the rank with the highest number of personnel
        const maxDataIndex = data.indexOf(Math.max(...data));
        const topRank = {
          rank: labels[maxDataIndex],
          count: data[maxDataIndex],
        };
        setTopRank(topRank);

        setChartData({
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: backgroundColor,
              borderWidth: 0,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const options = {
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#333',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.formattedValue || '';
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="gender-diversity shadow-container">
      <h2>Rank Diversity</h2>
      <div className="graph-container">
        <Doughnut data={chartData} options={options} />
        <div className="graph-center">
          <span className="graph-percentage">{topRank.count}</span>
          <span className="graph-label">{topRank.rank}</span>
        </div>
      </div>
    </div>
  );
};

export default GenderDiversityGraph;
