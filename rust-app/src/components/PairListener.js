// components/PairListener.js
import React, { useState, useEffect } from 'react';

const PairListener = () =>
{
    const [notifications, setNotifications] = useState([]);
    const [eventSource, setEventSource] = useState(null);

    const listenForPairing = async () =>
    {
        try
        {
            const newFcmEventSource = new EventSource('http://localhost:5000/fcm-listen');

            newFcmEventSource.onmessage = (event) =>
            {
                if (event.data && event.data !== 'undefined')
                {
                    console.log(event.data);
                    const data = JSON.parse(event.data);
                    console.log('Notification:', data);
                    setNotifications((prevNotifications) => [...prevNotifications, data]);
                    newFcmEventSource.close();
                }
            };

            newFcmEventSource.onerror = (error) =>
            {
                console.error('FCM EventSource failed:', error);
                newFcmEventSource.close();
            };

            setEventSource(newFcmEventSource);
        } catch (error)
        {
            console.error('Error in FCM listen:', error);
        }
    };

    useEffect(() =>
    {
        return () =>
        {
            if (eventSource)
            {
                eventSource.close();
            }
        };
    }, [eventSource]);

    return (
        <div>
            <button onClick={listenForPairing}>Listen for Pairing</button>
            <h3>Notifications</h3>
            <ul>
                {notifications.map((notification, index) => (
                    <li key={index}>
                        {JSON.stringify(notification)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PairListener;
