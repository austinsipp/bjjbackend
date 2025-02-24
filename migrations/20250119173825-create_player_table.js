'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Player', {
      player_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',    // The name of the target table
          key: 'user_id'    // The column that this foreign key references
        }
      },
      created_date: {
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Player');
  }
};
