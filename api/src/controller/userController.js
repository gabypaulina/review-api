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
const user = require("../models/user");

const JWT_KEY = "proyek_ws";

const users = require("../models/user")(sequelize, DataTypes)

const getUser = async (req, res) => {
    let user_db = await getIdUsername()

    return res.status(200).send(user_db)
}

const searchUser = async (req, res) => {
    let username = req.params.username

    let user = await selectUsersByUsername(username);
    if (!user) {
        return res.status(404).send({ message: "User tidak ditemukan" });
    }

    return res.status(200).send({
        idUser: user.idUser,
        username: user.username
    })
}

async function getIdUsername() {
    let [users, metadata] = await sequelize.query(
      "SELECT users.idUser, users.username FROM users",
      {
        type: Sequelize.SELECT
      }
    );
    return users;
}

// async function searchUsername() {
//     let [users, metadata] = await sequelize.query(
//       "SELECT * FROM users WHERE username like ?",
//       {
//         type: Sequelize.SELECT
//       }
//     );
//     return users;
// }

async function selectUsersByUsername(username) {
    let [users, metadata] = await sequelize.query(
      "select * from users where username = :username",
      {
        replacements: {
          username: username,
        },
      }
    );
    return users[0];
  }

module.exports = { getUser, searchUser };