import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PostingCountGraph = ({ data }) => {
    return (
        <div className="chart-container">
            <BarChart width={800} height={400} data={data}>
                <XAxis dataKey="posted_to" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
        </div>
    );
};

export default PostingCountGraph;