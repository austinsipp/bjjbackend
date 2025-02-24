'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Remove the foreign key constraint
    await queryInterface.removeConstraint('Match', 'Match_left_player_fkey');
    await queryInterface.removeConstraint('Match', 'Match_right_player_fkey');
    await queryInterface.changeColumn('Match', 'left_player', {
      type: Sequelize.STRING
    });
    await queryInterface.changeColumn('Match', 'right_player', {
      type: Sequelize.STRING
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Match', 'left_player', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Player',    // The name of the target table
        key: 'player_id'    // The column that this foreign key references
      }
    });
    await queryInterface.changeColumn('Match', 'right_player', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Player',    // The name of the target table
        key: 'player_id'    // The column that this foreign key references
      }
    });
  }
};
