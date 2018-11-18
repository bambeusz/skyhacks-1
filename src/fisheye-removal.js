const FisheyeGL = require('./fisheyegl');

var distorter = FisheyeGL({
    selector: '', // a canvas element to work with
    lens: {
        a: 1,    // 0 to 4;  default 1
        b: 1,    // 0 to 4;  default 1
        Fx: 0.0, // 0 to 4;  default 0.0
        Fy: 0.0, // 0 to 4;  default 0.0
        scale: 1.5 // 0 to 20; default 1.5
    },
        // fov: {
        //     x: 1, // 0 to 2; default 1
        //     y: 1  // 0 to 2; default 1
        // },
        // fragmentSrc: "path/to/fragment.glfs", // optional, defaults to an inbuilt fragment shader
        // vertexSrc:   "path/to/vertex.glvs" // optional, defaults to an inbuilt vertex shader
});

// distorter.getImage(); // <= returns a native JavaScript Image object based on the DOM element
// distorter.getImage('./Validation/0_51/0_51_left/0_51_left_0.jpg'); // <= format can be specified

distorter.setImage('./Validation/0_51/0_51_left/0_51_left_0.jpg'); // <= load a new image with the same distortion settings

// console.log();
