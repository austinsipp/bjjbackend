'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Event', 'Event_initiating_player_fkey');
    await queryInterface.removeConstraint('Event', 'Event_receiving_player_fkey');
    await queryInterface.changeColumn('Event', 'initiating_player', {
      type: Sequelize.STRING
    });
    await queryInterface.changeColumn('Event', 'receiving_player', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Event', 'initiating_player', {
      type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Player',    // The name of the target table
          key: 'player_id'    // The column that this foreign key references
        }
    });
    await queryInterface.changeColumn('Event', 'receiving_player', {
      type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Player',    // The name of the target table
          key: 'player_id'    // The column that this foreign key references
        }
    });
  }
};
