const express = require('express');
const fs = require("fs");
const app = express();
const RustPlus = require('@liamcottle/rustplus.js'); // Adjust path as necessary

// Create RustPlus instance
const rustplus = new RustPlus('45.88.229.39', '28083', '76561198169713379', '-301778325');

// Connect to Rust server
rustplus.connect();

// Handle WebSocket connection events
rustplus.on('connecting', () =>
{
    console.log('Connecting to RustPlus server...');
});

rustplus.on('connected', () =>
{
    console.log('Connected to RustPlus server');
});

rustplus.on('disconnected', () =>
{
    console.log('Disconnected from RustPlus server');
});

rustplus.on('error', (error) =>
{
    console.error('WebSocket error:', error);
});

// Handle messages from RustPlus
rustplus.on('message', (message) =>
{
    console.log('Received message:', message);
    // Handle incoming messages as needed
});

// Example endpoint to send a message to RustPlus
app.get('/send-message', async (req, res) =>
{
    try
    {
        rustplus.sendTeamMessage('Hello from server!', (response) =>
        {
            console.log('Response from RustPlus:', response);
            res.send('Message sent to RustPlus');
        });
    } catch (error)
    {
        console.error('Error sending message to RustPlus:', error);
        res.status(500).send('Error sending message to RustPlus');
    }
});

app.get('/get-camera-frame', async (req, res) =>
{
    try
    {
        const camera = rustplus.getCamera("TrinityDestroyer2324");
        console.log(1)
        // listen for events when a camera frame has been rendered, you will get a png image buffer
        camera.on('render', async (frame) =>
        {
            console.log("on render");

            // save camera frame to disk
            fs.writeFileSync(`camera.png`, frame);

            // unsubscribe from camera to allow others to control it
            await camera.unsubscribe();
        });

        await camera.subscribe();
    } catch (error)
    {
        console.error('Error getting camera frame:', error);
        res.status(500).send('Error getting camera frame');
    }
});

app.get('/pause-camera-feed/:identifier', async (req, res) =>
{
    const identifier = req.params.identifier;

    try
    {
        const camera = rustplus.getCamera(identifier);
        await camera.unsubscribe();
        console.log(`Paused camera feed ${identifier}`);
        res.send(`Paused camera feed ${identifier}`);
    } catch (error)
    {
        console.error(`Error pausing camera feed ${identifier}:`, error);
        res.status(500).send(`Error pausing camera feed ${identifier}`);
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
{
    console.log(`Server running on port ${PORT}`);
});
