'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // docs/specs/phase-11-qr-review-flow.md, ticket 01. One active QR per
    // place - the partial unique index below is what actually enforces that,
    // not application logic alone (same belt-and-suspenders precedent
    // providers_reviews' place_id+reviewer_id partial index sets). Keyed on
    // place_id, not owner_id, deliberately - a business account owning
    // multiple places later needs zero schema change here, just more rows.
    await queryInterface.createTable('providers_review_qr_codes', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      place_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers_places',
          key: 'id'
        }
      },
      // High-entropy, unguessable - what actually gets encoded in the QR/URL,
      // never the place's own (sequential, guessable) id. Stored plaintext,
      // deliberately - unlike a password-reset code, a leaked token only ever
      // points at an already-public review form, not an account takeover.
      public_token: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // The only lifecycle this token has in V1 - no expiration (a QR sticker
      // lives on a wall for years, unlike a minutes-lived reset code), no
      // locked/unlocked state (that's a confirmed V2-only concept, not even
      // stubbed here). false means either superseded by a regenerate or
      // cascaded-off by its place being deleted/deactivated.
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers_users',
          key: 'id'
        }
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

    await queryInterface.addIndex('providers_review_qr_codes', ['public_token'], {
      unique: true,
      name: 'providers_review_qr_codes_public_token_unique'
    });

    // One live QR per place - regenerate creates a new row and flips this one
    // to false rather than updating in place, so old (superseded) rows stay
    // around as history without blocking a new active row for the same place.
    await queryInterface.addIndex('providers_review_qr_codes', ['place_id'], {
      unique: true,
      name: 'providers_review_qr_codes_place_id_active_unique',
      where: {
        is_active: true
      }
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('providers_review_qr_codes');
  }
};
