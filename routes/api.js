/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const getDb = require('../db');
var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res, next){
    
    getDb.then(function(db) {
      db.collection('books').find({}).toArray(function(err, result) {
        if (err) {
          console.log(`Error finding documents: ${err}`);
          return next(err);
        }
        return res.json(result);
      });           
    })
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res, next){
      var title = req.body.title;
    
      if (!title) {
        return res.send('missing title');
      }
    
      let data = {
        ...req.body,
        comments: [],
        commentcount: 0
      };
    
      getDb.then(function(db) {
        db.collection('books').insertOne(data, function(err, result) {
          if (err) {
            console.log(`Error inserting book: ${err}`);
            return next(err);
          }
          return res.send({
              _id: result.insertedId,
              title: req.body.title
          });
        })
      })
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res, next){
      //if successful response will be 'complete delete successful'
      getDb.then(function(db) {
        db.collection('books').deleteMany({}, function(err, result) {
          if(err) {
            console.log(`Error deleting all documents: ${err}`)
            return next(err);
          }
          return res.send('complete delete successful');
        })
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
    
      var bookid = req.params.id;
  
    
      getDb.then(function(db) {
        db.collection('books').findOne(ObjectId(bookid), function(err, result) {
          if (err) {
            console.log(`Error finding book: ${err}`);
            return res.send('no book exists');
          }
          else if (!result) { //null result
            return res.send('no book exists');
          }
          //console.log(`Found something. The result is ${result}`);
          return res.json({
            _id: result._id,
            title: result.title,
            comments: result.comments
          });
        }); //closes findOne
      }); //closes getDb
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res, next){
      var bookid = req.params.id;
      var comment = req.body.comment;
    
      //console.log(`req.body.comment is ${req.body.comment}`)
    
      getDb.then(function(db) {
        
        db.collection('books').findOne(ObjectId(bookid), function(err, result) {
          if (err) {
            console.log(`Error retrieving book: ${err}`)
            return next(err);
          }
          let commentsArray = result.comments;
          //console.log(`Book title is ${result.title}. Comments Array is ${commentsArray} and is type ${typeof commentsArray}. Is it an array? ${Array.isArray(commentsArray)}. It is length ${commentsArray.length}`);
          commentsArray.push(comment);
          //console.log(`Comments Array is now ${commentsArray[0]} and is length ${commentsArray.length}`);
          
          db.collection('books').findOneAndUpdate( {_id: ObjectId(bookid)}, { $set: {comments: commentsArray}}, {returnOriginal: false}, function(err, result2) {
            if (err) {
              console.log(`Error posting comment: ${err}`);
              return next(err);
            }
            //console.log(`The result is ${result2.value}`);
            return res.json(result2.value);
          });
        })
          
      });
    
      //json res format same as .get
    })
    
    .delete(function(req, res, next){
      var bookid = req.params.id;
    
      const data = {
        _id: ObjectId(bookid)
      }
    
      getDb.then(function(db) {
        db.collection('books').deleteOne(data, function(err, result) {
          if(err) {
            console.log(`Error found during delete: ${err}`);
            return next(err);
          }
          return res.send('delete successful');
        })
      });
    });
  
};
