import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css';


function App() {

  const [result, setResult] = useState([])
  return (
    <>
      <section id="center">
        <h1>mern render</h1>
        <button onClick={async() => {
          const res= await fetch('http://localhost:3000/users')
        const data= await res.json()
        console.log(data)
        setResult(data)
        }}>
          users
        </button>
        <pre>
          {JSON.stringify(result,null,2)}
        </pre>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
