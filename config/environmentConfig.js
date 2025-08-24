export const cameraConfig = {
    fov:75,
    aspect:window.innerWidth / window.innerHeight,
    near:0.1,
    far:1000,
    position:{
        x:4.61,
        y:2.74,
        z:8
    }
};

export const environmentConfig = {
    width:window.innerWidth,
    height:window.innerHeight,
    gravity:-0.002,
    gravityFriction:0.5
}

export const renderConfig = {
    alpha:true,
    antialias:true,
    shadowMap:{
        enabled:true
    }
}

export const directionalLightConfig={
    color:'#ffffff',
    intensity:1,
    position:{
        x:0,
        y:3,
        z:1
    },
    castShadow:true
}

export const ambientLightConfig={
    color:'#ffffff',
    intensity:0.5,
    position:{
        x:0,
        y:0,
        z:5
    }
}
