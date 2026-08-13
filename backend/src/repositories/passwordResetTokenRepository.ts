import { InputPasswordResetTokenInterface, PasswordResetTokenInterface } from '../interfaces/passwordResetTokenInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class PasswordResetTokenRepository extends BaseRepository<InputPasswordResetTokenInterface, PasswordResetTokenInterface> {
  constructor() {
    super(Model.PasswordResetToken);
  }
}
