const { expect } = require('chai');
const svc = require('../services/activityService');

describe('Activity Service - listByPet', () => {
  it('returns all activities when no petId is given', () => {
    const result = svc.listByPet();
    expect(result).to.be.an('array');
    expect(result.length).to.be.greaterThan(0);
  });

  it('returns only activities for the given petId', () => {
    const result = svc.listByPet('p1');
    expect(result.every(a => a.petId === 'p1')).to.be.true;
  });

  it('returns empty array for unknown petId', () => {
    const result = svc.listByPet('xxx');
    expect(result).to.be.an('array').that.is.empty;
  });

  it('each activity has required fields', () => {
    const result = svc.listByPet('p1');
    result.forEach(a => {
      expect(a).to.have.property('id');
      expect(a).to.have.property('userId');
      expect(a).to.have.property('petId');
      expect(a).to.have.property('action');
      expect(a).to.have.property('createdAt');
    });
  });
});
