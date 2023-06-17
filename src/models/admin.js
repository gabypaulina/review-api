'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Admin.init(
    {
      admin_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
      },
      username:DataTypes.STRING,
      password:DataTypes.STRING,
      email: DataTypes.STRING,
      api_key: DataTypes.STRING,
      api_hit: DataTypes.INTEGER,
      saldo: DataTypes.INTEGER
    }, 
    {
    sequelize,
    modelName: 'Admin',
    timestamps:false
  });
  return Admin;
};