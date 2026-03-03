import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    if (user.password !== loginDto.password) {
      await this.incrementAttempts(user.email, user.loginAttempts);
      throw new BadRequestException('Contraseña incorrecta');
    }
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      throw new BadRequestException(
        'Cuenta bloqueada por intentos fallidos. Intente nuevamente en 5 minutos.',
      );
    }
    await this.resetAttempts(user.email);
    return { message: 'login exitoso' };
  }
  async incrementAttempts(email: string, loginAttempts: number) {
    if (loginAttempts >= 3) {
      await this.lockAccount(email);
      throw new BadRequestException(
        'Cuenta bloqueada por intentos fallidos. Intente nuevamente en 5 minutos.',
      );
    }
    return this.usersService.updateUser(email, {
      loginAttempts: loginAttempts + 1,
    });
  }
  async lockAccount(email: string) {
    const lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
    return this.usersService.updateUser(email, { lockedUntil });
  }
  async resetAttempts(email: string) {
    return this.usersService.updateUser(email, {
      loginAttempts: 0,
      lockedUntil: null,
    });
  }
}
