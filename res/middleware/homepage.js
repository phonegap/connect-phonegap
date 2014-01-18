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

    function parseAsJSON(text) {
        try {
            return JSON.parse(text);
        } catch(e) {
            return {};
        }
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

            loadConfig(function(e, config) {
                //
                // bug: security prevents us from navigating to the file URL
                //
                //if (config.address) {
                //    window.location = config.URL;
                //}
                //else {
                    // address not saved, try fallback approach
                    window.history.back(window.history.length);
                //}
            });
        }
    }

    document.body.addEventListener('touchstart', ontouchstart, false);

})(window);
</script>
