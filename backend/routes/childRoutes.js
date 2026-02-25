const express = require("express");
const router = express.Router();
const {
    registerChild,
    getChildren,
    getChildById,
    updateChild,
    deleteChild,
} = require("../controllers/childController");

router.route("/")
    .post(registerChild)
    .get(getChildren);

router.route("/:id")
    .get(getChildById)
    .put(updateChild)
    .delete(deleteChild);

module.exports = router;
