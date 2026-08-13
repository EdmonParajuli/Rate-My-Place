import { Transaction } from 'sequelize';
import { AuthService } from './authService';
import PlaceService from './placeService';
import { SessionService } from './sessionService';
import { Database } from '../config';
import { signToken } from '../utils/jwt';
import { UserTypeEnum } from '../enums/userTypesEnum';
import { ContextInterface, InputSignUpBusinessInterface, SignUpBusinessResponseInterface } from '../interfaces';

// Orchestration-only - owns no repository of its own (same shape as
// PlatformStatsService), composes AuthService/PlaceService's own methods so
// each still owns exactly one repository, per CLAUDE.md's service rule. See
// docs/03-architecture.md's "signUpBusiness" section for the resolved
// architecture question this follows.
export class BusinessOnboardingService {
  private authService: AuthService;
  private placeService: PlaceService;
  private sessionService: SessionService;

  constructor() {
    this.authService = new AuthService();
    this.placeService = new PlaceService();
    this.sessionService = new SessionService();
  }

  private async withTransaction<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T> {
    const transaction = await Database.sequelize.transaction();
    try {
      const result = await fn(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async signUpBusiness(
    input: InputSignUpBusinessInterface,
    context: ContextInterface
  ): Promise<SignUpBusinessResponseInterface> {
    const { name, email, password, ...placeInput } = input;

    // The transaction covers exactly the two writes that must be atomic - if
    // Place creation fails (e.g. an invalid categoryId), the User creation
    // rolls back too, so no business account is ever left without a place.
    const { user, place } = await this.withTransaction(async (transaction) => {
      const user = await this.authService.createUser(
        { name, email, password, userType: UserTypeEnum.BUSINESS },
        transaction
      );
      const place = await this.placeService.createPlace(
        { ...placeInput, ownerId: user.id },
        transaction
      );

      return { user, place };
    });

    // Token-signing and session creation happen after commit - same
    // "re-fetch/follow-up happens after the transaction resolves" rule
    // ReviewService.updateReview already documents, since neither belongs to
    // the atomicity this mutation exists to guarantee.
    const { accessToken, refreshToken } = signToken(user.id, user.userType);

    await this.sessionService.createSession({
      userId: user.id,
      refreshToken,
      userAgent: context.headers?.["user-agent"] as string | undefined,
      ip: context.ip,
    });

    return {
      user,
      place,
      token: {
        access: accessToken,
        refresh: refreshToken,
      },
    };
  }
}
