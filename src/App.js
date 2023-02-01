import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/header';
import CarParkDetail from './components/carParkDetail';
import {RealtimeData} from './components/parkedCar';

function App() {
  return (
    <div className="App">
      <Header/>
      <CarParkDetail/>
      <RealtimeData/>
    </div>
  );
}

export default App;

