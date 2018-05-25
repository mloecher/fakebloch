/// <reference path="typings/threejs/three.d.ts" />

class Spin {

    M0: number = 1.0;
    M: THREE.Vector3 = new THREE.Vector3(0,0,1);
    B_off: THREE.Vector3 = new THREE.Vector3(0,0,0);
    gamma: number = 1.0;
    t1: number = 4;
    t2: number = 8;
    pos: THREE.Vector3 = new THREE.Vector3(0,0,0);

    /*applyBloch(B: THREE.Vector3, GRAD: THREE.Vector3, del_t: number) {
        this.M.x += 1.0;
    }*/

    applyBloch(B: THREE.Vector3, delT: number) {
        var B_eff = new THREE.Vector3().addVectors(B, this.B_off);
        var delM = new THREE.Vector3().crossVectors(this.M, B_eff);
        delM.multiplyScalar(this.gamma);
        var relax = new THREE.Vector3(-this.M.x/this.t2, -this.M.y/this.t2, -(this.M.z-this.M0)/this.t1)
        delM.add(relax);
        delM.multiplyScalar(delT);
        this.M.add(delM);

        /*console.log(relax)*/
    }
}

class AllSpins {
    allSpins: Spin[] = [];
    allArrows: THREE.Object3D = new THREE.Object3D();
    numSpins: number;

    constructor(numSpins: number) {
        this.numSpins = numSpins;
        this.allArrows.name = "allArrows";
        for (var i = 0; i <= numSpins; i++) {
            this.allSpins[i] = new Spin();
            this.allSpins[i].B_off.z += (numSpins/2 - i)/numSpins/2;

        }
    }

    clearArrows() {
        var to_remove;
        for (var i = 0; i <= this.numSpins; i++) {
            to_remove = this.allArrows.getObjectByName("arrow" + i);
            this.allArrows.remove(to_remove);
        }
        to_remove = null;
    }

    updateArrows() {
        for (var i = 0; i <= this.numSpins; i++) {
            var dir = this.allSpins[i].M.normalize();
            var origin = new THREE.Vector3( 0, 0, 0 );
            var length = this.allSpins[i].M0;
            var hex = 0xff0000;
            var arrow = new THREE.ArrowHelper( dir, origin, length, hex, .2, .2 );
            arrow.name = "arrow" + i;
            this.allArrows.add( arrow );
        }

    }

    applyBloch(B: THREE.Vector3, delT: number) {
        for (var i = 0; i <= this.numSpins; i++) {
            this.allSpins[i].applyBloch(B, delT);
        }
    }

}
