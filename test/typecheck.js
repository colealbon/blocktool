'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const typecheck = require(process.cwd() + '/lib/typecheck.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

suite('typecheck:', function() {
    test('blockhashGuard throws error if length not 64', function(done) {
        expect(function() {
            const testblockhash =
                '000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac725';
            return typecheck.blockhashGuard(
                testblockhash);
        }).to.throw(Error);
        done();
    });
    test('blockRangeGuard does nothing with good blockrange', function(
        done) {
        expect(function() {
            const testblockrange = {
                'blockcountlow': 1,
                'blockcounthigh': 10
            };
            return typecheck.blockRangeGuard(
                testblockrange);
        }).to.not.throw(Error);
        done();
    });
    test('blockRangeGuard throws error on string', function(done) {
        expect(function() {
            const testblockrange = {
                'blockcountlow': 1,
                'blockcounthigh': "10"
            };
            return typecheck.blockRangeGuard(
                testblockrange);
        }).to.throw(Error);
        done();
    });
    test('blockRangeGuard throws error on decimal', function(done) {
        expect(function() {
            const testblockrange = {
                'blockcountlow': 1.123,
                'blockcounthigh': "10"
            };
            return typecheck.blockRangeGuard(
                testblockrange);
        }).to.throw(Error);
        done();
    });
    test('blockRangeGuard throws error on missing low', function(done) {
        expect(function() {
            const testblockrange = {
                'blockcounthigh': 10,
                'blockcountlow': ''
            };
            return typecheck.blockRangeGuard(
                testblockrange);
        }).to.throw(Error);
        done();
    });
    test('blockRangeGuard throws error on negatron', function(done) {
        expect(function() {
            const testblockrange = {
                'blockcounthigh': -1,
                'blockcountlow': -10
            };
            return typecheck.blockRangeGuard(
                testblockrange);
        }).to.throw(Error);
        done();
    });
    test('blockRangeGuard throws error if low is higher than high',
        function(done) {
            expect(function() {
                const testblockrange = {
                    'blockcounthigh': 1,
                    'blockcountlow': 10
                };
                return typecheck.blockRangeGuard(
                    testblockrange);
            }).to.throw(Error);
            done();
        });
    test(
        'blockRangeGuard throws error if low > high (change param order)',
        function(done) {
            expect(function() {
                const testblockrange = {
                    'blockcountlow': 10,
                    'blockcounthigh': 1
                };
                return typecheck.blockRangeGuard(
                    testblockrange);
            }).to.throw(Error);
            done();
        });
    test('blockRangeGuard throws error on missing high', function(done) {
        expect(function() {
            const testblockrange = {
                'blockcountlow': 10
            };
            return typecheck.blockRangeGuard(
                testblockrange);
        }).to.throw(Error);
        done();
    });

    test('dateRangeGuard does nothing with good dateRange', function(
        done) {
        expect(function() {
            const testdateRange = {
                'starttime': 1,
                'endtime': 10
            };
            return typecheck.dateRangeGuard(
                testdateRange);
        }).to.not.throw(Error);
        done();
    });
    test('dateRangeGuard throws error on string', function(done) {
        expect(function() {
            const testdateRange = {
                'starttime': 1,
                'endtime': "10"
            };
            return typecheck.dateRangeGuard(
                testdateRange);
        }).to.throw(Error);
        done();
    });
    test('dateRangeGuard throws error on decimal', function(done) {
        expect(function() {
            const testdateRange = {
                'starttime': 1.123,
                'endtime': "10"
            };
            return typecheck.dateRangeGuard(
                testdateRange);
        }).to.throw(Error);
        done();
    });
    test('dateRangeGuard throws error on missing low', function(done) {
        expect(function() {
            const testdateRange = {
                'endtime': 10,
                'starttime': ''
            };
            return typecheck.dateRangeGuard(
                testdateRange);
        }).to.throw(Error);
        done();
    });
    test('dateRangeGuard throws error on negatron', function(done) {
        expect(function() {
            const testdateRange = {
                'endtime': -10,
                'starttime': 1
            };
            return typecheck.dateRangeGuard(
                testdateRange);
        }).to.throw(Error);
        done();
    });
    test('dateRangeGuard throws error if low is higher than high',
        function(done) {
            expect(function() {
                const testdateRange = {
                    'endtime': 1,
                    'starttime': 10
                };
                return typecheck.dateRangeGuard(
                    testdateRange);
            }).to.throw(Error);
            done();
        });
    test(
        'dateRangeGuard throws error if low > high (change param order)',
        function(done) {
            expect(function() {
                const testdateRange = {
                    'starttime': 10,
                    'endtime': 1
                };
                return typecheck.dateRangeGuard(
                    testdateRange);
            }).to.throw(Error);
            done();
        });
    test('dateRangeGuard throws error on missing high', function(done) {
        expect(function() {
            const testdateRange = {
                'starttime': 10
            };
            return typecheck.dateRangeGuard(
                testdateRange);
        }).to.throw(Error);
        done();
    });
    test('natNumGuard does nothing with positive integer', function(
        done) {
        expect(function() {
            const testNaturalNumber = 101;
            return typecheck.natNumGuard(
                testNaturalNumber);
        }).to.not.throw(Error);
        done();
    });
    test('natNumGuard does throws on negative integer', function(
        done) {
        expect(function() {
            const testNaturalNumber = -101;
            return typecheck.natNumGuard(
                testNaturalNumber);
        }).to.throw(Error);
        done();
    });
    test('intGuard does nothing with integer', function(
        done) {
        expect(function() {
            const testinteger = 101;
            return typecheck.intGuard(testinteger);
        }).to.not.throw(Error);
        done();
    });
    test('intGuard throws error on decimal', function(done) {
        expect(function() {
            const testinteger = 1.1;
            return typecheck.intGuard(testinteger);
        }).to.throw(Error);
        done();
    });
    test('intGuard throws error on string', function(done) {
        expect(function() {
            const testinteger = "1";
            return typecheck.intGuard(testinteger);
        }).to.throw(Error);
        done();
    });
    test('numGuard does nothing with integer', function(
        done) {
        expect(function() {
            const testinteger = 101;
            return typecheck.numGuard(testinteger);
        }).to.not.throw(Error);
        done();
    });
    test('numGuard does nothing with decimal', function(done) {
        expect(function() {
            const testinteger = 1.1;
            return typecheck.numGuard(testinteger);
        }).to.not.throw(Error);
        done();
    });
    test('numGuard throws error on string', function(done) {
        expect(function() {
            const testinteger = "1";
            return typecheck.numGuard(testinteger);
        }).to.throw(Error);
        done();
    });
    test('objGuard does nothing with obj', function(done) {
        expect(function() {
            const testobject = {
                'value': 1
            };
            return typecheck.objGuard(testobject);
        }).to.not.throw(Error);
        done();
    });
    test('objGuard throws error on string that looks like obj',
        function(done) {
            expect(function() {
                const testobject = "{'value': 1}";
                return typecheck.objGuard(testobject);
            }).to.throw(Error);
            done();
        });
    test('undefGuard does nothing with undef', function(done) {
        expect(function() {
            const testobject = undefined;
            return typecheck.undefGuard(testobject);
        }).to.not.throw(Error);
        done();
    });
    test('undefGuard throws error on string',
        function(done) {
            expect(function() {
                const testobject = "{'value': 1}";
                return typecheck.objGuard(testobject);
            }).to.throw(Error);
            done();
        });
    test('strGuard does nothing with str', function(
        done) {
        expect(function() {
            const teststring = "101";
            return typecheck.strGuard(teststring);
        }).to.not.throw(Error);
        done();
    });
    test('strGuard throws error on decimal', function(done) {
        expect(function() {
            const teststring = 1.1;
            return typecheck.strGuard(teststring);
        }).to.throw(Error);
        done();
    });
    test('str64Guard does nothing with str64', function(
        done) {
        expect(function() {
            const teststring =
                "3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828cb";
            return typecheck.str64Guard(teststring);
        }).to.not.throw(Error);
        done();
    });
    test('str64Guard throws error on decimal', function(done) {
        expect(function() {
            const teststring = 1.1;
            return typecheck.str64Guard(teststring);
        }).to.throw(Error);
        done();
    });
    test('str64Guard throws error on short string', function(done) {
        expect(function() {
            const teststring = "1.1";
            return typecheck.str64Guard(teststring);
        }).to.throw(Error);
        done();
    });
    test('arrOfStr64Guard does nothing with array of str64', function(
        done) {
        expect(function() {
            const testArr = [
                "3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828cb",
                "3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828cc"
            ];
            return typecheck.arrOfStr64Guard(testArr);
        }).to.not.throw(Error);
        done();
    });
    test('arrOfStr64Guard throws on short string', function(
        done) {
        expect(function() {
            const testArr = [
                "3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828cb",
                "3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828c"
            ];
            return typecheck.arrOfStr64Guard(testArr);
        }).to.throw(Error);
        done();
    });
    test('arrOfIntGuard stays silent on array of int', function(
        done) {
        expect(function() {
            const testArr = [363398, 363399, 363400];
            return typecheck.arrOfIntGuard(testArr);
        }).to.not.throw(Error);
        done();
    });
    test('arrOfIntGuard stays silent on array of int', function(
        done) {
        expect(function() {
            const testArr = [363398, -363399, 363400];
            return typecheck.arrOfIntGuard(testArr);
        }).to.not.throw(Error);
        done();
    });
    test('arrOfIntGuard throws on string', function(
        done) {
        expect(function() {
            const testArr = [
                1,
                "3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828c"
            ];
            return typecheck.arrOfIntGuard(testArr);
        }).to.throw(Error);
        done();
    });

    test('arrOfNatNumGuard stays silent on array of int', function(
        done) {
        expect(function() {
            const testArr = [363398, 363399, 363400];
            return typecheck.arrOfNatNumGuard(testArr);
        }).to.not.throw(Error);
        done();
    });

    test('arrOfNatNumGuard throws on negative', function(
        done) {
        expect(function() {
            const testArr = [363398, 363399, -363400];
            return typecheck.arrOfNatNumGuard(testArr);
        }).to.throw(Error);
        done();
    });

    test('arrOfNatNumGuard throws on string', function(
        done) {
        expect(function() {
            const testArr = [
                1,
                "3b115dcc8a5d1ae060b9be8bdfc697155f6cf40f10bbfb8ab22d14306a9828c"
            ];
            return typecheck.arrOfNatNumGuard(testArr);
        }).to.throw(Error);
        done();
    });


    test('blockHeaderGuard stays silent on missing time element',
        function(
            done) {
            expect(function() {
                const testBlockHeader = {
                    "hash": "0000000000000000008544ebc6abcb14ff003d8eb5e9d36023cd379dfb6f203a",
                    "confirmations": 1,
                    "size": 189863,
                    "height": 404714,
                    "version": 4,
                    "merkleroot": "0b7bf2e1903a6fdbb5ae347974c45e2bfaf70edae8bca1fb36ccbdfd8c6da982",
                    "tx": [
                        "6b3e82b1c2c46080a0fc0ecd656d780b6119e7746078399b2fdcb20e87b0452e",
                        "THIS IS FAKE!!!",
                        "4c75f496b13dcff6e8133a8483c9aa8043f7fee18245ac329f9b44e0a24ee45e"
                    ],
                    "time": 1459196008,
                    "mediantime": 1459195130,
                    "nonce": 3223751858,
                    "bits": "1806a4c3",
                    "difficulty": 165496835118.2263,
                    "chainwork": "00000000000000000000000000000000000000000014e0940bd995e4097091f3",
                    "previousblockhash": "000000000000000003812c3915bcd9f55a559a8cbdf8a9e511caef43bd8b2053"
                };
                return typecheck.blockHeaderGuard(
                    testBlockHeader);
            }).to.not.throw(Error);
            done();
        });
    test('blockHeaderGuard throws on missing time element', function(
        done) {
        expect(function() {
            const testBlockHeader = {
                "hash": "0000000000000000008544ebc6abcb14ff003d8eb5e9d36023cd379dfb6f203a",
                "confirmations": 1,
                "size": 189863,
                "height": 404714,
                "version": 4,
                "merkleroot": "0b7bf2e1903a6fdbb5ae347974c45e2bfaf70edae8bca1fb36ccbdfd8c6da982",
                "tx": [
                    "6b3e82b1c2c46080a0fc0ecd656d780b6119e7746078399b2fdcb20e87b0452e",
                    "THIS IS FAKE!!!",
                    "4c75f496b13dcff6e8133a8483c9aa8043f7fee18245ac329f9b44e0a24ee45e"
                ],
                "mediantime": 1459195130,
                "nonce": 3223751858,
                "bits": "1806a4c3",
                "difficulty": 165496835118.2263,
                "chainwork": "00000000000000000000000000000000000000000014e0940bd995e4097091f3",
                "previousblockhash": "000000000000000003812c3915bcd9f55a559a8cbdf8a9e511caef43bd8b2053"
            };
            return typecheck.blockHeaderGuard(
                testBlockHeader);
        }).to.throw(Error);
        done();
    });
    test('vinItemGuard stays silent on valid vinitem', function(
        done) {
        expect(function() {
            const testVinItem = {
                "txid": "35f244fe1c02d86695c662b4392ccede1403692d4bfc5f565930ba1fa9fe8e02",
                "vout": 219,
                "scriptSig": {
                    "asm": "3045022100f78413f12eadd25665d1ce3c2f592ef7112d26b7c18ee776c398736000caa77602202a2d3a1311fe5da95dcb957e9506b9004c3a580dcfe4762195f1a6abc4a4163b[ALL] 04bade4eaebcf86be6390e9bff0ca8e481439132cc277feb07fbb63ef28235d5e8176b6c01b56d0b0d4c2b82ddd08042f337412b47ad16319b02d241f32936af09",
                    "hex": "483045022100f78413f12eadd25665d1ce3c2f592ef7112d26b7c18ee776c398736000caa77602202a2d3a1311fe5da95dcb957e9506b9004c3a580dcfe4762195f1a6abc4a4163b014104bade4eaebcf86be6390e9bff0ca8e481439132cc277feb07fbb63ef28235d5e8176b6c01b56d0b0d4c2b82ddd08042f337412b47ad16319b02d241f32936af09"
                },
                "sequence": 4294967295
            };
            return typecheck.vinItemGuard(
                testVinItem);
        }).to.not.throw(Error);
        done();
    });
    test('vinGuard stays silent on valid vin element', function(
        done) {
        expect(function() {
            const testVin = [{
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
            return typecheck.vinGuard(
                testVin);
        }).to.not.throw(Error);
        done();
    });


    test('inputDetailGuard stays silent on valid vin element', function(
        done) {
        expect(function() {
            const testInputDetail = [{
                value: 0.01033289,
                n: 1,
                scriptPubKey: {
                    asm: 'OP_DUP OP_HASH160 1b3c724281b3a91a4d36dd65882cb557d2081453 OP_EQUALVERIFY OP_CHECKSIG',
                    hex: '76a9141b3c724281b3a91a4d36dd65882cb557d208145388ac',
                    reqSigs: 1,
                    type: 'pubkeyhash',
                    addresses: [
                        '13V1f4hsA7MBM1xRRKN4gxsx3suHi6Jhhk'
                    ]
                },
                destroy_start: 1399696133,
                txid: '7c9a20b31c89e025e9c031f0d67f3cdebe0091d9447f082a35cc9d076ba1eaf5',
                destroy_stop: 1399703554
            }];
            return typecheck.inputDetailGuard(
                testInputDetail);
        }).to.not.throw(Error);
        done();
    });
    test('inputDetailGuard throws on missing txid', function(
        done) {
        expect(function() {
            const testInputDetail = [{
                "value": 0.957,
                "n": 0,
                "scriptPubKey": {
                    "asm": "OP_DUP OP_HASH160 0e5edf60129c072efcd75810a2dec327ad4c27ac OP_EQUALVERIFY OP_CHECKSIG",
                    "hex": "76a9140e5edf60129c072efcd75810a2dec327ad4c27ac88ac",
                    "reqSigs": 1,
                    "type": "pubkeyhash",
                    "addresses": [
                        "12Jz7YhtTpLZDAbdE8f2Y2JwEkj7YzKvCm"
                    ]
                },
                "destroy_start": 1435791969
            }];
            return typecheck.inputDetailGuard(
                testInputDetail);
        }).to.throw(TypeError);
        done();
    });

    test('inputDetailGuard throws on missing destroy_start', function(
        done) {
        expect(function() {
            const testInputDetail = [{
                "value": 0.957,
                "n": 0,
                "scriptPubKey": {
                    "asm": "OP_DUP OP_HASH160 0e5edf60129c072efcd75810a2dec327ad4c27ac OP_EQUALVERIFY OP_CHECKSIG",
                    "hex": "76a9140e5edf60129c072efcd75810a2dec327ad4c27ac88ac",
                    "reqSigs": 1,
                    "type": "pubkeyhash",
                    "addresses": [
                        "12Jz7YhtTpLZDAbdE8f2Y2JwEkj7YzKvCm"
                    ]
                },
                "txid": "fbd378eed705fb1331e2310ce1058dcd9c4254be5db5794aab11a17f2435b697"
            }];
            return typecheck.inputDetailGuard(
                testInputDetail);
        }).to.throw(Error);
        done();
    });

    test('inputDetailItemGuard stays silent on valid vin element',
        function(
            done) {
            expect(function() {
                const testInputDetailItem = {
                    value: 0.01033289,
                    n: 1,
                    scriptPubKey: {
                        asm: 'OP_DUP OP_HASH160 1b3c724281b3a91a4d36dd65882cb557d2081453 OP_EQUALVERIFY OP_CHECKSIG',
                        hex: '76a9141b3c724281b3a91a4d36dd65882cb557d208145388ac',
                        reqSigs: 1,
                        type: 'pubkeyhash',
                        addresses: [
                            '13V1f4hsA7MBM1xRRKN4gxsx3suHi6Jhhk'
                        ]
                    },
                    destroy_start: 1399696133,
                    txid: '7c9a20b31c89e025e9c031f0d67f3cdebe0091d9447f082a35cc9d076ba1eaf5',
                    destroy_stop: 1399703554
                };
                return typecheck.inputDetailItemGuard(
                    testInputDetailItem);
            }).to.not.throw(Error);
            done();
        });
    test('inputDetailItemGuard throws on missing txid', function(
        done) {
        expect(function() {
            const testInputDetailItem = {
                "value": 0.957,
                "n": 0,
                "scriptPubKey": {
                    "asm": "OP_DUP OP_HASH160 0e5edf60129c072efcd75810a2dec327ad4c27ac OP_EQUALVERIFY OP_CHECKSIG",
                    "hex": "76a9140e5edf60129c072efcd75810a2dec327ad4c27ac88ac",
                    "reqSigs": 1,
                    "type": "pubkeyhash",
                    "addresses": [
                        "12Jz7YhtTpLZDAbdE8f2Y2JwEkj7YzKvCm"
                    ]
                },
                "destroy_start": 1435791969
            };
            return typecheck.inputDetailItemGuard(
                testInputDetailItem);
        }).to.throw(TypeError);
        done();
    });

    test('inputDetailItemGuard throws on missing destroy_start',
        function(
            done) {
            expect(function() {
                const testInputDetailItem = {
                    value: 0.01033289,
                    n: 1,
                    scriptPubKey: {
                        asm: 'OP_DUP OP_HASH160 1b3c724281b3a91a4d36dd65882cb557d2081453 OP_EQUALVERIFY OP_CHECKSIG',
                        hex: '76a9141b3c724281b3a91a4d36dd65882cb557d208145388ac',
                        reqSigs: 1,
                        type: 'pubkeyhash',
                        addresses: [
                            '13V1f4hsA7MBM1xRRKN4gxsx3suHi6Jhhk'
                        ]
                    },
                    txid: '7c9a20b31c89e025e9c031f0d67f3cdebe0091d9447f082a35cc9d076ba1eaf5',
                    destroy_stop: 1399703554
                };
                return typecheck.inputDetailItemGuard(
                    testInputDetailItem);
            }).to.throw(Error);
            done();
        });
    test('inputDetailItemGuard throws on missing destroy_stop',
        function(
            done) {
            expect(function() {
                const testInputDetailItem = {
                    value: 0.01033289,
                    n: 1,
                    scriptPubKey: {
                        asm: 'OP_DUP OP_HASH160 1b3c724281b3a91a4d36dd65882cb557d2081453 OP_EQUALVERIFY OP_CHECKSIG',
                        hex: '76a9141b3c724281b3a91a4d36dd65882cb557d208145388ac',
                        reqSigs: 1,
                        type: 'pubkeyhash',
                        addresses: [
                            '13V1f4hsA7MBM1xRRKN4gxsx3suHi6Jhhk'
                        ]
                    },
                    destroy_start: 1399696133,
                    txid: '7c9a20b31c89e025e9c031f0d67f3cdebe0091d9447f082a35cc9d076ba1eaf5'
                };
                return typecheck.inputDetailItemGuard(
                    testInputDetailItem);
            }).to.throw(Error);
            done();
        });
    test('guessGuard does nothing with good guess', function(
        done) {
        expect(function() {
            const highcount = 3;
            const lowcount = 1;
            const targettime = 1231469744;
            const lowtime = 1231469665;
            const hightime = 1231470173;
            const testguess = {
                'lowcount': lowcount,
                'highcount': highcount,
                'targettime': targettime,
                'lowtime': lowtime,
                'hightime': hightime
            };
            return typecheck.guessGuard(
                testguess);
        }).to.not.throw(Error);
        done();
    });
    test('guessGuard throws error on string', function(done) {
        expect(function() {
            const testguess =
                "{'lowcount': 1, 'highcount': 3, 'targettime': 1231469744, 'lowtime': 1231469665, 'hightime': 1231470173}";
            return typecheck.guessGuard(
                testguess);
        }).to.throw(Error);
        done();
    });
    test('guessGuard throws error on decimal', function(done) {
        expect(function() {
            const highcount = .3;
            const lowcount = 1;
            const targettime = 1231469744;
            const lowtime = 1231469665;
            const hightime = 1231470173;
            const testguess = {
                'lowcount': lowcount,
                'highcount': highcount,
                'targettime': targettime,
                'lowtime': lowtime,
                'hightime': hightime
            };
            return typecheck.guessGuard(
                testguess);
        }).to.throw(Error);
        done();
    });
    test('guessGuard throws error on missing targettime', function(done) {
        expect(function() {
            const highcount = .3;
            const lowcount = 1;
            const lowtime = 1231469665;
            const hightime = 1231470173;
            const testguess = {
                'lowcount': lowcount,
                'highcount': highcount,
                'lowtime': lowtime,
                'hightime': hightime
            };
            return typecheck.guessGuard(
                testguess);
        }).to.throw(Error);
        done();
    });
    test('guessGuard throws error missing highcount', function(done) {
        expect(function() {
            const lowcount = 1;
            const targettime = 1231469744;
            const lowtime = 1231469665;
            const hightime = 1231470173;
            const testguess = {
                'lowcount': lowcount,
                'targettime': targettime,
                'lowtime': lowtime,
                'hightime': hightime
            };
            return typecheck.guessGuard(
                testguess);
        }).to.throw(Error);
        done();
    });
    test('guessGuard throws error on missing lowcount', function(done) {
        expect(function() {
            const highcount = 3;
            const targettime = 1231469744;
            const lowtime = 1231469665;
            const hightime = 1231470173;
            const testguess = {
                'highcount': highcount,
                'targettime': targettime,
                'lowtime': lowtime,
                'hightime': hightime
            };
            return typecheck.guessGuard(
                testguess);
        }).to.throw(Error);
        done();
    });
    test('guessGuard does nothing with missing lowtime, hightime',
        function(
            done) {
            expect(function() {
                const highcount = 3;
                const lowcount = 1;
                const targettime = 1231469744;
                const testguess = {
                    'lowcount': lowcount,
                    'highcount': highcount,
                    'targettime': targettime
                };
                return typecheck.guessGuard(
                    testguess);
            }).to.not.throw(Error);
            done();
        });
    test('guessGuard throws error on negatron',
        function(
            done) {
            expect(function() {
                const highcount = 3;
                const lowcount = -3;
                const targettime = 1231469744;
                const testguess = {
                    'lowcount': lowcount,
                    'highcount': highcount,
                    'targettime': targettime
                };
                return typecheck.guessGuard(
                    testguess);
            }).to.throw(Error);
            done();
        });
    test('guessGuard throws error if low is higher than high',
        function(done) {
            expect(function() {
                const highcount = 100;
                const lowcount = 200;
                const targettime = 1231469744;
                const testguess = {
                    'lowcount': lowcount,
                    'highcount': highcount,
                    'targettime': targettime
                };
                return typecheck.guessGuard(
                    testguess);
            }).to.throw(Error);
            done();
        });
});
