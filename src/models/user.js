"use strict";
const sequelize = require("sequelize");
const {Model} = require("sequelize");
const dataTypes = require("sequelize/lib/data-types");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            //define association here
        }
    }
    User.init(
        {
            id_user: DataTypes.STRING,
            username: DataTypes.STRING,
            name: DataTypes.STRING,
            email_address: DataTypes.STRING,
            password: DataTypes.STRING,
            api_key: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
        },
        {
            sequelize,
            modelname: "User",
            timestamps: false,
        }
    );
    return User;
}