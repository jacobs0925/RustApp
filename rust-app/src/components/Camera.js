import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Camera.css'; // We'll define the styles in this file

// Import assets
import cameraButton from '../assets/cameraButton.png';
import playButton from '../assets/playButton.png';
import pauseButton from '../assets/pauseButton.png';
import frameImage from '../assets/frame.png';

const Camera = ({ identifier, type }) =>
{
    const [imageSrc, setImageSrc] = useState('');
    const [eventSource, setEventSource] = useState(null);
    const [entities, setEntities] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [isMoving, setIsMoving] = useState(false);

    const startEventSource = () =>
    {
        // Cleanup existing EventSource if it's already open
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
            console.log('message recxeived')
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
        console.log('stopping event source')
        if (eventSource)
        {
            eventSource.close();
            setEventSource(null);
            setImageSrc('');
            setEntities([]);
        }
    };

    const togglePlayPause = () =>
    {
        console.log('togglePlayPause')

        if (isPlaying)
        {
            stopEventSource();
        } else
        {
            startEventSource();
        }
        setIsPlaying(!isPlaying);
    };

    const moveCamera = async (direction) =>
    {
        console.log('moveCamera')

        if (isMoving) return;
        setIsMoving(true);
        console.log('start move')
        try
        {
            if (eventSource && eventSource.readyState === EventSource.OPEN)
            {
                eventSource.close();
            }

            await axios.get(`http://localhost:5000/move-camera/${identifier}/${direction}`);
            console.log(`Camera moved ${direction}`);
        } catch (error)
        {
            console.error(`Error moving camera ${direction}:`, error);
        } finally
        {
            setIsMoving(false);
            console.log('end move')
            startEventSource();

        }
    };

    const shootTurret = async () =>
    {
        try
        {
            await axios.get(`http://localhost:5000/shoot-turret/${identifier}`);
            console.log('Turret fired');
        } catch (error)
        {
            console.error('Error firing turret:', error);
        }
    };

    const zoomCamera = async () =>
    {
        try
        {
            await axios.get(`http://localhost:5000/zoom-camera/${identifier}`);
            console.log(`Camera zoomed`);
        } catch (error)
        {
            console.error(`Error zooming camera`, error);
        }
    };

    const handleKeyDown = (event) =>
    {
        console.log('keydown')

        if (isSelected)
        {
            if (type === 'PTZ')
            {
                if (event.key === 'Control')
                {
                    zoomCamera(); // Control key to zoom in
                } else if (event.key === 'Shift')
                {
                    zoomCamera(); // Shift key to zoom out
                }
            } else if (type === 'Drone')
            {
                if (event.key === 'Shift')
                {
                    moveCamera('vertup'); // Shift key to move drone up
                } else if (event.key === 'Control')
                {
                    moveCamera('vertdown'); // Control key to move drone down
                }
            } else if (type === 'Turret' && event.key === ' ')
            {
                shootTurret(); // Spacebar to shoot
            }
        }
    };

    const calculateDistance = (position) =>
    {
        const { x, y, z } = position;
        return Math.sqrt(x * x + y * y + z * z).toFixed(2);
    };

    useEffect(() =>
    {
        console.log('useffect')

        window.addEventListener('keydown', handleKeyDown);
        return () =>
        {
            window.removeEventListener('keydown', handleKeyDown);
            if (eventSource)
            {
                eventSource.close();
            }
        };
    }, [eventSource, isSelected]);

    return (
        <div
            className="camera-container"
            onMouseEnter={() => setIsSelected(true)}
            onMouseLeave={() => setIsSelected(false)}
        >
            <div className="camera-frame">
                <img src={frameImage} alt="Frame" className="frame-image" />
                <img src={imageSrc} style={{ display: isPlaying ? "flex" : "none" }} className="camera-image" alt="Camera Frame" />
                <img
                    src={isPlaying ? pauseButton : playButton}
                    alt="Play/Pause"
                    className="play-pause-button"
                    onClick={togglePlayPause}
                />

                {type === 'PTZ' && (
                    <>
                        <img
                            src={cameraButton}
                            alt="Up"
                            className="camera-button up"
                            onClick={() => moveCamera('up')}
                        />
                        <img
                            src={cameraButton}
                            alt="Left"
                            className="camera-button left"
                            onClick={() => moveCamera('left')}
                        />
                        <img
                            src={cameraButton}
                            alt="Right"
                            className="camera-button right"
                            onClick={() => moveCamera('right')}
                        />
                        <img
                            src={cameraButton}
                            alt="Down"
                            className="camera-button down"
                            onClick={() => moveCamera('down')}
                        />
                    </>
                )}

                {type === 'Drone' && (
                    <>
                        <img
                            src={cameraButton}
                            alt="Up"
                            className="camera-button up"
                            onClick={() => moveCamera('up')}
                        />
                        <img
                            src={cameraButton}
                            alt="Left"
                            className="camera-button left"
                            onClick={() => moveCamera('left')}
                        />
                        <img
                            src={cameraButton}
                            alt="Right"
                            className="camera-button right"
                            onClick={() => moveCamera('right')}
                        />
                        <img
                            src={cameraButton}
                            alt="Down"
                            className="camera-button down"
                            onClick={() => moveCamera('down')}
                        />
                    </>
                )}

                {type === 'Turret' && (
                    <>
                        <img
                            src={cameraButton}
                            alt="Up"
                            className="camera-button up"
                            onClick={() => moveCamera('up')}
                        />
                        <img
                            src={cameraButton}
                            alt="Left"
                            className="camera-button left"
                            onClick={() => moveCamera('left')}
                        />
                        <img
                            src={cameraButton}
                            alt="Right"
                            className="camera-button right"
                            onClick={() => moveCamera('right')}
                        />
                        <img
                            src={cameraButton}
                            alt="Down"
                            className="camera-button down"
                            onClick={() => moveCamera('down')}
                        />
                    </>
                )}
            </div>
            <div>
                <h3>Entities</h3>
                <ul>
                    {entities.map((entity) => (
                        <li key={entity.entityId}>
                            {entity.name} ({entity.type}) - Distance: {calculateDistance(entity.position)} meters
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Camera;
