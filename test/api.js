'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const config = require(__dirname + '/../config/options.js');
const fs = require('fs');
const ssloptions = {
    key: fs.readFileSync(config.server_key),
    cert: fs.readFileSync(config.server_crt)
};
const https = require('https');
const cheerio = require('cheerio');

suite('api:', function() {

    let server = require('../app.js');

    if (!server) server = https.createServer(ssloptions);
    const assert = require('chai').assert;
    test('this always passes', function() {
        assert.equal(1, 1);
    });

    test('/api should return statusCode 302', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/swagger',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            const body = [];
            res.on('data', function(data) {
                body.push(data);
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    302);
                done();
            });
        });
        req.end();
    });

    test('/blockcount JSON validation', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/blockcount',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', function(data) {
                spool = spool + data;
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    200);
                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool, {
                            decodeEntities: false
                        });
                    assert.isBelow(403581, JSON
                        .parse(
                            cheers.html()).blockcount
                    );
                    assert.isBelow(
                        1458536468849, JSON
                        .parse(
                            cheers.html()).timestamp
                    );
                }
                done();
            });
        });
        req.end();
    });
    test('/blocktime no params JSON validation', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/blocktime',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', function(data) {
                spool = spool + data;
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    200);
                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool, {
                            decodeEntities: false
                        });
                    assert.isBelow(1458625149,
                        JSON
                        .parse(
                            cheers.html()).blocktime
                    );
                    assert.isBelow(403581, JSON
                        .parse(
                            cheers.html()).blockcount
                    );
                    assert.isBelow(
                        1458534660, JSON
                        .parse(
                            cheers.html()).timestamp
                    );
                }
                done();
            });
        });
        req.end();
    });
    test('/blocktime with params JSON validation', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/blocktime?blockcount=300000&api_key=special-key',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', function(data) {
                spool = spool + data;
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    200);
                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool, {
                            decodeEntities: false
                        });
                    assert.equal(1399703554,
                        JSON
                        .parse(
                            cheers.html()).blocktime
                    );
                    assert.equal(300000, JSON
                        .parse(
                            cheers.html()).blockcount
                    );
                    assert.isBelow(
                        1458534660, JSON
                        .parse(
                            cheers.html()).timestamp
                    );
                }
                done();
            });
        });
        req.end();
    });

    test('/blockhash with params JSON validation', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/blockhash?blockcount=408060&api_key=special-key',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', function(data) {
                spool = spool + data;
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    200);
                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool, {
                            decodeEntities: false
                        });
                    assert.equal(
                        "0000000000000000058a13426f63efb3c7b7407fb2d60dbd5008ea6983ec55a9",
                        JSON
                        .parse(
                            cheers.html()).blockhash
                    );
                    assert.equal(408060, JSON
                        .parse(
                            cheers.html()).blockcount
                    );
                    assert.isBelow(
                        1458534660, JSON
                        .parse(
                            cheers.html()).timestamp
                    );
                }
                done();
            });
        });
        req.end();
    });

    test('/blockhash  with params JSON validation', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/blockhash?starttime=1399703554&endtime=1399754821&api_key=special-key',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', function(data) {
                spool = spool + data;
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    200);
                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool, {
                            decodeEntities: false
                        });
                    assert.equal(
                        "1399703554",
                        JSON
                        .parse(
                            cheers.html()).starttime
                    );
                    assert.equal(
                        "1399754821",
                        JSON
                        .parse(
                            cheers.html()).endtime
                    );
                    assert.equal(
                        101, JSON
                        .parse(
                            cheers.html()).blockhash
                        .length
                    );
                    assert.equal(
                        "000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac7254",
                        JSON
                        .parse(
                            cheers.html()).blockhash[
                            0]
                    );
                }
                done();
            });
        });
        req.end();
    });



    test('/blocktime with params JSON validation', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/blockcount?starttime=1358694696&api_key=special-key',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', function(data) {
                spool = spool + data;
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    200);
                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool, {
                            decodeEntities: false
                        });
                    assert.equal(217296, JSON
                        .parse(
                            cheers.html()).blockcount
                    );
                    assert.isBelow(
                        1458534660, JSON
                        .parse(
                            cheers.html()).timestamp
                    );
                }
                done();
            });
        });
        req.end();
    });
    test('/transactionsignature with param txid', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/transactionsignature?txid=3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828cb&api_key=special-key',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', function(data) {
                spool = spool + data;
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    200);

                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool, {
                            decodeEntities: false
                        });
                    assert.equal(
                        '3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828cb',
                        JSON
                        .parse(
                            cheers.html()
                        ).transactionsignature
                        .txid);
                    assert.ok(JSON
                        .parse(
                            cheers.html()).transactionsignature
                        .inputdetail
                    );
                    assert.equal(
                        '7c9a20b31c89e025e9c031f0d67f3cdebe0091d9447f082a35cc9d076ba1eaf5',
                        JSON
                        .parse(
                            cheers.html()
                        ).transactionsignature
                        .inputdetail[4].txid
                    );
                }
                done();
            });
        });
        req.end();
    });

    test('/txid with blockhash param', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/txid?blockhash=000000000000000005376b428f34489f044f6170f922cb97375dd37136f1ccf4&api_key=special-key',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', function(data) {
                spool = spool + data;
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    200);
                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool, {
                            decodeEntities: false
                        });
                    assert.equal(
                        '000000000000000005376b428f34489f044f6170f922cb97375dd37136f1ccf4',
                        JSON
                        .parse(
                            cheers.html()).blockhash
                    );
                    assert.equal(1551, JSON
                        .parse(
                            cheers.html()).txid
                        .length
                    );
                    assert.isBelow(
                        1458534660, JSON
                        .parse(
                            cheers.html()).timestamp
                    );
                }
                done();
            });
        });
        req.end();
    });
    test('/txid with blockhash param', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/txid?blockcount=405485&api_key=special-key',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', function(data) {
                spool = spool + data;
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    200);
                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool, {
                            decodeEntities: false
                        });
                    assert.equal(
                        '000000000000000003570a5bdbe8a21c50d0153e7912c8ec27d6ee3f7fa0c65e',
                        JSON
                        .parse(
                            cheers.html()).blockhash
                    );
                    assert.equal(2201, JSON
                        .parse(
                            cheers.html()).txid
                        .length
                    );
                    assert.isBelow(
                        1458534660, JSON
                        .parse(
                            cheers.html()).timestamp
                    );
                }
                done();
            });
        });
        req.end();
    });
    test('/txid with no param', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/txid?api_key=special-key',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', function(data) {
                spool = spool + data;
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    200);
                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool, {
                            decodeEntities: false
                        });
                    assert.isBelow(
                        1458534660, JSON
                        .parse(
                            cheers.html()).timestamp
                    );
                }
                done();
            });
        });
        req.end();
    });

    test('/txid with params JSON validation', function(done) {
        this.timeout(60000);
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/txid?starttime=1399703554&endtime=1399754821&api_key=special-key',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', function(data) {
                spool = spool + data;
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    200);
                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool, {
                            decodeEntities: false
                        });
                    assert.equal(
                        "1399703554",
                        JSON
                        .parse(
                            cheers.html()).starttime
                    );
                    assert.equal(
                        "1399754821",
                        JSON
                        .parse(
                            cheers.html()).endtime
                    );
                    assert.equal(
                        33616, JSON
                        .parse(
                            cheers.html()).txid
                        .length
                    );
                }
                done();
            });
        });
        req.end();
    });


});
