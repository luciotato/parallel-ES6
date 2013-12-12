var fs = require('fs');
var http = require('http');
var dns = require('dns');
var wait = require('wait.for-es6');
var parallel = require('../../parallel.js');  //require('parallel-es6');

//------------------------------
// TEST APP - dummy blog server
//------------------------------

function translateAsync(text, callback){
  //let's asume this fn  make api calls for translation, etc.
  // and can take a while
  setTimeout(function(){
    if (Math.random()>0.8) return callback(new Error('ocassional error, translate server down, catch it! - try again'));
    return callback(null,'<i>Latin: </i>'+text);
   }
   ,200)
}

//------------------------------
function formatPost(post, callback){ 

  var lines=post.split('\n');
  
  var title = lines.shift();
  var subTitle = lines.shift();

  var result = '<h1>'+ title +'</h1>'
              + '<h2>'+ subTitle +'</h2>';

  result += '<p>'+lines.join('</p><p>')+'</p>';
  
  return result;
}

//------------------------------
function composeTemplate(css, template){
  var composed=template.replace('{{ css }}', css);
  return composed;
}

//------------------------------
function applyTemplate(template, content){
  return template.replace('{{ content }}', content);
}

//------------------------------
function* read(fName){
  return yield wait.for(fs.readFile, 'examples/blogServer/'+fName,'utf8');
}

// Get client IP address from request object ---
function getClientAddress(req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0] 
        || req.connection.remoteAddress;
};

//------------------------------
// REQUEST HANDLER (generator, sequential)
function* handler(req,res){  // function* => generator

    try {

      console.log('request for',req.url, ' from ',getClientAddress(req));
      switch(req.url){

        case "/": //blog server

          res.writeHead(200, {'Content-Type': 'text/html'});
          var start = new Date().getTime();
          //console.log(start);

          var files=['style.css', 'blogTemplate.html', 'blogPost.txt'];
          //parallel read all required files
          var contents = yield wait.for ( parallel.map, files, read );

          //compose  template
          var template = composeTemplate ( contents[0], contents[1]);

          //translate post (log operation,api call, normally a callback hell)
          var translated = yield wait.for(translateAsync, contents[2]);

          res.write(applyTemplate(template, formatPost(translated)));

          //another async call
          return res.end();

        default:
          response.statusCode = 404;
          return res.end();
      }

    }
    catch(err){
      res.end('async ERROR catched: '+err.message);
    }
  }

//----------------
// Main

var server = http.createServer(
  function(req, res){
    console.log('req!');
    wait.launchFiber(handler,req,res); //handle requests in a "fiber"(generator), allowing sequential programming by yield
  }).listen(8000);
  
console.log('server started on port', 8000);


