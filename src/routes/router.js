const router = require("express").Router();

const {coba, register, login} = require("../controller/adminController");
const {getUser, searchUser} = require("../controller/userController");

router.post("/test", coba);

//admin
router.post("/users/register", register)
router.get("/users/login", login)

//user
router.get("/users", getUser)
router.get("/users/:username", searchUser)

//review
router.post("/review")



module.exports = router;