
import {cameraConfig, 
    renderConfig, 
    environmentConfig,
    directionalLightConfig,
    ambientLightConfig
} 
    from './config/environmentConfig.js';
import {enermyConfig} from './config/enermyConfig.js';
import {playerConfig} from './config/playerConfig.js';
import {groundConfig} from './config/groundConfig.js';
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
cameraConfig.fov,
cameraConfig.aspect,
cameraConfig.near,
cameraConfig.far
)
camera.position.set(cameraConfig.position.x, 
    cameraConfig.position.y, 
    cameraConfig.position.z
)

const renderer = new THREE.WebGLRenderer({
alpha: renderConfig.alpha,
antialias: renderConfig.antialias
})
renderer.shadowMap.enabled = renderConfig.shadowMap.enabled
renderer.setSize(environmentConfig.width, environmentConfig.height)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

class Box extends THREE.Mesh {
constructor({
    width,
    height,
    depth,
    color = '#00ff00',
    velocity = {
    x: 0,
    y: 0,
    z: 0
    },
    position = {
    x: 0,
    y: 0,
    z: 0
    },
    zAcceleration = false
}) {
    super(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color })
    )

    this.width = width
    this.height = height
    this.depth = depth

    this.position.set(position.x, position.y, position.z)

    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2

    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2

    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2

    this.velocity = velocity
    this.gravity = environmentConfig.gravity

    this.zAcceleration = zAcceleration
}

updateSides() {
    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2

    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2

    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2
}

update(ground) {
    this.updateSides()

    if (this.zAcceleration) this.velocity.z += 0.0003

    this.position.x += this.velocity.x
    this.position.z += this.velocity.z

    this.applyGravity(ground)
}

applyGravity(ground) {
    this.velocity.y += this.gravity

    // this is where we hit the ground
    if (
    boxCollision({
        box1: this,
        box2: ground
    })
    ) {
    const friction = environmentConfig.gravityFriction
    this.velocity.y *= friction
    this.velocity.y = -this.velocity.y
    } else this.position.y += this.velocity.y
}
}

function boxCollision({ box1, box2 }) {
const xCollision = box1.right >= box2.left && box1.left <= box2.right
const yCollision =
    box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
const zCollision = box1.front >= box2.back && box1.back <= box2.front

return xCollision && yCollision && zCollision
}

const cube = new Box({
    width: playerConfig.width,
    height: playerConfig.height,
    depth: playerConfig.depth,
    position: {
        x: playerConfig.position.x,
        y: playerConfig.position.y,
        z: playerConfig.position.z
    },
    velocity: {
        x: playerConfig.velocity.x,
        y: playerConfig.velocity.y,
        z: playerConfig.velocity.z
    },
    color: playerConfig.color,
    zAcceleration: playerConfig.zAcceleration
})
cube.castShadow = playerConfig.cashtShadow
scene.add(cube)

const ground = new Box({
    width: groundConfig.width,
    height: groundConfig.height,
    depth: groundConfig.depth,
    position: {
        x: groundConfig.position.x,
        y: groundConfig.position.y,
        z: groundConfig.position.z
    },
    velocity: {
        x: groundConfig.velocity.x,
        y: groundConfig.velocity.y,
        z: groundConfig.velocity.z
    },
    color: groundConfig.color,
    zAcceleration: groundConfig.zAcceleration
})

ground.receiveShadow = ground.receiveShadow
scene.add(ground)

const light = new THREE.DirectionalLight(directionalLightConfig.color, directionalLightConfig.intensity)
light.position.y = directionalLightConfig.position.y
light.position.z = directionalLightConfig.position.z
light.castShadow = directionalLightConfig.castShadow
scene.add(light)

scene.add(new THREE.AmbientLight(ambientLightConfig.color, ambientLightConfig.intensity))

camera.position.z = ambientLightConfig.position.z
console.log(ground.top)
console.log(cube.bottom)

const keys = {
a: {
    pressed: false
},
d: {
    pressed: false
},
s: {
    pressed: false
},
w: {
    pressed: false
}
}

window.addEventListener('keydown', (event) => {
switch (event.code) {
    case 'KeyA':
    keys.a.pressed = true
    break
    case 'KeyD':
    keys.d.pressed = true
    break
    case 'KeyS':
    keys.s.pressed = true
    break
    case 'KeyW':
    keys.w.pressed = true
    break
    case 'Space':
    cube.velocity.y = playerConfig.jumpVelocity
    break
}
})

window.addEventListener('keyup', (event) => {
switch (event.code) {
    case 'KeyA':
    keys.a.pressed = false
    break
    case 'KeyD':
    keys.d.pressed = false
    break
    case 'KeyS':
    keys.s.pressed = false
    break
    case 'KeyW':
    keys.w.pressed = false
    break
}
})

const enemies = []

let frames = 0
let spawnRate = enermyConfig.spawnRate
function animate() {
const animationId = requestAnimationFrame(animate)
renderer.render(scene, camera)

// movement code
cube.velocity.x = 0
cube.velocity.z = 0
if (keys.a.pressed) cube.velocity.x = -1 * playerConfig.moveVelocity.x
else if (keys.d.pressed) cube.velocity.x = playerConfig.moveVelocity.x

if (keys.s.pressed) cube.velocity.z = playerConfig.moveVelocity.z
else if (keys.w.pressed) cube.velocity.z = -1 * playerConfig.moveVelocity.z

cube.update(ground)
enemies.forEach((enemy) => {
    enemy.update(ground)
    if (
    boxCollision({
        box1: cube,
        box2: enemy
    })
    ) {
    cancelAnimationFrame(animationId)
    }
})

if (frames % spawnRate === 0) {
    if (spawnRate > enermyConfig.spawnRateLimitation) spawnRate -= enermyConfig.spawnRateReduce

    const enemy = new Box({
    width: enermyConfig.width,
    height: enermyConfig.height,
    depth: enermyConfig.depth,
    position: {
        x: (Math.random() - 0.5) * ground.width,
        y: enermyConfig.position.y,
        z: enermyConfig.position.z
    },
    velocity: {
        x: enermyConfig.velocidy.x,
        y: enermyConfig.velocidy.y,
        z: enermyConfig.velocidy.z
    },
    color: enermyConfig.color,
    zAcceleration: enermyConfig.zAcceleration
    })
    enemy.castShadow = enermyConfig.cashtShadow
    scene.add(enemy)
    enemies.push(enemy)
}

frames++
}
animate()