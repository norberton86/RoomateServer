// https://mlab.com/

var express = require("express");
var router = express.Router();
var jwt = require('jsonwebtoken');
var utils =require('../utils/utils');
var fs = require('fs');
var mysql = require('mysql');

function ensureToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      req.token = bearerToken;
      next();
    } else {
      res.sendStatus(403);
    }
}


router.get("/images/:email",ensureToken,function(req,res,next){

  jwt.verify(req.token, utils.secret_key, function(err, data) {
      if (err) {
        res.sendStatus(403);
      } 
      else 
      {
        var con = mysql.createConnection(utils.connection_data);
        var query="select url from sql9255207.image where email='"+req.params.email+"'";
        console.log(query)
        con.query(query, function (err, result) {
        
          if(err){
            
            res.sendStatus(400);
          }
          else
          {
            res.json({"status":"success",data:result.map((v,i,a) => { 
        
              return {uri:"http://localhost:3000/"+v.url}
            })})
          }
        });

        
      }
    });

});

router.get("/filter/:state/:city",ensureToken,function(req,res,next){

    jwt.verify(req.token, utils.secret_key, function(err, data) {
        if (err) {
          res.sendStatus(403);
        } 
        else 
        {
          var con = mysql.createConnection(utils.connection_data);
  
          con.query("select email,fullName,phone from sql9255207.user where  accountActive=1 and state='"+req.params.state+"' and city='"+req.params.city+"'", function (err, result) {
          
            if(err){
              res.sendStatus(400);
            }
            else
            {
              res.json({"status":"success",data:result})
            }
          });

          
        }
      });

});

router.post('/uploadImage/:id', ensureToken, function(req, res) {

  jwt.verify(req.token, utils.secret_key, function(err, data) {
      if (err) {
        res.sendStatus(403);
      } 
      else 
      {
          if (!req.files)
          return res.json({status:"error",message:"No files were uploaded"});
       
          // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
          let sampleFile = req.files.avatar;
          
          // Use the mv() method to place the file somewhere on your server
          sampleFile.mv("public/"+req.params.id , function(err) {
              if (err)
              return res.json({status:"error",message:"Error uploading picture"});

              var con = mysql.createConnection(utils.connection_data);
  
              con.connect(function(err) {
                if(err) 
                {
                  res.sendStatus(400);
                }
                else
                {
                  con.query("insert into sql9255207.image (email,url) values ('"+req.params.id.split('-')[0]+"','"+req.params.id+"')", function (err, result) {
                    
                    if(err){
                      res.sendStatus(400);
                    }
                    else
                    {
                      res.json({"status":"success"}) 
                    }
                  });
                }
              });
          
          });
      }
 });

})

router.get("/removeImage/:id",ensureToken,function(req,res,next){

  jwt.verify(req.token, utils.secret_key, function(err, data) {
      if (err) {
        res.sendStatus(403);
      } 
      else 
      {
          try{
              var filePath = 'public/'+req.params.id; 
              fs.unlinkSync(filePath);

              var con = mysql.createConnection(utils.connection_data);
  
              con.connect(function(err) {
                if(err) 
                {
                  res.sendStatus(400);
                }
                else
                {
                  con.query("delete from sql9255207.image WHERE url='"+req.params.id+"'", function (err, result) {
                    
                    if(err){
                      res.sendStatus(400);
                    }
                    else
                    {
                      res.json({"status":"success"}) 
                    }
                  });
                }
              });
          }
          catch(ex){
              res.json({status:ex})
          }
      }
    });

});

router.get("/activate/:status/:email",ensureToken,function(req,res,next){

  jwt.verify(req.token, utils.secret_key, function(err, data) {
      if (err) {
        res.sendStatus(403);
      } 
      else 
      {
        var con = mysql.createConnection(utils.connection_data);
  
        con.connect(function(err) {
          if(err) 
          {
            res.sendStatus(400);
          }
          else
          {
            con.query("UPDATE sql9255207.user SET accountActive="+req.params.status+" WHERE email='"+req.params.email+"'", function (err, result) {
              
              if(err){
                res.sendStatus(400);
              }
              else
              {
                res.json({"status":"success"}) 
              }
            });
          }
        });
      }
    });

});

router.get("/updateInfo/:phone/:state/:city/:email",ensureToken,function(req,res,next){

  jwt.verify(req.token, utils.secret_key, function(err, data) {
      if (err) {
        res.sendStatus(403);
      } 
      else 
      {
        var con = mysql.createConnection(utils.connection_data);
  
        con.connect(function(err) {
          if(err) 
          {
            res.sendStatus(400);
          }
          else
          {
            con.query("UPDATE sql9255207.user SET phone='"+req.params.phone+"',state='"+req.params.state+"',city='"+req.params.city+"' WHERE email='"+req.params.email+"'", function (err, result) {
              
              if(err){
                res.sendStatus(400);
              }
              else
              {
                res.json({"status":"success"}) 
              }
            });
          }
        });
      }
    });

});

router.get("/info/:email",ensureToken,function(req,res,next){

  jwt.verify(req.token, utils.secret_key, function(err, data) {
      if (err) {
        res.sendStatus(403);
      } 
      else 
      {

        var con = mysql.createConnection(utils.connection_data);
  
        con.connect(function(err) {
          if(err) 
          {
            res.sendStatus(400);
          }
          else
          {
            con.query("select * from sql9255207.user where email='"+req.params.email+"'", function (err, result) {
              
              if(err){
                res.sendStatus(400);
              }
              else
              {
                var accountActive=result[0].accountActive
                var  phone=result[0].phone
                var state=result[0].state
                var city=result[0].city

                fs.readdir('public', function (err, files) {

                  var images=[]
        
                  if (!err) {
                       images=files.filter(i=>i.indexOf(req.params.email)>=0).map((v,i,a) => { 
        
                        return {uri:"http://localhost:3000/"+v}
                      })
                  } 
        
                  var info={
                    accountActive:accountActive,
                    phone:phone,
                    state:state,
                    city:city,
                    images:images
                  }
        
                  console.log(info)
                  res.json({"status":"success","data":info})  
                  
                });
              
              }
            });
          }
        });


      }
    });

});

module.exports= router;
