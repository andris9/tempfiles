# TEMPFILES

**Tempfiles** removes all files from  a directory.

## Installation

    npm install tempfiles

## Usage

  * **cleanPeriodically**(dir, ttl, callback) - starts a timer to clean files that are older than ttl (in seconds)

Example:

    var tempfiles = require("tempfiles");
    
    tempfiles.cleanPeriodically("/tmp/ttl", 60, function(err, timer){
        if(!err)
            console.log("Cleaning periodically directory /tmp/ttl");
    });