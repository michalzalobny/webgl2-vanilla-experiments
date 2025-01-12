import { Particle } from '../Components/Particle';
import { Vec3 } from '../lib/math/Vec3';

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
}
