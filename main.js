import { createScene } from "./experience";
import './style.css'

document.querySelector('#app').innerHTML = `
  <div>
    <canvas class="webgl"></canvas>
  </div>
`

createScene(document.querySelector('.webgl'));
