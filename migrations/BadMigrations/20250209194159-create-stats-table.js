'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Stats', {
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Player',    
          key: 'player_id'    
        }
      },
      player_name: {
        type: Sequelize.STRING
      },
      player_school: {
        type: Sequelize.STRING
      },
      player_belt: {
        type: Sequelize.STRING
      },
      match_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Match',    // The name of the target table
          key: 'match_id'    // The column that this foreign key references
        }
      },
      match_type: {
        type: Sequelize.STRING
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
      event_id: {
        allowNull: false,
        references: {
          model: 'Event',    // The name of the target table
          key: 'event_id'    // The column that this foreign key references
        },
        type: Sequelize.INTEGER
      },
      position_type: {
        type: Sequelize.STRING
      },
      position_desc: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.STRING
      },
      opponent_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Player',    // The name of the target table
          key: 'player_id'    // The column that this foreign key references
        }
      },
      opponent_name: {
        type: Sequelize.STRING
      },
      opponent_school: {
        type: Sequelize.STRING
      },
      opponent_belt: {
        type: Sequelize.STRING
      },
      created_by: {
        type: Sequelize.STRING
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Stats');
  }
};
