const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const SECRET = 'mini-crm-secret-2024';
const PORT = 3000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// AUTH ENDPOINT — POST /api/auth/login
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const db = router.db.getState();
  const user = db.users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  };

  const token = jwt.sign(payload, SECRET, { expiresIn: '8h' });

  const { password: _pw, ...safeUser } = user;
  return res.status(200).json({ token, user: safeUser });
});

// JWT VERIFICATION MIDDLEWARE for all /api/* routes (except login)
server.use('/api', (req, res, next) => {
  if (req.path === '/auth/login' && req.method === 'POST') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

// ROLE-BASED ACCESS: only admins can manage /api/users
server.use('/api/users', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
  }
  next();
});

// Strip passwords from user responses
router.render = (req, res) => {
  const data = res.locals.data;
  if (req.path.startsWith('/users')) {
    if (Array.isArray(data)) {
      res.jsonp(data.map(({ password: _pw, ...u }) => u));
    } else if (data && typeof data === 'object') {
      const { password: _pw, ...safeUser } = data;
      res.jsonp(safeUser);
    } else {
      res.jsonp(data);
    }
  } else {
    res.jsonp(data);
  }
};

// Workaround: json-server's getRemovable crashes when a document has a null
// foreign-key value (e.g. dealId: null) because lodash-id calls null.toString().
// Override DELETE so we handle removal directly, without the cascade check.
server.delete('/api/:resource/:id', (req, res) => {
  const { resource, id } = req.params;
  const db = router.db.getState();
  if (!Array.isArray(db[resource])) {
    return res.status(404).json({});
  }
  const idx = db[resource].findIndex((item) => String(item.id) === String(id));
  if (idx === -1) {
    return res.status(404).json({});
  }
  db[resource].splice(idx, 1);
  router.db.write();
  res.json({});
});

// Mount json-server router at /api
server.use('/api', router);

server.listen(PORT, () => {
  console.log(`\n🚀  JSON Server running at http://localhost:${PORT}`);
  console.log(`   Endpoints: /api/contacts  /api/deals  /api/tasks  /api/notes  /api/users`);
  console.log(`   Auth:      POST /api/auth/login\n`);
});
