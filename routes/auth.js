var express = require("express");
var router = express.Router();
var jwt = require('jsonwebtoken');
var utils =require('../utils/utils')
var nodemailer = require('nodemailer');
var mysql = require('mysql');


router.get("/",function(req,res,next){
  res.json({name:"Syntel Roomate"});
});

router.get("/login/:user/:pass",function(req,res,next){

    var user = req.params.user 
    var pass = req.params.pass

    var con = mysql.createConnection(utils.connection_data);
  
    con.connect(function(err) {
      if(err) 
      {
        res.sendStatus(400);
      }
      else
      {
        con.query("select * from sql9255207.user where email='"+user+"' and pass='"+pass+"'", function (err, result) {
          
          if(err){
            res.sendStatus(400);
          }
          else
          {
            if(result.length>0)
            {
              const token = jwt.sign({ user: user }, utils.secret_key,{expiresIn:'5y'});
              res.json({
                status: 'success',
                token: token
              });
            }
            else
            {
              res.json({status:"invalid"})
            }
          }
        });
      }
    });
});

router.get("/recover/:email",function(req,res,next){

  var email = req.params.email


  var con = mysql.createConnection(utils.connection_data);
  
  con.connect(function(err) {
    if(err) 
    {
      res.sendStatus(400);
    }
    else
    {
      con.query("select pass from sql9255207.user where email='"+email+"'", function (err, result) {
        
        if(err){
          res.sendStatus(400);
        }
        else
        {
          if(result.length>0)
          {
              var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: utils.email_credentials
              })
            
              const mailOptions = {
                from: utils.email_credentials.user, // sender address
                to: email, // list of receivers
                subject: 'Your Pass from Syntel Roomate', // Subject line
                html: '<p>Your password:<b>'+result[0].pass+' </b> </p>'// plain text body
              };
            
              transporter.sendMail(mailOptions, function (err, info) {
                if(err){
                  res.sendStatus(400);
                }
                else
                res.json({status:"success"})
            });
          }
          else
          {
            res.json({status:"invalid"})
          } 
        }
      });
    }
  });
    

});

router.post("/singUp",function(req,res,next){

  var con = mysql.createConnection(utils.connection_data);
  
  con.connect(function(err) {
    if(err) 
    {
      res.sendStatus(400);
    }
    else
    {
      con.query("insert into sql9255207.user(email,fullName,pass,phone,state,city,accountActive) values ('"+req.body.email+"','"+req.body.fullName+"','"+req.body.pass+"','"+req.body.phone+"','"+req.body.state+"','"+req.body.city+"',1)", function (err, result) {
        
        if(err){
          res.json({status:"duplicate"});
        }
        else
        {
          res.json({status:"success"})
        }
      });
    }
  });

});

module.exports= router;
