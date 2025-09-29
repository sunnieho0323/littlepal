export const userA = {
  id: '68d7d794f85c8dbe8c0c3726',
  email: 's224958342@deakin.edu.au',
  role: 'user',
};
export const userB = {
  id: '68d9f2f2a74ebb8b14947e41',
  email: 'admin@littlepal.com',
  role: 'admin',
};
export const admin = {
  id: '68d9f2c0a74ebb8b14947e3d',
  email: 'testingg@littlepal.com',
  role: 'admin',
};

export function authHeaders(u = userA) {
  return {
    'x-user-id': u.id,
    'x-user-email': u.email,
    'x-user-role': u.role,
  };
}
