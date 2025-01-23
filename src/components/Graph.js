import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import '../css/Graph.css';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Graph = () => {
    const [coyData, setCoyData] = useState({ labels: [], datasets: [] });
    const [presentData, setPresentData] = useState({ labels: [], datasets: [] });
    const [rankData, setRankData] = useState({ labels: [], datasets: [] });
    const [presentRankData, setPresentRankData] = useState({ labels: [], datasets: [] });
    const [leaveTypeData, setLeaveTypeData] = useState({ labels: [], datasets: [] });
    const [casteData, setCasteData] = useState({ labels: [], datasets: [] });

    // Color scheme for a professional look
const colors = {
    primary: '#1C3879',     // Deep royal blue
    secondary: '#607D8B',   // Blue grey
    background: '#F0F4F8',  // Light blue-grey
    surface: '#FFFFFF',     // White
    text: '#37474F',        // Dark blue-grey
    accent: '#87CEEB',      // Light blue
    delete: '#D32F2F',      // Red for delete button
    edit: '#4B9F44',        // Green for edit button
  };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1500,
            easing: 'easeInOutQuad'
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: false,
                    display: true,
                    drawTicks: false,
                },
                ticks: {
                    stepSize: 10,
                    font: {
                        size: 14,
                    },
                },
            },
            x: {
                grid: {
                    drawBorder: false,
                    display: false,
                },
                ticks: {
                    font: {
                        size: 14,
                    },
                },
            },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                    },
                },
            },
            title: {
                display: true,
                text: 'Personnel Data',
                font: {
                    size: 18,
                },
            },
        },
    };

    // Fetch coy distribution data
    useEffect(() => {
        axios.get('/graph/api/coy-distribution')
            .then(response => {
                const data = response.data;
                const labels = data.map(item => item.coy);
                const counts = data.map(item => item.count);

                setCoyData({
                    labels,
                    datasets: [{
                        label: 'Number of Personnel by Coy',
                        data: counts,
                        backgroundColor: '#4CAF50',
                        borderColor: '#3e8e41',
                        borderWidth: 1,
                        barThickness: 20,
                    }]
                });
            })
    }, []);

    // Fetch number of people present today by coy
    useEffect(() => {
        axios.get('/graph/api/present-today-by-coy')
            .then(response => {
                const data = response.data;
                const labels = data.map(item => item.coy);
                const counts = data.map(item => item.count);

                setPresentData({
                    labels,
                    datasets: [{
                        label: 'Number of Personnel Present Today',
                        data: counts,
                        backgroundColor: '#03A9F4',
                        borderColor: '#0288D1',
                        borderWidth: 1,
                        barThickness: 20,
                    }]
                });
            })
    }, []);

    // Fetch rank distribution data
    useEffect(() => {
        axios.get('/graph/api/rank-distribution')
            .then(response => {
                const data = response.data;
                const labels = data.map(item => item.rank);
                const counts = data.map(item => item.count);

                setRankData({
                    labels,
                    datasets: [{
                        label: 'Number of Personnel by Rank',
                        data: counts,
                        backgroundColor: '#FF9800',
                        borderColor: '#FFA07A',
                        borderWidth: 1,
                        barThickness: 20,
                    }]
                });
            })
    }, []);

    // Fetch number of people present today by rank
    useEffect(() => {
        axios.get('/graph/api/present-today-by-rank')
            .then(response => {
                const data = response.data;
                const labels = data.map(item => item.rank);
                const counts = data.map(item => item.count);

                setPresentRankData({
                    labels,
                    datasets: [{
                        label: 'Number of Personnel Present Today by Rank',
                        data: counts,
                        backgroundColor: '#2196F3',
                        borderColor: '#1976D2',
                        borderWidth: 1,
                        barThickness: 20,
                    }]
                });
            })
    }, []);

    // Fetch number of personnel by leave type and rank category
   // Fetch number of personnel by leave type and rank category
useEffect(() => {
    axios.get('/graph/api/leave-type-distribution')
        .then(response => {
            const data = response.data;
            // Transform data for grouped display
            const leaveTypes = [...new Set(data.map(item => item.leave_type))];
            const ranks = [...new Set(data.map(item => item.rank_category))];
            
            // Define unique colors for each rank category
            const colorMapping = {
                'JCO': 'rgba(255, 99, 132, 0.5)',   // Light red
                'OR': 'rgba(54, 162, 235, 0.5)',    // Light blue
                // Add more colors if there are more rank categories
            };

            const groupedData = ranks.map(rank => {
                return {
                    label: rank,
                    data: leaveTypes.map(leaveType => {
                        const entry = data.find(d => d.leave_type === leaveType && d.rank_category === rank);
                        return entry ? entry.count : 0;
                    }),
                    backgroundColor: colorMapping[rank] || 'rgba(153, 102, 255, 0.5)', // Fallback color
                    borderColor: colorMapping[rank] ? colorMapping[rank].replace('0.5', '1') : 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                    barThickness: 20,
                }
            });

            setLeaveTypeData({
                labels: leaveTypes,
                datasets: groupedData,
            });
        })
}, []);


    // Fetch caste distribution data
    useEffect(() => {
        axios.get('/graph/api/caste-distribution')
            .then(response => {
                const data = response.data;
                const labels = data.map(item => item.caste);
                const counts = data.map(item => item.count);

                setCasteData({
                    labels,
                    datasets: [{
                        label: 'Number of Personnel by Caste',
                        data: counts,
                        backgroundColor: '#009688',
                        borderColor: '#00796B',
                        borderWidth: 1,
                        barThickness: 20,
                    }]
                });
            })
    }, []);

    return (
        <div className="graph-container">
            <h1 style={{ color: colors.primary, textAlign: 'center', marginBottom: '50px',fontWeight: 'bold' }}>Personnel Distribution</h1>
            <div className="chart-container">
                <h3>Coy Distribution</h3>
                <Bar data={coyData} options={chartOptions} />
            </div>
            <div className="chart-container">
                <h3>Personnel Present Today by Coy</h3>
                <Bar data={presentData} options={chartOptions} />
            </div>
            <div className="chart-container">
                <h3>Personnel Distribution by Rank</h3>
                <Bar data={rankData} options={chartOptions} />
            </div>
            <div className="chart-container">
                <h3>Personnel Present Today by Rank</h3>
                <Bar data={presentRankData} options={chartOptions} />
            </div>
            <div className="chart-container">
                <h3>Personnel by Leave Type and Rank Category</h3>
                <Bar data={leaveTypeData} options={chartOptions} />
            </div>
            <div className="chart-container">
                <h3>Personnel Distribution by Caste</h3>
                <Bar data={casteData} options={chartOptions} />
            </div>
        </div>
    );
};

export default Graph;
