<script type="text/javascript">
//
// Go to app's homepage on a three-finger tap.
//
(function() {

    function loadConfig(callback) {
        readFile('config.json', function(e, text) {
            var config = parseAsJSON(text);
            callback(e, config);
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

    function ontouchstart(event){
        if (event.touches.length === 3) {
            document.body.removeEventListener('touchstart', ontouchstart, false);
            window.history.back(window.history.length);

            // cannot reliably use the config to load the homepage URL
            // because it requires the FileReader API. The native code is
            // guaranteed to exist on the target app, but we will need to
            // inject the File API's JavaScript.
            //
            //loadConfig(function(e, config) {
            //    console.log('go home:', config.address);
            //    if (config.address) {
            //        window.document = config.address;
            //    }
            //    else {
            //        // address not saved, try fallback approach
            //        window.history.back(window.history.length);
            //    }
            //});
        }
    }

    document.body.addEventListener('touchstart', ontouchstart, false);

})(window);
</script>
