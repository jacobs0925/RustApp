const { fcmRegister, fcmListen } = require('./clitools,js');
const express = require('express');
const fs = require("fs");
const path = require('path');
const app = express();
const RustPlus = require('@liamcottle/rustplus.js');
const Camera = require('@liamcottle/rustplus.js/camera');

const rustplus = new RustPlus('75.70.36.178', '28023', '76561198169713379', '-786576931');

// Connect to Rust server
rustplus.connect();

// Handle WebSocket connection events
rustplus.on('connecting', () => console.log('Connecting to RustPlus server...'));
rustplus.on('connected', async () => console.log('Connected to RustPlus server'));
rustplus.on('disconnected', () => console.log('Disconnected from RustPlus server'));
rustplus.on('error', (error) => console.error('WebSocket error:', error));

// Helper function to manage camera subscriptions
const manageCameraSubscription = async (identifier, action, callback) =>
{
    let camera;
    try
    {
        camera = await rustplus.getCamera(identifier);
        await camera.subscribe();
        console.log(`Subscribed to camera ${identifier}`);

        await callback(camera);
    } catch (error)
    {
        console.error(`Error during camera ${action}:`, error);
    } finally
    {
        if (camera)
        {
            try
            {
                await camera.unsubscribe();
                console.log(`Unsubscribed from camera ${identifier}`);
            } catch (unsubscribeError)
            {
                console.error(`Error unsubscribing from camera ${identifier}:`, unsubscribeError);
            }
        }
    }
};

app.get('/fcm-register/:token', async (req, res) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    const token = req.params.token;
    try
    {
        let data = await fcmRegister(token);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        console.log(data);
    } catch (error)
    {
        console.error('Error in /fcm-register/:token:', error);
        res.write(`data: ${JSON.stringify({ error: 'Internal Server Error' })}\n\n`);
    } finally
    {
        res.end();
    }
});

app.get('/fcm-listen', async (req, res) =>
{
    const data = {
        fcm_credentials: {
            "keys": {
                "privateKey": "O4amBdwlL51Nqdasfwj4cjGI8hC3qiTNVeUxQXMCrkM",
                "publicKey": "BPx2yLq1pq4T_0GotN4Gg_4mnCKMg01mPOdg3efDB0BKhA6ydm7xP8Zg0Rm2enkJVwUD0xfJbybEDAzt4hJksl4",
                "authSecret": "DWAgwLCt5hrjRkXPcUrb6Q"
            },
            "fcm": {
                "token": "dnFG58oOKrk:APA91bGrdV09qX4aPUJ5i1TShXqjPf4agOyJsLs6GuxKDUs6fNgTyCX4eroM7Kcba7yef7dqDI5TYKDVc7st1ZdwXmECA7bshj7Ry-ZkK7g_aVFtbnBLaS8gsdFCCSVs4VEM1qJ7G4ew",
                "pushSet": "emXqLct3TnE"
            },
            "gcm": {
                "token": "c4ARpWLqgz4:APA91bFyayLyIJtP8nqcRIwy7Y2oDBAVkuO1AbTZq7UZeNKviFNYoW0-JK_dqiM14lYZMbwu8RsgfM-Fyy1dPRVJsjOrfy5qT1yttca7poLz3or0Kwe5k7abp4qsOiFmmDYJrZtDDS72",
                "androidId": "4734921135223974380",
                "securityToken": "4331482793272924928",
                "appId": "wp:receiver.push.com#57b1c296-46ad-4df5-92cd-c8cd460651cf"
            }
        },
        "expo_push_token": "ExponentPushToken[YgWS95DbMqqEz9YZFyNxAj]",
        "rustplus_auth_token": "eyJzdGVhbUlkIjoiNzY1NjExOTgxNjk3MTMzNzkiLCJ2ZXJzaW9uIjowLCJpc3MiOjE3MjE4NTYxOTUsImV4cCI6MTcyMzA2NTc5NX0=.+dXKGa2lH/bJ3Wf5t1I2effZNWIIoaT71bmRl2C6G8NOhUMv+XRXhBTJsKBfYxcYu/UoqI1P8cCyexoXMUgKAA=="
    };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try
    {
        const keepAlive = setInterval(() =>
        {
            res.write(': keep-alive\n\n');
        }, 30000);

        req.on('close', () =>
        {
            clearInterval(keepAlive);
        });

        const sendNotification = (notification) =>
        {
            res.write(`data: ${JSON.stringify(notification)}\n\n`);
        };

        let resp = await fcmListen(data, sendNotification);
        console.log(resp);
    } catch (error)
    {
        console.error('Error in /fcm-listen:', error);
        res.write(`data: ${JSON.stringify({ error: 'Internal Server Error' })}\n\n`);
    } finally
    {
        res.end();
    }
});

