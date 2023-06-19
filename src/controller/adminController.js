const { Sequelize, DataTypes } = require("sequelize");
const { development } = require("../config/config.json");
const sequelize = new Sequelize(
  development.database,
  development.username,
  development.password,
  {
    host: development.host,
    port: 3306,
    dialect: "mysql",
  }
);

const Joi = require("joi");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const JWT_KEY = "proyek_ws";

const admins = require("../models/admin")(sequelize, DataTypes);

const register = async (req, res) => {
  let schema = Joi.object({});
};

let admin_db = await sequelize.query("select * from admin", {
  type: Sequelize.SELECT,
});

let newId = "U" + (admin_db[0].length + 1).toString().padStart(3, "0");

const coba = (req, res) => {
  console.log("done");
  return res.status(200).send("done");
};

module.exports = { coba };
