var config = {};

function loadConfig(callback) {
    readFile('config.json', function(e, text) {
        config = parseAsJSON(text);
        callback();
    });
}

function readFile(filepath, callback) {
    window.requestFileSystem(
        LocalFileSystem.PERSISTENT,
        0,
        function(fileSystem) {
            fileSystem.root.getFile(
                filepath,
                null,
                function gotFileEntry(fileEntry) {
                    fileEntry.file(
                        function gotFile(file){
                            var reader = new FileReader();
                            reader.onloadend = function(evt) {
                                callback(null, evt.target.result); // text
                            };
                            reader.readAsText(file);
                        },
                        function(error) {
                            callback(error);
                        }
                    );
                },
                function(error) {
                    callback(error);
                }
            );
        },
        function(error) {
            callback(error);
        }
    );
}

function touchStart(event){
    console.log('touch start');
    // go home
    if(event.touches.length == 3){
        document.body.removeEventListener('touchstart', touchStart, false);
        window.document = config.address;
    // reload
    }else if(event.touches.length == 4){
        document.body.removeEventListener('touchstart', touchStart, false);     
        window.location.reload(true);  
    }
}

document.body.addEventListener('touchstart', touchStart, false);