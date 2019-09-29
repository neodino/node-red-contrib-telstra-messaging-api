
var httpsrequest = require('request-promise');
var errors = require('request-promise/errors');

module.exports = function (RED) {

  function TelstraMessagingApiNode(config) {
    RED.nodes.createNode(this, config);   
    var node = this;    

    this.on('input', function(msg) {
      node.status({fill: 'green', shape: 'dot', text: " "});      
      var options = {
        url: 'https://tapi.telstra.com/v2/oauth/token',
        method: 'POST',
        form: {
         client_id: config.consumerkey, 
         client_secret: config.consumersecret,
         grant_type: 'client_credentials',
         scope: 'NSMS'
        }
      };
      

      var msgpayload = msg.payload;

      httpsrequest(options).then(function(body){                 
        
        var access_token = JSON.parse(body).access_token;
        var authorization = "Bearer " + access_token;

        var message = config.message.trim();
        if (msgpayload !== "") {
           message = msgpayload;
        }          
          
        var mobilenumbers = config.mobile.replace(/\s+/g, '').split(",");             
 
        mobilenumbers.forEach(function(mobile) {
          setTimeout(function() {
            sendSMS(mobile,message, authorization, node, msg);
          },5000);
        });



        setTimeout(function() {
          node.status({});
          msg.payload = "telstra-messaging-api: Success" + authorization ;
          node.send(msg);
        }, 5000);
      }).catch(errors.StatusCodeError, function(reason) {
       node.status({fill: 'red', shape: 'dot', text: " "});
       setTimeout(function() {
        node.status({}); 
       }, 3000);
       node.error(reason);
      }).catch(errors.RequestError, function(reason){
         node.status({fill: 'red', shape: 'dot', text: " "});
         setTimeout(function() {
         node.status({});
       }, 3000);
         node.error(reason);

        });
     
   });
  }   

  function sendSMS(mobilenumber, message, authorization, node, msg) {
       node.status({fill: 'green', shape: 'dot', text: " "});
       var options2 = {
		  url: 'https://tapi.telstra.com/v2/messages/sms',
          method: 'POST',
          headers: {
            Authorization: authorization  
          },
          body: {
            to: mobilenumber,
            body: message
          },
          json: true
        };
        options2.headers['Content-Type'] = 'application/json';
        httpsrequest(options2).then(function(body2) {
         
        
        }).catch( errors.StatusCodeError, function(reason){
         node.status({fill: 'red', shape: 'dot', text: " "});
         setTimeout(function() {
         node.status({});
         }, 3000);
         node.error(reason);
       }).catch( errors.RequestError, function(reason){
         node.status({fill: 'red', shape: 'dot', text: " "});
         setTimeout(function() {
         node.status({});
       }, 3000);
         node.error(reason);
       });
  }

  RED.nodes.registerType("telstra-messaging-api", TelstraMessagingApiNode);

};
