import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Axios for making HTTP requests

const Test = () =>
{
    const [message, setMessage] = useState('');

    useEffect(() =>
    {
        // Function to start camera feed
        const startCameraFeed = async () =>
        {
            try
            {
                const response = await axios.get('http://localhost:5000/get-camera-frame');
                console.log('Response from server:', response.data);
                setMessage('Camera feed started.');
            } catch (error)
            {
                console.error('Error starting camera feed:', error);
                setMessage('Error starting camera feed.');
            }
        };

        // Function to pause camera feed
        const pauseCameraFeed = async () =>
        {
            try
            {
                const response = await axios.get('http://localhost:5000/pause-camera-feed/TrinityDestroyer2324');
                console.log('Response from server:', response.data);
                setMessage('Camera feed paused.');
            } catch (error)
            {
                console.error('Error pausing camera feed:', error);
                setMessage('Error pausing camera feed.');
            }
        };

        // Start camera feed when component mounts
        startCameraFeed();

        // Pause camera feed after 10 seconds
        const timer = setTimeout(() =>
        {
            pauseCameraFeed();
        }, 10000); // 10 seconds in milliseconds

        // Clean up function to clear the timer if component unmounts or changes
        return () =>
        {
            clearTimeout(timer);
        };
    }, []);

    return (
        <div>
            <h1>Hello from React Component</h1>
            <p>{message}</p>
            {/* Additional React component content */}
        </div>
    );
};

export { Test };
