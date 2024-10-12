const db = require("../db/index");

const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");

/**
 * @openapi
 * /auth/register:
 *   post:
 *     description: registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns jwt token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post("/register", validInfo, async (req, res) => {
  try {
    const { email, password } = await req.body;

    const user = await db.users.findOne({ where: { email: email } });

    if (user) {
      return res.status(401).send("user already exists");
    }

    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);

    const bcryptPassword = await bcrypt.hash(password, salt);

    const newUser = await db.users.create({
      email: email,
      password: bcryptPassword,
    });
    const token = jwtGenerator(newUser.id);
    return res.status(200).json({ token });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     description: authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns jwt token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post("/login", validInfo, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.users.findOne({ where: { email: email } });

    if (!user) {
      return res.status(401).send("password or email is incorrect");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).send("password or email is incorrect");
    }

    const token = jwtGenerator(user.id);

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});

router.get("/is-verify", authorization, async (req, res) => {
  try {
    return res.status(200).send("true");
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});

module.exports = router;
