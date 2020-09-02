import * as THREE from 'three';
import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { MemberEntity } from 'src/app/lib/entities/member/MemberEntity';

@Injectable({
    providedIn: 'root',
})
export class ThreejsService implements OnDestroy {
    private canvas: HTMLCanvasElement;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;

    private parentContainer: THREE.Mesh;
    private circles: THREE.Mesh[];
    private width: number = window.innerWidth;
    private height: number = window.innerHeight;

    private frameId: number = null;

    public constructor(private ngZone: NgZone) {}

    public ngOnDestroy(): void {
      if (this.frameId != null) {
        cancelAnimationFrame(this.frameId);
      }
    }

    public createScene(canvas: ElementRef<HTMLCanvasElement>, nicks: MemberEntity[]): void {

        // TODO: Only returns available nicknames
        nicks.forEach(function(nick: MemberEntity): void {
          console.log(nick.name);
        });


        // The first step is to get the reference of the canvas element from our HTML document
        this.canvas = canvas.nativeElement;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,    // transparent background
            antialias: true // smooth edges
        });
        this.renderer.setSize(this.width, this.height);

        // create the scene
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            75, this.width / this.height, 0.1, 1000
        );
        this.scene.add(this.camera);
        this.camera.position.copy(new THREE.Vector3(this.fti(0), this.fti(0), this.fti(10)) );
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        // code here --x

        this.parentContainer = new THREE.Mesh();
        this.scene.add(this.parentContainer);

        this.circles = this.createCirclesOffsetPosition(['hans', 'peter', 'paul']);
        this.circles.forEach(c => {
            this.parentContainer.add(c);
        });

    }

    public animate(): void {
      // We have to run this outside angular zones,
      // because it could trigger heavy changeDetection cycles.
      this.ngZone.runOutsideAngular(() => {
        if (document.readyState !== 'loading') {
          this.render();
        } else {
          window.addEventListener('DOMContentLoaded', () => {
            this.render();
          });
        }

        window.addEventListener('resize', () => {
          this.resize();
        });
      });
    }

    public render(): void {
      this.frameId = requestAnimationFrame(() => {
        this.render();
      });

        this.parentContainer.rotateZ(.001);
        // keeps the circle upright
        this.circles.forEach(c => {c.rotateZ(-0.001); });

      // this.mesh.rotation.x += 0.01;
      // this.mesh.rotation.y += 0.01;

      this.renderer.render(this.scene, this.camera);
    }

    public resize(): void {

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize( this.width, this.height );
    }

    public createCirclesOffsetPosition(nicknames: string[]): THREE.Mesh[] {
        const radius = 3;
        const segments = 10;
        const circles = [];

        for (let i = 0; i < nicknames.length; i++) {
            circles.push(this.createCircle(radius, segments));
        }

        const offsetDistance = 20;

        // east, north, west, south
        const vectorList = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, -1, 0)
        ];

        // apply the offset distance to each offsetVector
        vectorList.forEach(offsetVector => {
            offsetVector.setLength(offsetDistance);
        });

        // add the offset vectors to each circle to give them their offset starting position
        for (let i = 0; i < circles.length; i++) {
            circles[i].position.add(vectorList[i]);
        }

        return circles;
    }

    public createCircle(radius: number = 1, sections: number = 8): THREE.Mesh {
        const geo = new THREE.CircleGeometry(radius, sections);
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
        console.log('Added circle to scene');
        this.scene.add(mesh);
        return mesh;
    }

    public fti(feet: number): number {
        return feet * 12;
    }
}
