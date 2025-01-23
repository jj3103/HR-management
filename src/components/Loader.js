import React from 'react';
import '../css/Loader.css'; // Import CSS for loader styling

const Loader = () => {
    return (
        <div className="loader-overlay">
            <div className="loader"></div>
        </div>
    );
};

export default Loader;
