import React from 'react';
import './ShineBorder.css'; 

const ShineBorder = ({ children, className, color }) => {
    const colors = color.join(', ');
    
    return (
        <div className={`shine-border ${className}`} style={{ '--border-colors': colors }}>
            {children}
        </div>
    );
};

export default ShineBorder;
