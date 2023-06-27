'use strict';

const { sequelize } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Items', {
      item_id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      admin_id:{
        type: Sequelize.STRING,
        allowNull:false
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Items');
  }
};