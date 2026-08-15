'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Badge catalog - paranoid: true like every other reference table, since
    // soft-deleting a badge later is a real (if unlikely) admin action. The
    // criteria for earning each badge is NOT stored here (no criteria/threshold
    // columns to parse) - it's a small hardcoded map in badgeService.ts, same
    // "start simple, no configurable rules engine" precedent
    // businessDashboardMath.ts's reputation-score formula already set.
    await queryInterface.createTable('providers_badges', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      key: {
        type: Sequelize.ENUM('FIRST_REVIEW', 'PROLIFIC_REVIEWER', 'HELPFUL_REVIEWER', 'EXPLORER', 'ELITE_REVIEWER'),
        allowNull: false,
        unique: true
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.bulkInsert('providers_badges', [
      {
        key: 'FIRST_REVIEW',
        label: 'First Review',
        description: 'Wrote your first review.',
        icon: 'award',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'PROLIFIC_REVIEWER',
        label: 'Prolific Reviewer',
        description: 'Wrote 10 or more reviews.',
        icon: 'flame',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'HELPFUL_REVIEWER',
        label: 'Helpful Reviewer',
        description: 'Received 10 or more helpful votes.',
        icon: 'thumbs-up',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'EXPLORER',
        label: 'Explorer',
        description: 'Reviewed 5 or more different places.',
        icon: 'compass',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'ELITE_REVIEWER',
        label: 'Elite Reviewer',
        description: 'Wrote 10+ reviews and earned 25+ helpful votes.',
        icon: 'crown',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // No deleted_at / paranoid on this one - an earned badge is a permanent
    // fact once awarded (never re-evaluated or revoked, see
    // docs/specs/phase-5-badges.md), so there's nothing to soft-delete. Unique
    // index on (user_id, badge_id) is the insert-guard that makes a badge
    // earnable only once per user.
    await queryInterface.createTable('providers_user_badges', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers_users',
          key: 'id'
        }
      },
      badge_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers_badges',
          key: 'id'
        }
      },
      earned_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('providers_user_badges', ['user_id', 'badge_id'], {
      unique: true,
      name: 'providers_user_badges_user_id_badge_id_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('providers_user_badges');
    await queryInterface.dropTable('providers_badges');
    // Postgres ENUM types aren't dropped automatically when the column that
    // used them is removed - clean it up explicitly so undo is actually
    // reversible, same as add-price-range-to-places.js / saved-places.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_providers_badges_key";');
  }
};
