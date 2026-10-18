"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, Edges, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Product3DConfig } from "@/types";

const GOLD = "#c9a050";
const FOREST = "#123b2a";
const INNER_LID = "/images/textures/coffret-inner-lid.jpg";

function prepare(tex: THREE.Texture) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function aspectOf(tex: THREE.Texture, fallback = 1) {
  const img = tex.image as { width?: number; height?: number } | undefined;
  return img?.width && img?.height ? img.width / img.height : fallback;
}

/** Deterministic pseudo-random generator so procedural assets are stable between renders. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ───────────────────────────── Gift box ───────────────────────────── */

export function GiftBox({
  front,
  back = INNER_LID,
  size = [3, 2, 0.5],
  color = FOREST,
}: Extract<Product3DConfig, { kind: "box" }>) {
  const [frontTex, backTex] = useTexture([front, back]);
  useMemo(() => [frontTex, backTex].forEach(prepare), [frontTex, backTex]);

  const width = size[0];
  const depth = size[2];
  // height follows the photo aspect ratio so artwork is never distorted
  const height = width / aspectOf(frontTex, size[0] / size[1]);

  const side = useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 }),
    [color],
  );
  const materials = useMemo(
    () => [
      side,
      side,
      side,
      side,
      new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.45, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.5 }),
    ],
    [side, frontTex, backTex],
  );

  return (
    <group>
      <mesh material={materials} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <Edges threshold={15} color={GOLD} />
      </mesh>
      {/* thin gold band around the box, like a foil trim */}
      <mesh position={[0, -height / 2 + 0.07, 0]}>
        <boxGeometry args={[width + 0.012, 0.035, depth + 0.012]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
}

/* ───────────────────────────── Bottle ───────────────────────────── */

export function Bottle({ label, glassColor = "#2b1507" }: Extract<Product3DConfig, { kind: "bottle" }>) {
  const labelTex = prepare(useTexture(label));
  const profile = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const add = (r: number, y: number) => pts.push(new THREE.Vector2(r, y));
    add(0.001, -1.5);
    add(0.4, -1.5);
    add(0.44, -1.44);
    add(0.44, 0.45);
    // shoulder
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      const k = t * t * (3 - 2 * t);
      add(0.44 - 0.29 * k, 0.45 + t * 0.62);
    }
    add(0.14, 1.55);
    add(0.165, 1.6);
    add(0.165, 1.68);
    add(0.001, 1.68);
    return pts;
  }, []);

  const r = 0.447;
  const h = 1.15;
  const theta = Math.min((h * aspectOf(labelTex, 0.52)) / r, Math.PI * 1.8);

  return (
    <group position={[0, 0.05, 0]}>
      <mesh castShadow>
        <latheGeometry args={[profile, 64]} />
        <meshPhysicalMaterial
          color={glassColor}
          roughness={0.08}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          reflectivity={0.8}
        />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[r, r, h, 64, 1, true, -theta / 2, theta]} />
        <meshStandardMaterial map={labelTex} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* cap */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.3, 48]} />
        <meshStandardMaterial color="#141414" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.66, 0]}>
        <cylinderGeometry args={[0.185, 0.185, 0.04, 48]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ───────────────────────────── Jar ───────────────────────────── */

export function Jar({ label, fill = "#5a2a14" }: Extract<Product3DConfig, { kind: "jar" }>) {
  const labelTex = prepare(useTexture(label));
  const r = 0.85;
  const bodyH = 1.6;
  const labelH = bodyH * 0.62;
  const theta = Math.min((labelH * aspectOf(labelTex, 1.3)) / (r + 0.01), Math.PI * 1.7);

  return (
    <group position={[0, -0.25, 0]}>
      {/* contents */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[r - 0.04, r - 0.04, bodyH - 0.1, 48]} />
        <meshStandardMaterial color={fill} roughness={0.55} />
      </mesh>
      {/* glass */}
      <mesh castShadow>
        <cylinderGeometry args={[r, r, bodyH, 64]} />
        <meshPhysicalMaterial color="#f3ead8" transparent opacity={0.22} roughness={0.05} clearcoat={1} />
      </mesh>
      {/* label */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[r + 0.012, r + 0.012, labelH, 64, 1, true, -theta / 2, theta]} />
        <meshStandardMaterial map={labelTex} roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      {/* gold lid */}
      <mesh position={[0, bodyH / 2 + 0.16, 0]} castShadow>
        <cylinderGeometry args={[r + 0.04, r + 0.04, 0.32, 64]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.28} />
      </mesh>
      <mesh position={[0, bodyH / 2 + 0.33, 0]}>
        <cylinderGeometry args={[r - 0.05, r + 0.04, 0.03, 64]} />
        <meshStandardMaterial color="#d9b66e" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ───────────────────────────── GLB (future assets) ───────────────────────────── */

export function GLBModel({ url, scale = 1 }: Extract<Product3DConfig, { kind: "glb" }>) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => {
    cloned.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
  }, [cloned]);
  return (
    <Center>
      <primitive object={cloned} scale={scale} />
    </Center>
  );
}

export function ProductModel({ config }: { config: Product3DConfig }) {
  switch (config.kind) {
    case "glb":
      return <GLBModel {...config} />;
    case "bottle":
      return <Bottle {...config} />;
    case "jar":
      return <Jar {...config} />;
    default:
      return <GiftBox {...config} />;
  }
}

/* ───────────────────────────── Stone pedestal ───────────────────────────── */

function useStoneTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#d9c8a7";
    ctx.fillRect(0, 0, 512, 512);
    const rand = rng(7);
    // travertine strata
    for (let i = 0; i < 60; i++) {
      const y = rand() * 512;
      ctx.strokeStyle = `rgba(${150 + rand() * 40},${120 + rand() * 30},${80 + rand() * 30},${0.08 + rand() * 0.12})`;
      ctx.lineWidth = 1 + rand() * 4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 4 + (rand() - 0.5) * 3);
      ctx.stroke();
    }
    // pores
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(110,85,55,${rand() * 0.25})`;
      ctx.beginPath();
      ctx.ellipse(rand() * 512, rand() * 512, rand() * 2.4, rand() * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
}

export function Pedestal({ y = -1.9 }: { y?: number }) {
  const map = useStoneTexture();
  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(1.95, 2.1, 0.55, 40, 3);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const rand = rng(42);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const yy = pos.getY(i);
      const radial = Math.hypot(x, z);
      if (radial > 0.01) {
        const k = 1 + (rand() - 0.5) * 0.06;
        pos.setX(i, x * k);
        pos.setZ(i, z * k);
      }
      pos.setY(i, yy + (rand() - 0.5) * (yy > 0 ? 0.03 : 0.05));
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group position={[0, y, 0]}>
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
      <mesh position={[0.15, -0.42, 0.05]} rotation={[0, 0.4, 0]} receiveShadow>
        <cylinderGeometry args={[2.25, 2.45, 0.32, 36]} />
        <meshStandardMaterial map={map} color="#cdb994" roughness={1} />
      </mesh>
    </group>
  );
}

/* ───────────────────────────── Floating dates ───────────────────────────── */

const DATE_SLOTS: { p: [number, number, number]; s: number; r: [number, number, number] }[] = [
  { p: [-2.35, 1.35, 0.4], s: 1, r: [0.4, 0.2, 0.8] },
  { p: [2.3, 1.7, -0.3], s: 0.9, r: [1.1, 0.5, -0.4] },
  { p: [-2.0, -0.65, 0.9], s: 1.1, r: [0.2, 1.2, 0.3] },
  { p: [2.45, -0.2, 0.7], s: 0.95, r: [0.8, -0.3, 1.2] },
  { p: [-1.1, 1.95, -0.6], s: 0.75, r: [1.4, 0.2, 0.1] },
  { p: [1.25, -1.25, 1.3], s: 0.8, r: [0.3, 0.9, -0.8] },
  { p: [-2.7, 0.35, -0.8], s: 0.7, r: [0.9, 0.4, 0.5] },
];

function useWrinkleTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 256, 128);
    const rand = rng(3);
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = rand() > 0.5 ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1 + rand() * 2.5;
      ctx.beginPath();
      const y = rand() * 128;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(80, y + (rand() - 0.5) * 30, 170, y + (rand() - 0.5) * 30, 256, y + (rand() - 0.5) * 20);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
}

export function FloatingDates({ count = 7, animate = true }: { count?: number; animate?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const bump = useWrinkleTexture();
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#5b2410",
        roughness: 0.38,
        clearcoat: 0.9,
        clearcoatRoughness: 0.35,
        sheen: 0.4,
        sheenColor: new THREE.Color("#a0522d"),
        bumpMap: bump,
        bumpScale: 2.2,
      }),
    [bump],
  );
  const slots = DATE_SLOTS.slice(0, count);

  useFrame(({ clock }) => {
    if (!animate || !group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      const base = slots[i];
      child.position.y = base.p[1] + Math.sin(t * 0.8 + i * 1.7) * 0.12;
      child.rotation.x = base.r[0] + t * 0.15 * (i % 2 ? 1 : -1);
      child.rotation.z = base.r[2] + Math.sin(t * 0.5 + i) * 0.2;
    });
  });

  return (
    <group ref={group}>
      {slots.map((d, i) => (
        <mesh key={i} position={d.p} rotation={d.r} scale={[0.36 * d.s, 0.2 * d.s, 0.2 * d.s]} material={material} castShadow>
          <sphereGeometry args={[1, 32, 20]} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────────── Gold accents ───────────────────────────── */

export function GoldAccents({ animate = true }: { animate?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (animate && ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.08;
  });
  const leaves = useMemo(() => {
    const rand = rng(11);
    return Array.from({ length: 14 }, () => ({
      p: [(rand() - 0.5) * 6.5, (rand() - 0.3) * 4, (rand() - 0.5) * 3] as [number, number, number],
      s: 0.03 + rand() * 0.05,
    }));
  }, []);
  return (
    <group ref={ref}>
      {leaves.map((l, i) => (
        <mesh key={i} position={l.p} scale={l.s}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#e2c27d" metalness={1} roughness={0.2} emissive="#b88a3b" emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
}
