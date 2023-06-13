const router = require("express").Router();

//user endpoints
const { getUser, coba, searchUser } = require("../controllers/userController");

router.get("/coba", coba);
router.get("/users", getUser)

module.exports = router;
