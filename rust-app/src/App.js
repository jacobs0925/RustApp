// App.js
import './App.css';
import Camera from './components/Camera';
import SignIn from './components/SignIn';
import PairListener from './components/PairListener';

function App()
{
    return (
        <div className="App">
            <Camera identifier={'TESTER4'} type="Turret" />
            <SignIn />
            <PairListener />
        </div>
    );
}

export default App;
