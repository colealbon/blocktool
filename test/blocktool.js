'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const blocktool = require(process.cwd() + '/lib/blocktool.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

suite('blocktool:', function() {
    test('getblockcount (magic)', function(done) {
        return expect(blocktool.getBlockCount()).to.eventually.be
            .above(30827).notify(done);
    });
    test('getblocktime (magic)', function(done) {
        return expect(blocktool.getLatestBlockTime()).to.eventually
            .be
            .above(1458534660).notify(done);
    });
    test('blockcountToTime (magic)', function() {
        const blockcount = 300000;
        const blocktime = blocktool.blockCountToTime(
            blockcount);
        return expect(blocktime).to.eventually.equal(
            1399703554
        );
    });
    test('blockHashToBlockHeader (magic)', function() {
        const blockhash =
            '000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac7254';
        return blocktool.blockHashToBlockHeader(blockhash).then(
            function(blockheader) {
                expect(blockheader.height).to.equal(300000);
            });
    });

    test('blockHashToTxid (magic)', function() {
        const blockhash =
            '000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac7254';
        return blocktool.blockHashToTxid(blockhash).then(
            function(txidArr) {
                expect(txidArr[1]).to.equal(
                    '7301b595279ece985f0c415e420e425451fcf7f684fcce087ba14d10ffec1121'
                );
            });
    });
    test('dateRangeToBlockRange (magic)', () => {
        const starttime = 1435795200;
        const endtime = 1435795800; //368596 Wed Aug  5 20:16:32 PDT 2015
        return blocktool.dateRangeToBlockRange({
            'starttime': starttime,
            'endtime': endtime
        }).then(function(blockrange) {
            expect(blockrange).to.not.equal(undefined);
            expect(blockrange.blockcountlow).to.equal(
                363398);
            expect(blockrange.blockcounthigh).to.equal(
                363400);
        });
    });
    test('dateRangeToBlockRange (throw error on missing starttime)',
        function(done) {
            expect(function() {
                const endtime = 1435795800; //368596 Wed Aug  5 20:16:32 PDT 2015
                return blocktool.dateRangeToBlockRange({
                    'endtime': endtime
                });
            }).to.throw(TypeError);
            done();
        });
    test('dateRangeToBlockRange does nothing with good dateRange',
        function(
            done) {
            expect(function() {
                const testdateRange = {
                    'starttime': 1,
                    'endtime': 10
                };
                return blocktool.dateRangeToBlockRange(
                    testdateRange);
            }).to.not.throw(Error);
            done();
        });
    test('dateRangeToBlockRange throws error on string', function(done) {
        expect(function() {
            const testdateRange = {
                'starttime': 1,
                'endtime': "10"
            };
            return blocktool.dateRangeToBlockRange(
                testdateRange);
        }).to.throw(Error);
        done();
    });
    test('dateRangeToBlockRange throws error on decimal', function(done) {
        expect(function() {
            const testdateRange = {
                'starttime': 1.123,
                'endtime': "10"
            };
            return blocktool.dateRangeToBlockRange(
                testdateRange);
        }).to.throw(TypeError);
        done();
    });
    test('dateRangeToBlockRange throws error on missing low', function(
        done) {
        expect(function() {
            const testdateRange = {
                'endtime': 10,
                'starttime': ''
            };
            return blocktool.dateRangeToBlockRange(
                testdateRange);
        }).to.throw(Error);
        done();
    });
    test('dateRangeToBlockRange throws error on negatron', function(
        done) {
        expect(function() {
            const testdateRange = {
                'endtime': -10,
                'starttime': 1
            };
            return blocktool.dateRangeToBlockRange(
                testdateRange);
        }).to.throw(Error);
        done();
    });
    test(
        'dateRangeToBlockRange throws error if low is higher than high',
        function(done) {
            expect(function() {
                const testdateRange = {
                    'endtime': 1,
                    'starttime': 10
                };
                return blocktool.dateRangeToBlockRange(
                    testdateRange);
            }).to.throw(Error);
            done();
        });
    test(
        'dateRangeToBlockRange throws error if low > high (change param order)',
        function(done) {
            expect(function() {
                const testdateRange = {
                    'starttime': 10,
                    'endtime': 1
                };
                return blocktool.dateRangeToBlockRange(
                    testdateRange);
            }).to.throw(Error);
            done();
        });
    test('dateRangeToBlockRange throws error on missing high', function(
        done) {
        expect(function() {
            const testdateRange = {
                'starttime': 10
            };
            return blocktool.dateRangeToBlockRange(
                testdateRange);
        }).to.throw(Error);
        done();
    });

    test('blockRangeToBlockCount (magic)', function() {
        const blockcountlow = 363398;
        const blockcounthigh = 363400; //368596 Wed Aug  5 20:16:32 PDT 2015
        return blocktool.blockRangeToBlockCount({
            'blockcountlow': blockcountlow,
            'blockcounthigh': blockcounthigh
        }).then(function(blockCountArr) {
            expect(blockCountArr).to.not.equal(
                undefined);
        });
    });
    test(
        'blockRangeToBlockCount (throw error on missing blockcountlow)',
        function(done) {
            expect(function() {
                const blockcounthigh = 363400; //368596 Wed Aug  5 20:16:32 PDT 2015
                void blocktool.blockRangeToBlockCount({
                    'blockcounthigh': blockcounthigh
                }).to.throw(TypeError);
            });
            done();
        });
    test(
        'blockRangeToBlockCount (throw error on missing blockcounthigh)',
        function(done) {
            expect(function() {
                const blockcountlow = 363398; //368596 Wed Aug  5 20:16:32 PDT 2015
                void blocktool.blockRangeToBlockCount({
                    'blockcountlow': blockcountlow
                }).to.throw(TypeError);
            });
            done();
        });
    test(
        'blockRangeToBlockCount (blockRangeToBlockCount throws error on string)',
        function(done) {
            expect(function() {
                const testblockrange = {
                    'blockcountlow': 1,
                    'blockcounthigh': "10"
                };
                void blocktool.blockRangeToBlockCount(
                    testblockrange).to.throw(TypeError);
            });
            done();
        });
    test(
        'blockRangeToBlockCount (throw error on missing blockcountlow)',
        function(done) {
            expect(function() {
                const blockcountlow = 363398; //368596 Wed Aug  5 20:16:32 PDT 2015
                return blocktool.blockRangeToBlockCount({
                    'blockcountlow': blockcountlow
                }).to.throw(TypeError);
            });
            done();
        });

    test(
        'blockRangeToBlockCount (blockRangeToBlockCount throws error on decimal)',
        function(done) {
            expect(function() {
                const testblockrange = {
                    'blockcountlow': 1.123,
                    'blockcounthigh': 10
                };
                void blocktool.blockRangeToBlockCount(
                    testblockrange).to.throw(TypeError);
            });
            done();
        });
    test(
        'blockRangeToBlockCount (blockRangeToBlockCount throws error on negative integer)',
        function(done) {
            expect(function() {
                const testblockrange = {
                    'blockcountlow': -10,
                    'blockcounthigh': 10
                };
                void blocktool.blockRangeToBlockCount(
                    testblockrange).to.throw(TypeError);
            });
            done();
        });
    test(
        'blockRangeToBlockCount (blockRangeToBlockCount throws error if low > high)',
        function(done) {
            expect(function() {
                const testblockrange = {
                    'blockcountlow': 10,
                    'blockcounthigh': 1
                };
                void blocktool.blockRangeToBlockCount(
                    testblockrange).to.throw(TypeError);
            });
            done();
        });
    test(
        'blockRangeToBlockCount (blockRangeToBlockCount low > high change param order)',
        function(done) {
            expect(function() {
                const testblockrange = {
                    'blockcounthigh': 1,
                    'blockcountlow': 10
                };
                void blocktool.blockRangeToBlockCount(
                    testblockrange).to.throw(TypeError);
            });
            done();
        });

    test('txidToTransactionSignature (magic)',
        function(done) {
            const txid =
                '3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828cb';
            return blocktool.txidToTransactionSignature(
                txid).then(function(transactionsignature) {
                expect(transactionsignature.inputdetail[
                        0].value)
                    .to.equal(0.01070851);
                done();
            });
        });
    test('vinToInputDetail (magic)', function() {
        const vin = [{
            "txid": "35f244fe1c02d86695c662b4392ccede1403692d4bfc5f565930ba1fa9fe8e02",
            "vout": 219,
            "scriptSig": {
                "asm": "3045022100f78413f12eadd25665d1ce3c2f592ef7112d26b7c18ee776c398736000caa77602202a2d3a1311fe5da95dcb957e9506b9004c3a580dcfe4762195f1a6abc4a4163b[ALL] 04bade4eaebcf86be6390e9bff0ca8e481439132cc277feb07fbb63ef28235d5e8176b6c01b56d0b0d4c2b82ddd08042f337412b47ad16319b02d241f32936af09",
                "hex": "483045022100f78413f12eadd25665d1ce3c2f592ef7112d26b7c18ee776c398736000caa77602202a2d3a1311fe5da95dcb957e9506b9004c3a580dcfe4762195f1a6abc4a4163b014104bade4eaebcf86be6390e9bff0ca8e481439132cc277feb07fbb63ef28235d5e8176b6c01b56d0b0d4c2b82ddd08042f337412b47ad16319b02d241f32936af09"
            },
            "sequence": 4294967295
        }, {
            "txid": "4c4a0671a805a1f778a73703a014fb932f30ab89038eea0347eeb6336d420b12",
            "vout": 1,
            "scriptSig": {
                "asm": "30440220337cd6be0c7126ce3f7dd521cb5cab07fd2978773a8466ed6c9aff5011be72da0220224b61945142250961ba13fd63f5fadc8d12c7d1be21d95ef76eceb068ece98f[ALL] 04fbf2e14749628453453efe3be33773c8d4b76f5d896d8ca1f668c6e46f47297669cda85171239686fc8e8ef5deb02eb5004d5177de3497b017666290c5c2c8df",
                "hex": "4730440220337cd6be0c7126ce3f7dd521cb5cab07fd2978773a8466ed6c9aff5011be72da0220224b61945142250961ba13fd63f5fadc8d12c7d1be21d95ef76eceb068ece98f014104fbf2e14749628453453efe3be33773c8d4b76f5d896d8ca1f668c6e46f47297669cda85171239686fc8e8ef5deb02eb5004d5177de3497b017666290c5c2c8df"
            },
            "sequence": 4294967295
        }, {
            "txid": "7225aa18b6eb5ee255b675570baddb34ba5c5e7229cccedee35e56071aed3f56",
            "vout": 1,
            "scriptSig": {
                "asm": "3045022100e759bb1a4a6a9e88e7ad8e0aa416765241764fa0faa5d94ce28cc749b53e010502205cfb39337f3598dc78420c3222b589f12924af5b1116b150c7521e71f42d8d2a[ALL] 048329c040efa5755aa9170568a074f6e0216a65a99945ac83cb708dd49002311aa3dbb8b29b0d4f10c5fad223b427c0491c2a27c42910424db40f1540ff921524",
                "hex": "483045022100e759bb1a4a6a9e88e7ad8e0aa416765241764fa0faa5d94ce28cc749b53e010502205cfb39337f3598dc78420c3222b589f12924af5b1116b150c7521e71f42d8d2a0141048329c040efa5755aa9170568a074f6e0216a65a99945ac83cb708dd49002311aa3dbb8b29b0d4f10c5fad223b427c0491c2a27c42910424db40f1540ff921524"
            },
            "sequence": 4294967295
        }, {
            "txid": "f29f57b0e7eb878f226242ad4c6e439fa42c6d9c0da0d8c7e6c5acfaa52b45d6",
            "vout": 0,
            "scriptSig": {
                "asm": "3045022100843bac171fb3f77cd1436bba915ed9f3a9d30a57f1d9a9900fd9ca4f4ca31b270220565a228dd19b19a090a0890c2b71e48726baa6405007faf0adf530dcdb0d8947[ALL] 0481a1c7e473d4da6389e2332107c6a3c9a944c74cd86f6ef8bff5c94f618994c314b6eb77c902dc247d1275071983132db62e4192dfe267d1de0833987053c88b",
                "hex": "483045022100843bac171fb3f77cd1436bba915ed9f3a9d30a57f1d9a9900fd9ca4f4ca31b270220565a228dd19b19a090a0890c2b71e48726baa6405007faf0adf530dcdb0d894701410481a1c7e473d4da6389e2332107c6a3c9a944c74cd86f6ef8bff5c94f618994c314b6eb77c902dc247d1275071983132db62e4192dfe267d1de0833987053c88b"
            },
            "sequence": 4294967295
        }, {
            "txid": "7c9a20b31c89e025e9c031f0d67f3cdebe0091d9447f082a35cc9d076ba1eaf5",
            "vout": 1,
            "scriptSig": {
                "asm": "30440220424540e65fe7dbae285a3e6d38a8c391295f3527eb0a317942fa4e189bf32a3302201320bf0eee6bb419f471ac761b7f6307f597d4643144b5a6cb3c426502cb1b2b[ALL] 04b41dd4782998ce381156736614a21838c36db8a3ca7d36a4813a8acebca53c90aabf056238662c5ee9fb4e7829e34072110f4f14daaf0bd477f7973a388842ae",
                "hex": "4730440220424540e65fe7dbae285a3e6d38a8c391295f3527eb0a317942fa4e189bf32a3302201320bf0eee6bb419f471ac761b7f6307f597d4643144b5a6cb3c426502cb1b2b014104b41dd4782998ce381156736614a21838c36db8a3ca7d36a4813a8acebca53c90aabf056238662c5ee9fb4e7829e34072110f4f14daaf0bd477f7973a388842ae"
            },
            "sequence": 4294967295
        }];
        const inputdetail = blocktool.vinToInputDetail(
            vin);
        //console.log(inputdetail);
        return expect(inputdetail.length).to.equal(
            vin.length
        );
    });

    test('rawTransactionToInputDetail (magic)', function() {
        const rawtransaction = {
            "hex": "0100000005028efea91fba3059565ffc4b2d690314dece2c39b462c69566d8021cfe44f235db0000008b483045022100f78413f12eadd25665d1ce3c2f592ef7112d26b7c18ee776c398736000caa77602202a2d3a1311fe5da95dcb957e9506b9004c3a580dcfe4762195f1a6abc4a4163b014104bade4eaebcf86be6390e9bff0ca8e481439132cc277feb07fbb63ef28235d5e8176b6c01b56d0b0d4c2b82ddd08042f337412b47ad16319b02d241f32936af09ffffffff120b426d33b6ee4703ea8e0389ab302f93fb14a00337a778f7a105a871064a4c010000008a4730440220337cd6be0c7126ce3f7dd521cb5cab07fd2978773a8466ed6c9aff5011be72da0220224b61945142250961ba13fd63f5fadc8d12c7d1be21d95ef76eceb068ece98f014104fbf2e14749628453453efe3be33773c8d4b76f5d896d8ca1f668c6e46f47297669cda85171239686fc8e8ef5deb02eb5004d5177de3497b017666290c5c2c8dfffffffff563fed1a07565ee3dececc29725e5cba34dbad0b5775b655e25eebb618aa2572010000008b483045022100e759bb1a4a6a9e88e7ad8e0aa416765241764fa0faa5d94ce28cc749b53e010502205cfb39337f3598dc78420c3222b589f12924af5b1116b150c7521e71f42d8d2a0141048329c040efa5755aa9170568a074f6e0216a65a99945ac83cb708dd49002311aa3dbb8b29b0d4f10c5fad223b427c0491c2a27c42910424db40f1540ff921524ffffffffd6452ba5faacc5e6c7d8a00d9c6d2ca49f436e4cad4262228f87ebe7b0579ff2000000008b483045022100843bac171fb3f77cd1436bba915ed9f3a9d30a57f1d9a9900fd9ca4f4ca31b270220565a228dd19b19a090a0890c2b71e48726baa6405007faf0adf530dcdb0d894701410481a1c7e473d4da6389e2332107c6a3c9a944c74cd86f6ef8bff5c94f618994c314b6eb77c902dc247d1275071983132db62e4192dfe267d1de0833987053c88bfffffffff5eaa16b079dcc352a087f44d99100bede3c7fd6f031c0e925e0891cb3209a7c010000008a4730440220424540e65fe7dbae285a3e6d38a8c391295f3527eb0a317942fa4e189bf32a3302201320bf0eee6bb419f471ac761b7f6307f597d4643144b5a6cb3c426502cb1b2b014104b41dd4782998ce381156736614a21838c36db8a3ca7d36a4813a8acebca53c90aabf056238662c5ee9fb4e7829e34072110f4f14daaf0bd477f7973a388842aeffffffff0234782d01000000001976a91427205f7a0fa65d575f9153189e3cf65559bb617888aca4931b00000000001976a9149156473ccc87a7c7ab8a0952e082abd5d79ae67788ac00000000",
            "txid": "3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828cb",
            "size": 976,
            "version": 1,
            "locktime": 0,
            "vin": [{
                "txid": "35f244fe1c02d86695c662b4392ccede1403692d4bfc5f565930ba1fa9fe8e02",
                "vout": 219,
                "scriptSig": {
                    "asm": "3045022100f78413f12eadd25665d1ce3c2f592ef7112d26b7c18ee776c398736000caa77602202a2d3a1311fe5da95dcb957e9506b9004c3a580dcfe4762195f1a6abc4a4163b[ALL] 04bade4eaebcf86be6390e9bff0ca8e481439132cc277feb07fbb63ef28235d5e8176b6c01b56d0b0d4c2b82ddd08042f337412b47ad16319b02d241f32936af09",
                    "hex": "483045022100f78413f12eadd25665d1ce3c2f592ef7112d26b7c18ee776c398736000caa77602202a2d3a1311fe5da95dcb957e9506b9004c3a580dcfe4762195f1a6abc4a4163b014104bade4eaebcf86be6390e9bff0ca8e481439132cc277feb07fbb63ef28235d5e8176b6c01b56d0b0d4c2b82ddd08042f337412b47ad16319b02d241f32936af09"
                },
                "sequence": 4294967295
            }, {
                "txid": "4c4a0671a805a1f778a73703a014fb932f30ab89038eea0347eeb6336d420b12",
                "vout": 1,
                "scriptSig": {
                    "asm": "30440220337cd6be0c7126ce3f7dd521cb5cab07fd2978773a8466ed6c9aff5011be72da0220224b61945142250961ba13fd63f5fadc8d12c7d1be21d95ef76eceb068ece98f[ALL] 04fbf2e14749628453453efe3be33773c8d4b76f5d896d8ca1f668c6e46f47297669cda85171239686fc8e8ef5deb02eb5004d5177de3497b017666290c5c2c8df",
                    "hex": "4730440220337cd6be0c7126ce3f7dd521cb5cab07fd2978773a8466ed6c9aff5011be72da0220224b61945142250961ba13fd63f5fadc8d12c7d1be21d95ef76eceb068ece98f014104fbf2e14749628453453efe3be33773c8d4b76f5d896d8ca1f668c6e46f47297669cda85171239686fc8e8ef5deb02eb5004d5177de3497b017666290c5c2c8df"
                },
                "sequence": 4294967295
            }, {
                "txid": "7225aa18b6eb5ee255b675570baddb34ba5c5e7229cccedee35e56071aed3f56",
                "vout": 1,
                "scriptSig": {
                    "asm": "3045022100e759bb1a4a6a9e88e7ad8e0aa416765241764fa0faa5d94ce28cc749b53e010502205cfb39337f3598dc78420c3222b589f12924af5b1116b150c7521e71f42d8d2a[ALL] 048329c040efa5755aa9170568a074f6e0216a65a99945ac83cb708dd49002311aa3dbb8b29b0d4f10c5fad223b427c0491c2a27c42910424db40f1540ff921524",
                    "hex": "483045022100e759bb1a4a6a9e88e7ad8e0aa416765241764fa0faa5d94ce28cc749b53e010502205cfb39337f3598dc78420c3222b589f12924af5b1116b150c7521e71f42d8d2a0141048329c040efa5755aa9170568a074f6e0216a65a99945ac83cb708dd49002311aa3dbb8b29b0d4f10c5fad223b427c0491c2a27c42910424db40f1540ff921524"
                },
                "sequence": 4294967295
            }, {
                "txid": "f29f57b0e7eb878f226242ad4c6e439fa42c6d9c0da0d8c7e6c5acfaa52b45d6",
                "vout": 0,
                "scriptSig": {
                    "asm": "3045022100843bac171fb3f77cd1436bba915ed9f3a9d30a57f1d9a9900fd9ca4f4ca31b270220565a228dd19b19a090a0890c2b71e48726baa6405007faf0adf530dcdb0d8947[ALL] 0481a1c7e473d4da6389e2332107c6a3c9a944c74cd86f6ef8bff5c94f618994c314b6eb77c902dc247d1275071983132db62e4192dfe267d1de0833987053c88b",
                    "hex": "483045022100843bac171fb3f77cd1436bba915ed9f3a9d30a57f1d9a9900fd9ca4f4ca31b270220565a228dd19b19a090a0890c2b71e48726baa6405007faf0adf530dcdb0d894701410481a1c7e473d4da6389e2332107c6a3c9a944c74cd86f6ef8bff5c94f618994c314b6eb77c902dc247d1275071983132db62e4192dfe267d1de0833987053c88b"
                },
                "sequence": 4294967295
            }, {
                "txid": "7c9a20b31c89e025e9c031f0d67f3cdebe0091d9447f082a35cc9d076ba1eaf5",
                "vout": 1,
                "scriptSig": {
                    "asm": "30440220424540e65fe7dbae285a3e6d38a8c391295f3527eb0a317942fa4e189bf32a3302201320bf0eee6bb419f471ac761b7f6307f597d4643144b5a6cb3c426502cb1b2b[ALL] 04b41dd4782998ce381156736614a21838c36db8a3ca7d36a4813a8acebca53c90aabf056238662c5ee9fb4e7829e34072110f4f14daaf0bd477f7973a388842ae",
                    "hex": "4730440220424540e65fe7dbae285a3e6d38a8c391295f3527eb0a317942fa4e189bf32a3302201320bf0eee6bb419f471ac761b7f6307f597d4643144b5a6cb3c426502cb1b2b014104b41dd4782998ce381156736614a21838c36db8a3ca7d36a4813a8acebca53c90aabf056238662c5ee9fb4e7829e34072110f4f14daaf0bd477f7973a388842ae"
                },
                "sequence": 4294967295
            }],
            "vout": [{
                "value": 0.19757108,
                "n": 0,
                "scriptPubKey": {
                    "asm": "OP_DUP OP_HASH160 27205f7a0fa65d575f9153189e3cf65559bb6178 OP_EQUALVERIFY OP_CHECKSIG",
                    "hex": "76a91427205f7a0fa65d575f9153189e3cf65559bb617888ac",
                    "reqSigs": 1,
                    "type": "pubkeyhash",
                    "addresses": [
                        "14Zt8o3QpaWmh6WAXWiRzC4YnoBkvJ9GyW"
                    ]
                }
            }, {
                "value": 0.01807268,
                "n": 1,
                "scriptPubKey": {
                    "asm": "OP_DUP OP_HASH160 9156473ccc87a7c7ab8a0952e082abd5d79ae677 OP_EQUALVERIFY OP_CHECKSIG",
                    "hex": "76a9149156473ccc87a7c7ab8a0952e082abd5d79ae67788ac",
                    "reqSigs": 1,
                    "type": "pubkeyhash",
                    "addresses": [
                        "1EFULY26FkaSiZdXEE8Y2yD3W4FySxqZvi"
                    ]
                }
            }],
            "blockhash": "000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac7254",
            "confirmations": 103875,
            "time": 1399703554,
            "blocktime": 1399703554
        };
        const inputdetail = blocktool.rawTransactionToInputDetail(
            rawtransaction);
        return expect(inputdetail.length).to.equal(
            rawtransaction.vin.length
        );
    });

    test('rawTransactionToTransactionSignature (magic)',
        function() {
            const rawtransaction = {
                "hex": "0100000005028efea91fba3059565ffc4b2d690314dece2c39b462c69566d8021cfe44f235db0000008b483045022100f78413f12eadd25665d1ce3c2f592ef7112d26b7c18ee776c398736000caa77602202a2d3a1311fe5da95dcb957e9506b9004c3a580dcfe4762195f1a6abc4a4163b014104bade4eaebcf86be6390e9bff0ca8e481439132cc277feb07fbb63ef28235d5e8176b6c01b56d0b0d4c2b82ddd08042f337412b47ad16319b02d241f32936af09ffffffff120b426d33b6ee4703ea8e0389ab302f93fb14a00337a778f7a105a871064a4c010000008a4730440220337cd6be0c7126ce3f7dd521cb5cab07fd2978773a8466ed6c9aff5011be72da0220224b61945142250961ba13fd63f5fadc8d12c7d1be21d95ef76eceb068ece98f014104fbf2e14749628453453efe3be33773c8d4b76f5d896d8ca1f668c6e46f47297669cda85171239686fc8e8ef5deb02eb5004d5177de3497b017666290c5c2c8dfffffffff563fed1a07565ee3dececc29725e5cba34dbad0b5775b655e25eebb618aa2572010000008b483045022100e759bb1a4a6a9e88e7ad8e0aa416765241764fa0faa5d94ce28cc749b53e010502205cfb39337f3598dc78420c3222b589f12924af5b1116b150c7521e71f42d8d2a0141048329c040efa5755aa9170568a074f6e0216a65a99945ac83cb708dd49002311aa3dbb8b29b0d4f10c5fad223b427c0491c2a27c42910424db40f1540ff921524ffffffffd6452ba5faacc5e6c7d8a00d9c6d2ca49f436e4cad4262228f87ebe7b0579ff2000000008b483045022100843bac171fb3f77cd1436bba915ed9f3a9d30a57f1d9a9900fd9ca4f4ca31b270220565a228dd19b19a090a0890c2b71e48726baa6405007faf0adf530dcdb0d894701410481a1c7e473d4da6389e2332107c6a3c9a944c74cd86f6ef8bff5c94f618994c314b6eb77c902dc247d1275071983132db62e4192dfe267d1de0833987053c88bfffffffff5eaa16b079dcc352a087f44d99100bede3c7fd6f031c0e925e0891cb3209a7c010000008a4730440220424540e65fe7dbae285a3e6d38a8c391295f3527eb0a317942fa4e189bf32a3302201320bf0eee6bb419f471ac761b7f6307f597d4643144b5a6cb3c426502cb1b2b014104b41dd4782998ce381156736614a21838c36db8a3ca7d36a4813a8acebca53c90aabf056238662c5ee9fb4e7829e34072110f4f14daaf0bd477f7973a388842aeffffffff0234782d01000000001976a91427205f7a0fa65d575f9153189e3cf65559bb617888aca4931b00000000001976a9149156473ccc87a7c7ab8a0952e082abd5d79ae67788ac00000000",
                "txid": "3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828cb",
                "size": 976,
                "version": 1,
                "locktime": 0,
                "vin": [{
                    "txid": "35f244fe1c02d86695c662b4392ccede1403692d4bfc5f565930ba1fa9fe8e02",
                    "vout": 219,
                    "scriptSig": {
                        "asm": "3045022100f78413f12eadd25665d1ce3c2f592ef7112d26b7c18ee776c398736000caa77602202a2d3a1311fe5da95dcb957e9506b9004c3a580dcfe4762195f1a6abc4a4163b[ALL] 04bade4eaebcf86be6390e9bff0ca8e481439132cc277feb07fbb63ef28235d5e8176b6c01b56d0b0d4c2b82ddd08042f337412b47ad16319b02d241f32936af09",
                        "hex": "483045022100f78413f12eadd25665d1ce3c2f592ef7112d26b7c18ee776c398736000caa77602202a2d3a1311fe5da95dcb957e9506b9004c3a580dcfe4762195f1a6abc4a4163b014104bade4eaebcf86be6390e9bff0ca8e481439132cc277feb07fbb63ef28235d5e8176b6c01b56d0b0d4c2b82ddd08042f337412b47ad16319b02d241f32936af09"
                    },
                    "sequence": 4294967295
                }, {
                    "txid": "4c4a0671a805a1f778a73703a014fb932f30ab89038eea0347eeb6336d420b12",
                    "vout": 1,
                    "scriptSig": {
                        "asm": "30440220337cd6be0c7126ce3f7dd521cb5cab07fd2978773a8466ed6c9aff5011be72da0220224b61945142250961ba13fd63f5fadc8d12c7d1be21d95ef76eceb068ece98f[ALL] 04fbf2e14749628453453efe3be33773c8d4b76f5d896d8ca1f668c6e46f47297669cda85171239686fc8e8ef5deb02eb5004d5177de3497b017666290c5c2c8df",
                        "hex": "4730440220337cd6be0c7126ce3f7dd521cb5cab07fd2978773a8466ed6c9aff5011be72da0220224b61945142250961ba13fd63f5fadc8d12c7d1be21d95ef76eceb068ece98f014104fbf2e14749628453453efe3be33773c8d4b76f5d896d8ca1f668c6e46f47297669cda85171239686fc8e8ef5deb02eb5004d5177de3497b017666290c5c2c8df"
                    },
                    "sequence": 4294967295
                }, {
                    "txid": "7225aa18b6eb5ee255b675570baddb34ba5c5e7229cccedee35e56071aed3f56",
                    "vout": 1,
                    "scriptSig": {
                        "asm": "3045022100e759bb1a4a6a9e88e7ad8e0aa416765241764fa0faa5d94ce28cc749b53e010502205cfb39337f3598dc78420c3222b589f12924af5b1116b150c7521e71f42d8d2a[ALL] 048329c040efa5755aa9170568a074f6e0216a65a99945ac83cb708dd49002311aa3dbb8b29b0d4f10c5fad223b427c0491c2a27c42910424db40f1540ff921524",
                        "hex": "483045022100e759bb1a4a6a9e88e7ad8e0aa416765241764fa0faa5d94ce28cc749b53e010502205cfb39337f3598dc78420c3222b589f12924af5b1116b150c7521e71f42d8d2a0141048329c040efa5755aa9170568a074f6e0216a65a99945ac83cb708dd49002311aa3dbb8b29b0d4f10c5fad223b427c0491c2a27c42910424db40f1540ff921524"
                    },
                    "sequence": 4294967295
                }, {
                    "txid": "f29f57b0e7eb878f226242ad4c6e439fa42c6d9c0da0d8c7e6c5acfaa52b45d6",
                    "vout": 0,
                    "scriptSig": {
                        "asm": "3045022100843bac171fb3f77cd1436bba915ed9f3a9d30a57f1d9a9900fd9ca4f4ca31b270220565a228dd19b19a090a0890c2b71e48726baa6405007faf0adf530dcdb0d8947[ALL] 0481a1c7e473d4da6389e2332107c6a3c9a944c74cd86f6ef8bff5c94f618994c314b6eb77c902dc247d1275071983132db62e4192dfe267d1de0833987053c88b",
                        "hex": "483045022100843bac171fb3f77cd1436bba915ed9f3a9d30a57f1d9a9900fd9ca4f4ca31b270220565a228dd19b19a090a0890c2b71e48726baa6405007faf0adf530dcdb0d894701410481a1c7e473d4da6389e2332107c6a3c9a944c74cd86f6ef8bff5c94f618994c314b6eb77c902dc247d1275071983132db62e4192dfe267d1de0833987053c88b"
                    },
                    "sequence": 4294967295
                }, {
                    "txid": "7c9a20b31c89e025e9c031f0d67f3cdebe0091d9447f082a35cc9d076ba1eaf5",
                    "vout": 1,
                    "scriptSig": {
                        "asm": "30440220424540e65fe7dbae285a3e6d38a8c391295f3527eb0a317942fa4e189bf32a3302201320bf0eee6bb419f471ac761b7f6307f597d4643144b5a6cb3c426502cb1b2b[ALL] 04b41dd4782998ce381156736614a21838c36db8a3ca7d36a4813a8acebca53c90aabf056238662c5ee9fb4e7829e34072110f4f14daaf0bd477f7973a388842ae",
                        "hex": "4730440220424540e65fe7dbae285a3e6d38a8c391295f3527eb0a317942fa4e189bf32a3302201320bf0eee6bb419f471ac761b7f6307f597d4643144b5a6cb3c426502cb1b2b014104b41dd4782998ce381156736614a21838c36db8a3ca7d36a4813a8acebca53c90aabf056238662c5ee9fb4e7829e34072110f4f14daaf0bd477f7973a388842ae"
                    },
                    "sequence": 4294967295
                }],
                "vout": [{
                    "value": 0.19757108,
                    "n": 0,
                    "scriptPubKey": {
                        "asm": "OP_DUP OP_HASH160 27205f7a0fa65d575f9153189e3cf65559bb6178 OP_EQUALVERIFY OP_CHECKSIG",
                        "hex": "76a91427205f7a0fa65d575f9153189e3cf65559bb617888ac",
                        "reqSigs": 1,
                        "type": "pubkeyhash",
                        "addresses": [
                            "14Zt8o3QpaWmh6WAXWiRzC4YnoBkvJ9GyW"
                        ]
                    }
                }, {
                    "value": 0.01807268,
                    "n": 1,
                    "scriptPubKey": {
                        "asm": "OP_DUP OP_HASH160 9156473ccc87a7c7ab8a0952e082abd5d79ae677 OP_EQUALVERIFY OP_CHECKSIG",
                        "hex": "76a9149156473ccc87a7c7ab8a0952e082abd5d79ae67788ac",
                        "reqSigs": 1,
                        "type": "pubkeyhash",
                        "addresses": [
                            "1EFULY26FkaSiZdXEE8Y2yD3W4FySxqZvi"
                        ]
                    }
                }],
                "blockhash": "000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac7254",
                "confirmations": 103875,
                "time": 1399703554,
                "blocktime": 1399703554
            };
            const callback = function(content) {
                expect(content.inputdetail.length).to
                    .equal(5);
                //logger.silly(content);
            };
            return blocktool.rawTransactionToTransactionSignature(
                rawtransaction, callback);
        });
    test('blockheaderToTime (magic)', function() {
        const blockheader = {
            "hash": "000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac7254",
            "confirmations": 103871,
            "size": 128810,
            "height": 300000,
            "version": 2,
            "merkleroot": "915c887a2d9ec3f566a648bedcf4ed30d0988e22268cfe43ab5b0cf8638999d3",
            "tx": [
                "b39fa6c39b99683ac8f456721b270786c627ecb246700888315991877024b983",
                "3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828cb"
            ],
            "time": 1399703554,
            "mediantime": 1399701278,
            "nonce": 222771801,
            "bits": "1900896c",
            "difficulty": 8000872135.968163,
            "chainwork": "000000000000000000000000000000000000000000005a7b3c42ea8b844374e9",
            "previousblockhash": "000000000000000067ecc744b5ae34eebbde14d21ca4db51652e4d67e155f07e",
            "nextblockhash": "000000000000000049a0914d83df36982c77ac1f65ade6a52bdced2ce312aba9"
        };
        const blocktime = blocktool.blockHeaderToTime(
            blockheader);
        return expect(blocktime).to.equal(
            1399703554
        );
    });
    test('blockCountToBlockhash (magic)', function() {
        const blockcount = 300000;
        const blockhash = blocktool.blockCountToBlockhash(
            blockcount);
        return expect(blockhash).to.eventually.equal(
            '000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac7254'
        );
    });
    test(
        'blockcountToBlockhash throws error on receiving string blockcount',
        function() {
            return expect(function() {
                const blockcount = "1";
                return blocktool.blockCountToBlockhash(
                    blockcount);
            }).to.throw(TypeError);
        });

    test('guess', function(done) {
        const highcount = 3;
        const lowcount = 1;
        const targettime = 1231469744;
        const lowtime = 1231469665;
        const hightime = 1231470173;
        const guess = blocktool.guess({
            'lowcount': lowcount,
            'highcount': highcount,
            'targettime': targettime,
            'lowtime': lowtime,
            'hightime': hightime
        });
        return expect(guess).to.eventually.equal(2)
            .notify(
                done);
    });
    test('guess throws error on receiving string for high',
        function(
            done) {
            expect(function() {
                const highcount = "3";
                const lowcount = 1;
                const targettime = 1231469744;
                const lowtime = 1231469665;
                const hightime = 1231470173;
                void blocktool.guess({
                    'lowcount': lowcount,
                    'highcount': highcount,
                    'targettime': targettime,
                    'lowtime': lowtime,
                    'hightime': hightime
                });
            }).to.throw(TypeError);
            done();
        });
    test(
        'guess throws error on receiving string for low',
        function(
            done) {
            expect(function() {
                const highcount = 3;
                const lowcount = "1";
                const targettime = 1231469744;
                const lowtime = 1231469665;
                const hightime = 1231470173;
                void blocktool.guess({
                    'lowcount': lowcount,
                    'highcount': highcount,
                    'targettime': targettime,
                    'lowtime': lowtime,
                    'hightime': hightime
                });
            }).to.throw(TypeError);
            done();
        });
    test(
        'guess throws error on receiving string for targettime',
        function(done) {
            expect(function() {
                const highcount = 3;
                const lowcount = 1;
                const targettime = "1231469744";
                const lowtime = 1231469665;
                const hightime = 1231470173;
                void blocktool.guess({
                    'lowcount': lowcount,
                    'highcount': highcount,
                    'targettime': targettime,
                    'lowtime': lowtime,
                    'hightime': hightime
                });
            }).to.throw(TypeError);
            done();
        });
    test('timeToBlockCount (post-apocalypse)', function(
        done) {
        const targettime = 9999999999;
        const blockcount = blocktool.timeToBlockCount(
            targettime);
        return expect(blockcount).to.eventually.be.above(
                363312)
            .notify(done);
    });
    test('timeToBlockCount (pre-satoshi)', function(done) {
        const targettime = 100;
        const blockcount = blocktool.timeToBlockCount(
            targettime);
        return expect(blockcount).to.eventually.equal(
            1).notify(
            done);
    });
    test('timeToBlockCount (targettime == blocktime)',
        function(
            done) {
            this.timeout(1200000);
            const targettime = 1438656758;
            const blockcount = blocktool.timeToBlockCount(
                targettime);
            return expect(blockcount).to.eventually.equal(
                368329).notify(
                done);
        });
    test('timeToBlockCount (targettime != blocktime)',
        function(
            done) {
            const targettime = 1438656757;
            const blockcount = blocktool.timeToBlockCount(
                targettime);
            return expect(blockcount).to.eventually.equal(
                368329).notify(
                done);
        });
    test(
        'timeToBlockCount throws error on receiving string for targettime',
        function(
            done) {
            expect(function() {
                const targettime = "1438656757";
                return blocktool.timeToBlockCount(
                    targettime);
            }).to.throw(TypeError);
            done();
        });
    test('txidToVout', function(done) {
        const txid =
            '25d4deffa4ac3b239565804decdde7c91eae489330a746ea486a3e0bdb3214b0';
        return blocktool.txidToVout(txid)
            .then(function(vout) {
                expect(vout.length).to.equal(
                    200);
                done();
            });
    });


    test(
        'dateRangeToTransactionSignature first signature not null',
        function() {
            const starttime = 1435795200;
            const endtime = 1435795800; //368596 Wed Aug  5 20:16:32 PDT 2015
            return expect(blocktool.dateRangeToTransactionSignature({
                'starttime': starttime,
                'endtime': endtime
            }).next()).to.not.equal(undefined);

        });
    test('txidToRawTransaction (magic)', function() {
        const txid =
            'b39fa6c39b99683ac8f456721b270786c627ecb246700888315991877024b983';
        return blocktool.txidToRawTransaction(txid).then(
            function(rawtransaction) {
                expect(rawtransaction.txid).to.equal(
                    txid);
            });
    });
    test('txidToVout (magic)', function() {
        const txid =
            'b39fa6c39b99683ac8f456721b270786c627ecb246700888315991877024b983';
        return blocktool.txidToVout(txid).then(
            function(vout) {
                expect(vout[0].value).to.equal(
                    25.0402836);
            });
    });
    test('vinItemToInputDetailItem (magic)', function() {
        const vinitem = {
            "txid": "7c9a20b31c89e025e9c031f0d67f3cdebe0091d9447f082a35cc9d076ba1eaf5",
            "vout": 1,
            "scriptSig": {
                "asm": "30440220424540e65fe7dbae285a3e6d38a8c391295f3527eb0a317942fa4e189bf32a3302201320bf0eee6bb419f471ac761b7f6307f597d4643144b5a6cb3c426502cb1b2b[ALL] 04b41dd4782998ce381156736614a21838c36db8a3ca7d36a4813a8acebca53c90aabf056238662c5ee9fb4e7829e34072110f4f14daaf0bd477f7973a388842ae",
                "hex": "4730440220424540e65fe7dbae285a3e6d38a8c391295f3527eb0a317942fa4e189bf32a3302201320bf0eee6bb419f471ac761b7f6307f597d4643144b5a6cb3c426502cb1b2b014104b41dd4782998ce381156736614a21838c36db8a3ca7d36a4813a8acebca53c90aabf056238662c5ee9fb4e7829e34072110f4f14daaf0bd477f7973a388842ae"
            },
            "sequence": 4294967295
        };
        return blocktool.vinItemToInputDetailItem(vinitem).then(
            function(inputdetailitem) {
                expect(inputdetailitem[0].value).to.equal(
                    0.01033289);
            });
    });
});
