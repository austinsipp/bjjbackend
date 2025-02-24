'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Match', {
      match_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      match_type: {
        type: Sequelize.STRING
      },
      rule_set: {
        type: Sequelize.STRING
      },
      left_player: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Player',    // The name of the target table
          key: 'player_id'    // The column that this foreign key references
        }
      },
      right_player: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Player',    // The name of the target table
          key: 'player_id'    // The column that this foreign key references
        }
      },
      date_of_match: {
        type: Sequelize.DATE
      },
      match_desc: {
        type: Sequelize.STRING
      },
      assoc_spec_event: {
        type: Sequelize.STRING
      },
      created_by: {
        type: Sequelize.STRING
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Match');
  }
};
