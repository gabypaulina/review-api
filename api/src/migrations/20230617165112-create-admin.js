'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Admins', {
      admin_id: {
        type: Sequelize.STRING,
        allowNull:false,
        primaryKey:true
      },
      username:{
        type: Sequelize.STRING,
        allowNull:false
      },
      password:{
        type: Sequelize.STRING,
        allowNull:false,
      },
      email:{
        type:Sequelize.STRING,
        allowNull:false
      },
      api_key:{
        type:Sequelize.STRING,
        allowNull:false
      },
      api_hit:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      saldo:{
        type: Sequelize.INTEGER,
        allowNull:false
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Admins');
  }
};