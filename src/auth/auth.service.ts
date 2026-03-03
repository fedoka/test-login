import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 3;
  private readonly LOCK_TIME = 5 * 60 * 1000; // 5 minutos
  constructor(private readonly usersService: UsersService) {}
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    this.checkLock(user.lockedUntil);
    if (user.password !== loginDto.password) {
      await this.incrementAttempts(user.email, user.loginAttempts);
      throw new BadRequestException('Contraseña incorrecta');
    }
    await this.resetAttempts(user.email);
    return { message: 'login exitoso', logged: true };
  }
  checkLock(lockedUntil: Date) {
    if (lockedUntil && new Date() < new Date(lockedUntil)) {
      throw new BadRequestException(
        `Cuenta bloqueada por intentos fallidos. Intente nuevamente en ${this.LOCK_TIME / 60000} minutos.`,
      );
    }
  }
  async incrementAttempts(email: string, loginAttempts: number) {
    const newAttempts = loginAttempts + 1;
    if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      await this.lockAccount(email);
      throw new BadRequestException(
        `Cuenta bloqueada por intentos fallidos. Intente nuevamente en ${this.LOCK_TIME / 60000} minutos.`,
      );
    }
    await this.usersService.updateUser(email, {
      loginAttempts: newAttempts,
    });
  }
  async lockAccount(email: string) {
    const lockedUntil = new Date(Date.now() + this.LOCK_TIME);
    await this.usersService.updateUser(email, { lockedUntil });
  }
  async resetAttempts(email: string) {
    await this.usersService.updateUser(email, {
      loginAttempts: 0,
      lockedUntil: null,
    });
  }
}
