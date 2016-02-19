module.exports = function (RED) {
    var Liner = require('liner');


    function ReadLine(n) {
        RED.nodes.createNode(this, n);
        this.name = n.name;
        this.topic = n.topic;
        this.file = n.file;
        this.offset = n.offset;
        this.limit = n.limit;
        var node = this;


        node.on('close', function (done) {
            node.status({});
            done();
        });

        node.on('input', function (msg) {
            if (msg.filename !== undefined && msg.filename !== "") {
                file = msg.filename;
            } else {
                file = node.file;
            }
            var liner = new Liner(file);
            var i = 0;
            var lim = 0;
                        
            liner.on('readable', function () {
                while (true) {
                    var line = liner.read();
                    if (line === null) {
                        break;
                    }
                    if(i < node.offset){
                        i++;
                        continue;
                    }
                    if(node.limit > 0 && lim >= node.limit){
                        liner.end();
                        break;
                    }

                    // clone message to pass all attributes
                    var new_msg = RED.util.cloneMessage(msg) || {};
                    new_msg.payload = line;
                    new_msg.line = i+1;
                    
                    lim++;
                    i++;
                    node.send([new_msg, null]);
                }
            });
            liner.on('error', function (err) {
                node.error(err);
            });
            liner.on('end', function () {

                // clone message to pass all attributes
                var new_msg = RED.util.cloneMessage(msg) || {};
                new_msg.payload = i;
                new_msg.line = undefined;

                node.send([null, new_msg]);
            });

        });

    }
    RED.nodes.registerType("read-line", ReadLine);
};