'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      review_id: {
        type: Sequelize.STRING,
        allowNull:false,
        primaryKey: true
      },
      item_id:{
        type: Sequelize.STRING,
        allowNull:false
      },
      rating:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      content:{
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reviews');
  }
};