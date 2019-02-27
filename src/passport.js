import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import _ from 'lodash';
import { User, UserPasswordReset } from './data/models';

const isResetPasswordMatch = async (userId, password) => {
  const [userPasswordReset] = await UserPasswordReset.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 1,
  });
  if (!userPasswordReset || userPasswordReset.isUsed) {
    return false;
  }
  const isMatch = await bcrypt.compare(
    password,
    userPasswordReset.resetPassword,
  );
  if (isMatch) {
    userPasswordReset.update({ isUsed: true });
  }
  return isMatch;
};

passport.use(
  new LocalStrategy((username, password, done) => {
    const sanitizedUsername = _.trim(username.toLowerCase());
    const foo = async () => {
      let user = await User.find({
        where: { username: sanitizedUsername },
      });
      let isReset = false;
      if (!user) {
        user = await User.find({ where: { email: sanitizedUsername } });

        if (!user) {
          return done(null, false);
        }
      }

      const isPwordMatch = await bcrypt.compare(password, user.password);
      if (!isPwordMatch) {
        const isResetPwordMatch = await isResetPasswordMatch(user.id, password);
        if (!isResetPwordMatch) {
          return done(null, false);
        }
        isReset = true;
      }

      return done(null, {
        id: user.id,
        email: user.email,
        username: user.username,
        isReset,
      });
    };
    foo().catch(() => done(null, false));
  }),
);

export default passport;
