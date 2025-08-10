// dummie Data
let users = [
    {
        id: 1, 
        userName: "Jessica", 
        email: "jessica@example.com", 
        password: "jessica1234" 
    },
    {
        id: 2, 
        userName: "Sunnie", 
        email: "sunnie@example.com", 
        password: "sunnie1234" 
    },
    {
        id: 3, 
        userName: "Vindya", 
        email: "vindya@example.com", 
        password: "vindya1234" 
    },
    {
        id: 4, 
        userName: "Owen", 
        email: "owen@example.com", 
        password: "owen1234" 
    },
];

exports.getAllUsers = () => {
    return users;
};

exports.getUserById = (id) => {
  const numId = Number(id);
  return users.find(u => u.id === numId) || null;
};

exports.createUser = (userData) => {
    const newUser = { id: users.length + 1, ...userData};
    users.push(newUser);
    return newUser;
};

exports.updateUser = (id, data) => {
  const numId = Number(id);
  const idx = users.findIndex(u => u.id === numId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data };
  return users[idx];
};

exports.deleteUser = (id) => {
  const numId = Number(id);
  users = users.filter(u => u.id !== numId);
  return true;
};