//pic size 687*687
import React from 'react'
import axios from 'axios'
const CANNON = require('cannon')
const THREE = require('three')
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Tone from 'tone'
import Typed from 'typed.js'


var options = {
  strings: ['', 'aleatoricBounce'],
  typeSpeed: 100,
  loop: true,
  loopCount: 2,
  backDelay: 2000,
  backSpeed: 100,
  showCursor: false

}
// const typed = new Typed('#title', options)


var resetT = {
  strings: ['', 'GAME OVER   : R TO RESET'],
  typeSpeed: 100,
  loop: true,
  loopCount: Infinity,
  backSpeed: 100,
  showCursor: false

}


class Main extends React.Component{
  constructor(){
    super()
    this.state = {
      data: {},
      error: ''

    }
    this.componentDidMount = this.componentDidMount.bind(this)





  }


  componentDidMount(){
    //Canvas
    const resetTyped = new Typed('#reset', resetT)

    const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

ctx.clearRect(0, 0, canvas.width, canvas.height)
ctx.globalAlpha = 0.2
ctx.fillStyle = 'green'
ctx.fillRect(0, 0, canvas.width, canvas.height)

var grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
var grd2 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)


//sound STUFF

var tremolo = new Tone.Tremolo().start()
var pingPong = new Tone.PingPongDelay('4n', 0.2).toMaster()
var autoWah = new Tone.AutoWah(50, 6, -30).toMaster()
var freeverb = new Tone.Freeverb().toMaster()
freeverb.dampening.value = 500
const synthA =  new Tone.DuoSynth().toMaster().chain(tremolo, pingPong, autoWah)
synthA.attack = 0.01

const synthB =  new Tone.AMSynth().toMaster().chain(tremolo, pingPong, autoWah)


const channel = new Tone.Channel(-16).chain(freeverb, pingPong).toMaster()
channel.volume.value = -20
const synthC =  new Tone.MonoSynth().connect(channel)

var fmSynth = new Tone.FMSynth().toMaster()


//DISPLAY  STATS
const scoreDisplay = document.getElementById('score')
const livesDisplay = document.getElementById('lives')
const ballsIn = document.getElementById('ballsIn')
const reset = document.getElementById('reset')
let score = 0
let lives = 31


//KeyBoard Controls
const keys =[]
document.body.addEventListener('keydown', function (e) {
  e.preventDefault();
  if(e.keyCode===38){

    if(player.width === 20 && !player.grounded){
      player.width = 50
      player.height = 20
    } else if(player.width === 50 && !player.grounded){
      player.width = 20
      player.height = 50


    }
  }
  if(e.keyCode===82){
    score = 0
    lives = 31
    balls.length=1
    setup()
    reset.innerHTML = ''
    canvas.classList.remove('over')
    reset.classList.add('hide')

  }

  keys[e.keyCode] = true
})

document.body.addEventListener('keyup', function (e) {
  keys[e.keyCode] = false
})



//Element Setup
const player = {
  height: 50,
  width: 20,
  posX: 0,
  posY: 0,
  velX: 0,
  velY: 0,
  speed: 3,
  jumping: false,
  grounded: false

}






const ball ={
  posX: 40,
  posY: 40,
  velX: 3,
  velY: 1,
  speed: 3,
  height: 5,
  width: 5

}

const balls = []

balls.push(ball)

function BallCreate(posX, posY){
  this.posX = posX,
  this.posY = posY,
  this.velX = 3,
  this.velY = 1,
  this.speed = 3+balls.length,
  this.height = 5,
  this.width = 5
  balls.push(this)

}


const worldG = {
  gravity: 0.2,
  friction: 0.9
}

const goal = {
  posX: 420,
  posY: 90,
  height: 50,
  width: 50
}



var boxes = []
let check

function Box(posX, posY, width){
  this.posX = posX,
  this.posY = posY,
  this.width = width,
  this.height= 10
  check = boxes.filter(x => x.posY !== this.posY && this.posY > (x.posY-10) && this.posY < (x.posY+10) )
  if(check.length === 0){
    boxes.push(this)
  }
}


//Start / Reset
function setup(){
  lives--
  goal.posX = (Math.random() *1100)+ 20
  goal.posY = (Math.random() *200)+20

  boxes = []


  // border walls
  boxes.push({
    posX: 0,
    posY: 590,
    width: 1200,
    height: 10
  })

  boxes.push({
    posX: 0,
    posY: 0,
    width: 1200,
    height: 10
  })

  boxes.push({
    posX: 0,
    posY: 0,
    width: 10,
    height: 600
  })

  boxes.push({
    posX: 1190,
    posY: 0,
    width: 10,
    height: 600
  })

  while(boxes.length<25){
    new Box(Math.floor(Math.random() *1400)+10, Math.floor(Math.random() *590)+10, Math.floor(Math.random() *100+50))

  }

}
setup()


//Collision Detection
function collisionDetection(shapeA, shapeB){
  var vX = (shapeA.posX + (shapeA.width / 2)) - (shapeB.posX + (shapeB.width / 2)),
    vY = (shapeA.posY + (shapeA.height / 2)) - (shapeB.posY + (shapeB.height / 2)),
    // add the half widths and half heights of the objects
    hWidths = (shapeA.width / 2) + (shapeB.width / 2),
    hHeights = (shapeA.height / 2) + (shapeB.height / 2),
    colDir = null

  // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
  if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
    //  figures out on which side we are colliding (top, bottom, left, or right)
    var oX = hWidths - Math.abs(vX),
      oY = hHeights - Math.abs(vY)
    if (oX >= oY) {
      if (vY > 0) {
        colDir = 't'
        shapeA.posY += oY
      } else {
        colDir = 'b'
        shapeA.posY -= oY

      }
    } else {
      if (vX > 0) {
        colDir = 'l'
        shapeA.posX += oX
      } else {
        colDir = 'r'
        shapeA.posX -= oX
      }
    }
  }
  return colDir
}


