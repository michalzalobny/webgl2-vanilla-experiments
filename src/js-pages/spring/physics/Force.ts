import { Particle } from '../Components/Particle';
import { Vec3 } from '../lib/math/Vec3';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export class Force {
  static GenerateDragForce(particle: Particle, k: number) {
    let dragForce = new Vec3();
    if (particle.velocity.squaredLen() > 0) {
      const dragDirection = particle.velocity.clone().normalize().multiply(-1);
      const dragMagnitude = k * particle.velocity.squaredLen();
      dragForce = dragDirection.multiply(dragMagnitude);
    }
    return dragForce;
  }

  static GenerateFrictionForce(particle: Particle, k: number) {
    const frictionDirection = particle.velocity.clone().normalize().multiply(-1);
    const frictionMagnitude = k;
    const frictionForce = frictionDirection.multiply(frictionMagnitude);
    return frictionForce;
  }

  static GenerateGravitationalForce(
    particle1: Particle,
    particle2: Particle,
    G: number,
    minDistance: number,
    maxDistance: number
  ) {
    const d = particle2.mesh.position.clone().sub(particle1.mesh.position);
    let distanceSquared = d.squaredLen();
    if (distanceSquared === 0) return new Vec3();
    distanceSquared = clamp(distanceSquared, minDistance, maxDistance);
    const attractionDirection = d.clone().normalize();
    const attractionMagnitude = (G * particle1.mass * particle2.mass) / distanceSquared;
    const attractionForce = attractionDirection.multiply(attractionMagnitude);
    return attractionForce;
  }

  static GenerateSpringForce(particle: Particle, anchor: Vec3, restLength: number, k: number) {
    const d = particle.mesh.position.clone().sub(anchor);
    const displacement = d.len() - restLength;
    const springDirection = d.clone().normalize();
    const springMagnitude = -k * displacement;
    const springForce = springDirection.multiply(springMagnitude);
    return springForce;
  }
}
