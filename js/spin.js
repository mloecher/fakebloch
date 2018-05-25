/// <reference path="typings/threejs/three.d.ts" />
var Spin = (function () {
    function Spin() {
        this.M0 = 1.0;
        this.M = new THREE.Vector3(0, 0, 1);
        this.B_off = new THREE.Vector3(0, 0, 0);
        this.gamma = 1.0;
        this.t1 = 4;
        this.t2 = 8;
        this.pos = new THREE.Vector3(0, 0, 0);
    }
    /*applyBloch(B: THREE.Vector3, GRAD: THREE.Vector3, del_t: number) {
        this.M.x += 1.0;
    }*/
    Spin.prototype.applyBloch = function (B, delT) {
        var B_eff = new THREE.Vector3().addVectors(B, this.B_off);
        var delM = new THREE.Vector3().crossVectors(this.M, B_eff);
        delM.multiplyScalar(this.gamma);
        var relax = new THREE.Vector3(-this.M.x / this.t2, -this.M.y / this.t2, -(this.M.z - this.M0) / this.t1);
        delM.add(relax);
        delM.multiplyScalar(delT);
        this.M.add(delM);
        /*console.log(relax)*/
    };
    return Spin;
})();
var AllSpins = (function () {
    function AllSpins(numSpins) {
        this.allSpins = [];
        this.allArrows = new THREE.Object3D();
        this.numSpins = numSpins;
        this.allArrows.name = "allArrows";
        for (var i = 0; i <= numSpins; i++) {
            this.allSpins[i] = new Spin();
            this.allSpins[i].B_off.z += (numSpins / 2 - i) / numSpins / 2;
        }
    }
    AllSpins.prototype.clearArrows = function () {
        var to_remove;
        for (var i = 0; i <= this.numSpins; i++) {
            to_remove = this.allArrows.getObjectByName("arrow" + i);
            this.allArrows.remove(to_remove);
        }
        to_remove = null;
    };
    AllSpins.prototype.updateArrows = function () {
        for (var i = 0; i <= this.numSpins; i++) {
            var dir = this.allSpins[i].M.normalize();
            var origin = new THREE.Vector3(0, 0, 0);
            var length = this.allSpins[i].M0;
            var hex = 0xff0000;
            var arrow = new THREE.ArrowHelper(dir, origin, length, hex, .2, .2);
            arrow.name = "arrow" + i;
            this.allArrows.add(arrow);
        }
    };
    AllSpins.prototype.applyBloch = function (B, delT) {
        for (var i = 0; i <= this.numSpins; i++) {
            this.allSpins[i].applyBloch(B, delT);
        }
    };
    return AllSpins;
})();
