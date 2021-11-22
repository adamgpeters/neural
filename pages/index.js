import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react';
import { Typography, Slider, Snackbar, Alert } from "@mui/material";

function changeNeurons(curr, exp, neurons) {
  let diff = exp - curr;
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      let n = getNeuron();
      for (let i = 0; i < numNeurons; i++) {
        if (dist(neurons[i].x, neurons[i].y, n.x, n.y) < distance) {
          n.connections.push(neurons[i]);
          neurons[i].connections.push(n);
        }
      }
      neurons.push(n);
    }
  } else {
    diff = -diff;
    for (let i = 0; i < diff; i++) {
      let n = neurons[0];
      for (let z = 1; z < numNeurons - i; z++) {
        neurons[z].connections = neurons[z].connections.filter((e) => e != n);
      }
      neurons.splice(0, 1);
    }
  }

  numNeurons = neurons.length;
}

function getNeuron() {
  return new neuron(random(50, width - 50), (random(50, height - 50)));
}

function changeDistance(d) {
  distance = d;
  for (let i = 0; i < numNeurons; i++) {
    let k = [];
    for (let z = 0; z < numNeurons; z++) {
      if (dist(neurons[i].x, neurons[i].y, neurons[z].x, neurons[z].y) < distance) {
        k.push(neurons[z]);
      }
    }
    neurons[i].connections = k;
  }
}

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    if (typeof window !== 'undefined') {
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Call handler right away so state gets updated with initial window size
      handleResize();

      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}


class neuron {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.connections = new Array();
    this.strength = 0;
    this.decay = 0.3;
    this.propogation = -1;
    this.cooldown = 0;
  }

  update() {
    if (this.strength > 0) {
      this.strength -= this.decay;
    } else {
      this.strength = 0;
    }

    if (this.cooldown > 0) {
      this.cooldown -= 1;
    }

    if (this.propogation >= this.connections.length) {
      this.propogation -= 1;
    } else if (this.propogation >= 0) {
      this.cooldown = scooldown;
      for (let i = 0; i < this.connections.length; i++) {
        if (this.connections[i].cooldown <= 0 && this.connections[i].strength <= 1) {
          this.connections[i].propogation = Math.floor(random(propSpeed, propSpeed + 5));
          this.connections[i].strength = Math.floor(random(7, 10));
        }
      }
      this.propogation = -1;
    }
  }
}

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
})
let x = 50;
let y = 50;
let neurons;
let distance = 100;
let numNeurons = 120;
let width;
let height;
let scooldown = 60;
let propSpeed = 10;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

const generateNeurons = (s) => {
  let neurons = [];
  for (let i = 0; i < s; i++) {
    neurons.push(new neuron(random(50, width - 50), (random(50, height - 50))));
  }
  console.log(neurons);
  for (let i = 0; i < s; i++) {
    for (let z = 0; z < s; z++) {
      if (dist(neurons[i].x, neurons[i].y, neurons[z].x, neurons[z].y) < distance) {
        neurons[i].connections.push(neurons[z]);
      }
    }
  }

  return neurons;
}

