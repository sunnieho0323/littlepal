// Minimal stub so routes have real handler functions
// TODO: Replace with real logic + JWT later

exports.register = async (req, res, next) => {
  try {
    // const { email, password } = req.body;
    // … create user …
    return res.status(201).json({ ok: true, message: 'registered (stub)' });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    // const { email, password } = req.body;
    // … verify user & issue token …
    // Simulate a logged-in user for now:
    const user = { id: 'u_demo_1', email: 'demo@cat.com', name: 'Demo User' };
    const token = 'stub-token';
    return res.json({ ok: true, user, token });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    // If you add auth middleware later, return actual user.
    return res.json({ ok: true, user: { id: 'u_demo_1', email: 'demo@cat.com' } });
  } catch (err) { next(err); }
};
