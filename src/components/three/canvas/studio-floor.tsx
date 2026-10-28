"use client";
import { ContactShadows } from "@react-three/drei";
import { MATERIALS } from "../presets";

/** Sol studio crème : disque + ombres de contact. `dark` pour le fond sombre du studio 3D. */
export function StudioFloor({ dark = false, radius = 2.6 }: { dark?: boolean; radius?: number }) {
  return (
    <group position={[0, -0.001, 0]}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[radius, 64]} />
        <meshStandardMaterial color={dark ? MATERIALS.floorDark : MATERIALS.floorLight} roughness={0.95} />
      </mesh>
      <ContactShadows position={[0, 0.002, 0]} opacity={dark ? 0.6 : 0.42} scale={radius * 2} blur={2.4} far={2} resolution={512} color={MATERIALS.shadow} />
    </group>
  );
}
