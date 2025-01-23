//src/pages/notification.js {fronted Code}
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './notification.css';
import NotificationContext from '../context/NotificationContext';

const Notifications = () => {
    const { updateNotificationCount } = useContext(NotificationContext);
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/notifications');
                setNotifications(response.data);
                updateNotificationCount(response.data.length); // Update notification count
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [updateNotificationCount]);

    const filteredNotifications = notifications.filter(notification =>
        activeTab === 'all' ? true : notification.status === activeTab
    );

    const handleIgnore = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/notifications/${id}`);
            const updatedNotifications = notifications.filter(notification => notification.id !== id);
            setNotifications(updatedNotifications);
            updateNotificationCount(updatedNotifications.length); // Update notification count after deletion
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleRespond = (id) => {
        console.log("Responded to notification with id:", id);
    };

    return (
        <div className="n-main">
            <div className="n-header">
                <h1>Notifications</h1>
                <div className="n-tabs">
                    <button
                        className={`n-tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All
                    </button>
                </div>
            </div>
            <div className="n-list">
                {filteredNotifications.length === 0 ? (
                    <div className="n-item">
                        <p>No Notifications Found</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div key={notification.id} className="n-item">
                            <div className="n-info">
                                <span className="n-name">{notification.name}</span>
                                <span className="n-message">{notification.message}</span>
                                <span className="n-time">{notification.time}</span>
                            </div>
                            <div className="n-actions">
                                <button className="n-btn ignore" onClick={() => handleIgnore(notification.id)}>Ignore</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
