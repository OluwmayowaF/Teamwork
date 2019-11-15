require('dotenv').config();

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const supertest = require('supertest');

const app = require('../server');
const testDb = require('./testHelper');


const environment = process.env.NODE_ENV; // test
const stage = require('../config')[environment];

const request = supertest(`localhost:${stage.port}`);

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTU3MzQ1Njc3MywiZXhwIjoxNTgyMDk2NzczLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0MzAwMCJ9.ibjJKYM05yRqFB3MjGTwvrKE2y3nDcniPQ4aCPGxPCk';
const employeeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTU3MzQ1NzIwOSwiZXhwIjoxNTgyMDk3MjA5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0MzAwMCJ9.9LN_3xp6toYwD2EeaCDG7MsEDBOMuTG7aUNDbw-j5G8';
const employee2Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIwOSwiaWF0IjoxNTczNTc2ODg4LCJleHAiOjE1ODIyMTY4ODgsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3QzMDAwIn0.JdA5UMCe-P-3qNWXe6vLDggr5Ti8wXwJtd4et8RsB6s';
const employee3Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIxMCwiaWF0IjoxNTczNTc2ODg4LCJleHAiOjE1ODIyMTY4ODgsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3QzMDAwIn0.W6yaFiJjiCbbNdPG-HLn-ZhDH8IVNRU33fEFhAoYyXk';
let testid = '';
let testid2 = '';
let gifid = '';
let gifid2 = '';

const { expect } = chai;
chai.use(chaiHttp);

