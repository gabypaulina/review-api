'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      user_id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      username:{
        type:Sequelize.STRING,
        allowNull:false
      },
      first_name:{
        type:Sequelize.STRING,
        allowNull:false
      },
      last_name:{
        type: Sequelize.STRING,
        allowNull:false
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};