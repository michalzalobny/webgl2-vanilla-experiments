import { Particle } from '../Components/Particle';
import { Vec3 } from '../lib/math/Vec3';

export class Force {
  static GenerateDragForce(particle: Particle, k: number) {
    let dragForce = new Vec3();
    const velocitySquaredLen = particle.velocity.squaredLen();
    if (velocitySquaredLen > 0) {
      const dragDirection = particle.velocity.clone().normalize().multiply(-1);
      const dragMagnitude = k * velocitySquaredLen;
      dragForce = dragDirection.multiply(dragMagnitude);
    }

    return dragForce;
  }
}
