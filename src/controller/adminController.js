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
  let schema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(8),
  });
};

try {
  await schema.validateAsync(req.body);
} catch (error) {
  if (error.toString().includes("empty")) {
    return res.status(400).send({ message: "Invalid data field" });
  }
  if (error.toString().includes("username")) {
    return res
      .status(400)
      .send({ message: "Username has already been taken" });
  }
  if (error.toString().includes("email")) {
    return res.status(400).send({
      message: "Invalid email address",
    });
  }

  return res.status(400).send({ message: error.message });
}

let admin_db = await sequelize.query("select * from admin", {
  type: Sequelize.SELECT,
});

let newId = "U" + (admin_db[0].length + 1).toString().padStart(3, "0");

const coba = (req, res) => {
  console.log("done");
  return res.status(200).send("done");
};

module.exports = { coba };
