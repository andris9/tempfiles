var fs = require("fs");

module.exports.checkDir = checkDir;
module.exports.cleanPeriodically = cleanPeriodically;

function cleanPeriodically(dir, ttl, callback){
    var timer;
    if(!(ttl = Number(ttl)) || ttl<1){
        return callback(new Error("Interval not defined or invalid"));
    }
    
    checkDir(dir, function(err, status){
        if(err){
            return callback(err);
        }
        
        timer = setInterval(function(){
            var curtime = Date.now(),
                ttltime = curtime - ttl*1000;
            
            fs.readdir(dir, function(err, files){
                
                if(files && files.length){
                    walkFiles();
                }
                
                function walkFiles(){
                    if(!files.length){
                        return;
                    }
                    var file = files.pop()
                    curfile = [dir, file].join("/");
                    fs.stat(curfile, function(err, stats){
                        if(err || !stats.isFile()){
                            return;
                        }
                        if(stats.mtime.getTime() < ttltime){
                            console.log("Removing file "+file)
                            fs.unlink(curfile);
                        }
                        walkFiles();
                   });
                }

            })
            
        }, 10*1000);
        
        callback(null, timer);
        
        
   });
}

function parseDir(dir){
    var dirpath = dir.trim().split("/");
    for(var i=0, len = dirpath.length; i<len; i++){
        switch(dirpath[i].trim()){
            case "..":
                if(i>0 && dirpath[i-1]){
                    dirpath.splice(i-1,2);
                    len -= 2;
                    i -= 2;
                    break;
                }
            case ".":
                dirpath.splice(i,1);
                len--;
                i--;
                break;
        }
    }
    return dirpath.join("/");
}

function checkDir(dir, mode, callback){
    dir = parseDir(dir || "");
    
    if(!callback && typeof mode=="function"){
        callback = mode;
        mode = undefined;
    }
    
    var created = [],
        dirs = dir.split("/"),
        fulldir = [];
    
    if(!dir){
        callback(null, false);
    }
    
    walkDirs();
    
    function walkDirs(){
        var curdir;
        
        if(!dirs.length){
            return callback(null, true);
        }
        
        fulldir.push(dirs.shift());
        curdir = fulldir.join("/");
        
        if(!curdir){
            return process.nextTick(walkDirs);
        }
        
        fs.stat(curdir, function(err, stats){
            if(err){
                return createDir(curdir);
            }
            if(stats.isFile()){
                return cleanOut(new Error(curdir +" is an existing file"))
            }
            if(stats.isDirectory()){
                return process.nextTick(walkDirs);
            }
            return cleanOut(new Error(curdir +" status unknown"));
        });
        
    }
    
    function createDir(dir){
        fs.mkdir(dir, mode, function(err){
            if(err){
                return cleanOut(err);
            }else{
                created.push(dir);
                walkDirs();
            }
        });
    }
    
    function cleanOut(err){
        
        removeDirs();
        
        function removeDirs(){
            var curdir = created.pop();
            if(!curdir){
                return callback(err);
            }else{
                fs.rmdir(curdir, removeDirs);
            }
        }
        
    }
       
}