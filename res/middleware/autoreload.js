<script type="text/javascript">
//
// Reload the app if server detects local change
//
(function() {

    var url = 'http://127.0.0.1:3000/__api__/autoreload';

    function getDirectory(path, success, error) {
        window.requestFileSystem(
            LocalFileSystem.PERSISTENT,
            0,
            function(fileSystem) {
                fileSystem.root.getDirectory(path, { create: true, exclusive: false }, 
                function(dirEntry){
                    success(dirEntry);
                }, function(){
                    console.log('[fileUtils] error: failed to getDirectory');
                    error();
                });
            });
    }

    function copyFiles(fileList, destinationDirectoryEntry, success, error) {
        var fileCount = 0,
            copyCount = 0;

        for (var i = 0; i < fileList.length; i++) {
            (function() {
                var relativePathToFile = fileList[i];
                var absolutePathToFile = cordova.file.applicationDirectory + 'www/' + relativePathToFile;

                createPath(destinationDirectoryEntry, relativePathToFile, function(e) {
                    destinationDirectoryEntry.getFile(relativePathToFile, {create: true},
                        function(newFile) {
                            console.log('[fileUtils] successfully CREATED the new file: [' + newFile.name + ']');

                            var fileTransfer = new FileTransfer();
                            console.log('[fileUtils] copying file from: [' + absolutePathToFile + '] to: [' + newFile.toURL() + ']');
                            fileTransfer.download(
                                absolutePathToFile,
                                newFile.toInternalURL(),
                                function() {
                                    //copy success
                                    copyCount++;
                                    console.log('[fileUtils] successfully COPIED the new file: [' + newFile.name + ']');
                                    checkPosition(success);
                                },
                                function(error) {
                                    console.log('[fileUtils][ERROR] failed to COPY the new file: [' + relativePathToFile +
                                        '] error code: [' + error.code + '] source: [' + error.source +
                                        '] target: [' + error.target + '] http_status: [' + error.http_status + ']');
                                    checkPosition();
                                }
                            );
                        },
                        function(error) {
                            console.log('[fileUtils][ERROR] failed to GET a handle on the new file: [' + relativePathToFile + '] error code: [' + error.code + ']');
                            checkPosition();
                        });
                });
            })();
        }

        function checkPosition(success) {
            // All done?
            fileCount++;
            if (fileCount === fileList.length) {
                console.log('[fileUtils] successfully copied ' + copyCount + ' of ' + fileList.length + ' files.');
                success();
            }
        }
    }

    function createPath(entry, filename, callback) {
        var parentDirectories = filename.split("/");
        if (parentDirectories.length === 1) {
            // There are no directories in this path
            callback();
        }
        else {
            for (var i = 0, l = parentDirectories.length - 1; i < l; ++i) {
                (function () { // Create a closure for the path variable to be correct when logging it
                    var path = parentDirectories.slice(0, i+1).join("/");
                    entry.getDirectory(path, { create: true, exclusive: true },
                        function () {
                            console.log("[fileUtils] Created directory " + path);
                            callback();
                        },
                        function(error) {
                            // error in this case means the directory already exists.
                            callback(error);
                        });
                })();
            }
        }
    }

    function downloadZip(){
        window.requestFileSystem(
            LocalFileSystem.PERSISTENT,
            0,
            function(fileSystem) {
                var fileTransfer = new FileTransfer();
                var uri = encodeURI('http://127.0.0.1:3000/__api__/zip');
                var timeStamp = Math.round(+new Date()/1000);
                var downloadPath = fileSystem.root.toURL() + 'app' + timeStamp + '.zip';
                var dirPath =  fileSystem.root.toURL() + 'app' + timeStamp;

                fileTransfer.download(
                    uri,
                    downloadPath,
                    function(entry) {
                        console.log("download complete: " + entry.toURL());

                        zip.unzip(downloadPath, dirPath, function(statusCode) {
                            if (statusCode === 0) {
                                console.log('[fileUtils] successfully extracted the update payload');
                                var localFiles = [
                                    'cordova.js',
                                    'cordova_plugins.js'
                                ];

                                getDirectory('app' + timeStamp, function(appDirEntry){
                                    copyFiles(localFiles, appDirEntry, function(){
                                       window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + 'www/plugins', function(pluginsEntry){
                                            pluginsEntry.copyTo(appDirEntry, 'plugins', function(){
                                                // success - plugins folder copied over
                                                window.location.href = dirPath + '/index.html';
                                            }, function(){
                                                // error out copying over plugins folder
                                            });
                                        }, function(){
                                            // error out getting plugins folder
                                        });
                                    }, function(){
                                        // error out copying over localFiles
                                    });
                                });
                            }
                            else {
                                console.error('[fileUtils] error: failed to extract update payload');
                                console.log(zipPath, dirPath);
                            }
                        });
                    },
                    function(error) {
                        console.log("download error source " + error.source);
                        console.log("download error target " + error.target);
                        console.log("upload error code" + error.code);
                    },
                    false
                );
            },
            function(e) {
                callback(e);
            }
        );
    }

    function postStatus() {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && /^[2]/.test(this.status)) {
            }
        }
        xhr.send();
    }

    function checkForReload() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
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
