// Auth API stub — replace with real HTTP calls when backend is ready

const FAKE_DELAY = 800; // ms, simulates network latency

const fakeDelay = (ms = FAKE_DELAY) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Stub user store (in-memory)
const users = [
  {
    id: 'u1',
    name: 'Dr. Aisha Nair',
    email: 'doctor@talkalign.com',
    password: 'password123',
    role: 'doctor',
    avatar: null,
  },
  {
    id: 'u2',
    name: 'Priya Sharma',
    email: 'parent@talkalign.com',
    password: 'password123',
    role: 'parent',
    avatar: null,
  },
  {
    id: 'u3',
    name: 'Clinic Admin',
    email: 'admin@talkalign.com',
    password: 'password123',
    role: 'supervisor',
    avatar: null,
  },
];

/**
 * login({ email, password }) → { user, token }
 */
export async function login({ email, password }) {
  await fakeDelay();
  const user = users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) throw new Error('Invalid email or password.');
  const { password: _p, ...safeUser } = user;
  return { user: safeUser, token: `mock-token-${user.id}` };
}

/**
 * register({ name, email, password, role }) → { user, token }
 */
export async function register({ name, email, password, role }) {
  await fakeDelay();
  if (users.find((u) => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }
  const newUser = {
    id: `u${Date.now()}`,
    name,
    email,
    password,
    role,
    avatar: null,
  };
  users.push(newUser);
  const { password: _p, ...safeUser } = newUser;
  return { user: safeUser, token: `mock-token-${newUser.id}` };
}

/**
 * logout() → void
 */
export async function logout() {
  await fakeDelay(300);
  return true;
}