export default function Home() {
  const [open, setOpen] = useState(true);
  const size = useWindowSize();
  width = Math.floor(size.width / 2);
  height = size.height - 5;
  const setup = (p5, canvasParentRef) => {

    p5.createCanvas(width, height).parent(canvasParentRef);
    p5.fill(255, 50, 50)
    p5.strokeWeight(1);
    p5.noStroke();
    neurons = generateNeurons(numNeurons);
  };


  const draw = (p5) => {
    p5.background(0);
    for (let i = 0; i < numNeurons; i++) {
      let n = neurons[i];
      n.update();
      p5.push();
      p5.stroke(p5.map(n.strength, 0, 10, 100, 240));
      n.connections.forEach(c => {
        p5.line(n.x, n.y, c.x, c.y);
      })
      p5.pop();
    }
    for (let i = 0; i < numNeurons; i++) {
      let n = neurons[i];
      let from = p5.color(180, 180, 180);
      // let to = p5.color(65, 126, 193);
      let to = p5.color(250, 50, 50);
      // let to = p5.color(220, 220, 220);
      p5.fill(p5.lerpColor(from, to, p5.map(n.strength, 0, 10, 0, 1)));
      // p5.fill(255, 50, 50);
      if (p5.dist(p5.mouseX, p5.mouseY, n.x, n.y) < 15) {
        if (p5.mouseIsPressed) {
          n.propogation = 10;
          n.strength = 10;
        }
        p5.push();
        p5.stroke(0, 0, 0);
        p5.ellipse(n.x, n.y, 20, 20);
        p5.pop();
      } else {
        p5.push()
        p5.stroke(0)
        p5.strokeWeight(1)
        p5.ellipse(n.x, n.y, 10, 10)
        p5.pop()
      }
    }
  };

  return (
    <div style={{ backgroundColor: 'black', width: "100vw", height: "100vh" }}>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={(_, reason) => {
          if (reason === 'clickaway') {
            return;
          }

          setOpen(false);
        }}
      >
        <Alert
          severity="info"
          onClose={(_, reason) => {
            if (reason === 'clickaway') {
              return;
            }

            setOpen(false);
          }} sx={{ width: '100%' }}>
          Try clicking a node!
        </Alert>
      </Snackbar>
      <div style={{ width: "50vw" }}>
        <Sketch style={{ display: "inline-block", float: "left" }} setup={setup} draw={draw} />
      </div>
      <div style={{ color: "white", width: "50vw", display: "inline-block", float: "left", textAlign: "center" }}>
        <Typography style={{ marginTop: "5vh", textAlign: "center", fontSize: 36 }} >Neural</Typography>
        <div style={{ marginTop: "10vh", marginLeft: "10%", width: "80%", textAlign: "center" }} >
          <Typography style={{ margin: "0 auto", textAlign: "left" }} id="input-slider" gutterBottom>
            Number of Nodes
          </Typography>
          <Slider
            aria-label="Temperature"
            defaultValue={120}
            valueLabelDisplay="auto"
            onChange={(_, val) => changeNeurons(numNeurons, val, neurons)}
            min={0}
            max={150}
          />
        </div>
        <div style={{ marginTop: "10vh", marginLeft: "10%", width: "80%", textAlign: "center" }} >
          <Typography style={{ margin: "0 auto", textAlign: "left" }} id="input-slider" gutterBottom>
            Distance: space required between nodes for a connection to form
          </Typography>
          <Slider
            aria-label="Temperature"
            defaultValue={100}
            valueLabelDisplay="auto"
            onChange={(_, val) => changeDistance(val)}
            min={50}
            max={125}
          />
        </div>
        <div style={{ marginTop: "10vh", marginLeft: "10%", width: "80%", textAlign: "center" }} >
          <Typography style={{ margin: "0 auto", textAlign: "left" }} id="input-slider" gutterBottom>
            Cooldown: how long it takes for a neuron to recieve a signal again
          </Typography>
          <Slider
            aria-label="Temperature"
            defaultValue={100}
            valueLabelDisplay="auto"
            onChange={(_, val) => { scooldown = val }}
            min={10}
            step={10}
            marks
            max={60}
          />
        </div>
        <div style={{ marginTop: "10vh", marginLeft: "10%", width: "80%", textAlign: "center" }} >
          <Typography style={{ margin: "0 auto", textAlign: "left" }} id="input-slider" gutterBottom>
            Propogation Speed: the time it takes for a signal to be passed to its neighbors
          </Typography>
          <Slider
            aria-label="Temperature"
            defaultValue={10}
            valueLabelDisplay="auto"
            onChange={(_, val) => { propSpeed = val }}
            min={1}
            max={20}
          />
        </div>
      </div>
    </div >
  );
};