setInterval(function () {
  if(lives>0){
    new BallCreate(Math.floor(Math.random()*1000),Math.floor(Math.random()*200))
  }
}, 10000)

//UPDATE LOOP

function gameLoop() {

  if(lives <= 0){
    canvas.classList.add('over')
    reset.classList.remove('hide')
    lives = 0
    livesDisplay.innerHTML = lives
  }
  if(lives>0){
    scoreDisplay.innerHTML = score
    livesDisplay.innerHTML = lives
    ballsIn.innerHTML = balls.length


    if (keys[32] ) {

      // up arrow or space
      if (!player.jumping && player.grounded) {
        player.jumping = true
        player.grounded = false
        player.velY = -player.speed * 4
        synthA.triggerAttackRelease(player.posY,0.01)
      }
    }if (keys[39]) {
    // right arrow
      if (player.velX < player.speed) {
        player.velX++
        // synthA.triggerAttackRelease(player.posX,0.01)
      }
    }
    if (keys[37]) {         // left arrow
      if (player.velX > -player.speed) {
        player.velX--
        // synthA.triggerAttackRelease(player.posX,0.01)
      }
    }





    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 0.3
    grd.addColorStop(0, '#8ED6FF')
    grd.addColorStop(0.2, '#004CB3')
    grd.addColorStop(0.8, '#EE4CB3')
    //grd.addColorStop(0.6, '#E000EE')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, canvas.width, canvas.height)


    player.velX *= worldG.friction
    player.velY += worldG.gravity






    player.grounded = false
    boxes.map(x => {
      ctx.fillRect(x.posX, x.posY, x.width, x.height)
      var dir  = collisionDetection(player, x)

      if (dir === 'l' || dir === 'r') {
        player.velX = 0
        player.jumping = false
      } else if (dir === 'b') {

        player.grounded = true
        player.jumping = false
      } else if (dir === 't') {
        player.velY = 0

      }
      balls.map(ball => {
        var dirB  = collisionDetection(ball, x)

        if (dirB === 'l' || dirB === 'r') {
          ball.velX = -ball.velX

        } else if (dirB === 'b') {



          ball.velY = -ball.velY


        } else if (dirB === 't') {

          ball.velY = 5
          if(ball.posY <50){
            synthC.triggerAttackRelease(ball.posX/2,0.01)
          }
          if(ball.posY >50){
            synthB.triggerAttackRelease(ball.posY*2,0.01)
          }

        }
      })


    })

    balls.map(ball =>{
      var dirC  = collisionDetection(ball, player)
      // console.log(dirC)
      if (dirC === 'l') {

        ball.velX = -ball.velX



      }else if (dirC === 'r') {

        ball.velX = -ball.velX




      } else if (dirC === 'b') {



        ball.velY = -ball.velY


      } else if (dirC === 't') {
        ball.velY = - ball.velY
      }


      var goalD  = collisionDetection(ball, goal)

      if (goalD === 'l') {

        setup()

        new BallCreate(Math.floor(Math.random()*1000),Math.floor(Math.random()*200))
        fmSynth.triggerAttackRelease(goal.posY*20,0.01)


      }else if (goalD === 'r') {

        setup()

        new BallCreate(Math.floor(Math.random()*1000),Math.floor(Math.random()*200))
        fmSynth.triggerAttackRelease(goal.posY*30,0.01)



      } else if (goalD === 'b') {


        setup()

        new BallCreate(Math.floor(Math.random()*1000),Math.floor(Math.random()*200))
        fmSynth.triggerAttackRelease(goal.posY*10,0.01)

      } else if (goalD === 't') {
        setup()

        new BallCreate(Math.floor(Math.random()*1000),Math.floor(Math.random()*200))
        fmSynth.triggerAttackRelease(goal.posY*40,0.01)
      }
    })

    if(player.grounded){
      player.velY = 0
    }


    var dirC  = collisionDetection(goal, player)
    // console.log(dirC)
    if (dirC === 'l' || dirC === 'r' || dirC === 'b' || dirC === 't'  ) {

      score++
      setup()
      lives+=2
      if(balls.length>1){
        balls.pop()
      }

    }



    player.posX += player.velX
    player.posY += player.velY

    balls.map(ball => {
      ball.posX += ball.velX
      ball.posY += ball.velY
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.arc(ball.posX, ball.posY, 5, 0, Math.PI*2, false)
      ctx.fillStyle = grd2
      ctx.fill()
      ctx.closePath()
    })




    grd2.addColorStop(0.8, '#8ED6FF')

    grd2.addColorStop(0.2, '#EE4CB3')



    ctx.fillStyle = grd2

    ctx.fillRect(player.posX, player.posY, player.width, player.height)

    ctx.globalAlpha = 1
    ctx.fillStyle = 'rgba(255,255,255,0.8 )'
    ctx.fillRect(goal.posX, goal.posY, goal.width, goal.height)


  }
  requestAnimationFrame(gameLoop)

}




