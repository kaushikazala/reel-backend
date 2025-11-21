const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/user.model');
const foodPartnerModel = require('../models/foodpartner.model');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    const role = req.query.role || 'user';
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    const fullName = profile.displayName || (profile.name && `${profile.name.givenName} ${profile.name.familyName}`) || '';

    if (role === 'food-partner') {
      let fp = await foodPartnerModel.findOne({ email });
      if (!fp) {
        fp = await foodPartnerModel.create({
          businessName: `${fullName}'s Business`,
          ownerName: fullName,
          email,
          phone: '',
          businessType: '',
          address: '',
          password: '',
          agreeToTerms: false,
          googleAuth: true
        });
      }
      return done(null, { id: fp._id.toString(), role: 'food-partner', email });
    } else {
      let u = await userModel.findOne({ email });
      if (!u) {
        u = await userModel.create({
          fullName,
          email,
          password: '',
          googleAuth: true
        });
      }
      return done(null, { id: u._id.toString(), role: 'user', email });
    }
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;
