const { expect } = require('chai');
const userService = require('../services/userService');

describe('userService (unit)', () => {
  it('getAllUsers returns an array', () => {
    const users = userService.getAllUsers();
    expect(users).to.be.an('array');
    expect(users.length).to.be.greaterThan(0);
  });

  it('getUserById returns correct user', () => {
    const u = userService.getUserById(1);
    expect(u).to.exist;
    expect(u.id).to.equal(1);
  });

  it('createUser adds a new user with incremental id', () => {
    const before = userService.getAllUsers().length;
    const created = userService.createUser({
      userName: 'MochaUser', email: 'm@t.com', password: 'pw'
    });
    const after = userService.getAllUsers().length;
    expect(created).to.have.property('id');
    expect(after).to.equal(before + 1);
  });

  it('updateUser modifies fields', () => {
    const updated = userService.updateUser(1, { userName: 'Jess' });
    expect(updated).to.exist;
    expect(updated.userName).to.equal('Jess');
  });

  it('deleteUser removes user', () => {
    const before = userService.getAllUsers().length;
    userService.deleteUser(2);
    const after = userService.getAllUsers().length;
    expect(after).to.equal(before - 1);
  });
});
