const {Sequelize, DataTypes} = require("sequelize");

const sequelize = new Sequelize ("project_ws", "root", "", {
    host: "localhost",
    port: 3306,
    dialect: "mysql",
})
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_KEY;

const users = require("../models/user")(sequelize, DataTypes);
// random string
// const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

async function getUser(username) {
    let userGet = await users.findAll({
        where: {
            username: username,
        },
    });
    return userGet;
}

const coba = (req, res) => {
    return res.status(200).send("Helo")
}

module.exports = {coba};