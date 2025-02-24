'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Users','school_affiliations', {
        type: Sequelize.INTEGER,
        references: {
          model: 'School',
          key: 'school_id'
        }
      })

      await queryInterface.addColumn('Users','school_affiliation_freeform', {
        type: Sequelize.STRING
      })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Users','school_affiliations')
    await queryInterface.removeColumn('Users','school_affiliation_freeform')
  }
};