describe('Teamwork Restful API tests', () => {
  after((done) => {
    testDb.deleteTestUser();
    done();
  });
  describe('Test that the admin can create employes on using the post route - /api/v1/auth/create-user', () => {
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
        // .set('Authorization', `Bearer ${adminToken}`)
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
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
    it('Should ensure a user with right credentials is not prevented from signing in', (done) => {
      const user = {
        email: 'unittest@employee.com',
        password: '12345678',
      };
      chai
        .request(app)
        .post('/api/v1/auth/signin')
        .send(user)
        .end((err, res) => {
          expect(res).not.to.have.status(400);
          done();
        });
    });
  });
  describe('Test that signed in employee can view information ', () => {
    it('Should allow signed in employee see their details ', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/user')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
    it('Should work if user fulfils all requirements ', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/user')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).not.to.have.status(400);
          done();
        });
    });
    it('Should not be accesible without the bearer token', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/user')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Authorization Token not found');
          done();
        });
    });
    it('Should not be accesible without a fake token bearer token', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/user')
        .set('Authorization', 'Bearer gtgvgvdgvytbghgs-ytghygvyfvygdbfhhhfhhhfhhf-ffffffffffhfbyufg123536y474-gydybdygtu')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Invalid Token');
          done();
        });
    });
  });
  describe('Test that signed in employees can create articles on the system', () => {
    it('Should not allow anyone one who is not signed in to create an article', (done) => {
      const article = {
        title: 'The Great sails',
        article: 'The Age of Sail (usually dated as 1571–1862) was a period roughly corresponding to the early modern period in which international trade and naval warfare',
        tag: 'general',
      };
      chai
        .request(app)
        .post('/api/v1/articles')
        .send(article)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Authorization Token not found');
          done();
        });
    });
    it('Should not allow articles without a title to be submitted', (done) => {
      const article = {
        title: '',
        article: 'The Age of Sail (usually dated as 1571–1862) was a period roughly corresponding to the early modern period in which international trade and naval warfare',
        tag: 'genral',
      };
      chai
        .request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(article)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equals('Your article must have a title and some content');
          done();
        });
    });
    it('Should not allow articles without content to be submitted', (done) => {
      const article = {
        title: 'The Great Sails',
        article: '',
      };
      chai
        .request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(article)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equals('Your article must have a title and some content');
          done();
        });
    });
    it('Should allow a logged in employee to create an article with the rigth data', (done) => {
      const article = {
        title: 'The Great Sails',
        article: 'The Age of Sail (usually dated as 1571–1862) was a period roughly corresponding to the early modern perioe',
      };
      chai
        .request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(article)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.status).to.equals('success');
          testid = res.body.data.articleId;
          done();
        });
    });
    it('Should allow a logged in employee to create an article with the rigth data', (done) => {
      const article = {
        title: 'The Great Sails',
        article: 'The Age of Sail (usually dated as 1571–1862) was a period roughly corresponding to the early modern perioe',
      };
      chai
        .request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(article)
        .end((err, res) => {
          expect(res).to.not.have.status(400);
          expect(res.body.status).to.equals('success');
          testid2 = res.body.data.articleId;
          done();
        });
    });
  });
  describe('Test that signed in employees can edit their articles on the system', () => {
    it('Should not allow anyone one who is not signed in to edit an article', (done) => {
      const article = {
        title: 'The Great sails',
        article: 'The Age of Sail (usually dated as 1571–1862) was a period roughly corresponding to the early modern period in which international trade and naval warfare',
        tag: 'general',
      };
      chai
        .request(app)
        .patch('/api/v1/articles/1')
        .send(article)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Authorization Token not found');
          done();
        });
    });
    it('Should not allow anyone outside the author of the article to edit', (done) => {
      const article = {
        title: 'Red Dragon',
        article: 'The Age of Sail (usually dated as 1571–1862) was a period roughly corresponding to the early modern period in which international trade and naval warfare',
        tag: 'genral',
      };
      chai
        .request(app)
        .patch('/api/v1/articles/1')
        .set('Authorization', `Bearer ${employee3Token}`)
        .send(article)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.error).to.equals('Article with that id was not found for this user!');
          done();
        });
    });
    it('Should allow a logged in Owner of the article to edit/update an article with the right data', (done) => {
      const article = {
        title: 'The Only Sails',
        article: 'The Age of Sail (usually dated as 1571–1862) was a period roughly corresponding to the early modern perioe',
      };
      chai
        .request(app)
        .patch('/api/v1/articles/1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(article)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
  });
  describe('Test that signed in employees can delete their articles on the system', () => {
    it('Should not allow anyone one who is not signed in to edit an article', (done) => {
      const article = {
        title: 'The Great sails',
        article: 'The Age of Sail (usually dated as 1571–1862) was a period roughly corresponding to the early modern period in which international trade and naval warfare',
        tag: 'general',
      };
      chai
        .request(app)
        .delete(`/api/v1/articles/${testid}`)
        .send(article)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Authorization Token not found');
          done();
        });
    });
    it('Should not allow anyone outside the author of the article to delete', (done) => {
      const article = {
        title: 'Red Dragon',
        article: 'The Age of Sail (usually dated as 1571–1862) was a period roughly corresponding to the early modern period in which international trade and naval warfare',
        tag: 'genral',
      };
      chai
        .request(app)
        .delete(`/api/v1/articles/${testid}`)
        .set('Authorization', `Bearer ${employee2Token}`)
        .send(article)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.error).to.equals('Article with that id was not found for this user!');
          done();
        });
    });
    it('Should allow a logged in Owner of the article to deletean article with the right data', (done) => {
      const article = {
        title: 'The Only Sails',
        article: 'The Age of Sail (usually dated as 1571–1862) was a period roughly corresponding to the early modern perioe',
      };
      chai
        .request(app)
        .delete(`/api/v1/articles/${testid}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(article)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
  });
  describe('Test that signed in employees can add comments to other employees articles', () => {
    it('Should not allow comments without any comment to be submitted', (done) => {
      const comment = {
        comment: '',
      };
      chai
        .request(app)
        .post('/api/v1/articles/1/comment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(comment)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equals('Your comment must have some content');
          done();
        });
    });
    it('Should ensure that the article actually exist before saving a comment', (done) => {
      const comment = {
        comment: 'Nice ooh. i have learnt alot from this',
      };
      chai
        .request(app)
        .post(`/api/v1/articles/${testid}/comment`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(comment)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.error).to.equals('Article was not found!');
          done();
        });
    });
    it('Should allow a logged in employee to add a comment to an exisiting article', (done) => {
      const comment = {
        comment: 'Nice ooh. i have learnt alot from this',
      };
      chai
        .request(app)
        .post('/api/v1/articles/1/comment')
        .set('Authorization', `Bearer ${employee2Token}`)
        .send(comment)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
  });
  describe('Test that signed in employee can view a specific article ', () => {
    it('Should allow signed in employee see a specific article', (done) => {
      chai
        .request(app)
        .get('/api/v1/articles/1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
    it('Should work if user fulfils all requirements ', (done) => {
      chai
        .request(app)
        .get('/api/v1/articles/1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).not.to.have.status(400);
          done();
        });
    });
    it('Should not be accesible without the bearer token', (done) => {
      chai
        .request(app)
        .get('/api/v1/articles/1')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Authorization Token not found');
          done();
        });
    });
    it('Should not be accesible with a fake bearer token', (done) => {
      chai
        .request(app)
        .get('/api/v1/articles/1')
        .set('Authorization', 'Bearer gtgvgvdgvytbghgs-ytghygvyfvygdbfhhhfhhhfhhf-ffffffffffhfbyufg123536y474-gydybdygtu')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Invalid Token');
          done();
        });
    });
    it('Should not show an article which does not exist', (done) => {
      chai
        .request(app)
        .get(`/api/v1/articles/${testid}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.error).to.equals('That article no longer exists');
          done();
        });
    });
    it('Should return a message if the article has no comment', (done) => {
      chai
        .request(app)
        .get('/api/v1/articles/2')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.comments).to.equals('No Comments have been added to this article');
          done();
        });
    });
  });
  describe('Test that signed in employees can post gifs on the system', () => {
    it('Should allow a logged in employee to post a gif with the rigth data', (done) => {
      chai
        .request(app);
      request.post('/api/v1/gifs')
        .field('title', 'redDragon')
        .attach('image', 'test/tenor.gif')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.status).to.equals('success');
          expect(res.body.data.message).to.equals('GIF image successfully posted');
          gifid = res.body.data.gifId;
          done();
        });
    });
    it('Should allow a logged in employee to post a gif with the rigth data', (done) => {
      chai
        .request(app);
      request.post('/api/v1/gifs')
        .field('title', 'redDragon')
        .attach('image', 'test/tenor.gif')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.status).to.equals('success');
          expect(res.body.data.message).to.equals('GIF image successfully posted');
          gifid2 = res.body.data.gifId;
          done();
        });
    });
    it('Should not allow a logged in employee to post a gif without a title', (done) => {
      chai
        .request(app);
      request.post('/api/v1/gifs')
        .field('title', '')
        .attach('image', 'test/tenor.gif')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Enter a title for your gif post');
          done();
        });
    });
    it('Should not allow a logged in employee to post a gif without a gif', (done) => {
      chai
        .request(app);
      request.post('/api/v1/gifs')
        .field('title', 'Red Mango')
        .attach('image', '')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Kindly upload a gif to proceed');
          done();
        });
    });
  });
  describe('Test that signed in employees can delete thier gifs on the system', () => {
    it('Should allow a logged in employee to delete thier gif a gif with the rigth data', (done) => {
      chai
        .request(app);
      request.delete(`/api/v1/gifs/${gifid}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
    it('Should not allow  logged in employee to dete a gif that is not thiers', (done) => {
      chai
        .request(app);
      request.delete(`/api/v1/gifs/${gifid}`)
        .set('Authorization', `Bearer ${employee2Token}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Gif was not found!!');
          done();
        });
    });
  });
  describe('Test that signed in employees can add comments to other employees gifs', () => {
    it('Should not allow comments without any comment to be submitted', (done) => {
      const comment = {
        comment: '',
      };
      chai
        .request(app)
        .post('/api/v1/gifs/1/comment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(comment)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equals('Your comment must have some content');
          done();
        });
    });
    it('Should ensure that the gif actually exist before saving a comment', (done) => {
      const comment = {
        comment: 'Nice ooh. i have learnt alot from this',
      };
      chai
        .request(app)
        .post(`/api/v1/gifs/${gifid}/comment`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(comment)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.error).to.equals('Gif was not found!');
          done();
        });
    });
    it('Should allow a logged in employee to add a comment to an exisiting gif', (done) => {
      const comment = {
        comment: 'Nice ooh. i have learnt alot from this',
      };
      chai
        .request(app)
        .post('/api/v1/gifs/1/comment')
        .set('Authorization', `Bearer ${employee2Token}`)
        .send(comment)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
  });
  describe('Test that signed in employee can view a specific gif ', () => {
    it('Should allow signed in employee see a specific gif', (done) => {
      chai
        .request(app)
        .get('/api/v1/gifs/1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
    it('Should work if user fulfils all requirements ', (done) => {
      chai
        .request(app)
        .get('/api/v1/gifs/1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).not.to.have.status(400);
          done();
        });
    });
    it('Should not be accesible without the bearer token', (done) => {
      chai
        .request(app)
        .get('/api/v1/gifs/1')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Authorization Token not found');
          done();
        });
    });
    it('Should not be accesible with a fake bearer token', (done) => {
      chai
        .request(app)
        .get('/api/v1/gifs/1')
        .set('Authorization', 'Bearer gtgvgvdgvytbghgs-ytghygvyfvygdbfhhhfhhhfhhf-ffffffffffhfbyufg123536y474-gydybdygtu')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Invalid Token');
          done();
        });
    });
    it('Should not show a gif which does not exist', (done) => {
      chai
        .request(app)
        .get(`/api/v1/gifs/${gifid}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.error).to.equals('Gif was not found!');
          done();
        });
    });
    it('Should return a message if the gif has no comment', (done) => {
      chai
        .request(app)
        .get('/api/v1/gifs/2')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.comments).to.equals('No Comments have been added to this gif');
          done();
        });
    });
  });
  describe('Test that signed in employee can view his feeds all gifs and articles ', () => {
    it('Should allow signed in employee see thier feeds', (done) => {
      chai
        .request(app)
        .get('/api/v1/feeds')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
    it('Should work if user fulfils all requirements ', (done) => {
      chai
        .request(app)
        .get('/api/v1/feeds')
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).not.to.have.status(404);
          done();
        });
    });
    it('Should not be accesible without the bearer token', (done) => {
      chai
        .request(app)
        .get('/api/v1/feeds')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Authorization Token not found');
          done();
        });
    });
    it('Should not be accesible with a fake bearer token', (done) => {
      chai
        .request(app)
        .get('/api/v1/feeds')
        .set('Authorization', 'Bearer gtgvgvdgvytbghgs-ytghygvyfvygdbfhhhfhhhfhhf-ffffffffffhfbyufg123536y474-gydybdygtu')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.status).to.equals('error');
          expect(res.body.error).to.equals('Invalid Token');
          done();
        });
    });
  });
  describe('Test that signed in employee can flag an article as inappropraite', () => {
    it('Should allow signed in employee flag an article', (done) => {
      chai
        .request(app)
        .patch(`/api/v1/articles/${testid2}/flag`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
    it('Should ensure article exists before attempting to flag  ', (done) => {
      chai
        .request(app)
        .patch(`/api/v1/articles/${testid}/flag`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
    it('Should not be accesible without the bearer token', (done) => {
      chai
        .request(app)
        .patch(`/api/v1/articles/${testid}/flag`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Authorization Token not found');
          done();
        });
    });
  });
  describe('Test that signed in employee can flag a gif as inappropraite', () => {
    it('Should allow signed in employee flag a gif', (done) => {
      chai
        .request(app)
        .patch(`/api/v1/gifs/${gifid2}/flag`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
    it('Should ensure article exists before attempting to flag  ', (done) => {
      chai
        .request(app)
        .patch(`/api/v1/gifs/${gifid}/flag`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
    it('Should not be accesible without the bearer token', (done) => {
      chai
        .request(app)
        .patch(`/api/v1/gifs/${gifid2}/flag`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Authorization Token not found');
          done();
        });
    });
  });
  describe('Test that admin can delete flagged posts', () => {
    it('Should allow admin delete a flagged gif', (done) => {
      chai
        .request(app)
        .delete(`/api/v1/gifs/${gifid2}/flag`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
    it('Should allow admin delete a flagged article', (done) => {
      chai
        .request(app)
        .delete(`/api/v1/articles/${testid2}/flag`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals('success');
          done();
        });
    });
    it('Should ensure article exists before attempting to delete  ', (done) => {
      chai
        .request(app)
        .delete(`/api/v1/articles/${testid}/flag`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
    it('Should ensure gif exists before attempting to delete  ', (done) => {
      chai
        .request(app)
        .delete(`/api/v1/gifs/${gifid}/flag`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
    it('Should not be accesible without the bearer token', (done) => {
      chai
        .request(app)
        .patch(`/api/v1/gifs/${gifid2}/flag`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equals('Authorization Token not found');
          done();
        });
    });
    it('Should not be accesible without the admin token', (done) => {
      chai
        .request(app)
        .delete(`/api/v1/gifs/${gifid2}/flag`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body.error).to.equals('Permission Denied! This Route is reserved for Admin Users Only.');
          done();
        });
    });
  });
});
