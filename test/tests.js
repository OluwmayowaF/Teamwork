require('dotenv').config();

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const testDb = require('./testHelper');

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTU3MzQ1Njc3MywiZXhwIjoxNTgyMDk2NzczLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0MzAwMCJ9.ibjJKYM05yRqFB3MjGTwvrKE2y3nDcniPQ4aCPGxPCk';
const employeeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTU3MzQ1NzIwOSwiZXhwIjoxNTgyMDk3MjA5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0MzAwMCJ9.9LN_3xp6toYwD2EeaCDG7MsEDBOMuTG7aUNDbw-j5G8';
const { expect } = chai;
chai.use(chaiHttp);

describe('Teamwork Restful API tests', () => {
  after((done) => {
    testDb.deleteTestUser();
    done();
  });
  describe('Test that the admin can create employes on using the post route - /api/v1/auth/create-user', () => {
    // Include Tests for authorization token
    it('Should not  allow a user without the bearer token to create a user', (done) => {
      const user = {
        firstName: 'Test',
        lastName: 'Employee',
        email: 'unittest@employee.com',
        password: '12345678',
        gender: 'Male',
        jobRole: 'Talent Manager',
        department: 'A & R',
        role: 'test',
        address: 'Lagos',
      };
      chai
        .request(app)
        .post('/api/v1/auth/create-user')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Authorization Token not found');
          done();
        });
    });
    it('Should not  allow anyone who is not an admin to create a user', (done) => {
      const user = {
        firstName: 'Test',
        lastName: 'Employee',
        email: 'unittest@employee.com',
        password: '12345678',
        gender: 'Male',
        jobRole: 'Talent Manager',
        department: 'A & R',
        address: 'Lagos',
      };
      chai
        .request(app)
        .post('/api/v1/auth/create-user')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Unauthorized! This Route is reserved for Admin Users Only.');
          done();
        });
    });
    // Include Tests that its only admin
    it('Allows an admin create an Employee with the right credentials', (done) => {
      const user = {
        firstName: 'Test',
        lastName: 'Employee',
        email: 'unittest@employee.com',
        password: '12345678',
        gender: 'Male',
        jobRole: 'RegTester',
        department: 'A & R',
        address: 'Lagos',
      };
      chai
        .request(app)
        .post('/api/v1/auth/create-user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
    it('Should not allow an admin create another Employee with the same email as existing employee', (done) => {
      const user = {
        firstName: 'Test 2',
        lastName: 'Employee',
        email: 'unittest@employee.com',
        password: '12345678',
        gender: 'Female',
        jobRole: 'Producer',
        department: 'Media',
        address: 'Lagos',
      };
      chai
        .request(app)
        .post('/api/v1/auth/create-user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('User with that EMAIL already exist');
          done();
        });
    });
    it('Should not create a user without any of these: firstname, lastname, email, password and department ', (done) => {
      const user = {
        firstName: '',
        lastName: 'Solomon',
        email: 'solomon@employee.com',
        password: '123456',
        gender: 'mail',
        jobRole: 'cashier',
        department: '',
        address: 'Lagos',
      };

      chai
        .request(app)
        .post('/api/v1/auth/create-user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('The following fields are required before employee can be registered: firstname, lastname, email, password and department');
          done();
        });
    });
    it('Should not create a user without a valid emial', (done) => {
      const user = {
        firstName: 'Mark',
        lastName: 's',
        email: 'mail.com',
        password: '123456',
        gender: 'mail',
        jobRole: 'cashier',
        department: 'Office Management',
        address: 'Lagos',
      };
      chai
        .request(app)
        .post('/api/v1/auth/create-user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Please enter a valid email');
          done();
        });
    });
  });
  describe('Test that employees can sign in with the credentials admin provides to them', () => {
    it('Should not allow an employee sign in without entering thier password ', (done) => {
      const user = {
        email: 'unittest@employee.com',
        password: '',
      };
      chai
        .request(app)
        .post('/api/v1/auth/signin')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Kindly enter your email and password to login');
          done();
        });
    });
    it('Should not allow an employee sign in without entering thier email ', (done) => {
      const user = {
        email: '',
        password: '123456',
      };
      chai
        .request(app)
        .post('/api/v1/auth/signin')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Kindly enter your email and password to login');
          done();
        });
    });
    it('Should not allow an employee sign in with the wrong password', (done) => {
      const user = {
        email: 'unittest@employee.com',
        password: '1235678',
      };
      chai
        .request(app)
        .post('/api/v1/auth/signin')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Invalid Credentials');
          done();
        });
    });
    it('Should not allow an employee sign in with an invalid email', (done) => {
      const user = {
        email: 'employee.com',
        password: '1235678',
      };
      chai
        .request(app)
        .post('/api/v1/auth/signin')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Please enter a valid email');
          done();
        });
    });
    it('Should allow an employee sign in succesfully with the right credentials', (done) => {
      const user = {
        email: 'unittest@employee.com',
        password: '12345678',
      };
      chai
        .request(app)
        .post('/api/v1/auth/signin')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
  });
});
