'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Event', {
      event_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      match_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Match',    // The name of the target table
          key: 'match_id'    // The column that this foreign key references
        }
      },
      match_time: {
        type: Sequelize.STRING
      },
      initiating_player: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Player',    // The name of the target table
          key: 'player_id'    // The column that this foreign key references
        }
      },
      receiving_player: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Player',    // The name of the target table
          key: 'player_id'    // The column that this foreign key references
        }
      },
      event_type: {
        type: Sequelize.STRING
      },
      event_desc: {
        type: Sequelize.STRING
      },
      points_awarded: {
        type: Sequelize.SMALLINT
      },
      created_by: {
        type: Sequelize.STRING
      },
      processed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false, 
      allowNull: false, 
      }   
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Event');
  }
};
