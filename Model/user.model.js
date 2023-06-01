const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  preferences: {
    temperatureUnit: { type: String, required: true },
    languagePreference: { type: String, required: true },
  },
  preferred_locations: [{ type: String, default: [] }],
});
