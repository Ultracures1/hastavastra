// Admin site-content settings (announcements, marquee, hero, banners, etc.)
// stored as JSON values under string keys.
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { safeParse } = require("./helpers");

const router = express.Router();
router.use(requireAuth);

const ALLOWED_KEYS = [
  "announcement_messages",
  "marquee_text",
  "hero",
  "promo_banner",
  "most_loved_banner",
  "fabric_banner",
  "press_logos",
  "section_titles",
];

router.get("/", async (req, res, next) => {
  try {
    const rows = await db.query("SELECT * FROM settings");
    const settings = {};
    for (const row of rows) settings[row.skey] = safeParse(row.svalue, null);
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const updates = req.body || {};
    const keys = Object.keys(updates).filter((k) => ALLOWED_KEYS.includes(k));
    if (!keys.length) {
      return res.status(400).json({ error: "No valid setting keys provided" });
    }
    for (const key of keys) {
      await db.upsertSetting(key, updates[key]);
    }
    res.json({ ok: true, updated: keys });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
