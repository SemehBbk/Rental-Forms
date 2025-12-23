const express = require("express");
const { createHouse, getAllHouses, getHouse, deleteHouse } = require("../controllers/houseController");
const authenticate = require("../middleware/authenticate");
const { whoCanDo } = require("../middleware/whoCanDo");

const router = express.Router();

// Protect all routes - only admin can manage houses
router.use(authenticate);
router.use(whoCanDo("admin"));

router.route("/")
    .get(getAllHouses)
    .post(createHouse);

router.route("/:id")
    .get(getHouse)
    .delete(deleteHouse);

module.exports = router;