gameLoop()

      var dt = 1/60, R = 0.2;
let plane2
            var clothMass = 0.1;  // 1 kg in total
            var clothSize = 8; // 1 meter
            var Nx = 24;
            var Ny = 24;
            var mass = clothMass / Nx*Ny;

            var restDistance = clothSize/Nx;

            var ballSize = 1
            let  vect = new THREE.Vector3( 0, 0, 0 )
            var clothFunction = plane(restDistance * Nx, restDistance * Ny, vect);

            function plane(width, height, vector) {

                return function(u, v, vect) {
                  vect = new THREE.Vector3( 0, 0, 0 )
                    var x = (u-0.5) * width;
                    var y = (v+0.5) * height;
                    var z = 0;
                    return vect.set( x, y, z );
                };
            }


            let container
            let camera, scene, renderer;

            let sphereMesh, sphereBody;
            const particles = [];
            let world;

            initCannon();
            init();
            animate();

            function initCannon(){
                world = new CANNON.World();
                world.broadphase = new CANNON.NaiveBroadphase();
                world.gravity.set(0,-10,0);
                world.solver.iterations = 20;

                // Materials
                var clothMaterial = new CANNON.Material();
                var sphereMaterial = new CANNON.Material();
                var clothSphereContactMaterial = new CANNON.ContactMaterial(  clothMaterial,
sphereMaterial,
0.0, // friction coefficient
0.0  // restitution
);
                // Adjust constraint equation parameters for ground/ground contact
                clothSphereContactMaterial.contactEquationStiffness = 0.4;
                clothSphereContactMaterial.contactEquationRelaxation = 30;

                // Add contact material to the world
                world.addContactMaterial(clothSphereContactMaterial);

                // Create sphere
                var sphereShape = new CANNON.Sphere(ballSize*0.3);
                sphereBody = new CANNON.Body({
                    mass: 3
                });
                sphereBody.addShape(sphereShape);
                sphereBody.position.set(0,-100,0);
                world.addBody(sphereBody);

                // Create cannon particles
                for ( var i = 0, il = Nx+1; i !== il; i++ ) {
                    particles.push([]);
                    for ( var j = 0, jl = Ny+1; j !== jl; j++ ) {
                        var idx = j*(Nx+1) + i;
                        var p = clothFunction(i/(Nx+1), j/(Ny+1));
                        var particle = new CANNON.Body({
                            mass: j==Ny ? 0 : mass
                        });
                        particle.addShape(new CANNON.Particle());
                        particle.linearDamping = 0.5;
                        particle.position.set(
                            p.x,
                            p.y-Ny * 0.9 * restDistance,
                            p.z
                        );
                        particles[i].push(particle);
                        world.addBody(particle);
                        particle.velocity.set(0,0,-0.5*(Ny-j));
                    }
                }
                function connect(i1,j1,i2,j2){
                    world.addConstraint( new CANNON.DistanceConstraint(particles[i1][j1],particles[i2][j2],restDistance) );
                }
                for(var i=0; i<Nx+1; i++){
                    for(var j=0; j<Ny+1; j++){
                        if(i<Nx) connect(i,j,i+1,j);
                        if(j<Ny) connect(i,j,i,j+1);
                    }
                }
            }

            function init() {

                container = document.createElement( 'div' );
                document.body.appendChild( container );

                // scene

                scene = new THREE.Scene();

                scene.fog = new THREE.Fog( 0x000000, 500, 10000 );

                // camera

                camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.5, 10000 );

                camera.position.x=0
                camera.position.y=-2
                camera.position.z=15


                scene.add( camera );




                // lights
                var light, materials;
                scene.add( new THREE.AmbientLight( 0x666666 ) );

                light = new THREE.DirectionalLight( 0xffffff, 1.75 );
                var d = 5;

                light.position.set( d, d, d );

                light.castShadow = true;
                //light.shadowCameraVisible = true;



                scene.add( light );

                scene.background = new THREE.Color( 0x000000 );





                // sphere
                var ballGeo = new THREE.SphereGeometry( ballSize, 20, 20 );
                var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x888888 } );

                sphereMesh = new THREE.Mesh( ballGeo, ballMaterial );
                sphereMesh.castShadow = true;
                //sphereMesh.receiveShadow = true;
                // scene.add( sphereMesh );


 renderer = new THREE.WebGLRenderer( {alpha: true } );                renderer.setSize( window.innerWidth, window.innerHeight );

                container.appendChild( renderer.domElement );



                window.addEventListener( 'resize', onWindowResize, false );

                // camera.lookAt( sphereMesh.position );
            }

            //

            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                // controls.handleResize();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }
          //  const cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world )
            // var controls = new OrbitControls( camera, renderer.domElement );
            if(this.state.works){
              var texture = new THREE.TextureLoader().load( `data:image/png;base64,  ${this.state.works[0].dat.slice(2).slice(0, -1)}` )
            };
            if(!this.state.works){

               texture = new THREE.CanvasTexture(canvas);
               console.log(texture)
            };
            var geometry = new THREE.PlaneGeometry( 2, 1, 24, 12 );
            var material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide, map: texture} );
            plane2 = new THREE.Mesh( geometry, material );
            plane2.matrixWorldNeedsUpdate = true
            plane2.elementsNeedUpdate = true
            plane2.verticesNeedUpdate = true
            scene.add( plane2 );


            function animate() {

                requestAnimationFrame( animate );
                // controls.update();
                world.step(dt);
                var t = world.time;
                scene.position.x  += R * Math.sin(t)*2,
                sphereBody.position.set(R * Math.sin(t)*2, 0, R * Math.cos(t)*2);
                render();
                if(texture){
                texture.needsUpdate = true;
              }
            }

            function render() {


              //console.log(camera)

                for ( var i = 0, il = Nx+1; i !== il; i++ ) {
                    for ( var j = 0, jl = Ny+1; j !== jl; j++ ) {
                        var idx = j*(Nx+1) + i;

                        if(geometry&&  geometry.vertices[idx] ){
                        geometry.vertices[idx].copy(particles[i][j].position);
                        geometry.elementsNeedUpdate = true
                        geometry.verticesNeedUpdate = true
                      }
                    }
                }


                if(plane2){

                plane2.elementsNeedUpdate = true
                plane2.verticesNeedUpdate = true
                plane2.matrixWorldNeedsUpdate = true
              }


                sphereMesh.position.copy(sphereBody.position)
  //               if(cannonDebugRenderer){
  //   cannonDebugRenderer.update()
  // }
                renderer.render( scene, camera );

            }


  }

  componentDidUpdate(){



  }




  render() {

    //console.log(this.state)

    return (
      <div>

      <div className="info">
     Score  :<span id="score" className="banner"></span>
     Lives  :<span id="lives" className="banner"></span>
     Balls In Play  :<span id="ballsIn" className="banner"></span>
   </div>
   <div id="reset" className="hide"></div>
   <canvas id='canvas' width="1200" height="600"> </canvas>
</div>


    )
  }
}
export default Main
