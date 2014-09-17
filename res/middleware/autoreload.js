<script type="text/javascript">
//
// Reload the app if server detects local change
//
(function() {

    var url = 'http://' + '10.0.1.3:3000' + '/__api__/autoreload';

    //function clearAppDir(callback){
    //    window.requestFileSystem(
    //        LocalFileSystem.PERSISTENT,
    //        0,
    //        function(fileSystem) {
    //            console.log('got file system');
    //            fileSystem.root.getDirectory(fileSystem.root.toURL() +'/app' , {}, function(dirEntry){
    //                console.log('got dir');
    //                dirEntry.removeRecursively(function() {
    //                    console.log('Directory removed.');
    //                    callback();
    //                }, function(e){
    //                    console.log('err' + e);
    //                });                    
    //            });

    //        },
    //        function(e) {
    //            callback(e);
    //        }
    //    );    
    //}

    function downloadZip() {
        window.requestFileSystem(
            LocalFileSystem.PERSISTENT,
            0,
            function(fileSystem) {
                var fileTransfer = new FileTransfer();
                var uri = encodeURI('http://10.0.1.3:3000' + '/__api__/zip');
                var timeStamp = Math.round(+new Date()/1000);
                console.log('file system ' + fileSystem.root.toURL() );
                var downloadPath = fileSystem.root.toURL() + 'app' + timeStamp + '.zip';
                var dirPath =  fileSystem.root.toURL() + 'app' + timeStamp;
                fileTransfer.download(
                    uri,
                    downloadPath,
                    function(entry) {
                        console.log('download complete: ' + downloadPath);

                        zip.unzip(downloadPath, dirPath, function(statusCode) {
                            console.log('statusCode: ' + statusCode);
                            if (statusCode === 0) {
                                console.log('[fileUtils] successfully extracted the update payload');
                                //clearAppDir(function(){
                                    window.location.href = dirPath + '/index.html';
                                //});
                            }
                            else {
                                console.error('[fileUtils] error: failed to extract update payload');
                                console.log(downloadPath, dirPath);
                            }
                        });
                    },
                    function(error) {
                        console.log('download error source ' + error.source);
                        console.log('download error target ' + error.target);
                        console.log('upload error code' + error.code);
                    },
                    false
                );
            },
            function(e) {
                callback(e);
            }
        );
    }

    function postStatus(){
        var xhr = new XMLHttpRequest;
        xhr.open('post', url, false);
        xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && /^[2]/.test(this.status)) {
            }
        }
        xhr.send();
    }

    function checkForReload(){
        var xhr = new XMLHttpRequest;
        xhr.open('get', url, true);
        xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && /^[2]/.test(this.status)) {
                var response = JSON.parse(this.responseText);
                if (response.content.outdated) {
                    postStatus();
                    downloadZip();
                }
            }
        }
        xhr.send();
    }

    setInterval(checkForReload, 1000 * 3);
})(window);
</script>
