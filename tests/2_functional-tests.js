/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
const getDb = require('../db');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  // test('#example Test GET /api/books', function(done){
  //    chai.request(server)
  //     .get('/api/books')
  //     .end(function(err, res){
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(res.body[0], 'title', 'Books in array should contain title');
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        let testBook = {
          title: 'Test Book'
        };
        
        chai.request(server)
          .post('/api/books')
          .send(testBook)
          .end(function(err, res) {
            // console.log(`Testing POST: received result ${JSON.stringify(res.body)}`);
            assert.equal(res.status, 200);
            assert.property(res.body, '_id', 'The created book should contain _id');
            assert.property(res.body, 'title', 'The created book should contain a title');
            assert.equal(res.body.title, 'Test Book', 'The created book\'s title should be Test Book')
            done();
        });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        let testBook = {
          title: '' //no title is provided in this test data
        };
        
        chai.request(server)
          .post('/api/books')
          .send(testBook)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing title');
            done();
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
       chai.request(server)
        .get('/api/books')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done();
        });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        const testId = '5eed04ce2d732b39b766a60b' //this ID is not in the database
        
        chai.request(server)
          .get('/api/books/' + testId)
          .end(function(err, res) {
            if (err) {
              console.log(`Error received! ${err}`)
            }
            console.log(`res is ${res}`);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        
        const data = {
          title: 'Test Book 2',
          comments: [],
          commentcount: 0
        };
    
        getDb.then(function(db) {
          db.collection('books').insertOne(data, function(err, result) {
            if (err) {
              console.log(`Error inserting book: ${err}`);
            }
            else {
              let responseId = result.insertedId;
              chai.request(server)
                .get('/api/books/' + responseId)
                .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.property(res.body, '_id');
                  assert.property(res.body, 'title');
                  assert.property(res.body, 'comments');
                  done();
                });
            }
          })
        })
      });
      
    });

    
    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        
        const testComment = 'I love this book!';
        

        const testBook = {
          title: 'Test Book 3',
          comments: [],
          commentcount: 0
        };
        
        getDb.then(function(db) {       
          db.collection('books').insertOne(testBook, function(err, result) { //add test data into database
            if (err) {
              console.log(`Error found during testing while inserting test book data: ${err}`);
            }
            else {
              const responseId = result.insertedId;
              chai.request(server)
                .post('/api/books/' + responseId)
                .send({
                  comment: testComment
                })
                .end(function(req, res) {
                  //console.log(`res.body is ${JSON.stringify(res.body)}`)
                  assert.equal(res.status, 200);
                  assert.isArray(res.body.comments);
                  assert.equal(res.body._id, responseId);
                  assert.equal(res.body.title, 'Test Book 3');
                  assert.equal(res.body.comments[0], testComment);
                  done();
                });
            }
          })
        })
      });
      
    });
    
    suite('POST /api/books/:[id] ==> delete a book', function() {
      test('Test DELETE /api/books/:[id]', function(done) {
        const testBook = {
          title: 'Test Book 4',
          comments: [],
          commentcount: 0
        };
        
        getDb.then(function(db) {
          db.collection('books').insertOne(testBook, function(err, insertResult) {
            if (err) {
              console.log(`Error found during testing while inserting test book data: ${err}`)
            }
            else {
              const responseId = insertResult.insertedId; //saving this id to use to verify if delete all works
              
              chai.request(server)
                .delete('/api/books/' + responseId)
                .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'delete successful');
                  done();
                })
            }
          })
        })
      })
    })
    
    suite('DELETE /api/books => delete all books,', function() {
      test('Test DELETE /api/books', function(done) {
      
        const testBook = {
          title: 'Test Book 5',
          comments: [],
          commentcount: 0
        };
        
        getDb.then(function(db) {
          db.collection('books').insertOne(testBook, function(err, insertResult) { //add test data into database
            if (err) {
              console.log(`Error found during testing while inserting test book data: ${err}`)
            }
            else {
              chai.request(server)
                .delete('/api/books')
                .end(function(err, res) {
                  console.log(`Testing Delete: received result of ${res}`);
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'complete delete successful');
                  done();
                })
            } //closes out if-else
          }) //closes out insertOne
        }) //closes out getDb
        
      }); //closes out test
    }); //closes out suite DELETE

  }); //closes out suite Routing Tests

}); //closes out suite Functional Tests