app.get('/stream-camera-frame/:identifier', async (req, res) =>
{
    const identifier = req.params.identifier;
    console.log(identifier);

    try
    {
        const camera = await rustplus.getCamera(identifier);

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const onRenderListener = async (frameData) =>
        {
            console.log('trying to render')
            try
            {
                let { entities, image } = frameData;
                let frame = await image;
                const payload = {
                    frame: frame.toString('base64'),
                    entities: entities
                };
                res.flushHeaders();
                res.write(`data: ${JSON.stringify(payload)}\n\n`);
            } catch (error)
            {
                console.error('Error in onRenderListener:', error);
                res.status(500).send('Error processing frame data');
                camera.removeAllListeners();
            }
        };

        const onErrorListener = async (error) =>
        {
            console.log(`disconnected: ${error}`)
        }

        camera.on('render', onRenderListener);
        camera.on('error', onErrorListener);
        await camera.subscribe();

        req.on('close', async () =>
        {
            console.log('req closed')
            if (onRenderListener)
            {
                camera.removeListener('render', onRenderListener);
            }
            try
            {
                await camera.unsubscribe();
            } catch (error)
            {
                console.error('Error while unsubscribing from camera:', error);
            }
        });
    } catch (error)
    {
        console.error('Error setting up camera stream:', error);
        res.status(500).send('Error setting up camera stream');
    }
});

app.get('/move-camera/:identifier/:direction', async (req, res) =>
{
    const identifier = req.params.identifier;
    const direction = req.params.direction.toLowerCase();
    res.setHeader('Access-Control-Allow-Origin', '*');

    await manageCameraSubscription(identifier, 'move', async (camera) =>
    {
        switch (direction)
        {
            case 'up':
                await camera.move(Camera.Buttons.NONE, 0, 1);
                break;
            case 'down':
                await camera.move(Camera.Buttons.NONE, 0, -1);
                break;
            case 'left':
                await camera.move(Camera.Buttons.NONE, -1, 0);
                break;
            case 'right':
                await camera.move(Camera.Buttons.NONE, 1, 0);
                break;
            case 'vertup':
                await camera.move(Camera.Buttons.SPRINT, 1, 0);
                break;
            case 'vertdown':
                await camera.move(Camera.Buttons.DUCK, 0, 0);
                break;
            default:
                throw new Error('Invalid direction');
        }
        res.status(200).send(`Camera moved ${direction}`);
    }).catch(error =>
    {
        console.error(`Error moving camera ${direction}:`, error);
        res.status(500).send(`Error moving camera ${direction}`);
    });
});

app.get('/zoom-camera/:identifier', async (req, res) =>
{
    const identifier = req.params.identifier;
    res.setHeader('Access-Control-Allow-Origin', '*');

    await manageCameraSubscription(identifier, 'zoom', async (camera) =>
    {
        await camera.zoom();
        res.status(200).send('Camera zoomed');
    }).catch(error =>
    {
        console.error('Error zooming camera:', error);
        res.status(500).send('Error zooming camera');
    });
});

app.get('/shoot-turret/:identifier', async (req, res) =>
{
    const identifier = req.params.identifier;
    res.setHeader('Access-Control-Allow-Origin', '*');

    await manageCameraSubscription(identifier, 'shoot', async (camera) =>
    {
        await camera.shoot();
        res.status(200).send('Turret shot');
    }).catch(error =>
    {
        console.error('Error shooting turret:', error);
        res.status(500).send('Error shooting turret');
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
{
    console.log(`Server running on port ${PORT}`);
});