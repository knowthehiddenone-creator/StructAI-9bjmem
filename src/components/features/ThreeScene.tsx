import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    THREE: {
      WebGLRenderer: new (opts: object) => {
        setPixelRatio: (v: number) => void;
        setClearColor: (c: number, a: number) => void;
        setSize: (w: number, h: number) => void;
        render: (scene: object, camera: object) => void;
      };
      Scene: new () => object & { add: (o: object) => void };
      PerspectiveCamera: new (fov: number, aspect: number, near: number, far: number) => object & {
        position: { set: (x: number, y: number, z: number) => void };
        lookAt: (x: number, y: number, z: number) => void;
        aspect: number;
        updateProjectionMatrix: () => void;
      };
      AmbientLight: new (c: number, i: number) => object;
      DirectionalLight: new (c: number, i: number) => object & { position: { set: (...a: number[]) => void } };
      PointLight: new (c: number, i: number) => object & { position: { set: (...a: number[]) => void } };
      BoxGeometry: new (w: number, h: number, d: number) => object;
      MeshBasicMaterial: new (opts: object) => object;
      Mesh: new (geo: object, mat: object) => object & { position: { set: (x: number, y: number, z: number) => void }; rotation: { y: number } };
      Group: new () => object & { add: (o: object) => void; rotation: { y: number } };
      GridHelper: new (s: number, d: number, c1: number, c2: number) => object & { position: { y: number }; material: { opacity: number; transparent: boolean } };
      BufferGeometry: new () => object & { setAttribute: (n: string, b: object) => void; setFromPoints: (p: object[]) => object };
      BufferAttribute: new (arr: Float32Array, n: number) => object;
      Points: new (geo: object, mat: object) => object & { geometry: { attributes: { position: { array: Float32Array; needsUpdate: boolean } }; }; _velocities?: { vx: number; vy: number; vz: number }[] };
      PointsMaterial: new (opts: object) => object;
      LineBasicMaterial: new (opts: object) => object;
      Line: new (geo: object, mat: object) => object;
      Vector3: new (x: number, y: number, z: number) => object;
    };
  }
}

interface Velocity { vx: number; vy: number; vz: number; }

export default function ThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const sceneRef  = useRef<{ group?: object & { rotation: { y: number } }; particles?: ReturnType<typeof window.THREE.Points> }>({});

  useEffect(() => {
    if (!canvasRef.current || !window.THREE) return;
    const THREE = window.THREE;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(4, 3.5, 6);
    camera.lookAt(0, 0.5, 0);

    scene.add(new THREE.AmbientLight(0xDDF4FF, 0.6));
    const dir = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    dir.position.set(5, 10, 5);
    scene.add(dir);
    const pt = new THREE.PointLight(0x0969DA, 0.8);
    pt.position.set(-3, 5, -3);
    scene.add(pt);

    const group = new THREE.Group();
    scene.add(group);
    sceneRef.current.group = group;

    const wireMat = new THREE.MeshBasicMaterial({ color: 0x0969DA, wireframe: true });
    const concMat = new THREE.MeshBasicMaterial({ color: 0xD0D7DE, wireframe: true });
    const plateMat = new THREE.MeshBasicMaterial({ color: 0x0969DA, wireframe: true });

    // Column flanges
    const flangeGeo = new THREE.BoxGeometry(0.15, 2.5, 0.02);
    const lFlange = new THREE.Mesh(flangeGeo, wireMat);
    lFlange.position.set(-0.3, 1.29, 0);
    group.add(lFlange);
    const rFlange = new THREE.Mesh(flangeGeo, wireMat);
    rFlange.position.set(0.3, 1.29, 0);
    group.add(rFlange);
    const web = new THREE.Mesh(new THREE.BoxGeometry(0.01, 2.5, 0.58), wireMat);
    web.position.set(0, 1.29, 0);
    group.add(web);

    // Base plate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.045, 0.85), plateMat);
    plate.position.set(0, 0.02, 0);
    group.add(plate);

    // Pedestal
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.2), concMat);
    pedestal.position.set(0, -0.44, 0);
    group.add(pedestal);

    // Anchor bolts
    const anchorMat = new THREE.LineBasicMaterial({ color: 0x0969DA });
    const boltPositions: [number, number][] = [[-0.35, -0.25], [0.35, -0.25], [-0.35, 0.25], [0.35, 0.25]];
    boltPositions.forEach(([ax, az]) => {
      const geo = new THREE.BufferGeometry();
      const pts = new Float32Array([ax, 0.02, az, ax, -0.8, az]);
      geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      group.add(new THREE.Line(geo, anchorMat));
    });

    // Grid
    const grid = new THREE.GridHelper(6, 12, 0xD0D7DE, 0xEAEEF2);
    grid.position.y = -0.85;
    grid.material.opacity = 0.3;
    grid.material.transparent = true;
    scene.add(grid);

    // Particles
    const pCount = 150;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const velocities: Velocity[] = [];
    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(Math.random() * 2 - 1);
      const r     = 2.8 + Math.random() * 1.5;
      pPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 0.5;
      pPos[i * 3 + 2] = r * Math.cos(phi);
      velocities.push({ vx: (Math.random() - 0.5) * 0.004, vy: (Math.random() - 0.5) * 0.004, vz: (Math.random() - 0.5) * 0.004 });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x0969DA, size: 0.022, opacity: 0.5, transparent: true });
    const particles = new THREE.Points(pGeo, pMat);
    particles._velocities = velocities;
    scene.add(particles);
    sceneRef.current.particles = particles;

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      if (sceneRef.current.group) sceneRef.current.group.rotation.y += 0.003;
      if (sceneRef.current.particles) {
        const pos  = sceneRef.current.particles.geometry.attributes.position.array;
        const vels = sceneRef.current.particles._velocities!;
        for (let i = 0; i < pCount; i++) {
          pos[i * 3]     += vels[i].vx;
          pos[i * 3 + 1] += vels[i].vy;
          pos[i * 3 + 2] += vels[i].vz;
          const dx = pos[i * 3]; const dy = pos[i * 3 + 1] - 0.5; const dz = pos[i * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist > 5.0 || dist < 1.2) { vels[i].vx *= -1; vels[i].vy *= -1; vels[i].vz *= -1; }
        }
        sceneRef.current.particles.geometry.attributes.position.needsUpdate = true;
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} id="three-canvas" />;
}
