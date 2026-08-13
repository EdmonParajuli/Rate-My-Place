import { InputSessionInterface, SessionInterface } from '../interfaces/sessionInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class SessionRepository extends BaseRepository<InputSessionInterface, SessionInterface> {
  constructor() {
    super(Model.Session);
  }
}
