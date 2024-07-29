import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Axios for making HTTP requests

const Camera = ({ identifier }) =>
{
    const [imageSrc, setImageSrc] = useState('');
    const [eventSource, setEventSource] = useState(null);
    const [entities, setEntities] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const startEventSource = () =>
    {
        if (eventSource)
        {
            eventSource.close();
        }

        const newEventSource = new EventSource(`http://localhost:5000/stream-camera-frame/${identifier}`);

        newEventSource.onmessage = (event) =>
        {
            const data = JSON.parse(event.data);
            const { entities, frame } = data;
            setEntities(entities);
            const imageUrl = `data:image/png;base64,${frame}`;
            setImageSrc(imageUrl);
        };

        newEventSource.onerror = (error) =>
        {
            console.error('EventSource failed:', error);
            newEventSource.close();
        };

        setEventSource(newEventSource);
    };

    const stopEventSource = () =>
    {
        if (eventSource)
        {
            eventSource.close();
            setEventSource(null);
            setImageSrc('');
            setEntities([]);
        }
    };

    const moveCamera = async (direction) =>
    {
        let shouldStart = false;
        if (eventSource)
        {
            eventSource.close();
            shouldStart = true;
        }

        try
        {
            await axios.get(`http://localhost:5000/move-camera/${identifier}/${direction}`);
            console.log(`Camera moved ${direction}`);
            if (shouldStart)
            {
                startEventSource(); // Resubscribe after receiving 200 OK
            }
        } catch (error)
        {
            console.error(`Error moving camera ${direction}:`, error);
        }
    };

    const signIn = async () =>
    {
        try
        {
            let resp = await axios.get(`http://localhost:5000/fcm-register/eyJzdGVhbUlkIjoiNzY1NjExOTgxNjk3MTMzNzkiLCJ2ZXJzaW9uIjowLCJpc3MiOjE3MjE1NDcxMTksImV4cCI6MTcyMjc1NjcxOX0%3D.sgz5cvbFo0fsqyrLt6QyqeMfwOvP3G%2BoPDfdPxGSwRdGoTZO%2B4f%2FDN%2FGlyXhG8%2B6LU7hwDCGdVq2iYU4ob4DAQ%3D%3D`);
            console.log(resp.data)

        } catch (error)
        {
            console.error(`Error moving camera:`, error);
        }
    };

    const listenForPairing = async () =>
    {
        try
        {
            const newFcmEventSource = new EventSource('http://localhost:5000/fcm-listen');

            newFcmEventSource.onmessage = (event) =>
            {
                if (event.data && event.data !== 'undefined') 
                {
                    console.log(event.data)
                    const data = JSON.parse(event.data);
                    console.log('Notification:', data);
                    setNotifications(prevNotifications => [...prevNotifications, data]);
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
            console.error('Error in FCM signIn:', error);
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
            <button onClick={startEventSource}>Start</button>
            <button onClick={stopEventSource}>Stop</button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                <button onClick={() => moveCamera('up')}>Up</button>
                <div>
                    <button onClick={() => moveCamera('left')}>Left</button>
                    <button onClick={() => moveCamera('right')}>Right</button>
                </div>
                <button onClick={() => moveCamera('down')}>Down</button>
            </div>
            {imageSrc ? <img src={imageSrc} style={{ height: "50vh", marginTop: '20px' }} alt="Camera Frame" /> : 'Loading...'}
            <div>
                <button onClick={signIn}>Sign In</button>
                <h3>Entities</h3>
                <ul>
                    {entities.map((entity) => (
                        <li key={entity.entityId}>
                            {entity.name} ({entity.type}) - Position: {`(${entity.position.x.toFixed(2)}, ${entity.position.y.toFixed(2)}, ${entity.position.z.toFixed(2)})`}
                        </li>
                    ))}
                </ul>
                <h3>Notifications</h3>
                <ul>
                    {notifications.map((notification, index) => (
                        <li key={index}>
                            {JSON.stringify(notification)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export { Camera };
