// components/SignIn.js
import React from 'react';
import axios from 'axios';

const SignIn = () =>
{
    const signIn = async () =>
    {
        try
        {
            let resp = await axios.get(`http://localhost:5000/fcm-register/eyJzdGVhbUlkIjoiNzY1NjExOTgxNjk3MTMzNzkiLCJ2ZXJzaW9uIjowLCJpc3MiOjE3MjE4NTEyNDIsImV4cCI6MTcyMzA2MDg0Mn0%3D.eK3rPQgCWT9S1aN987r9cG7WtFnwM6Q1kV7RUhWAgQgroJKcvmS0TKnukJH5vx8y792TLnHUi37mTusRw6pRAw%3D%3D`);
            console.log(resp.data);
        } catch (error)
        {
            console.error('Error signing in:', error);
        }
    };

    return (
        <div>
            <button onClick={signIn}>Sign In</button>
        </div>
    );
};

export default SignIn;
